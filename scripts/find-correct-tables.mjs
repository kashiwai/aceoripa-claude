import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function findTables() {
  console.log('🔍 Looking for user card tables...\n')

  // テーブル名のパターンを試す
  const tableNames = [
    'user_cards',
    'user_pokemon_cards', 
    'users_pokemon_cards',
    'user_card_collection',
    'card_collection'
  ]

  for (const tableName of tableNames) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (!error) {
      console.log(`✅ Found: ${tableName}`)
      if (data && data.length > 0) {
        console.log('   Columns:', Object.keys(data[0]).join(', '))
      }
    }
  }

  // gacha_resultsのカラムを確認
  console.log('\n📋 Checking gacha_results columns...')
  const { error: insertError } = await supabase
    .from('gacha_results')
    .insert({
      id: 'test-id-' + Date.now(),
      user_id: 'test-user',
      test_field: 'test'
    })
  
  if (insertError) {
    console.log('Insert test error:', insertError.message)
    
    // RLSで見えるカラムを確認
    const { data: sampleData, error: selectError } = await supabase
      .from('gacha_results')
      .select('*')
      .limit(1)
    
    if (!selectError && sampleData && sampleData.length > 0) {
      console.log('Visible columns:', Object.keys(sampleData[0]).join(', '))
    }
  }
}

findTables().catch(console.error)
