const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const csv = require('csv-parse/sync')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
)

// レアリティ変換マップ
const rarityMap = {
  'SSR': 'SS',
  'SR': 'S',
  'R': 'A',
  'N': 'B',
  '': 'C' // デフォルト
}

async function importCards() {
  try {
    console.log('ポケモンカードのインポートを開始します...\n')

    // CSVファイルを読み込み
    const csvPath = path.join(__dirname, '..', 'public', 'pokemon_cards_template.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // CSVをパース
    const records = csv.parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    })

    console.log(`${records.length}件のカードデータを読み込みました\n`)

    let successCount = 0
    let errorCount = 0

    // 各レコードを処理
    for (const record of records) {
      try {
        // レアリティを変換
        const originalRarity = record['レアリティ'] || ''
        const convertedRarity = rarityMap[originalRarity] || 'C'

        const cardData = {
          card_name: record['カード名'],
          product_code: record['商品コード'],
          rarity: convertedRarity,
          market_price: parseInt(record['還元pt']) || 0,
          image_url: '/images/ngcard.jpg', // 一旦デフォルト画像を設定
          description: `${record['カード名']} - ${originalRarity}レア`
        }

        // データベースに挿入（重複時は更新）
        const { data, error } = await supabase
          .from('pokemon_cards')
          .upsert(cardData, { 
            onConflict: 'product_code',
            ignoreDuplicates: false 
          })
          .select()
          .single()

        if (error) {
          console.error(`❌ エラー: ${cardData.card_name} (${cardData.product_code})`)
          console.error(`   ${error.message || error}`)
          console.error(`   詳細:`, error)
          errorCount++
        } else {
          console.log(`✅ 成功: ${cardData.card_name} (${cardData.product_code}) - ${convertedRarity}賞`)
          successCount++
        }

      } catch (err) {
        console.error(`❌ 処理エラー: ${record['カード名']}`)
        console.error(`   ${err.message}`)
        errorCount++
      }
    }

    // 結果サマリー
    console.log('\n==========================================')
    console.log('インポート結果:')
    console.log(`成功: ${successCount}件`)
    console.log(`エラー: ${errorCount}件`)
    console.log(`合計: ${records.length}件`)
    console.log('==========================================')

    // レアリティ別の統計を表示
    const { data: stats } = await supabase
      .from('pokemon_cards')
      .select('rarity')

    if (stats) {
      const rarityCounts = stats.reduce((acc, card) => {
        acc[card.rarity] = (acc[card.rarity] || 0) + 1
        return acc
      }, {})

      console.log('\nレアリティ別カード数:')
      Object.entries(rarityCounts).sort().forEach(([rarity, count]) => {
        console.log(`${rarity}賞: ${count}枚`)
      })
    }

    console.log('\n✅ インポートが完了しました！')
    console.log('\n管理画面でカードを確認できます: /admin/cards')
    console.log('画像URLは後から一括更新できます。')

  } catch (error) {
    console.error('インポートエラー:', error)
  }
}

// 実行
importCards()