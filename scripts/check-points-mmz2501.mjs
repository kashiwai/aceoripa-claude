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

async function checkPoints() {
  const email = 'mmz2501@gmail.com'

  console.log(`\n📊 ${email} のポイント状況を確認中...\n`)

  // ユーザーIDを取得
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', email)
    .single()

  if (userError || !user) {
    console.error('❌ User not found:', userError)
    process.exit(1)
  }

  console.log(`ユーザーID: ${user.id}\n`)

  // user_pointsテーブルを確認
  const { data: userPoints, error: upError } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (upError) {
    console.error('❌ Error fetching user_points:', upError)
  } else {
    console.log('【user_pointsテーブル】')
    console.log(`  無料ポイント: ${userPoints.free_points}`)
    console.log(`  有料ポイント: ${userPoints.paid_points}`)
    console.log(`  合計: ${userPoints.free_points + userPoints.paid_points}\n`)
  }

  // point_transactionsテーブルを確認
  const { data: transactions, error: txError } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (txError) {
    console.error('❌ Error fetching transactions:', txError)
  } else {
    console.log(`【point_transactionsテーブル】 (最新10件)`)
    transactions.slice(0, 10).forEach((tx, i) => {
      const sign = tx.amount >= 0 ? '+' : ''
      const paidLabel = tx.is_paid ? '有料' : '無料'
      console.log(`  ${i + 1}. ${sign}${tx.amount}pt (${paidLabel}) ${tx.type} - ${tx.description}`)
      console.log(`     ${new Date(tx.created_at).toLocaleString('ja-JP')}`)
    })

    // 合計計算
    const totalFree = transactions
      .filter(tx => !tx.is_paid)
      .reduce((sum, tx) => sum + tx.amount, 0)

    const totalPaid = transactions
      .filter(tx => tx.is_paid)
      .reduce((sum, tx) => sum + tx.amount, 0)

    console.log(`\n  トランザクション合計:`)
    console.log(`    無料: ${totalFree}pt`)
    console.log(`    有料: ${totalPaid}pt`)
    console.log(`    合計: ${totalFree + totalPaid}pt`)
  }

  // 不整合チェック
  if (userPoints && transactions) {
    const txTotal = transactions.reduce((sum, tx) => sum + tx.amount, 0)
    const upTotal = userPoints.free_points + userPoints.paid_points
    const diff = txTotal - upTotal

    if (diff !== 0) {
      console.log(`\n⚠️  不整合検出: ${diff}pt の差分があります`)
      console.log(`   user_points: ${upTotal}pt`)
      console.log(`   transactions合計: ${txTotal}pt`)
    } else {
      console.log(`\n✅ データは整合性があります`)
    }
  }
}

checkPoints().catch(console.error)
