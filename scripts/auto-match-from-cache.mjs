import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// .env.localを読み込み
config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const POKECA_DIR = '/Users/kousuke/Downloads/pokeca'
const IMAGES_DIR = path.join(POKECA_DIR, 'images')
const MANUAL_IMAGES_DIR = path.join(POKECA_DIR, '手動画像')
const AI_CACHE_FILE = path.join(POKECA_DIR, 'ai_card_excel_cache.json')
const PAID_CACHE_FILE = path.join(POKECA_DIR, 'paid_tier_cache.json')
const STORAGE_BUCKET = 'card-images'

// キャッシュデータを読み込み
async function loadCaches() {
  console.log('📂 キャッシュファイルを読み込み中...')

  let aiCache = {}
  let paidCache = {}

  try {
    const aiContent = await fs.readFile(AI_CACHE_FILE, 'utf-8')
    aiCache = JSON.parse(aiContent)
    console.log(`  ✓ ai_card_excel_cache: ${Object.keys(aiCache).length}件`)
  } catch (e) {
    console.log('  ⚠ ai_card_excel_cache読み込み失敗')
  }

  try {
    const paidContent = await fs.readFile(PAID_CACHE_FILE, 'utf-8')
    paidCache = JSON.parse(paidContent)
    console.log(`  ✓ paid_tier_cache: ${Object.keys(paidCache).length}件`)
  } catch (e) {
    console.log('  ⚠ paid_tier_cache読み込み失敗')
  }

  // インデックス作成
  const aiIndex = new Map()
  for (const [key, value] of Object.entries(aiCache)) {
    const match = key.match(/card_[^.]+/)
    if (match) {
      aiIndex.set(match[0], value)
    }
    const filename = key.split('/').pop()?.replace(/\.(webp|jpg|jpeg|png)$/i, '')
    if (filename) {
      aiIndex.set(filename, value)
    }
  }

  const paidIndex = new Map()
  for (const [key, value] of Object.entries(paidCache)) {
    const fileBase = key.replace(/\.(webp|jpg|jpeg|png|gif)$/i, '')
    paidIndex.set(fileBase, value)
  }

  return { aiIndex, paidIndex }
}

// 画像ファイル一覧を取得
async function loadImageFiles() {
  const files = await fs.readdir(IMAGES_DIR)
  const regularImages = files.filter(f => /\.(webp|jpg|jpeg|png|gif)$/i.test(f))

  let manualImages = []
  try {
    const manualFiles = await fs.readdir(MANUAL_IMAGES_DIR)
    manualImages = manualFiles
      .filter(f => /\.(webp|jpg|jpeg|png|gif)$/i.test(f))
      .map(f => `手動/${f}`)
  } catch (e) {
    // 手動画像フォルダがない場合
  }

  return [...regularImages, ...manualImages]
}

// カード名から画像を検索
function searchImageByCardName(cardName, imageFiles, aiIndex, paidIndex) {
  const normalizedQuery = cardName
    .replace(/\s*PSA10\s*/gi, '')
    .replace(/\s*PSA\s*\d+\s*/gi, '')
    .replace(/\s+/g, '')
    .toLowerCase()

  const results = []

  for (const fileName of imageFiles) {
    const normalizedFileName = fileName.toLowerCase()
    const isManual = fileName.startsWith('手動/')
    const actualFileName = isManual ? fileName.substring(3) : fileName
    const fileBase = actualFileName.replace(/\.(webp|jpg|jpeg|png|gif)$/i, '')

    // キャッシュからカード情報取得
    const aiCardInfo = aiIndex.get(fileBase) || null
    const paidCardName = paidIndex.get(fileBase) || null

    let score = 0
    let matchText = normalizedFileName

    // ai_cacheの詳細情報で検索
    if (aiCardInfo) {
      const searchableText = [
        aiCardInfo.pokemon_or_character,
        aiCardInfo.full_card_name,
        aiCardInfo.card_number,
        aiCardInfo.rarity,
        aiCardInfo.series,
        aiCardInfo.suggested_filename,
        actualFileName
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .replace(/\s+/g, '')

      matchText = searchableText
    } else if (paidCardName) {
      // paid_cacheのカード名で検索
      const searchableText = [paidCardName, actualFileName]
        .join(' ')
        .toLowerCase()
        .replace(/\s+/g, '')
      matchText = searchableText
    } else if (isManual) {
      matchText = actualFileName.toLowerCase().replace(/\s+/g, '')
    }

    // 完全一致
    if (matchText.includes(normalizedQuery)) {
      score = 100

      // ファイル名での完全一致はさらに高スコア
      if (normalizedFileName.includes(normalizedQuery)) {
        score = 110
      }
    } else {
      // 部分一致
      const queryChars = normalizedQuery.split('')
      let matchCount = 0
      for (const char of queryChars) {
        if (matchText.includes(char)) {
          matchCount++
        }
      }
      score = Math.round((matchCount / queryChars.length) * 100)
    }

    // スコア80以上のみ（高精度マッチング）
    if (score >= 80) {
      results.push({
        fileName,
        score,
        cardName: aiCardInfo?.full_card_name || aiCardInfo?.pokemon_or_character || paidCardName
      })
    }
  }

  // スコアでソート
  results.sort((a, b) => b.score - a.score)
  return results
}

// 画像をアップロード
async function uploadImage(cardId, imageFileName) {
  const isManual = imageFileName.startsWith('手動/')
  const actualFileName = isManual ? imageFileName.substring(3) : imageFileName
  const baseDir = isManual ? MANUAL_IMAGES_DIR : IMAGES_DIR

  const imagePath = path.join(baseDir, actualFileName)
  const fileBuffer = await fs.readFile(imagePath)
  const ext = path.extname(actualFileName)
  const fileName = `${cardId}${ext}`

  const contentType = ext === '.webp' ? 'image/webp' :
                     ext === '.png' ? 'image/png' :
                     ext === '.gif' ? 'image/gif' : 'image/jpeg'

  // Supabase Storageにアップロード
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, fileBuffer, {
      contentType,
      upsert: true
    })

  if (uploadError) {
    throw uploadError
  }

  // 公開URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName)

  // DBのimage_urlを更新
  const { error: updateError } = await supabase
    .from('pokemon_cards')
    .update({ image_url: publicUrl })
    .eq('id', cardId)

  if (updateError) {
    throw updateError
  }

  return publicUrl
}

