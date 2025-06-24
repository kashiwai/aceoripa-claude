const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Supabaseクライアントの作成
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('SUPABASE_SERVICE_KEY:', supabaseKey ? '設定済み' : '未設定')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// サンプルカードデータ（テキストデータのみ正しい状態）
const cards = [
  { card_name: 'リザードンex', product_code: 'PKM-151-001', rarity: 'SS', market_price: 50000 },
  { card_name: 'ミュウex', product_code: 'PKM-151-002', rarity: 'SS', market_price: 30000 },
  { card_name: 'ピカチュウex', product_code: 'PKM-151-003', rarity: 'SS', market_price: 25000 },
  { card_name: 'フシギバナex', product_code: 'PKM-SV-001', rarity: 'S', market_price: 10000 },
  { card_name: 'カメックスex', product_code: 'PKM-SV-002', rarity: 'S', market_price: 8000 },
  { card_name: 'フリーザーex', product_code: 'PKM-151-010', rarity: 'S', market_price: 5000 },
  { card_name: 'ニドクイン', product_code: 'PKM-151-020', rarity: 'A', market_price: 1000 },
  { card_name: 'ニドキング', product_code: 'PKM-151-021', rarity: 'A', market_price: 1000 },
  { card_name: 'フシギダネ', product_code: 'PKM-151-050', rarity: 'B', market_price: 100 },
  { card_name: 'ヒトカゲ', product_code: 'PKM-151-051', rarity: 'B', market_price: 100 },
  { card_name: 'ゼニガメ', product_code: 'PKM-151-052', rarity: 'B', market_price: 100 },
  { card_name: 'ピカチュウ', product_code: 'PKM-151-053', rarity: 'B', market_price: 100 },
]

async function importCards() {
  console.log('カードの直接インポートを開始します...\n')

  for (const card of cards) {
    try {
      // デフォルト画像URLを設定
      const cardData = {
        ...card,
        image_url: '/images/ngcard.jpg',
        description: `${card.card_name} - ${card.rarity}賞`
      }

      // データベースに挿入
      const { data, error } = await supabase
        .from('pokemon_cards')
        .insert(cardData)
        .select()
        .single()

      if (error) {
        console.error(`❌ エラー: ${card.card_name}`)
        console.error('   エラー内容:', error)
      } else {
        console.log(`✅ 成功: ${card.card_name} (${card.product_code}) - ${card.rarity}賞`)
      }
    } catch (err) {
      console.error(`❌ 処理エラー: ${card.card_name}`)
      console.error('   ', err)
    }
  }

  // 投入結果を確認
  console.log('\n投入結果を確認中...')
  const { data: allCards, error: fetchError } = await supabase
    .from('pokemon_cards')
    .select('*')
    .order('rarity', { ascending: true })

  if (fetchError) {
    console.error('カード取得エラー:', fetchError)
  } else {
    console.log(`\n✅ 合計 ${allCards.length} 枚のカードが登録されています`)
    
    // レアリティ別集計
    const byRarity = allCards.reduce((acc, card) => {
      acc[card.rarity] = (acc[card.rarity] || 0) + 1
      return acc
    }, {})
    
    console.log('\nレアリティ別:')
    Object.entries(byRarity).forEach(([rarity, count]) => {
      console.log(`  ${rarity}賞: ${count}枚`)
    })
  }
}

// 実行
importCards().catch(console.error)