const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
)

// サンプルカードデータ
const sampleCards = [
  // SS賞
  { card_name: 'リザードンex SAR', product_code: 'PK-001', rarity: 'SS', market_price: 50000, image_url: '/images/pokemon/001_リザードンex SAR_PK-001.jpg' },
  { card_name: 'ピカチュウ AR', product_code: 'PK-002', rarity: 'SS', market_price: 30000, image_url: '/images/pokemon/002_ピカチュウ AR_PK-002.jpg' },
  { card_name: 'ミュウex SAR', product_code: 'PK-003', rarity: 'SS', market_price: 25000, image_url: '/images/pokemon/003_ミュウex SAR_PK-003.jpg' },
  
  // S賞
  { card_name: 'エリカの招待 SR', product_code: 'PK-010', rarity: 'S', market_price: 8000, image_url: '/images/pokemon/010_エリカの招待 SR_PK-010.jpg' },
  { card_name: 'ナンジャモ SR', product_code: 'PK-011', rarity: 'S', market_price: 12000, image_url: '/images/pokemon/011_ナンジャモ SR_PK-011.jpg' },
  { card_name: 'サンダーex SR', product_code: 'PK-012', rarity: 'S', market_price: 5000, image_url: '/images/pokemon/012_サンダーex SR_PK-012.jpg' },
  
  // A賞
  { card_name: 'フシギバナ R', product_code: 'PK-020', rarity: 'A', market_price: 1500, image_url: '/images/pokemon/020_フシギバナ R_PK-020.jpg' },
  { card_name: 'カメックス R', product_code: 'PK-021', rarity: 'A', market_price: 1200, image_url: '/images/pokemon/021_カメックス R_PK-021.jpg' },
  { card_name: 'ピカチュウ プロモ', product_code: 'PK-022', rarity: 'A', market_price: 2000, image_url: '/images/pokemon/022_ピカチュウ プロモ_PK-022.jpg' },
  
  // B賞
  { card_name: 'イーブイ C', product_code: 'PK-030', rarity: 'B', market_price: 300, image_url: '/images/pokemon/030_イーブイ C_PK-030.jpg' },
  { card_name: 'コイキング C', product_code: 'PK-031', rarity: 'B', market_price: 100, image_url: '/images/pokemon/031_コイキング C_PK-031.jpg' },
  { card_name: 'ゼニガメ C', product_code: 'PK-032', rarity: 'B', market_price: 200, image_url: '/images/pokemon/032_ゼニガメ C_PK-032.jpg' },
  
  // C賞
  { card_name: 'エネルギーカード', product_code: 'PK-040', rarity: 'C', market_price: 50, image_url: '/images/pokemon/040_エネルギーカード_PK-040.jpg' },
  { card_name: 'トレーナーズカード', product_code: 'PK-041', rarity: 'C', market_price: 50, image_url: '/images/pokemon/041_トレーナーズカード_PK-041.jpg' },
  { card_name: 'ボールカード', product_code: 'PK-042', rarity: 'C', market_price: 50, image_url: '/images/pokemon/042_ボールカード_PK-042.jpg' },
]

// サンプルガチャデータ
const sampleGacha = {
  name: 'ポケモンカード151 スペシャルガチャ',
  description: 'ポケモンカード151の人気カードが当たる！リザードンex SARも封入！',
  single_price: 800,
  multi_price: 7200,
  card_count: 1,
  bonus_cards: 0,
  is_active: true,
  guarantee_sr_on_multi: true,
  banner_image_url: '/images/banners/pokemon-151-gacha.jpg',
  metadata: {
    animation_type: 'premium',
    stock_total: 3000,
    stock_remaining: 2850,
    revenue_total: 0,
    total_draws: 0
  }
}

async function seedData() {
  try {
    console.log('サンプルデータの投入を開始します...')

    // 1. カードを投入
    console.log('\n1. カードデータを投入中...')
    for (const card of sampleCards) {
      const { data, error } = await supabase
        .from('pokemon_cards')
        .upsert(card, { onConflict: 'product_code' })
        .select()
        .single()

      if (error) {
        console.error(`カード投入エラー (${card.card_name}):`, error.message)
      } else {
        console.log(`✓ カード投入成功: ${card.card_name}`)
      }
    }

    // 2. ガチャを作成
    console.log('\n2. ガチャを作成中...')
    const { data: gacha, error: gachaError } = await supabase
      .from('gacha_products')
      .insert(sampleGacha)
      .select()
      .single()

    if (gachaError) {
      console.error('ガチャ作成エラー:', gachaError.message)
      return
    }
    console.log(`✓ ガチャ作成成功: ${gacha.name}`)

    // 3. カードプールを設定
    console.log('\n3. カードプールを設定中...')
    
    // 各カードの重み設定
    const weights = {
      'SS': 10,   // SS賞: 1%程度
      'S': 50,    // S賞: 5%程度
      'A': 200,   // A賞: 20%程度
      'B': 300,   // B賞: 30%程度
      'C': 440    // C賞: 44%程度
    }

    // カードIDを取得
    const { data: cards } = await supabase
      .from('pokemon_cards')
      .select('id, rarity, card_name')
      .in('product_code', sampleCards.map(c => c.product_code))

    if (cards) {
      const pools = cards.map(card => ({
        gacha_product_id: gacha.id,
        pokemon_card_id: card.id,
        weight: weights[card.rarity] || 100
      }))

      const { error: poolError } = await supabase
        .from('gacha_pokemon_pools')
        .insert(pools)

      if (poolError) {
        console.error('プール設定エラー:', poolError.message)
      } else {
        console.log(`✓ ${pools.length}枚のカードをプールに設定しました`)
        
        // 確率の確認
        console.log('\n確率設定:')
        const totalWeight = pools.reduce((sum, p) => sum + p.weight, 0)
        const rarityWeights = {}
        pools.forEach(p => {
          const card = cards.find(c => c.id === p.pokemon_card_id)
          if (card) {
            rarityWeights[card.rarity] = (rarityWeights[card.rarity] || 0) + p.weight
          }
        })
        
        Object.entries(rarityWeights).forEach(([rarity, weight]) => {
          const percentage = ((weight / totalWeight) * 100).toFixed(1)
          console.log(`${rarity}賞: ${percentage}%`)
        })
      }
    }

    console.log('\n✅ サンプルデータの投入が完了しました！')
    console.log('\n管理画面でガチャとカードを確認できます:')
    console.log('- ガチャ管理: /admin/gacha')
    console.log('- カード管理: /admin/cards')

  } catch (error) {
    console.error('エラーが発生しました:', error)
  }
}

// 実行
seedData()