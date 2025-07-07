const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// サンプルのSS/Sカードデータ
const sampleCards = [
  // SS賞カード
  { card_name: 'ピカチュウex SAR', product_code: 'SS-001', rarity: 'SS', market_price: 120000 },
  { card_name: 'リザードンex SAR', product_code: 'SS-002', rarity: 'SS', market_price: 150000 },
  { card_name: 'ミュウex SAR', product_code: 'SS-003', rarity: 'SS', market_price: 98000 },
  { card_name: 'ナンジャモ SAR', product_code: 'SS-004', rarity: 'SS', market_price: 110000 },
  { card_name: 'リーリエ SR', product_code: 'SS-005', rarity: 'SS', market_price: 85000 },
  { card_name: 'マリィ SR', product_code: 'SS-006', rarity: 'SS', market_price: 92000 },
  { card_name: 'ルギアV SA', product_code: 'SS-007', rarity: 'SS', market_price: 78000 },
  { card_name: 'レックウザVMAX CSR', product_code: 'SS-008', rarity: 'SS', market_price: 88000 },
  { card_name: 'アルセウスVSTAR UR', product_code: 'SS-009', rarity: 'SS', market_price: 95000 },
  { card_name: 'ギラティナVSTAR UR', product_code: 'SS-010', rarity: 'SS', market_price: 105000 },
  
  // S賞カード
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
  
  // A賞カード（検索テスト用）
  { card_name: 'ピカチュウ プロモ', product_code: 'A-001', rarity: 'A', market_price: 8000 },
  { card_name: 'イーブイ プロモ', product_code: 'A-002', rarity: 'A', market_price: 6500 },
  { card_name: 'リザードン R', product_code: 'A-003', rarity: 'A', market_price: 7000 },
]

async function importCards() {
  console.log('Starting card import...')
  
  try {
    // 既存のSS/Sカードを削除（重複防止）
    const { error: deleteError } = await supabase
      .from('pokemon_cards')
      .delete()
      .in('rarity', ['SS', 'S'])
      .like('product_code', 'SS-%')
      .or('product_code.like.S-%')
    
    if (deleteError) {
      console.log('Delete error (may be normal if no existing cards):', deleteError.message)
    }
    
    // カードを挿入
    const { data, error } = await supabase
      .from('pokemon_cards')
      .insert(sampleCards)
      .select()
    
    if (error) {
      console.error('Import error:', error)
      return
    }
    
    console.log(`Successfully imported ${data.length} cards!`)
    
    // 確認のため、レアリティ別のカウントを表示
    const { data: counts } = await supabase
      .from('pokemon_cards')
      .select('rarity')
    
    const rarityCounts = counts.reduce((acc, card) => {
      acc[card.rarity] = (acc[card.rarity] || 0) + 1
      return acc
    }, {})
    
    console.log('\nCard counts by rarity:')
    Object.entries(rarityCounts).forEach(([rarity, count]) => {
      console.log(`${rarity}: ${count} cards`)
    })
    
  } catch (error) {
    console.error('Unexpected error:', error)
  } finally {
    process.exit(0)
  }
}

importCards()