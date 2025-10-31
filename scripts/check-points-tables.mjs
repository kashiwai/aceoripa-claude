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

async function checkTables() {
  console.log('🔍 Checking points tables...\n')

  // usersテーブルをチェック
  console.log('1. Checking users table...')
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1)

  if (usersError) {
    console.log('❌ users table error:', usersError.message)
  } else if (usersData && usersData.length > 0) {
    console.log('✅ users table exists')
    console.log('   Columns:', Object.keys(usersData[0]).join(', '))
  }

  // user_pointsテーブルをチェック
  console.log('\n2. Checking user_points table...')
  const { data: pointsData, error: pointsError } = await supabase
    .from('user_points')
    .select('*')
    .limit(1)

  if (pointsError) {
    console.log('❌ user_points table error:', pointsError.message)
  } else if (pointsData) {
    console.log('✅ user_points table exists')
    if (pointsData.length > 0) {
      console.log('   Columns:', Object.keys(pointsData[0]).join(', '))
      console.log('   Sample data:', pointsData[0])
    } else {
      console.log('   Table is empty')
    }
  }

  // テストユーザーのポイントを確認
  console.log('\n3. Checking test user points (mmz2501@gmail.com)...')
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'mmz2501@gmail.com')
    .single()

  if (userError) {
    console.log('❌ Test user not found:', userError.message)
    return
  }

  console.log('✅ Test user found:', userData.id)

  // usersテーブルのポイントを確認
  const { data: userPoints, error: userPointsError } = await supabase
    .from('users')
    .select('free_points, paid_points')
    .eq('id', userData.id)
    .single()

  if (userPointsError) {
    console.log('❌ users table points error:', userPointsError.message)
  } else {
    console.log('📊 Points in users table:')
    console.log('   free_points:', userPoints.free_points || 0)
    console.log('   paid_points:', userPoints.paid_points || 0)
    console.log('   total:', (userPoints.free_points || 0) + (userPoints.paid_points || 0))
  }

  // user_pointsテーブルのポイントを確認
  const { data: upPoints, error: upError } = await supabase
    .from('user_points')
    .select('free_points, paid_points')
    .eq('user_id', userData.id)
    .single()

  if (upError) {
    console.log('❌ user_points table points error:', upError.message)
  } else {
    console.log('📊 Points in user_points table:')
    console.log('   free_points:', upPoints.free_points || 0)
    console.log('   paid_points:', upPoints.paid_points || 0)
    console.log('   total:', (upPoints.free_points || 0) + (upPoints.paid_points || 0))
  }
}

checkTables().catch(console.error)
