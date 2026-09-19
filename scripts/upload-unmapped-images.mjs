#!/usr/bin/env node

/**
 * 未マッピング画像アップロードスクリプト
 *
 * OpenAI Vision APIを使って画像からカード名を抽出し、
 * データベースとマッチングしてアップロード
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'
import OpenAI from 'openai'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// .env.localを読み込み
config({ path: path.join(__dirname, '../.env.local') })

// Supabase設定
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase環境変数が設定されていません')
  process.exit(1)
}

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

// 設定
const POKECA_DIR = '/Users/kousuke/Downloads/pokeca'
const CACHE_FILE = path.join(POKECA_DIR, 'ai_card_excel_cache.json')
const IMAGES_DIR = path.join(POKECA_DIR, 'images')
const STORAGE_BUCKET = 'card-images'
const BATCH_SIZE = 10 // Vision API用に少なめに設定
const MAX_IMAGES = process.argv.includes('--all') ? Infinity : 100 // デフォルトは100枚テスト
const DRY_RUN = process.argv.includes('--dry-run')

// 統計情報
const stats = {
  totalUnmapped: 0,
  processed: 0,
  visionSuccess: 0,
  visionFailed: 0,
  matched: 0,
  uploaded: 0,
  updated: 0,
  errors: [],
  visionResults: [] // Vision API結果のサンプル
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 未マッピング画像アップロード開始\n')

  if (DRY_RUN) {
    console.log('🧪 ドライランモード\n')
  }

  if (MAX_IMAGES !== Infinity) {
    console.log(`📝 テストモード: 最初の${MAX_IMAGES}枚のみ処理\n`)
  }

  // 1. 未マッピング画像を取得
  console.log('📖 未マッピング画像を読み込み中...')
  const unmappedImages = await getUnmappedImages()
  stats.totalUnmapped = unmappedImages.length
  console.log(`✅ ${stats.totalUnmapped}件の未マッピング画像を発見\n`)

  // 処理する画像数を制限
  const imagesToProcess = unmappedImages.slice(0, MAX_IMAGES)
  console.log(`📊 ${imagesToProcess.length}件の画像を処理します\n`)

  // 2. データベースのカード一覧を取得（画像が無いカードのみ）
  console.log('📚 データベースから画像が無いカードを取得中...')
  const dbCards = await getCardsWithoutImages()
  console.log(`✅ ${dbCards.length}件のカードが画像を必要としています\n`)

  // 3. バッチ処理でVision API + アップロード
  console.log('🔍 Vision APIで画像解析 + アップロード開始...\n')
  await processBatches(imagesToProcess, dbCards)

  // 4. 結果表示
  printResults()
}

/**
 * 未マッピング画像を取得
 */
async function getUnmappedImages() {
  try {
    // キャッシュファイル読み込み
    const cacheContent = await fs.readFile(CACHE_FILE, 'utf-8')
    const cache = JSON.parse(cacheContent)
    const cachedImages = new Set(Object.keys(cache))

    // images/フォルダの全ファイルを取得
    const allFiles = await fs.readdir(IMAGES_DIR)
    const imageFiles = allFiles
      .filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f))
      .map(f => `images/${f}`)

    // 未マッピングのみ抽出
    return imageFiles
      .filter(path => !cachedImages.has(path))
      .map(imagePath => ({
        imagePath,
        fileName: path.basename(imagePath),
        fullPath: path.join(POKECA_DIR, imagePath)
      }))
  } catch (error) {
    console.error('❌ 画像読み込みエラー:', error.message)
    process.exit(1)
  }
}

/**
 * 全カードをDBから取得（画像の有無は後でフィルタ）
 */
