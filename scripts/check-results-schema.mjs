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
  console.log('🔍 Checking gacha_results schema...\n')

  const { data, error } = await supabase
    .from('gacha_results')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('✅ Sample row from gacha_results:')
    console.log(JSON.stringify(data[0], null, 2))
    console.log('\n📋 Available columns:')
    Object.keys(data[0]).forEach(key => {
      console.log(`   - ${key}`)
    })
  } else {
    console.log('⚠️  No data in gacha_results (table might be empty)')
    console.log('Let me check if table exists by trying to select with no filter...')

    const { error: testError } = await supabase
      .from('gacha_results')
      .select('*')
      .limit(0)

    if (testError) {
      console.error('❌ Table error:', testError)
    } else {
      console.log('✅ Table exists but is empty')
    }
  }
}

checkSchema().catch(console.error)
