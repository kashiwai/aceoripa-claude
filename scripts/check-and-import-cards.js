const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAndImportCards() {
  console.log('Checking database for existing cards...')
  
  try {
    // 現在のカード数を確認
    const { count, error: countError } = await supabase
      .from('pokemon_cards')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Count error:', countError)
      return
    }
    
    console.log(`Current card count: ${count}`)
    
    if (count === 0) {
      console.log('No cards found. Importing sample cards...')
      
      // サンプルカードデータ
      const sampleCards = [
        // SS賞（10枚）
        { card_name: 'リザードンex SAR', product_code: 'SS-001', rarity: 'SS', market_price: 150000 },
        { card_name: 'ピカチュウex SAR', product_code: 'SS-002', rarity: 'SS', market_price: 120000 },
        { card_name: 'ミュウex SAR', product_code: 'SS-003', rarity: 'SS', market_price: 98000 },
        { card_name: 'ナンジャモ SAR', product_code: 'SS-004', rarity: 'SS', market_price: 110000 },
        { card_name: 'リーリエ SR', product_code: 'SS-005', rarity: 'SS', market_price: 85000 },
        { card_name: 'マリィ SR', product_code: 'SS-006', rarity: 'SS', market_price: 92000 },
        { card_name: 'ルギアV SA', product_code: 'SS-007', rarity: 'SS', market_price: 78000 },
        { card_name: 'レックウザVMAX CSR', product_code: 'SS-008', rarity: 'SS', market_price: 88000 },
        { card_name: 'アルセウスVSTAR UR', product_code: 'SS-009', rarity: 'SS', market_price: 95000 },
        { card_name: 'ギラティナVSTAR UR', product_code: 'SS-010', rarity: 'SS', market_price: 105000 },
        
        // S賞（20枚）
        { card_name: 'ピカチュウVMAX CSR', product_code: 'S-001', rarity: 'S', market_price: 45000 },
        { card_name: 'イーブイVMAX CSR', product_code: 'S-002', rarity: 'S', market_price: 38000 },
        { card_name: 'ブラッキーVMAX CSR', product_code: 'S-003', rarity: 'S', market_price: 42000 },
        { card_name: 'ニンフィアVMAX CSR', product_code: 'S-004', rarity: 'S', market_price: 35000 },
        { card_name: 'グレイシアVMAX CSR', product_code: 'S-005', rarity: 'S', market_price: 32000 },
        { card_name: 'リーフィアVMAX CSR', product_code: 'S-006', rarity: 'S', market_price: 30000 },
        { card_name: 'サンダースVMAX CSR', product_code: 'S-007', rarity: 'S', market_price: 28000 },
        { card_name: 'シャワーズVMAX CSR', product_code: 'S-008', rarity: 'S', market_price: 28000 },
        { card_name: 'ブースターVMAX CSR', product_code: 'S-009', rarity: 'S', market_price: 26000 },
        { card_name: 'エーフィVMAX CSR', product_code: 'S-010', rarity: 'S', market_price: 32000 },
        { card_name: 'フシギバナex SR', product_code: 'S-011', rarity: 'S', market_price: 22000 },
        { card_name: 'カメックスex SR', product_code: 'S-012', rarity: 'S', market_price: 20000 },
        { card_name: 'ミュウツーex SR', product_code: 'S-013', rarity: 'S', market_price: 25000 },
        { card_name: 'レックウザex SR', product_code: 'S-014', rarity: 'S', market_price: 24000 },
        { card_name: 'ルカリオex SR', product_code: 'S-015', rarity: 'S', market_price: 18000 },
        { card_name: 'ゲッコウガex SR', product_code: 'S-016', rarity: 'S', market_price: 16000 },
        { card_name: 'ガブリアスex SR', product_code: 'S-017', rarity: 'S', market_price: 15000 },
        { card_name: 'サーナイトex SR', product_code: 'S-018', rarity: 'S', market_price: 17000 },
        { card_name: 'ジラーチex SR', product_code: 'S-019', rarity: 'S', market_price: 19000 },
        { card_name: 'デオキシスex SR', product_code: 'S-020', rarity: 'S', market_price: 21000 },
        
        // A賞（30枚）
        { card_name: 'ピカチュウ プロモ', product_code: 'A-001', rarity: 'A', market_price: 8000 },
        { card_name: 'イーブイ プロモ', product_code: 'A-002', rarity: 'A', market_price: 6500 },
        { card_name: 'リザードン R', product_code: 'A-003', rarity: 'A', market_price: 7000 },
        { card_name: 'フシギバナ R', product_code: 'A-004', rarity: 'A', market_price: 5000 },
        { card_name: 'カメックス R', product_code: 'A-005', rarity: 'A', market_price: 5000 },
        { card_name: 'ピカチュウV', product_code: 'A-006', rarity: 'A', market_price: 4500 },
        { card_name: 'ミュウツーV', product_code: 'A-007', rarity: 'A', market_price: 4000 },
        { card_name: 'レックウザV', product_code: 'A-008', rarity: 'A', market_price: 4200 },
        { card_name: 'ルギアV', product_code: 'A-009', rarity: 'A', market_price: 3800 },
        { card_name: 'ホウオウV', product_code: 'A-010', rarity: 'A', market_price: 3600 },
        
        // B賞（40枚）
        { card_name: 'ピカチュウ', product_code: 'B-001', rarity: 'B', market_price: 1500 },
        { card_name: 'イーブイ', product_code: 'B-002', rarity: 'B', market_price: 1200 },
        { card_name: 'フシギダネ', product_code: 'B-003', rarity: 'B', market_price: 800 },
        { card_name: 'ヒトカゲ', product_code: 'B-004', rarity: 'B', market_price: 800 },
        { card_name: 'ゼニガメ', product_code: 'B-005', rarity: 'B', market_price: 800 },
        { card_name: 'ブラッキー', product_code: 'B-006', rarity: 'B', market_price: 1000 },
        { card_name: 'エーフィ', product_code: 'B-007', rarity: 'B', market_price: 1000 },
        { card_name: 'ニンフィア', product_code: 'B-008', rarity: 'B', market_price: 900 },
        { card_name: 'グレイシア', product_code: 'B-009', rarity: 'B', market_price: 900 },
        { card_name: 'リーフィア', product_code: 'B-010', rarity: 'B', market_price: 900 },
        
        // C賞（50枚）  
        { card_name: 'コイキング', product_code: 'C-001', rarity: 'C', market_price: 200 },
        { card_name: 'ポッポ', product_code: 'C-002', rarity: 'C', market_price: 150 },
        { card_name: 'コラッタ', product_code: 'C-003', rarity: 'C', market_price: 150 },
        { card_name: 'キャタピー', product_code: 'C-004', rarity: 'C', market_price: 180 },
        { card_name: 'ビードル', product_code: 'C-005', rarity: 'C', market_price: 180 },
        { card_name: 'オニスズメ', product_code: 'C-006', rarity: 'C', market_price: 160 },
        { card_name: 'アーボ', product_code: 'C-007', rarity: 'C', market_price: 170 },
        { card_name: 'サンド', product_code: 'C-008', rarity: 'C', market_price: 190 },
        { card_name: 'ニドラン♀', product_code: 'C-009', rarity: 'C', market_price: 200 },
        { card_name: 'ニドラン♂', product_code: 'C-010', rarity: 'C', market_price: 200 }
      ]
      
      // カードを挿入
      const { data, error: insertError } = await supabase
        .from('pokemon_cards')
        .insert(sampleCards)
        .select()
      
      if (insertError) {
        console.error('Insert error:', insertError)
        return
      }
      
      console.log(`Successfully imported ${data.length} cards!`)
    } else {
      // レアリティ別のカード数を表示
      const { data: rarityStats } = await supabase
        .from('pokemon_cards')
        .select('rarity')
      
      const counts = rarityStats.reduce((acc, card) => {
        acc[card.rarity] = (acc[card.rarity] || 0) + 1
        return acc
      }, {})
      
      console.log('\nCurrent card distribution:')
      console.log('SS:', counts.SS || 0, 'cards')
      console.log('S:', counts.S || 0, 'cards')
      console.log('A:', counts.A || 0, 'cards')
      console.log('B:', counts.B || 0, 'cards')
      console.log('C:', counts.C || 0, 'cards')
      console.log('D:', counts.D || 0, 'cards')
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  } finally {
    process.exit(0)
  }
}

checkAndImportCards()