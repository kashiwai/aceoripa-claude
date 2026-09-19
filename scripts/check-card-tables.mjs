import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  console.log('🔍 Checking card-related tables...\n')

  // gacha_resultsテーブルのスキーマ確認
  console.log('1. Checking gacha_results table schema...')
  const { data: resultsData, error: resultsError } = await supabase
    .from('gacha_results')
    .select('*')
    .limit(1)

  if (resultsError) {
    console.log('❌ gacha_results table error:', resultsError.message)
    console.log('   Details:', resultsError)
  } else {
    console.log('✅ gacha_results table exists')
    if (resultsData && resultsData.length > 0) {
      console.log('   Columns:', Object.keys(resultsData[0]).join(', '))
    } else {
      console.log('   Table is empty (no sample data)')
    }
  }

  // user_pokemon_cardsテーブルのスキーマ確認
  console.log('\n2. Checking user_pokemon_cards table schema...')
  const { data: cardsData, error: cardsError } = await supabase
    .from('user_pokemon_cards')
    .select('*')
    .limit(1)

  if (cardsError) {
    console.log('❌ user_pokemon_cards table error:', cardsError.message)
    console.log('   Details:', cardsError)
  } else {
    console.log('✅ user_pokemon_cards table exists')
    if (cardsData && cardsData.length > 0) {
      console.log('   Columns:', Object.keys(cardsData[0]).join(', '))
      console.log('   Sample:', cardsData[0])
    } else {
      console.log('   Table is empty (no sample data)')
    }
  }

  // pokemon_cardsテーブル確認
  console.log('\n3. Checking pokemon_cards table...')
  const { data: pokemonCards, error: pokemonError } = await supabase
    .from('pokemon_cards')
    .select('id, card_name, rarity')
    .limit(5)

  if (pokemonError) {
    console.log('❌ pokemon_cards table error:', pokemonError.message)
  } else {
    console.log('✅ pokemon_cards table exists')
    console.log(`   Sample cards (${pokemonCards.length}):`)
    pokemonCards.forEach(card => {
      console.log(`   - ${card.card_name} (${card.rarity}) [${card.id}]`)
    })
  }
}

checkTables().catch(console.error)
