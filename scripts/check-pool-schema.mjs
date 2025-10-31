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
  console.log('🔍 Checking gacha_pokemon_pools schema...\n')

  const { data, error } = await supabase
    .from('gacha_pokemon_pools')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('✅ Sample row from gacha_pokemon_pools:')
    console.log(JSON.stringify(data[0], null, 2))
    console.log('\n📋 Available columns:')
    Object.keys(data[0]).forEach(key => {
      console.log(`   - ${key}: ${typeof data[0][key]} = ${JSON.stringify(data[0][key]).substring(0, 50)}`)
    })
  } else {
    console.log('⚠️  No data in gacha_pokemon_pools')
  }
}

checkSchema().catch(console.error)
