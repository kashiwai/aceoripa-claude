import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' }
})

async function getColumns() {
  console.log('🔍 Getting gacha_results columns via raw SQL...\n')

  try {
    // Use raw SQL query to get table structure
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'gacha_results'
        ORDER BY ordinal_position
      `
    })

    if (error) {
      console.log('RPC not available, trying direct query...')

      // Alternative: try to insert empty object and see what columns are required
      const { error: insertError } = await supabase
        .from('gacha_results')
        .insert({})

      if (insertError) {
        console.log('Insert error message:', insertError.message)
        console.log('Insert error details:', insertError.details)
        console.log('Insert error hint:', insertError.hint)
      }
    } else {
      console.log('✅ Columns in gacha_results:')
      data.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`)
      })
    }
  } catch (err) {
    console.error('Error:', err.message)
  }
}

getColumns().catch(console.error)
