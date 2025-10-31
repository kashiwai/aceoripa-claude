import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyFix() {
  console.log('🔍 Verifying user_cards table fix...\n')

  const testUserId = '4cbe9288-8505-4a76-b050-22d5e2133ced'
  
  // Get a real pokemon_card_id
  const { data: cards } = await supabase
    .from('pokemon_cards')
    .select('id, card_name')
    .limit(1)
  
  if (!cards || cards.length === 0) {
    console.log('❌ No pokemon_cards found')
    return
  }
  
  const testCardId = cards[0].id
  const testCardName = cards[0].card_name
  
  console.log(`Testing with card: ${testCardName} (${testCardId})\n`)

  // Try inserting the same card twice
  console.log('🔧 Test 1: Inserting first copy...')
  const { error: error1 } = await supabase
    .from('user_cards')
    .insert({
      user_id: testUserId,
      card_id: testCardId,
      obtained_at: new Date().toISOString()
    })

  if (error1) {
    console.log('❌ First insert failed:', error1.message)
    return
  }
  console.log('✅ First copy inserted successfully')

  console.log('🔧 Test 2: Inserting second copy (duplicate)...')
  const { error: error2 } = await supabase
    .from('user_cards')
    .insert({
      user_id: testUserId,
      card_id: testCardId,
      obtained_at: new Date().toISOString()
    })

  if (error2) {
    console.log('❌ Second insert failed:', error2.message)
    console.log('\n⚠️  The UNIQUE constraint is still present!')
    console.log('Please make sure you ran the SQL in Supabase dashboard.')
  } else {
    console.log('✅ Second copy inserted successfully')
    console.log('\n🎉 SUCCESS! Users can now receive duplicate cards from gacha!')
  }

  // Clean up test records
  console.log('\n🧹 Cleaning up test records...')
  await supabase
    .from('user_cards')
    .delete()
    .eq('user_id', testUserId)
    .eq('card_id', testCardId)
  
  console.log('✅ Cleanup complete')
}

verifyFix().catch(console.error)
