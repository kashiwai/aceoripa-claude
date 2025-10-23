#!/usr/bin/env node

/**
 * ポケカ画像一括アップロードスクリプト
 *
 * 処理の流れ:
 * 1. ai_card_excel_cache.jsonを読み込み
 * 2. 日本語版のカードのみフィルタリング
 * 3. Supabase Storageに画像をアップロード
 * 4. データベースのimage_urlを更新
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// .env.localを読み込み
config({ path: path.join(__dirname, '../.env.local') })

// Supabase設定
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 環境変数が設定されていません')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'x-client-info': 'pokemon-image-uploader'
    }
  }
})

// 設定
const POKECA_DIR = '/Users/kousuke/Downloads/pokeca'
const CACHE_FILE = path.join(POKECA_DIR, 'ai_card_excel_cache.json')
const IMAGES_DIR = path.join(POKECA_DIR, 'images')
const BATCH_SIZE = 50 // 一度に処理する画像数
const STORAGE_BUCKET = 'card-images'
const DRY_RUN = process.argv.includes('--dry-run') // ドライランモード

// 統計情報
const stats = {
  total: 0,
  japanese: 0,
  uploaded: 0,
  matched: 0,
  exactMatch: 0,
  partialMatch: 0,
  noMatch: 0,
  updated: 0,
  errors: []
}

/**
 * メイン処理
 */
