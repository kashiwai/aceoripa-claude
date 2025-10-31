import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyFix() {
  console.log('🔧 Applying fix to user_cards table...\n')

  const sql = readFileSync('supabase/migrations/20251029000001_fix_user_cards_duplicate.sql', 'utf-8')
  
  console.log('📋 SQL to execute:')
  console.log(sql)
  console.log('\n⚠️  Please run this SQL in your Supabase SQL Editor:\n')
  console.log('1. Go to https://supabase.com/dashboard')
  console.log('2. Select your project')
  console.log('3. Go to SQL Editor')
  console.log('4. Paste and run the above SQL\n')
  
  console.log('Or if you have supabase CLI installed:')
  console.log('  cd /Users/kousuke/aceoripa/aceoripa/aceoripa-claude')
  console.log('  supabase db push\n')
}

applyFix().catch(console.error)
