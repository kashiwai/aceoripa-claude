import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchemas() {
  // user_cardsのスキーマ
  console.log('📋 user_cards table schema:')
  const { data: cardsData, error: cardsError } = await supabase
    .from('user_cards')
    .select('*')
    .limit(1)

  if (!cardsError && cardsData && cardsData.length > 0) {
    console.log('Columns:', Object.keys(cardsData[0]).join(', '))
    console.log('Sample:', cardsData[0])
  } else if (cardsError) {
    console.log('Error:', cardsError.message)
  } else {
    console.log('Table is empty')
  }

  // gacha_resultsのスキーマ
  console.log('\n📋 gacha_results table schema:')
  const { data: resultsData, error: resultsError } = await supabase
    .from('gacha_results')
    .select('*')
    .limit(1)

  if (!resultsError && resultsData && resultsData.length > 0) {
    console.log('Columns:', Object.keys(resultsData[0]).join(', '))
  } else if (resultsError) {
    console.log('Error:', resultsError.message)
  } else {
    console.log('Table is empty - checking via insert...')
    
    // 空の場合はinsertエラーからカラムを推測
    const testData = {
      id: 'test-' + Date.now(),
      user_id: 'test-user',
      product_id: 'test',
      gacha_id: 'test'
    }
    
    const { error: insertError } = await supabase
      .from('gacha_results')
      .insert(testData)
    
    console.log('Insert test:', insertError ? insertError.message : 'Success (deleted test data)')
    
    if (!insertError) {
      await supabase.from('gacha_results').delete().eq('id', testData.id)
    }
  }
}

checkSchemas().catch(console.error)
