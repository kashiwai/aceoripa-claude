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

async function checkSchema() {
  console.log('🔍 Checking user_pokemon_cards schema...\n')

  // Get existing data
  const { data: existing, error: existingError } = await supabase
    .from('user_pokemon_cards')
    .select('*')
    .limit(1)

  if (existingError) {
    console.error('❌ Error fetching data:', existingError)
  } else if (existing && existing.length > 0) {
    console.log('✅ Sample row:')
    console.log(JSON.stringify(existing[0], null, 2))
    console.log('\n📋 Columns:')
    Object.keys(existing[0]).forEach(key => {
      console.log(`   - ${key}: ${typeof existing[0][key]}`)
    })
  } else {
    console.log('⚠️  Table is empty')
  }

  // Try to insert test data
  console.log('\n🧪 Testing insert with sample data...')
  const testUserId = '4cbe9288-8505-4a76-b050-22d5e2133ced'
  const testCardId = '6d01cceb-8628-4231-9005-f0837c114670'

  const { data: insertData, error: insertError } = await supabase
    .from('user_pokemon_cards')
    .insert({
      user_id: testUserId,
      pokemon_card_id: testCardId,
      obtained_at: new Date().toISOString()
    })
    .select()

  if (insertError) {
    console.error('❌ Insert failed:')
    console.error('   Code:', insertError.code)
    console.error('   Message:', insertError.message)
    console.error('   Details:', insertError.details)
    console.error('   Hint:', insertError.hint)
    console.error('   Full error:', JSON.stringify(insertError, null, 2))
  } else {
    console.log('✅ Insert succeeded!')
    console.log(JSON.stringify(insertData, null, 2))

    // Clean up
    if (insertData && insertData.length > 0) {
      const { error: deleteError } = await supabase
        .from('user_pokemon_cards')
        .delete()
        .eq('id', insertData[0].id)

      if (deleteError) {
        console.log('⚠️  Could not delete test record:', deleteError.message)
      } else {
        console.log('🧹 Test record cleaned up')
      }
    }
  }
}

checkSchema().catch(console.error)
