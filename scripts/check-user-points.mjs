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

async function checkUserPoints() {
  const email = 'mmz2501@gmail.com'

  console.log(`🔍 Checking points for user: ${email}\n`)

  // Get user
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (userError) {
    console.error('❌ User not found:', userError)
    process.exit(1)
  }

  console.log('✅ User found:')
  console.log(`  ID: ${userData.id}`)
  console.log(`  Email: ${userData.email}`)
  console.log(`  Name: ${userData.name}`)
  console.log(`  Points: ${userData.points}`)
  console.log('\n📋 All user columns:')
  console.log(JSON.stringify(userData, null, 2))

  // Get point transactions
  const { data: transactions, error: txError } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', userData.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (txError) {
    console.error('❌ Error fetching transactions:', txError)
  } else {
    console.log(`\n📊 Recent transactions (last 50):`)
    console.log(`Total found: ${transactions.length}\n`)

    let totalAdded = 0
    let totalUsed = 0

    transactions.forEach((tx, i) => {
      const date = new Date(tx.created_at).toLocaleString('ja-JP')
      const amount = tx.amount > 0 ? `+${tx.amount}` : tx.amount
      const desc = tx.description || tx.type || 'No description'
      console.log(`${i+1}. ${date} | ${amount} pts | ${desc}`)

      if (tx.amount > 0) totalAdded += tx.amount
      else totalUsed += Math.abs(tx.amount)
    })

    console.log(`\n📈 Summary:`)
    console.log(`  Total added: +${totalAdded}`)
    console.log(`  Total used: -${totalUsed}`)
    console.log(`  Net: ${totalAdded - totalUsed}`)
    console.log(`  Current balance in users table: ${userData.points}`)

    if (totalAdded - totalUsed !== userData.points) {
      console.log(`\n⚠️  MISMATCH DETECTED!`)
      console.log(`  Expected: ${totalAdded - totalUsed}`)
      console.log(`  Actual: ${userData.points}`)
      console.log(`  Difference: ${(totalAdded - totalUsed) - userData.points}`)
    }
  }
}

checkUserPoints().catch(console.error)
