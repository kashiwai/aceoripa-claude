import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabase() {
  console.log('🔍 Checking database triggers and functions related to gacha_results and user_cards...\n')

  // Check user_cards table structure
  const { data: userCards } = await supabase
    .from('user_cards')
    .select('*')
    .limit(1)

  console.log('✅ user_cards table columns:',  Object.keys(userCards?.[0] || {}))

  // Check if we can insert successfully
  console.log('\n🔧 Testing user_cards insert...')
  const testUserId = '00000000-0000-0000-0000-000000000001'
  const testCardId = '00000000-0000-0000-0000-000000000002'
  
  const { error: insertError } = await supabase
    .from('user_cards')
    .insert({
      user_id: testUserId,
      card_id: testCardId,
      obtained_at: new Date().toISOString()
    })

  if (insertError) {
    console.log('❌ user_cards insert test failed:')
    console.log(insertError)
  } else {
    console.log('✅ user_cards insert test succeeded')
    
    // Clean up
    await supabase
      .from('user_cards')
      .delete()
      .eq('user_id', testUserId)
      .eq('card_id', testCardId)
    console.log('🧹 Test record cleaned up')
  }
}

checkDatabase().catch(console.error)