// メイン処理
async function main() {
  console.log('🚀 自動マッチング処理を開始します\n')

  // キャッシュとファイル一覧をロード
  const { aiIndex, paidIndex } = await loadCaches()
  const imageFiles = await loadImageFiles()
  console.log(`📁 画像ファイル: ${imageFiles.length}件\n`)

  // 画像なしカードを取得
  const { data: cardsWithoutImages, error } = await supabase
    .from('pokemon_cards')
    .select('id, card_name')
    .not('image_url', 'like', '%supabase.co%')
    .order('id')

  if (error) {
    console.error('❌ DB取得エラー:', error)
    return
  }

  console.log(`📊 画像なしカード: ${cardsWithoutImages.length}件\n`)

  // 統計
  let matched = 0
  let skipped = 0
  let failed = 0

  // ドライランモード確認
  const isDryRun = process.argv.includes('--dry-run')
  if (isDryRun) {
    console.log('🔍 ドライランモード（実際のアップロードは行いません）\n')
  }

  // 各カードをマッチング
  for (let i = 0; i < cardsWithoutImages.length; i++) {
    const card = cardsWithoutImages[i]
    const progress = `[${i + 1}/${cardsWithoutImages.length}]`

    // 検索
    const candidates = searchImageByCardName(card.card_name, imageFiles, aiIndex, paidIndex)

    if (candidates.length === 0) {
      console.log(`${progress} ⏭  ${card.card_name} - マッチなし`)
      skipped++
      continue
    }

    const bestMatch = candidates[0]

    // スコア80以上のみ自動マッチング
    if (bestMatch.score < 80) {
      console.log(`${progress} ⏭  ${card.card_name} - スコア低い (${bestMatch.score})`)
      skipped++
      continue
    }

    try {
      if (!isDryRun) {
        // アップロード実行
        const publicUrl = await uploadImage(card.id, bestMatch.fileName)
        console.log(`${progress} ✅ ${card.card_name}`)
        console.log(`     → ${bestMatch.fileName} (score: ${bestMatch.score})`)
        console.log(`     → ${publicUrl}`)
      } else {
        console.log(`${progress} 🔍 ${card.card_name}`)
        console.log(`     → ${bestMatch.fileName} (score: ${bestMatch.score})`)
      }
      matched++
    } catch (err) {
      console.error(`${progress} ❌ ${card.card_name} - エラー:`, err.message)
      failed++
    }

    // レート制限対策
    if (!isDryRun && i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // 結果サマリー
  console.log('\n' + '='.repeat(60))
  console.log('📊 処理結果')
  console.log('='.repeat(60))
  console.log(`総カード数: ${cardsWithoutImages.length}件`)
  console.log(`マッチング成功: ${matched}件`)
  console.log(`スキップ: ${skipped}件`)
  console.log(`失敗: ${failed}件`)
  console.log('='.repeat(60))

  if (isDryRun) {
    console.log('\n💡 実際にアップロードするには --dry-run オプションを外して実行してください')
  }
}

main().catch(console.error)
