import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Extract database connection string if available
const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL

async function executeFix() {
  console.log('🔧 Attempting to fix user_cards table constraint...\n')

  if (!databaseUrl) {
    console.log('❌ No direct database connection available.')
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:\n')
    console.log('ALTER TABLE user_cards DROP CONSTRAINT IF EXISTS user_cards_user_id_card_id_key;')
    console.log('CREATE INDEX IF NOT EXISTS idx_user_cards_user_card ON user_cards(user_id, card_id);\n')
    return
  }

  try {
    const { Client } = pg
    const client = new Client({ connectionString: databaseUrl })
    await client.connect()

    console.log('✅ Connected to database')
    console.log('🔧 Dropping unique constraint...')
    
    await client.query('ALTER TABLE user_cards DROP CONSTRAINT IF EXISTS user_cards_user_id_card_id_key;')
    console.log('✅ Unique constraint removed')
    
    console.log('🔧 Creating non-unique index...')
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_cards_user_card ON user_cards(user_id, card_id);')
    console.log('✅ Index created')
    
    await client.end()
    console.log('\n🎉 Fix applied successfully!')
    console.log('✅ Users can now receive duplicate cards from gacha!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:\n')
    console.log('ALTER TABLE user_cards DROP CONSTRAINT IF EXISTS user_cards_user_id_card_id_key;')
    console.log('CREATE INDEX IF NOT EXISTS idx_user_cards_user_card ON user_cards(user_id, card_id);\n')
  }
}

executeFix().catch(console.error)
