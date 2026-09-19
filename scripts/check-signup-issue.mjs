import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSignupIssue() {
  console.log('🔍 データベース状態を確認中...\n')

  const testEmail = 'mmz2501@gmail.com'

  // 1. auth.usersテーブルを確認
  console.log('1️⃣ auth.users テーブル:')
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('❌ Auth users error:', authError)
  } else {
    const targetAuthUser = authUsers.users.find(u => u.email === testEmail)
    if (targetAuthUser) {
      console.log(`✅ 見つかりました: ${testEmail}`)
      console.log(`   ID: ${targetAuthUser.id}`)
      console.log(`   Email confirmed: ${targetAuthUser.email_confirmed_at ? 'Yes' : 'No'}`)
      console.log(`   Created: ${targetAuthUser.created_at}`)
    } else {
      console.log(`❌ 見つかりませんでした: ${testEmail}`)
    }
  }

  // 2. usersテーブルを確認
  console.log('\n2️⃣ users テーブル:')
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .eq('email', testEmail)

  if (usersError) {
    console.error('❌ Users table error:', usersError)
  } else if (users && users.length > 0) {
    console.log(`✅ 見つかりました: ${users.length}件`)
    users.forEach(u => {
      console.log(`   ID: ${u.id}`)
      console.log(`   Email: ${u.email}`)
      console.log(`   Display name: ${u.display_name}`)
    })
  } else {
    console.log(`❌ 見つかりませんでした: ${testEmail}`)
  }

  // 3. user_pointsテーブルを確認
  console.log('\n3️⃣ user_points テーブル:')
  if (authUsers && authUsers.users) {
    const targetAuthUser = authUsers.users.find(u => u.email === testEmail)
    if (targetAuthUser) {
      const { data: points, error: pointsError } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', targetAuthUser.id)

      if (pointsError) {
        console.error('❌ User points error:', pointsError)
      } else if (points && points.length > 0) {
        console.log(`✅ 見つかりました: ${points.length}件`)
        points.forEach(p => {
          console.log(`   User ID: ${p.user_id}`)
          console.log(`   Free points: ${p.free_points}`)
          console.log(`   Paid points: ${p.paid_points}`)
        })
      } else {
        console.log(`❌ 見つかりませんでした (user_id: ${targetAuthUser.id})`)
      }
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 診断結果:')
  console.log('='.repeat(50))

  const authUser = authUsers?.users.find(u => u.email === testEmail)
  const hasAuthUser = !!authUser
  const hasUsersRecord = users && users.length > 0
  const hasPointsRecord = authUser ? await checkPoints(authUser.id) : false

  if (hasAuthUser && !hasUsersRecord) {
    console.log('⚠️  問題発見: auth.users に存在するが users テーブルにない')
    console.log('💡 解決策: users テーブルにレコードを追加する必要があります')
  }

  if (hasAuthUser && hasUsersRecord && !hasPointsRecord) {
    console.log('⚠️  問題発見: users テーブルには存在するが user_points にない')
    console.log('💡 解決策: user_points テーブルにレコードを追加する必要があります')
  }

  if (!hasAuthUser) {
    console.log('✅ このメールアドレスは新規登録可能です')
  } else if (hasAuthUser && hasUsersRecord && hasPointsRecord) {
    console.log('✅ すべてのテーブルに正常にレコードが存在します')
    console.log('💡 このメールアドレスは既に登録済みです。ログインしてください。')
  }
}

async function checkPoints(userId) {
  const { data, error } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', userId)

  return data && data.length > 0
}

checkSignupIssue().catch(console.error)
