#!/usr/bin/env node

/**
 * 手動画像マッチングスクリプト
 *
 * 画像なしカードと未使用画像をマッチングして、
 * 手動で確認しながらアップロード
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

config({ path: path.join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const POKECA_DIR = '/Users/kousuke/Downloads/pokeca'
const IMAGES_DIR = path.join(POKECA_DIR, 'images')
const STORAGE_BUCKET = 'card-images'

// 統計
const stats = {
  totalWithoutImages: 0,
  matched: 0,
  uploaded: 0,
  skipped: 0
}

/**
 * 画像なしカードを取得
 */
async function getCardsWithoutImages() {
  const cards = []
  const pageSize = 1000

  const { count: totalCount } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact', head: true })

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
  }

  return cards.filter(card =>
    !card.image_url ||
    card.image_url.includes('/images/ngcard.jpg') ||
    !card.image_url.includes('supabase.co')
  )
}

/**
 * 全画像ファイルを取得
 */
async function getAllImages() {
  const allFiles = await fs.readdir(IMAGES_DIR)
  return allFiles
    .filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f))
    .map(f => ({
      fileName: f,
      fullPath: path.join(IMAGES_DIR, f),
      baseName: f.replace(/\.(webp|jpg|jpeg|png)$/i, '')
    }))
}

/**
 * カード名から画像候補を検索
 */
function findImageCandidates(cardName, images) {
  const candidates = []

  // カード名を正規化（PSA10などを除去）
  const normalizedCardName = cardName
    .replace(/\s*PSA10\s*/gi, '')
    .replace(/\s*PSA\s*\d+\s*/gi, '')
    .replace(/\s+/g, '')
    .toLowerCase()

  for (const image of images) {
    const imageNameLower = image.baseName.toLowerCase()

    // 完全一致
    if (imageNameLower.includes(normalizedCardName)) {
      candidates.push({ image, score: 100, reason: '完全一致' })
      continue
    }

    // 部分一致
    const cardNameParts = normalizedCardName.split('')
    let matchCount = 0
    for (const char of cardNameParts) {
      if (imageNameLower.includes(char)) {
        matchCount++
      }
    }

    const score = (matchCount / cardNameParts.length) * 100
    if (score > 50) {
      candidates.push({ image, score: Math.round(score), reason: '部分一致' })
    }
  }

  return candidates.sort((a, b) => b.score - a.score)
}

/**
 * ユーザー入力を取得
 */
function askUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

/**
 * 画像をアップロード
 */
async function uploadImage(image, card) {
  try {
    const fileBuffer = await fs.readFile(image.fullPath)
    const ext = path.extname(image.fileName)
    const fileName = `${card.id}${ext}`

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: getContentType(ext),
        upsert: true
      })

    if (uploadError) {
      throw new Error(`アップロードエラー: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)

    const { error: updateError } = await supabase
      .from('pokemon_cards')
      .update({ image_url: publicUrl })
      .eq('id', card.id)

    if (updateError) {
      throw new Error(`DB更新エラー: ${updateError.message}`)
    }

    return publicUrl
  } catch (error) {
    throw error
  }
}

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
 * メイン処理
 */
async function main() {
  console.log('🔍 手動画像マッチング開始\n')

  // 1. 画像なしカードを取得
  console.log('📖 画像なしカードを取得中...')
  const cardsWithoutImages = await getCardsWithoutImages()
  stats.totalWithoutImages = cardsWithoutImages.length
  console.log(`✅ ${stats.totalWithoutImages}件の画像なしカード\n`)

  // 2. 全画像ファイルを取得
  console.log('📁 画像ファイルを読み込み中...')
  const allImages = await getAllImages()
  console.log(`✅ ${allImages.length}件の画像ファイル\n`)

  // 3. 各カードに対してマッチング候補を表示
  console.log('=' .repeat(70))
  console.log('手動マッチング開始')
  console.log('=' .repeat(70))
  console.log('操作方法:')
  console.log('  - 番号入力: その画像を使用')
  console.log('  - s: スキップ')
  console.log('  - q: 終了')
  console.log('=' .repeat(70) + '\n')

  for (let i = 0; i < cardsWithoutImages.length; i++) {
    const card = cardsWithoutImages[i]

    console.log(`\n[${i + 1}/${cardsWithoutImages.length}] ${card.card_name} (${card.product_code})`)

    // 候補を検索
    const candidates = findImageCandidates(card.card_name, allImages)

    if (candidates.length === 0) {
      console.log('  ⚠️  候補が見つかりませんでした')
      stats.skipped++
      continue
    }

    // トップ5候補を表示
    console.log('  候補画像:')
    candidates.slice(0, 5).forEach((candidate, idx) => {
      console.log(`    [${idx + 1}] ${candidate.image.fileName} (スコア: ${candidate.score}, ${candidate.reason})`)
    })

    const answer = await askUser('  選択 (1-5 / s=スキップ / q=終了): ')

    if (answer === 'q') {
      console.log('\n中断しました')
      break
    }

    if (answer === 's' || answer === '') {
      console.log('  ⏭️  スキップ')
      stats.skipped++
      continue
    }

    const choice = parseInt(answer)
    if (choice >= 1 && choice <= 5 && candidates[choice - 1]) {
      const selectedImage = candidates[choice - 1].image
      console.log(`  ✅ ${selectedImage.fileName} を使用`)

      try {
        const publicUrl = await uploadImage(selectedImage, card)
        console.log(`  ⬆️  アップロード完了: ${publicUrl}`)
        stats.matched++
        stats.uploaded++
      } catch (error) {
        console.log(`  ❌ エラー: ${error.message}`)
      }
    } else {
      console.log('  ⚠️  無効な選択')
      stats.skipped++
    }
  }

  // 結果表示
  console.log('\n\n' + '='.repeat(70))
  console.log('📊 処理結果')
  console.log('='.repeat(70))
  console.log(`画像なしカード:   ${stats.totalWithoutImages}件`)
  console.log(`マッチング:       ${stats.matched}件`)
  console.log(`アップロード:     ${stats.uploaded}件`)
  console.log(`スキップ:         ${stats.skipped}件`)
  console.log('='.repeat(70) + '\n')
}

main().catch(error => {
  console.error('❌ エラー:', error)
  process.exit(1)
})