async function getCardsWithoutImages() {
  const cards = []
  const pageSize = 1000

  // まず総件数を取得
  const { count: totalCount } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 データベース総件数: ${totalCount}件`)

  // ページネーションで全件取得
  for (let page = 0; page * pageSize < totalCount; page++) {
    const { data, error } = await supabase
      .from('pokemon_cards')
      .select('id, card_name, product_code, image_url')
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error) {
      console.error('❌ データベースエラー:', error)
      process.exit(1)
    }

    cards.push(...data)
    console.log(`   取得中... ${cards.length}/${totalCount}`)
  }

  // 画像が無いカードのみフィルタリング
  const cardsWithoutImages = cards.filter(card =>
    !card.image_url ||
    card.image_url.includes('/images/ngcard.jpg') ||
    !card.image_url.includes('supabase.co')
  )

  console.log(`✅ 画像が無いカード: ${cardsWithoutImages.length}件\n`)

  return cardsWithoutImages
}

/**
 * バッチ処理
 */
async function processBatches(images, dbCards) {
  const batches = []
  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    batches.push(images.slice(i, i + BATCH_SIZE))
  }

  console.log(`📦 ${batches.length}個のバッチに分割（各バッチ最大${BATCH_SIZE}件）\n`)

  const matchedCardIds = new Set() // 重複防止

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`\n📦 バッチ ${i + 1}/${batches.length} 処理中... (${batch.length}件)`)

    for (const image of batch) {
      await processImage(image, dbCards, matchedCardIds)
    }

    // API制限回避のため待機
    if (i < batches.length - 1) {
      console.log('⏳ APIレート制限回避のため3秒待機...')
      await sleep(3000)
    }
  }
}

/**
 * 1枚の画像を処理
 */
async function processImage(image, dbCards, matchedCardIds) {
  stats.processed++

  try {
    // 1. Vision APIでカード名を抽出
    const cardName = await extractCardNameFromImage(image.fullPath)

    if (!cardName) {
      stats.visionFailed++
      console.log(`  ❌ ${image.fileName}: カード名を抽出できませんでした`)
      return
    }

    stats.visionSuccess++

    // サンプル結果を保存（最初の10件）
    if (stats.visionResults.length < 10) {
      stats.visionResults.push({ fileName: image.fileName, cardName })
    }

    console.log(`  🔍 ${image.fileName} → "${cardName}"`)

    // 2. データベースとマッチング
    const dbCard = findMatchingCard(cardName, dbCards, matchedCardIds)

    if (!dbCard) {
      console.log(`     ⚠️  マッチするカードが見つかりません`)
      return
    }

    stats.matched++
    matchedCardIds.add(dbCard.id) // 重複防止
    console.log(`     ✅ マッチ: ${dbCard.card_name} (${dbCard.product_code})`)

    // 3. アップロード
    if (!DRY_RUN) {
      await uploadAndUpdateCard(image, dbCard)
    } else {
      stats.uploaded++
      stats.updated++
      console.log(`     🧪 アップロードスキップ (ドライラン)`)
    }

  } catch (error) {
    stats.errors.push({
      fileName: image.fileName,
      error: error.message
    })
    console.log(`  ❌ ${image.fileName}: ${error.message}`)
  }
}

/**
 * Vision APIでカード名を抽出
 */
async function extractCardNameFromImage(imagePath) {
  try {
    // 画像をBase64エンコード
    const imageBuffer = await fs.readFile(imagePath)
    const base64Image = imageBuffer.toString('base64')
    const ext = path.extname(imagePath).toLowerCase()
    const mimeType = ext === '.webp' ? 'image/webp' :
                     ext === '.png' ? 'image/png' : 'image/jpeg'

    // Vision APIリクエスト
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'これはポケモンカードの画像です。カード名（ポケモン名）を日本語で抽出してください。カード名のみを返してください。他の説明は不要です。例: ピカチュウ、リザードンex、ミュウツーVMAX'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 50
    })

    const extractedText = response.choices[0].message.content.trim()

    // 余計な文字を削除（"カード名: " などのプレフィックス）
    const cardName = extractedText
      .replace(/^(カード名|ポケモン名)[：:]\s*/i, '')
      .replace(/[「」『』【】]/g, '')
      .trim()

    return cardName || null

  } catch (error) {
    console.error(`     Vision APIエラー: ${error.message}`)
    return null
  }
}

/**
 * カード名からDBカードを検索
 */
function findMatchingCard(cardName, dbCards, matchedCardIds) {
  // 1. 完全一致
  let dbCard = dbCards.find(db =>
    !matchedCardIds.has(db.id) &&
    db.card_name === cardName
  )
  if (dbCard) return dbCard

  // 2. 部分一致（カード名が3文字以上）
  if (cardName.length >= 3) {
    dbCard = dbCards.find(db =>
      !matchedCardIds.has(db.id) && (
        db.card_name.includes(cardName) ||
        cardName.includes(db.card_name)
      )
    )
    if (dbCard) return dbCard
  }

  return null
}

/**
 * 画像をアップロードしてDBを更新
 */
async function uploadAndUpdateCard(image, dbCard) {
  try {
    const fileBuffer = await fs.readFile(image.fullPath)
    const ext = path.extname(image.fileName)
    const fileName = `${dbCard.id}${ext}`

    // Supabase Storageにアップロード
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: getContentType(ext),
        upsert: true
      })

    if (uploadError) {
      throw new Error(`アップロードエラー: ${uploadError.message}`)
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
      throw new Error(`DB更新エラー: ${updateError.message}`)
    }

    stats.updated++
    console.log(`     ⬆️  アップロード完了: ${publicUrl}`)

  } catch (error) {
    stats.errors.push({
      fileName: image.fileName,
      error: error.message
    })
    throw error
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
  console.log(`未マッピング総数:     ${stats.totalUnmapped}件`)
  console.log(`処理数:              ${stats.processed}件`)
  console.log(`Vision API成功:      ${stats.visionSuccess}件`)
  console.log(`Vision API失敗:      ${stats.visionFailed}件`)
  console.log(`マッチング成功:      ${stats.matched}件`)
  console.log(`アップロード:        ${stats.uploaded}件`)
  console.log(`DB更新:             ${stats.updated}件`)
  console.log(`エラー:             ${stats.errors.length}件`)

  if (stats.visionResults.length > 0) {
    console.log('\n✅ Vision API抽出サンプル:')
    stats.visionResults.forEach((result, i) => {
      console.log(`  ${i + 1}. ${result.fileName} → "${result.cardName}"`)
    })
  }

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

  if (MAX_IMAGES !== Infinity) {
    console.log('💡 本番実行する場合は --all フラグを付けてください:')
    console.log('   node scripts/upload-unmapped-images.mjs --all\n')
  }
}

// 実行
main().catch(error => {
  console.error('❌ エラー:', error)
  process.exit(1)
})
