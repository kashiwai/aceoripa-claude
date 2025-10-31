import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPoolIntegrity() {
  console.log('🔍 Checking gacha pool integrity...\n')

  // Get a sample gacha pool
  const gachaId = 'c7000985-ac13-4824-9390-10e0a94ba842' // ナンジャモ大量発生オリパ

  // Get pool entries
  const { data: poolEntries, error: poolError } = await supabase
    .from('gacha_pokemon_pools')
    .select('id, card_id, weight, rarity')
    .eq('gacha_product_id', gachaId)
    .limit(10)

  if (poolError) {
    console.error('❌ Error fetching pool:', poolError)
    return
  }

  console.log(`📦 Found ${poolEntries.length} pool entries\n`)

  for (const entry of poolEntries) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`Pool Entry ID: ${entry.id}`)
    console.log(`Card ID: ${entry.card_id}`)
    console.log(`Rarity in pool: ${entry.rarity || 'NULL'}`)

    // Check if card exists in pokemon_cards
    const { data: card, error: cardError } = await supabase
      .from('pokemon_cards')
      .select('id, card_name, rarity, image_url')
      .eq('id', entry.card_id)
      .single()

    if (cardError || !card) {
      console.log(`❌ Card NOT FOUND in pokemon_cards table!`)
      console.log(`   Error: ${cardError?.message || 'No data'}`)
    } else {
      console.log(`✅ Card found: ${card.card_name}`)
      console.log(`   Rarity in card: ${card.rarity || 'NULL'}`)
      console.log(`   Image: ${card.image_url || 'NULL'}`)
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
}

checkPoolIntegrity().catch(console.error)
