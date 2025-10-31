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

async function restorePoints() {
  const email = 'mmz2501@gmail.com'

  console.log(`\n🔧 ${email} のポイントを復元中...\n`)

  // ユーザーIDを取得
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (userError || !user) {
    console.error('❌ User not found:', userError)
    process.exit(1)
  }

  // point_transactionsから正しい合計を計算
  const { data: transactions, error: txError } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', user.id)

  if (txError) {
    console.error('❌ Error fetching transactions:', txError)
    process.exit(1)
  }

  const totalFree = transactions
    .filter(tx => !tx.is_paid)
    .reduce((sum, tx) => sum + tx.amount, 0)

  const totalPaid = transactions
    .filter(tx => tx.is_paid)
    .reduce((sum, tx) => sum + tx.amount, 0)

  console.log(`トランザクションから計算された正しいポイント:`)
  console.log(`  無料: ${totalFree}pt`)
  console.log(`  有料: ${totalPaid}pt`)
  console.log(`  合計: ${totalFree + totalPaid}pt\n`)

  // user_pointsを更新
  const { error: updateError } = await supabase
    .from('user_points')
    .update({
      free_points: totalFree,
      paid_points: totalPaid,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)

  if (updateError) {
    console.error('❌ Update error:', updateError)
    process.exit(1)
  }

  console.log('✅ ポイントを復元しました！\n')

  // 確認
  const { data: updatedPoints } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', user.id)
    .single()

  console.log('更新後のuser_points:')
  console.log(`  無料ポイント: ${updatedPoints.free_points}`)
  console.log(`  有料ポイント: ${updatedPoints.paid_points}`)
  console.log(`  合計: ${updatedPoints.free_points + updatedPoints.paid_points}`)
}

restorePoints().catch(console.error)
