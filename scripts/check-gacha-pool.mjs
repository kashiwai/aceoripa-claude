import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../Users/kousuke/aceoripa/aceoripa/aceoripa-claude/.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkGachaPools() {
  console.log('🔍 ガチャプロダクトとプールを確認中...\n')

  // 1. ガチャプロダクト一覧を取得
  const { data: products, error: productsError } = await supabase
    .from('gacha_products')
    .select('id, name, price, is_active')
    .order('created_at', { ascending: false })
    .limit(10)

  if (productsError) {
    console.error('❌ ガチャプロダクト取得エラー:', productsError)
    return
  }

  console.log(`📦 ガチャプロダクト: ${products.length}件\n`)

  for (const product of products) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📦 ${product.name}`)
    console.log(`   ID: ${product.id}`)
    console.log(`   価格: ${product.price}ポイント`)
    console.log(`   状態: ${product.is_active ? '✅ 有効' : '❌ 無効'}`)

    // プール情報を取得
    const { data: pools, error: poolsError } = await supabase
      .from('gacha_pools')
      .select('*')
      .eq('gacha_id', product.id)

    if (poolsError) {
      console.error(`   ❌ プール取得エラー:`, poolsError)
      continue
    }

    console.log(`   プール: ${pools.length}枚のカード`)

    if (pools.length === 0) {
      console.log(`   ⚠️  プールが空です！カードを登録してください`)
    } else {
      // レアリティ別に集計
      const rarityCount = {}
      pools.forEach(p => {
        const rarity = p.rarity || 'Unknown'
        rarityCount[rarity] = (rarityCount[rarity] || 0) + 1
      })

      Object.entries(rarityCount).forEach(([rarity, count]) => {
        console.log(`      ${rarity}: ${count}枚`)
      })

      // ピックアップカード数
      const pickupCount = pools.filter(p => p.is_pickup).length
      if (pickupCount > 0) {
        console.log(`      🌟 ピックアップ: ${pickupCount}枚`)
      }
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
}

checkGachaPools().catch(console.error)
