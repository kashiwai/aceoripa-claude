const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
)

// レアリティのマッピング
const rarityMapping = {
  'RankSS': 'SS',
  'RankS': 'S', 
  'RankA': 'A',
  'RankB': 'B',
  'RankC': 'C',
  'RankD': 'C' // RankDはCにマップ
}

// 簡易CSVパーサー
function parseCSV(content) {
  const lines = content.split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const records = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const values = line.split(',').map(v => v.trim())
    const record = {}
    
    headers.forEach((header, index) => {
      record[header] = values[index] || ''
    })
    
    records.push(record)
  }
  
  return records
}

async function importCards() {
  try {
    console.log('256件のカードデータインポートを開始します...')
    
    // CSVファイルを読み込み
    const csvPath = path.join(__dirname, '..', 'carddata_images_no.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // BOMを除去
    const cleanContent = csvContent.replace(/^\uFEFF/, '')
    
    // CSVをパース
    const records = parseCSV(cleanContent)
    
    console.log(`CSVから${records.length}件のデータを読み込みました`)
    
    // データを整形
    const cardsToInsert = []
    for (const record of records) {
      if (!record['商品名'] || !record['新コード']) continue
      
      const rarity = rarityMapping[record['ランク']] || 'C'
      
      cardsToInsert.push({
        card_name: record['商品名'].trim(),
        product_code: record['新コード'].trim(),
        rarity: rarity,
        image_url: '/images/ngcard.jpg',
        market_price: parseInt(record['交換ポイント'] || '0'),
        description: `${record['カテゴリー名'] || 'ポケモン'}カード - ${record['ランク'] || ''}`
      })
    }
    
    console.log(`${cardsToInsert.length}件のカードをインポートします`)
    
    // 既存のカードを削除（テスト用）
    console.log('既存のテストデータを削除中...')
    const { error: deleteError } = await supabase
      .from('pokemon_cards')
      .delete()
      .like('product_code', 'PKM-%')
    
    if (deleteError) {
      console.error('削除エラー:', deleteError)
    }
    
    // バッチサイズを設定（一度に挿入する件数）
    const batchSize = 50
    let insertedCount = 0
    
    // バッチで挿入
    for (let i = 0; i < cardsToInsert.length; i += batchSize) {
      const batch = cardsToInsert.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('pokemon_cards')
        .upsert(batch, { 
          onConflict: 'product_code',
          ignoreDuplicates: false 
        })
        .select()
      
      if (error) {
        console.error(`バッチ${Math.floor(i/batchSize) + 1}でエラー:`, error)
      } else {
        insertedCount += data.length
        console.log(`進行状況: ${insertedCount}/${cardsToInsert.length}件`)
      }
    }
    
    // 最終確認
    const { count } = await supabase
      .from('pokemon_cards')
      .select('*', { count: 'exact' })
    
    console.log('\n✅ インポート完了!')
    console.log(`データベース内の総カード数: ${count}件`)
    
    // レアリティ別の統計
    const rarityStats = {}
    for (const card of cardsToInsert) {
      rarityStats[card.rarity] = (rarityStats[card.rarity] || 0) + 1
    }
    
    console.log('\nレアリティ別統計:')
    Object.entries(rarityStats).forEach(([rarity, count]) => {
      console.log(`${rarity}賞: ${count}件`)
    })
    
  } catch (error) {
    console.error('インポート中にエラーが発生しました:', error)
  }
}

// 実行
importCards()