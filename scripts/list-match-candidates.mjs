#!/usr/bin/env node

/**
 * マッチング候補一覧スクリプト
 *
 * 画像なしカードとマッチング候補を一覧で表示
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

config({ path: path.join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const POKECA_DIR = '/Users/kousuke/Downloads/pokeca'
const IMAGES_DIR = path.join(POKECA_DIR, 'images')

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

async function getAllImages() {
  const allFiles = await fs.readdir(IMAGES_DIR)
  return allFiles
    .filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f))
    .map(f => ({
      fileName: f,
      baseName: f.replace(/\.(webp|jpg|jpeg|png)$/i, '')
    }))
}

function findImageCandidates(cardName, images) {
  const candidates = []

  const normalizedCardName = cardName
    .replace(/\s*PSA10\s*/gi, '')
    .replace(/\s*PSA\s*\d+\s*/gi, '')
    .replace(/\s+/g, '')
    .toLowerCase()

  for (const image of images) {
    const imageNameLower = image.baseName.toLowerCase()

    if (imageNameLower.includes(normalizedCardName)) {
      candidates.push({ image, score: 100, reason: '完全一致' })
      continue
    }

    const cardNameParts = normalizedCardName.split('')
    let matchCount = 0
    for (const char of cardNameParts) {
      if (imageNameLower.includes(char)) {
        matchCount++
      }
    }

    const score = (matchCount / cardNameParts.length) * 100
    if (score > 60) {
      candidates.push({ image, score: Math.round(score), reason: '部分一致' })
    }
  }

  return candidates.sort((a, b) => b.score - a.score)
}

async function main() {
  console.log('🔍 マッチング候補リスト生成中...\n')

  const cardsWithoutImages = await getCardsWithoutImages()
  console.log(`📊 画像なしカード: ${cardsWithoutImages.length}件\n`)

  const allImages = await getAllImages()
  console.log(`📁 画像ファイル: ${allImages.length}件\n`)

  console.log('=' .repeat(100))
  console.log('マッチング候補リスト')
  console.log('=' .repeat(100))

  let withCandidates = 0
  let withoutCandidates = 0

  const results = []

  for (const card of cardsWithoutImages) {
    const candidates = findImageCandidates(card.card_name, allImages)

    if (candidates.length > 0) {
      withCandidates++
      const topCandidate = candidates[0]
      results.push({
        cardName: card.card_name,
        productCode: card.product_code,
        candidate: topCandidate.image.fileName,
        score: topCandidate.score
      })
    } else {
      withoutCandidates++
    }
  }

  // スコアの高い順にソート
  results.sort((a, b) => b.score - a.score)

  // トップ50を表示
  console.log('\n🎯 マッチング候補トップ50:\n')
  results.slice(0, 50).forEach((result, i) => {
    console.log(`${(i + 1).toString().padStart(3, ' ')}. ${result.cardName.padEnd(40, ' ')} → ${result.candidate} (スコア: ${result.score})`)
  })

  console.log('\n' + '=' .repeat(100))
  console.log('📊 サマリー')
  console.log('=' .repeat(100))
  console.log(`画像なしカード:       ${cardsWithoutImages.length}件`)
  console.log(`候補あり:             ${withCandidates}件`)
  console.log(`候補なし:             ${withoutCandidates}件`)
  console.log('=' .repeat(100))

  // 候補なしカードを表示
  if (withoutCandidates > 0) {
    console.log('\n⚠️  候補が見つからなかったカード:\n')
    const noCandidates = cardsWithoutImages.filter(card => {
      const candidates = findImageCandidates(card.card_name, allImages)
      return candidates.length === 0
    })

    noCandidates.slice(0, 30).forEach((card, i) => {
      console.log(`  ${(i + 1).toString().padStart(3, ' ')}. ${card.card_name} (${card.product_code})`)
    })

    if (noCandidates.length > 30) {
      console.log(`  ... 他 ${noCandidates.length - 30}件`)
    }
  }

  console.log('\n💡 次のステップ:')
  console.log('  手動マッチングを開始する場合:')
  console.log('  node scripts/manual-match-images.mjs\n')
}

main().catch(error => {
  console.error('❌ エラー:', error)
  process.exit(1)
})
