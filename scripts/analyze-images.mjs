#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const POKECA_DIR = '/Users/kousuke/Downloads/pokeca'
const CACHE_FILE = path.join(POKECA_DIR, 'ai_card_excel_cache.json')
const IMAGES_DIR = path.join(POKECA_DIR, 'images')

// キャッシュファイルを読み込み
const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))

// キャッシュに含まれる画像パスを抽出
const cachedImages = new Set(Object.keys(cache))

// images/フォルダの全ファイルを取得
const allImages = fs.readdirSync(IMAGES_DIR)
  .filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f))
  .map(f => 'images/' + f)

console.log('📊 画像分析結果:')
console.log('='.repeat(60))
console.log(`総画像数:      ${allImages.length}件`)
console.log(`キャッシュ数:  ${cachedImages.size}件`)
console.log(`未マッピング:  ${allImages.length - cachedImages.size}件`)
console.log('='.repeat(60))

// サンプル: キャッシュに含まれている画像パス
console.log('\n✅ キャッシュ済み画像のサンプル:')
Array.from(cachedImages).slice(0, 10).forEach(path => {
  const cardName = cache[path].full_card_name || cache[path].pokemon_or_character
  console.log(`  - ${path} → ${cardName}`)
})

// サンプル: キャッシュに含まれていない画像
const unmappedImages = allImages.filter(path => !cachedImages.has(path))
console.log(`\n❌ 未マッピング画像のサンプル（${unmappedImages.length}件中10件）:`)
unmappedImages.slice(0, 10).forEach(path => {
  console.log(`  - ${path}`)
})

console.log(`\n💡 提案:`)
console.log(`  - 未マッピングの${unmappedImages.length}件の画像からカード名を抽出する必要があります`)
console.log(`  - OpenAI Vision APIを使って画像からカード名を読み取る`)
console.log(`  - または、別のメタデータファイルが存在するか確認`)
