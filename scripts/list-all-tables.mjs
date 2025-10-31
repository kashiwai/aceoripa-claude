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

async function listTables() {
  console.log('🔍 Listing all tables in database...\n')

  // Try different table names related to users and cards
  const tablesToCheck = [
    'user_cards',
    'user_pokemon_cards',
    'users',
    'pokemon_cards',
    'gacha_results',
    'gacha_pokemon_pools',
    'gacha_products',
    'transactions',
    'point_transactions'
  ]

  for (const tableName of tablesToCheck) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0)

    if (error) {
      console.log(`❌ ${tableName}: Does NOT exist (${error.code})`)
    } else {
      console.log(`✅ ${tableName}: EXISTS`)

      // Get a sample row to see the schema
      const { data: sample } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (sample && sample.length > 0) {
        console.log(`   Sample columns: ${Object.keys(sample[0]).join(', ')}`)
      }
    }
  }
}

listTables().catch(console.error)
