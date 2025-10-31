import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '/Users/kousuke/aceoripa/aceoripa/aceoripa-claude/.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAllPools() {
  console.log('🔍 Checking all gacha pools...\n')

  // Get all gacha products
  const { data: products, error: productsError } = await supabase
    .from('gacha_products')
    .select('id, name, price, is_active')
    .order('created_at', { ascending: false })

  if (productsError) {
    console.error('❌ Error fetching products:', productsError)
    return
  }

  console.log(`Found ${products.length} gacha products\n`)

  for (const product of products) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📦 ${product.name}`)
    console.log(`   ID: ${product.id}`)
    console.log(`   Active: ${product.is_active ? '✅' : '❌'}`)

    // Check gacha_pokemon_pools
    const { data: pools, count, error: poolsError } = await supabase
      .from('gacha_pokemon_pools')
      .select('*', { count: 'exact' })
      .eq('gacha_product_id', product.id)

    if (poolsError) {
      console.error(`   ❌ Error:`, poolsError)
      continue
    }

    console.log(`   Pool size: ${count} cards`)

    if (count > 0) {
      // Show rarity breakdown
      const rarities = {}
      pools.forEach(p => {
        const r = p.rarity || 'Unknown'
        rarities[r] = (rarities[r] || 0) + 1
      })

      Object.entries(rarities).forEach(([rarity, cnt]) => {
        console.log(`      ${rarity}: ${cnt} cards`)
      })
    } else {
      console.log(`   ⚠️  Pool is empty!`)
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
}

checkAllPools().catch(console.error)
