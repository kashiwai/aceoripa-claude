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
  console.log('🔍 Checking gacha_results table schema...\n')

  // Try to get one record to see the schema
  const { data, error } = await supabase
    .from('gacha_results')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Error querying gacha_results:', error)
  } else {
    if (data && data.length > 0) {
      console.log('✅ Current schema (columns in table):')
      console.log(Object.keys(data[0]).join(', '))
      console.log('\n📋 Sample record:')
      console.log(JSON.stringify(data[0], null, 2))
    } else {
      console.log('⚠️  Table exists but has no records')
      
      // Try to insert and see what happens
      const { error: insertError } = await supabase
        .from('gacha_results')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          gacha_product_id: 'test',
          total_cost: 0,
          pulls_count: 1
        })
        .select()
      
      if (insertError) {
        console.log('❌ Insert test failed:')
        console.log(insertError)
      }
    }
  }
}

checkSchema().catch(console.error)
