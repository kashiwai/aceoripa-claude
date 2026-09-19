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

async function fixUserPoints() {
  const email = 'mmz2501@gmail.com'

  console.log(`🔧 Fixing points for user: ${email}\n`)

  // Get user
  const { data: userData, error: userError} = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (userError) {
    console.error('❌ User not found:', userError)
    process.exit(1)
  }

  console.log('✅ User found in users table:')
  console.log(`  ID: ${userData.id}\n`)

  // Get ALL point transactions
  const { data: transactions, error: txError } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', userData.id)
    .order('created_at', { ascending: true })

  if (txError) {
    console.error('❌ Error fetching transactions:', txError)
    process.exit(1)
  }

  console.log(`📊 Found ${transactions.length} transactions\n`)

  let totalPoints = 0
  transactions.forEach((tx) => {
    totalPoints += tx.amount
  })

  console.log(`💰 Calculated total from transactions: ${totalPoints}\n`)

  // Update user_points table
  console.log('🔧 Updating user_points table...\n')

  const { error: updateError } = await supabase
    .from('user_points')
    .update({
      free_points: totalPoints,
      paid_points: 0,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userData.id)

  if (updateError) {
    console.error('❌ Update failed:', updateError)
    process.exit(1)
  }

  console.log('✅ user_points table updated successfully!\n')
  console.log(`   free_points: ${totalPoints}`)
  console.log(`   paid_points: 0`)
  console.log(`   Total: ${totalPoints}\n`)

  console.log('🎉 Fix complete! Please refresh your admin page to see the updated points.')
}

fixUserPoints().catch(console.error)
