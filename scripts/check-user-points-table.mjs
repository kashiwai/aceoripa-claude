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

  console.log('✅ User found in users table:')
  console.log(`  ID: ${userData.id}\n`)

  // Check user_points table
  const { data: userPoints, error: pointsError } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', userData.id)
    .single()

  if (pointsError) {
    console.error('❌ user_points record not found:', pointsError.message)
    console.log('\n⚠️  This is the problem! user_points table has no record for this user.\n')
  } else {
    console.log('✅ user_points record found:')
    console.log(JSON.stringify(userPoints, null, 2))
    console.log('')
  }

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

    console.log(`\n📈 Transaction Summary:`)
    console.log(`  Total added: +${totalAdded}`)
    console.log(`  Total used: -${totalUsed}`)
    console.log(`  Net from transactions: ${totalAdded - totalUsed}`)

    if (userPoints) {
      const total = (userPoints.free_points || 0) + (userPoints.paid_points || 0)
      console.log(`\n📊 user_points table balance:`)
      console.log(`  Free points: ${userPoints.free_points || 0}`)
      console.log(`  Paid points: ${userPoints.paid_points || 0}`)
      console.log(`  Total: ${total}`)

      if (totalAdded - totalUsed !== total) {
        console.log(`\n⚠️  MISMATCH DETECTED!`)
        console.log(`  Expected from transactions: ${totalAdded - totalUsed}`)
        console.log(`  Actual in user_points: ${total}`)
        console.log(`  Difference: ${(totalAdded - totalUsed) - total}`)
      }
    } else {
      console.log(`\n❌ user_points record missing - points cannot be displayed!`)
    }
  }
}

checkUserPoints().catch(console.error)
