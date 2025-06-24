import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // ユーザーポイントの初期化
    const { error: pointsError } = await supabaseAdmin
      .from('user_points')
      .insert({
        user_id: userId,
        free_points: 1000, // 初回ボーナスポイント
        paid_points: 0
      })
      .single()

    if (pointsError && pointsError.code !== '23505') { // 重複エラー以外
      console.error('Points initialization error:', pointsError)
      throw pointsError
    }

    // ユーザー情報の初期化
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (authUser?.user) {
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: authUser.user.email!,
          provider: authUser.user.app_metadata.provider || 'email',
          display_name: authUser.user.user_metadata.full_name || authUser.user.email?.split('@')[0],
          avatar_url: authUser.user.user_metadata.avatar_url
        })
        .single()

      if (userError && userError.code !== '23505') { // 重複エラー以外
        console.error('User initialization error:', userError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User initialization error:', error)
    return NextResponse.json({ error: 'Failed to initialize user' }, { status: 500 })
  }
}