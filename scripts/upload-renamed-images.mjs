#!/usr/bin/env node

/**
 * images_renamed/ フォルダの画像アップロードスクリプト
 *
 * ローマ字ファイル名から日本語カード名をマッチング
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
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 設定
const POKECA_DIR = '/Users/kousuke/Downloads/pokeca'
const IMAGES_RENAMED_DIR = path.join(POKECA_DIR, 'images_renamed')
const STORAGE_BUCKET = 'card-images'
const DRY_RUN = process.argv.includes('--dry-run')

// 統計情報
const stats = {
  totalImages: 0,
  matched: 0,
  uploaded: 0,
  updated: 0,
  errors: []
}

/**
 * ローマ字→日本語マッピング（一部）
 * 完全なマッピングは膨大なので、主要なポケモンのみ
 */
const ROMAJI_TO_JAPANESE = {
  'pikachu': 'ピカチュウ',
  'lizardon': 'リザードン',
  'absol': 'アブソル',
  'aceburn': 'エースバーン',
  'aburii': 'アブリー',
  'achigeeta': 'アチゲータ',
  'arbok': 'アーボック',
  // 必要に応じて追加
}

/**
 * メイン処理
 */
async function main() {
  if (DRY_RUN) {
    console.log('🧪 ドライランモード\n')
  } else {
    console.log('🚀 images_renamed/ 画像アップロード開始\n')
  }

  // 1. images_renamed/フォルダの画像一覧を取得
  console.log('📖 images_renamed/ フォルダの画像を読み込み中...')
  const imageFiles = await getImageFiles()
  stats.totalImages = imageFiles.length
  console.log(`✅ ${stats.totalImages}件の画像ファイルを発見\n`)

  // 2. データベースのカード一覧を取得（画像が無いカードのみ）
  console.log('📚 データベースから画像が無いカードを取得中...')
  const dbCards = await getCardsWithoutImages()
  console.log(`✅ ${dbCards.length}件のカードが画像を必要としています\n`)

  // 3. ファイル名からカード名を推測してマッチング
  console.log('🔗 画像とカード情報をマッチング中...')
  const matches = matchImages(imageFiles, dbCards)
  stats.matched = matches.length
  console.log(`✅ ${stats.matched}件のマッチングが完了\n`)

  if (matches.length === 0) {
    console.log('⚠️  マッチングされた画像がありません')
    process.exit(0)
  }

  // マッチング詳細を表示
  if (DRY_RUN && matches.length > 0) {
    console.log('📝 マッチング詳細（最初の20件）:')
    matches.slice(0, 20).forEach((match, i) => {
      console.log(`  ${i + 1}. ${match.fileName} → ${match.dbCard.card_name}`)
    })
    console.log()
  }

  // 4. アップロード
  console.log('⬆️  画像アップロード開始...\n')
  for (const match of matches) {
    await uploadAndUpdateCard(match)
  }

  // 5. 結果表示
  printResults()
}

/**
 * images_renamed/ フォルダの画像ファイル一覧を取得
 */
async function getImageFiles() {
  try {
    const files = await fs.readdir(IMAGES_RENAMED_DIR)
    return files
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .map(f => ({
        fileName: f,
        fullPath: path.join(IMAGES_RENAMED_DIR, f),
        baseName: f.replace(/\.(jpg|jpeg|png|webp)$/i, '').toLowerCase()
      }))
  } catch (error) {
    console.error('❌ 画像ファイル読み込みエラー:', error.message)
    process.exit(1)
  }
}

/**
 * 画像が無いカードをDBから取得
 */
async function getCardsWithoutImages() {
  const cards = []
  const pageSize = 1000

  // まず総件数を取得
  const { count: totalCount } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact', head: true })
    .or('image_url.is.null,image_url.eq./images/ngcard.jpg,not.image_url.like.%supabase.co%')

  console.log(`📊 画像が無いカード: ${totalCount}件`)

  // ページネーションで全件取得
  for (let page = 0; page * pageSize < totalCount; page++) {
    const { data, error } = await supabase
      .from('pokemon_cards')
      .select('id, card_name, product_code')
      .or('image_url.is.null,image_url.eq./images/ngcard.jpg,not.image_url.like.%supabase.co%')
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error) {
      console.error('❌ データベースエラー:', error)
      process.exit(1)
    }

    cards.push(...data)
    console.log(`   取得中... ${cards.length}/${totalCount}`)
  }

  return cards
}

