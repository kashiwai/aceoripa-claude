import { createAdminClient } from '../src/lib/supabase-admin.js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function createUserCardsTable() {
  const client = createAdminClient()

  console.log('📝 Creating user_cards table...\n')

  // Read SQL file
  const sqlFile = join(__dirname, '../supabase/migrations/create_user_cards.sql')
  const sql = readFileSync(sqlFile, 'utf-8')

  try {
    // Execute SQL using raw query
    const { data, error } = await client.rpc('exec_sql', {
      query: sql
    })

    if (error) {
      // Try direct execution if RPC doesn't exist
      console.log('⚠️  RPC method not available, trying direct execution...')

      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 60)}...`)

        // Use Supabase's SQL editor endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ query: statement })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Failed to execute statement: ${errorText}`)
        } else {
          console.log('✅ Statement executed')
        }
      }
    } else {
      console.log('✅ SQL executed successfully')
    }

    // Verify table was created
    const { data: tableCheck, error: checkError } = await client
      .from('user_cards')
      .select('*')
      .limit(1)

    if (checkError) {
      console.error('\n❌ Table verification failed:', checkError.message)
      console.log('\n⚠️  Please manually create the table using Supabase Dashboard SQL Editor:')
      console.log('\n📋 Copy and paste this SQL:\n')
      console.log(sql)
    } else {
      console.log('\n✅ user_cards table created successfully!')
      console.log('✅ Table is ready to use')
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.log('\n⚠️  Please manually create the table using Supabase Dashboard SQL Editor:')
    console.log('1. Go to: https://supabase.com/dashboard')
    console.log('2. Select your project')
    console.log('3. Go to SQL Editor')
    console.log('4. Paste the SQL from: supabase/migrations/create_user_cards.sql')
    console.log('5. Click "Run"\n')
  }
}

createUserCardsTable()
