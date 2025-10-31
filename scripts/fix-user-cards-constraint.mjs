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

async function fixConstraint() {
  console.log('🔧 Removing UNIQUE constraint from user_cards table...\n')

  // Execute SQL to drop the unique constraint
  const { error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE user_cards DROP CONSTRAINT IF EXISTS user_cards_user_id_card_id_key;'
  })

  if (error) {
    console.log('⚠️  RPC method not available, trying direct query...\n')
    
    // Alternative: Use a migration file approach
    console.log('Creating SQL migration file...')
    
    const fs = require('fs')
    const migrationSQL = `-- Remove unique constraint that prevents duplicate cards
ALTER TABLE user_cards DROP CONSTRAINT IF EXISTS user_cards_user_id_card_id_key;
ALTER TABLE user_cards DROP CONSTRAINT IF EXISTS user_cards_pkey;

-- Recreate primary key
ALTER TABLE user_cards ADD PRIMARY KEY (id);

-- Add index for performance (non-unique)
CREATE INDEX IF NOT EXISTS idx_user_cards_user_card ON user_cards(user_id, card_id);
`
    
    fs.writeFileSync('scripts/remove-unique-constraint.sql', migrationSQL)
    console.log('✅ Migration file created: scripts/remove-unique-constraint.sql')
    console.log('\n📋 Please run this SQL in Supabase SQL Editor:\n')
    console.log(migrationSQL)
    
    return
  }

  console.log('✅ Constraint removed successfully!')
}

fixConstraint().catch(console.error)