/**
 * ファイル名からカード名を推測してマッチング
 */
function matchImages(imageFiles, dbCards) {
  const matches = []

  for (const imageFile of imageFiles) {
    const baseName = imageFile.baseName

    // 1. ローマ字→日本語変換を試みる
    let japaneseNames = []

    // アンダースコアで分割（例: pikachu_ex → pikachu, ex）
    const parts = baseName.split('_')
    const mainName = parts[0]
    const suffix = parts.slice(1).join('')

    // マッピングから日本語名を取得
    if (ROMAJI_TO_JAPANESE[mainName]) {
      japaneseNames.push(ROMAJI_TO_JAPANESE[mainName])
    }

    // 2. カード名の部分一致でマッチング
    const dbCard = dbCards.find(card => {
      const cardNameLower = card.card_name.toLowerCase()

      // 完全一致
      for (const japaneseName of japaneseNames) {
        if (card.card_name.includes(japaneseName)) {
          // サフィックスもチェック（ex, v, vmax など）
          if (suffix && suffix.includes('ex') && card.card_name.includes('ex')) {
            return true
          } else if (suffix && suffix.includes('vmax') && card.card_name.includes('VMAX')) {
            return true
          } else if (suffix && suffix.includes('v') && card.card_name.includes('V')) {
            return true
          } else if (!suffix) {
            return true
          }
        }
      }

      return false
    })

    if (dbCard) {
      matches.push({
        dbCard,
        imageFile,
        fileName: imageFile.fileName
      })
    }
  }

  return matches
}

/**
 * 画像をアップロードしてDBを更新
 */
async function uploadAndUpdateCard(match) {
  const { dbCard, imageFile } = match

  try {
    // ファイルが存在するか確認
    try {
      await fs.access(imageFile.fullPath)
    } catch {
      stats.errors.push({
        fileName: imageFile.fileName,
        error: 'ファイルが見つかりません'
      })
      return
    }

    const ext = path.extname(imageFile.fileName)
    const fileName = `${dbCard.id}${ext}`

    if (DRY_RUN) {
      stats.uploaded++
      stats.updated++
      console.log(`  🧪 ${imageFile.fileName} → ${dbCard.card_name} (${fileName})`)
      return
    }

    // ファイルを読み込み
    const fileBuffer = await fs.readFile(imageFile.fullPath)

    // Supabase Storageにアップロード
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: getContentType(ext),
        upsert: true
      })

    if (uploadError) {
      stats.errors.push({
        fileName: imageFile.fileName,
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
        fileName: imageFile.fileName,
        error: updateError.message
      })
      return
    }

    stats.updated++
    console.log(`  ✅ ${imageFile.fileName} → ${dbCard.card_name}`)

  } catch (error) {
    stats.errors.push({
      fileName: imageFile.fileName,
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
    '.webp': 'image/webp'
  }
  return types[ext.toLowerCase()] || 'application/octet-stream'
}

/**
 * 結果を表示
 */
function printResults() {
  console.log('\n\n' + '='.repeat(60))
  console.log('📊 処理結果')
  console.log('='.repeat(60))
  console.log(`総画像数:             ${stats.totalImages}件`)
  console.log(`マッチング:           ${stats.matched}件`)
  console.log(`アップロード:         ${stats.uploaded}件`)
  console.log(`DB更新:              ${stats.updated}件`)
  console.log(`エラー:              ${stats.errors.length}件`)

  if (stats.errors.length > 0) {
    console.log('\n❌ エラー詳細:')
    stats.errors.slice(0, 10).forEach(err => {
      console.log(`  - ${err.fileName}: ${err.error}`)
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
