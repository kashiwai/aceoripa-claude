import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkStructure() {
  console.log('🔍 Checking ACTUAL user_cards table structure in Supabase...\n')

  // Try to insert with both possible column names to see which works
  const testUserId = '4cbe9288-8505-4a76-b050-22d5e2133ced'
  
  // First, get a real pokemon_card_id from the database
  const { data: cards } = await supabase
    .from('pokemon_cards')
    .select('id')
    .limit(1)
  
  if (!cards || cards.length === 0) {
    console.log('❌ No pokemon_cards found in database')
    return
  }
  
  const realCardId = cards[0].id
  console.log(`✅ Found test card ID: ${realCardId}\n`)

  // Test with card_id
  console.log('🔧 Test 1: Inserting with "card_id" column...')
  const { error: error1 } = await supabase
    .from('user_cards')
    .insert({
      user_id: testUserId,
      card_id: realCardId,
      obtained_at: new Date().toISOString()
    })

  if (error1) {
    console.log('❌ Failed with card_id:')
    console.log(error1.message)
  } else {
    console.log('✅ SUCCESS with card_id!')
  }

  // Test with pokemon_card_id
  console.log('\n🔧 Test 2: Inserting with "pokemon_card_id" column...')
  const { error: error2 } = await supabase
    .from('user_cards')
    .insert({
      user_id: testUserId,
      pokemon_card_id: realCardId,
      obtained_at: new Date().toISOString()
    })

  if (error2) {
    console.log('❌ Failed with pokemon_card_id:')
    console.log(error2.message)
  } else {
    console.log('✅ SUCCESS with pokemon_card_id!')
  }

  // Clean up any test records
  await supabase
    .from('user_cards')
    .delete()
    .eq('user_id', testUserId)
    .eq('card_id', realCardId)
    .limit(10)
}

checkStructure().catch(console.error)