async function main() {
  if (DRY_RUN) {
    console.log('🧪 ドライランモード（実際のアップロードは行いません）\n')
  } else {
    console.log('🚀 ポケカ画像一括アップロード開始\n')
  }

  // 1. キャッシュファイル読み込み
  console.log('📖 キャッシュファイル読み込み中...')
  const cache = await loadCache()
  stats.total = Object.keys(cache).length
  console.log(`✅ ${stats.total}件のカード情報を読み込みました\n`)

  // 2. 日本語版のみフィルタリング
  console.log('🔍 日本語版カードをフィルタリング中...')
  const japaneseCards = filterJapaneseCards(cache)
  stats.japanese = japaneseCards.length
  console.log(`✅ ${stats.japanese}件の日本語版カードが見つかりました\n`)

  // 3. データベースのカード一覧を取得（全件）
  console.log('📚 データベースからカード一覧を取得中...')

  // まず総件数を取得
  const { count: totalCount } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 データベース総件数: ${totalCount}件`)

  // 全件取得（ページネーション）
  const pageSize = 1000
  const dbCards = []

  for (let page = 0; page * pageSize < totalCount; page++) {
    const { data, error } = await supabase
      .from('pokemon_cards')
      .select('id, card_name, product_code, image_url')
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error) {
      console.error('❌ データベースエラー:', error)
      process.exit(1)
    }

    dbCards.push(...data)
    console.log(`   取得中... ${dbCards.length}/${totalCount}`)
  }

  console.log(`✅ ${dbCards.length}件のカードを取得しました\n`)

  // DBカードのサンプルを表示
  if (DRY_RUN) {
    console.log('📝 データベースカードサンプル（最初の5件）:')
    dbCards.slice(0, 5).forEach((card, i) => {
      console.log(`  ${i + 1}. "${card.card_name}" (${card.product_code})`)
    })
    console.log()
  }

  // 4. マッチング処理
  console.log('🔗 画像とカード情報をマッチング中...')
  const matches = matchCardsWithImages(japaneseCards, dbCards)
  stats.matched = matches.length
  console.log(`✅ ${stats.matched}件のマッチングが完了しました\n`)

  // マッチング詳細を表示（最初の10件）
  if (DRY_RUN && matches.length > 0) {
    console.log('📝 マッチング詳細（最初の10件）:')
    matches.slice(0, 10).forEach((match, i) => {
      console.log(`  ${i + 1}. ${match.imageCard.cardName} → ${match.dbCard.card_name} (${match.dbCard.product_code})`)
    })
    console.log()
  }

  if (matches.length === 0) {
    console.log('⚠️  マッチングされたカードがありません')
    console.log('ヒント: カード名が一致しているか確認してください')
    process.exit(0)
  }

  // 5. バッチ処理でアップロード
  console.log('⬆️  画像アップロード開始...\n')
  await uploadBatches(matches)

  // 6. 結果表示
  printResults()
}

/**
 * キャッシュファイルを読み込み
 */
async function loadCache() {
  try {
    const content = await fs.readFile(CACHE_FILE, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('❌ キャッシュファイル読み込みエラー:', error.message)
    process.exit(1)
  }
}

/**
 * 日本語版カードのみフィルタリング
 */
function filterJapaneseCards(cache) {
  const japanese = []

  for (const [imagePath, cardInfo] of Object.entries(cache)) {
    const cardName = cardInfo.full_card_name || cardInfo.pokemon_or_character

    // 日本語版判定:
    // 1. language === '日本語版'
    // 2. languageが未設定で、カード名に日本語が含まれる
    // 3. 英語版を明示的に除外
    const isEnglish = cardInfo.language && cardInfo.language.includes('英語')
    const hasJapaneseName = cardName && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(cardName)

    if (!isEnglish && (cardInfo.language === '日本語版' || hasJapaneseName)) {
      japanese.push({
        imagePath,
        cardName,
        cardNumber: cardInfo.card_number,
        rarity: cardInfo.rarity,
        series: cardInfo.series
      })
    }
  }

  return japanese
}

/**
 * 画像とDBカードをマッチング
 */
function matchCardsWithImages(imageCards, dbCards) {
  const matches = []

  for (const imageCard of imageCards) {
    let matchType = null

    // カード名で完全一致
    let dbCard = dbCards.find(db => db.card_name === imageCard.cardName)
    if (dbCard) {
      matchType = 'exact'
      stats.exactMatch++
    }

    // 完全一致しない場合は部分一致
    if (!dbCard) {
      dbCard = dbCards.find(db =>
        db.card_name.includes(imageCard.cardName) ||
        imageCard.cardName.includes(db.card_name)
      )
      if (dbCard) {
        matchType = 'partial'
        stats.partialMatch++
      }
    }

    if (dbCard) {
      matches.push({
        dbCard,
        imageCard,
        matchType
      })
    } else {
      stats.noMatch++
    }
  }

  return matches
}

/**
 * バッチ処理でアップロード
 */
async function uploadBatches(matches) {
  const batches = []
  for (let i = 0; i < matches.length; i += BATCH_SIZE) {
    batches.push(matches.slice(i, i + BATCH_SIZE))
  }

  console.log(`📦 ${batches.length}個のバッチに分割しました（各バッチ最大${BATCH_SIZE}件）\n`)

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`\n📦 バッチ ${i + 1}/${batches.length} 処理中... (${batch.length}件)`)

    for (const match of batch) {
      await uploadAndUpdateCard(match)
    }

    // API制限回避のため少し待機
    if (i < batches.length - 1) {
      await sleep(1000)
    }
  }
}

/**
 * 画像をアップロードしてDBを更新
 */
async function uploadAndUpdateCard(match) {
  const { dbCard, imageCard } = match

  try {
    // 画像ファイルパス
    const fullImagePath = path.join(POKECA_DIR, imageCard.imagePath)

    // ファイルが存在するか確認
    try {
      await fs.access(fullImagePath)
    } catch {
      stats.errors.push({
        cardName: imageCard.cardName,
        error: 'ファイルが見つかりません',
        path: fullImagePath
      })
      return
    }

    // ファイルを読み込み
    const ext = path.extname(imageCard.imagePath)
    const fileName = `${dbCard.product_code}${ext}`

    if (DRY_RUN) {
      // ドライランモード: アップロードせず情報だけ表示
      stats.uploaded++
      stats.updated++
      console.log(`  🧪 ${imageCard.cardName} → ${fileName} (ドライラン)`)
      return
    }

    const fileBuffer = await fs.readFile(fullImagePath)

    // Supabase Storageにアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: getContentType(ext),
        upsert: true
      })

    if (uploadError) {
      stats.errors.push({
        cardName: imageCard.cardName,
        error: uploadError.message
      })
      return
    }

    stats.uploaded++

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)

    // DBのimage_urlを更新
    const { error: updateError } = await supabase
      .from('pokemon_cards')
      .update({ image_url: publicUrl })
      .eq('id', dbCard.id)

    if (updateError) {
      stats.errors.push({
        cardName: imageCard.cardName,
        error: updateError.message
      })
      return
    }

    stats.updated++
    console.log(`  ✅ ${imageCard.cardName} → ${publicUrl}`)

  } catch (error) {
    stats.errors.push({
      cardName: imageCard.cardName,
      error: error.message
    })
  }
}

/**
 * Content-Typeを取得
 */
function getContentType(ext) {
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  }
  return types[ext.toLowerCase()] || 'application/octet-stream'
}

/**
 * 待機
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 結果を表示
 */
function printResults() {
  console.log('\n\n' + '='.repeat(60))
  console.log('📊 処理結果')
  console.log('='.repeat(60))
  console.log(`総カード数:           ${stats.total}件`)
  console.log(`日本語版:             ${stats.japanese}件`)
  console.log(`マッチング合計:       ${stats.matched}件`)
  console.log(`  ├─ 完全一致:        ${stats.exactMatch}件`)
  console.log(`  ├─ 部分一致:        ${stats.partialMatch}件`)
  console.log(`  └─ マッチ失敗:      ${stats.noMatch}件`)
  console.log(`アップロード:         ${stats.uploaded}件`)
  console.log(`DB更新:              ${stats.updated}件`)
  console.log(`エラー:              ${stats.errors.length}件`)

  if (stats.errors.length > 0) {
    console.log('\n❌ エラー詳細:')
    stats.errors.slice(0, 10).forEach(err => {
      console.log(`  - ${err.cardName}: ${err.error}`)
    })
    if (stats.errors.length > 10) {
      console.log(`  ... 他 ${stats.errors.length - 10}件`)
    }
  }

  console.log('='.repeat(60) + '\n')
}

// 実行
main().catch(error => {
  console.error('❌ エラー:', error)
  process.exit(1)
})
