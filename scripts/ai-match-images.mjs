#!/usr/bin/env node

/**
 * AI画像マッチングスクリプト
 *
 * OpenAI APIを使ってカード名と画像ファイル名をスマートにマッチング
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'
import OpenAI from 'openai'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

config({ path: path.join(__dirname, '../.env.local') })

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

const POKECA_DIR = '/Users/kousuke/Downloads/pokeca'
const IMAGES_DIR = path.join(POKECA_DIR, 'images')
const STORAGE_BUCKET = 'card-images'
const BATCH_SIZE = 20 // AIマッチング用のバッチサイズ
const DRY_RUN = process.argv.includes('--dry-run')

const stats = {
  totalWithoutImages: 0,
  processed: 0,
  matched: 0,
  uploaded: 0,
  errors: []
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
    const { data } = await supabase
      .from('pokemon_cards')
      .select('id, card_name, product_code, image_url')
      .range(page * pageSize, (page + 1) * pageSize - 1)

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
      fullPath: path.join(IMAGES_DIR, f)
    }))
}

/**
 * AIでマッチング
 */
async function matchWithAI(cards, imageFiles) {
  const prompt = `あなたはポケモンカードの画像マッチングエキスパートです。

以下のカード名リストと画像ファイル名リストから、最も適切なマッチングを提案してください。

【カード名リスト】
${cards.map((c, i) => `${i + 1}. ${c.card_name} (${c.product_code})`).join('\n')}

【画像ファイル名リスト（一部）】
${imageFiles.slice(0, 100).map((img, i) => `${i + 1}. ${img.fileName}`).join('\n')}

【指示】
1. カード名と画像ファイル名の内容が一致しそうなものをマッチングしてください
2. 部分一致、略称、PSA10の有無なども考慮してください
3. BOX商品、パック商品は除外してください（単一カードのみ）
4. 結果はJSON配列で返してください

【出力形式】
[
  {
    "cardIndex": 1,
    "imageFileName": "card_12345.jpg",
    "confidence": 95,
    "reason": "カード名とファイル名が完全一致"
  }
]

confidence は 0-100 の数値で、80以上のもののみ返してください。`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたはポケモンカードの画像マッチングエキスパートです。正確なマッチングを行ってください。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000
    })

    const content = response.choices[0].message.content

    // JSONを抽出
    let jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      // もしオブジェクト形式で返ってきた場合
      const parsed = JSON.parse(content)
      if (parsed.matches) {
        return parsed.matches
      }
      return []
    }

    const matches = JSON.parse(jsonMatch[0])
    return matches

  } catch (error) {
    console.error('AI マッチングエラー:', error.message)
    return []
  }
}

/**
 * 画像をアップロード
 */
async function uploadImage(imagePath, card) {
  try {
    const fileBuffer = await fs.readFile(imagePath)
    const ext = path.extname(imagePath)
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * メイン処理
 */
async function main() {
  console.log('🤖 AI画像マッチング開始\n')

  if (DRY_RUN) {
    console.log('🧪 ドライランモード\n')
  }

  // 1. 画像なしカードを取得
  console.log('📖 画像なしカードを取得中...')
  const cardsWithoutImages = await getCardsWithoutImages()
  stats.totalWithoutImages = cardsWithoutImages.length
  console.log(`✅ ${stats.totalWithoutImages}件\n`)

  // 2. 全画像ファイルを取得
  console.log('📁 画像ファイルを取得中...')
  const allImages = await getAllImages()
  console.log(`✅ ${allImages.length}件\n`)

  // 3. バッチ処理
  const batches = []
  for (let i = 0; i < cardsWithoutImages.length; i += BATCH_SIZE) {
    batches.push(cardsWithoutImages.slice(i, i + BATCH_SIZE))
  }

  console.log(`📦 ${batches.length}個のバッチに分割\n`)

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`\n🤖 バッチ ${i + 1}/${batches.length} 処理中... (${batch.length}件)`)

    try {
      const matches = await matchWithAI(batch, allImages)
      console.log(`  ✅ ${matches.length}件のマッチング候補`)

      for (const match of matches) {
        const card = batch[match.cardIndex - 1]
        if (!card) {
          console.log(`  ⚠️  無効なカードインデックス: ${match.cardIndex}`)
          continue
        }

        const image = allImages.find(img => img.fileName === match.imageFileName)
        if (!image) {
          console.log(`  ⚠️  画像が見つかりません: ${match.imageFileName}`)
          continue
        }

        console.log(`  🎯 ${card.card_name} → ${match.imageFileName} (信頼度: ${match.confidence}%)`)

        if (!DRY_RUN && match.confidence >= 80) {
          try {
            const publicUrl = await uploadImage(image.fullPath, card)
            console.log(`     ⬆️  アップロード完了: ${publicUrl}`)
            stats.matched++
            stats.uploaded++
          } catch (error) {
            console.log(`     ❌ エラー: ${error.message}`)
            stats.errors.push({
              cardName: card.card_name,
              error: error.message
            })
          }
        } else if (DRY_RUN) {
          stats.matched++
          stats.uploaded++
          console.log(`     🧪 アップロードスキップ（ドライラン）`)
        }

        stats.processed++
      }

      // API制限回避
      if (i < batches.length - 1) {
        console.log('  ⏳ APIレート制限回避のため5秒待機...')
        await sleep(5000)
      }

    } catch (error) {
      console.log(`  ❌ バッチ処理エラー: ${error.message}`)
    }
  }

  // 結果表示
  console.log('\n\n' + '='.repeat(70))
  console.log('📊 処理結果')
  console.log('='.repeat(70))
  console.log(`画像なしカード:   ${stats.totalWithoutImages}件`)
  console.log(`処理数:           ${stats.processed}件`)
  console.log(`マッチング:       ${stats.matched}件`)
  console.log(`アップロード:     ${stats.uploaded}件`)
  console.log(`エラー:           ${stats.errors.length}件`)
  console.log('='.repeat(70) + '\n')

  if (stats.errors.length > 0) {
    console.log('❌ エラー詳細:')
    stats.errors.slice(0, 10).forEach(err => {
      console.log(`  - ${err.cardName}: ${err.error}`)
    })
    if (stats.errors.length > 10) {
      console.log(`  ... 他 ${stats.errors.length - 10}件`)
    }
  }
}

main().catch(error => {
  console.error('❌ エラー:', error)
  process.exit(1)
})
