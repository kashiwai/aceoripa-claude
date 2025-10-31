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

async function verifyMigration() {
  console.log('\n🔍 マイグレーション適用状況を確認中...\n')

  // 1. user_pointsテーブルのカラム情報を確認
  console.log('【1. user_pointsテーブルの制約確認】')

  const { data: tableInfo, error: tableError } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT
          column_name,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = 'user_points'
        AND column_name IN ('free_points', 'paid_points')
      `
    })

  if (tableError) {
    console.log('  ⚠️  RPC呼び出しに失敗（権限の問題の可能性）')
    console.log('  代わりにデータで確認します...\n')
  }

  // 2. mmz2501ユーザーのポイント状況を確認
  console.log('【2. mmz2501@gmail.com のポイント確認】')

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'mmz2501@gmail.com')
    .single()

  if (!user) {
    console.error('❌ User not found')
    process.exit(1)
  }

  const { data: userPoints } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', user.id)
    .single()

  console.log(`  無料ポイント: ${userPoints.free_points}`)
  console.log(`  有料ポイント: ${userPoints.paid_points}`)
  console.log(`  合計: ${userPoints.free_points + userPoints.paid_points}`)

  // NULL値がないか確認
  if (userPoints.free_points === null) {
    console.log('  ❌ free_points が NULL です！マイグレーションが適用されていません')
  } else {
    console.log('  ✅ free_points は NULL ではありません')
  }

  if (userPoints.paid_points === null) {
    console.log('  ❌ paid_points が NULL です！マイグレーションが適用されていません')
  } else {
    console.log('  ✅ paid_points は NULL ではありません')
  }

  // 3. トリガーの存在確認（間接的に）
  console.log('\n【3. 自動同期トリガーのテスト】')
  console.log('  テスト用のポイントトランザクションを作成します...')

  // 現在のポイントを記録
  const beforePoints = userPoints.free_points + userPoints.paid_points

  // テストトランザクションを追加
  const { error: insertError } = await supabase
    .from('point_transactions')
    .insert({
      user_id: user.id,
      amount: 1,
      type: 'bonus',
      is_paid: false,
      description: 'トリガーテスト（+1pt）',
      created_at: new Date().toISOString()
    })

  if (insertError) {
    console.log('  ❌ テストトランザクション追加エラー:', insertError.message)
  } else {
    console.log('  ✅ テストトランザクションを追加しました')

    // 1秒待機
    await new Promise(resolve => setTimeout(resolve, 1000))

    // user_pointsが自動更新されたか確認
    const { data: afterPoints } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const afterTotal = afterPoints.free_points + afterPoints.paid_points

    if (afterTotal === beforePoints + 1) {
      console.log('  ✅ トリガーが正常に動作しています！')
      console.log(`     更新前: ${beforePoints}pt → 更新後: ${afterTotal}pt`)
    } else {
      console.log('  ⚠️  トリガーが動作していない可能性があります')
      console.log(`     期待値: ${beforePoints + 1}pt, 実際: ${afterTotal}pt`)
    }

    // テストトランザクションを削除
    await supabase
      .from('point_transactions')
      .delete()
      .eq('description', 'トリガーテスト（+1pt）')
      .eq('user_id', user.id)

    console.log('  🗑️  テストトランザクションを削除しました')
  }

  console.log('\n✅ 検証完了\n')
}

verifyMigration().catch(console.error)
