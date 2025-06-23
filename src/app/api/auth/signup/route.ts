import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const { email, password, displayName } = await request.json()
    
    // Supabase Authでユーザーを作成
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }
    
    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }
    
    // usersテーブルにユーザー情報を作成
    const { error: dbError } = await adminClient
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        display_name: displayName || email.split('@')[0],
        provider: 'email'
      })
    
    if (dbError) {
      console.error('Database error:', dbError)
      // Auth側のユーザーを削除
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
    }
    
    // user_pointsテーブルに初期ポイントを作成
    await adminClient
      .from('user_points')
      .insert({
        user_id: authData.user.id,
        free_points: 0,
        paid_points: 0
      })
    
    // 新規登録ボーナスを付与
    const { data: signupBonus } = await adminClient
      .from('free_point_settings')
      .select('*')
      .eq('type', 'signup')
      .eq('is_active', true)
      .single()
    
    if (signupBonus && signupBonus.points > 0) {
      // ポイントを付与
      await adminClient
        .from('users')
        .update({ free_points: signupBonus.points })
        .eq('id', authData.user.id)
      
      // ポイント履歴を記録
      await adminClient
        .from('point_history')
        .insert({
          user_id: authData.user.id,
          type: 'signup_bonus',
          amount: signupBonus.points,
          description: signupBonus.description || '新規登録ボーナス',
          balance_after: signupBonus.points,
          created_at: new Date().toISOString()
        })
    }
    
    return NextResponse.json({ user: authData.user })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}