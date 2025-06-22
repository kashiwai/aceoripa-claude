const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vshkekffhjbvszzpagjt.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser() {
  try {
    console.log('テストユーザーを作成中...')
    
    // テストユーザーの作成
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: 'test@aceoripa.com',
      password: 'test123',
      email_confirm: true,
      user_metadata: {
        username: 'testuser',
        display_name: 'Test User'
      }
    })

    if (createError) {
      console.error('ユーザー作成エラー:', createError)
      return
    }

    console.log('テストユーザー作成完了:', user.user.id)

    // 初期ポイントの付与
    const { error: pointsError } = await supabase
      .from('user_points')
      .upsert({
        user_id: user.user.id,
        free_points: 10000,
        paid_points: 5000,
        total_points: 15000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (pointsError) {
      console.error('ポイント付与エラー:', pointsError)
    } else {
      console.log('初期ポイント付与完了: 15,000pt')
    }

    console.log('✅ テストユーザーセットアップ完了!')
    console.log('Email: test@aceoripa.com')
    console.log('Password: test123')
    console.log('初期ポイント: 15,000pt')

  } catch (error) {
    console.error('エラー:', error)
  }
}

createTestUser()