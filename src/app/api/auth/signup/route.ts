import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const { email, password, displayName } = await request.json()
    
    // パスワードの検証
    if (!password || password.length < 6) {
      return NextResponse.json({ 
        error: 'パスワードは6文字以上で入力してください' 
      }, { status: 400 })
    }
    
    // リクエストヘッダーからホストを取得
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = `${protocol}://${host}`
    
    // Supabase Authでユーザーを作成
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback`,
        data: {
          display_name: displayName || email.split('@')[0]
        }
      }
    })
    
    if (authError) {
      console.error('Auth error:', authError)
      // より詳細なエラーメッセージ
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ 
          error: 'このメールアドレスは既に登録されています' 
        }, { status: 400 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }
    
    if (!authData.user) {
      return NextResponse.json({ error: 'ユーザーの作成に失敗しました' }, { status: 500 })
    }
    
    // usersテーブルにユーザー情報を作成（エラーをスキップ）
    try {
      const { error: dbError } = await adminClient
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          display_name: displayName || email.split('@')[0],
          provider: 'email',
          created_at: new Date().toISOString()
        })
      
      if (dbError) {
        console.error('Users table error (non-critical):', dbError)
        // テーブルが存在しない場合でも、Auth登録は成功とする
      }
    } catch (dbErr) {
      console.error('Users table operation failed:', dbErr)
      // エラーがあってもAuth登録は成功とする
    }
    
    // user_pointsテーブルに初期ポイントを作成（エラーをスキップ）
    try {
      await adminClient
        .from('user_points')
        .insert({
          user_id: authData.user.id,
          free_points: 0,
          paid_points: 0,
          total_points: 0
        })
    } catch (pointsErr) {
      console.error('Points table operation failed:', pointsErr)
    }
    
    // 新規登録ボーナスを付与（エラーをスキップ）
    try {
      const { data: signupBonus } = await adminClient
        .from('free_point_settings')
        .select('*')
        .eq('type', 'signup')
        .eq('is_active', true)
        .single()
      
      if (signupBonus && signupBonus.points > 0) {
        // ポイントを付与
        await adminClient
          .from('user_points')
          .update({ 
            free_points: signupBonus.points,
            total_points: signupBonus.points
          })
          .eq('user_id', authData.user.id)
        
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
    } catch (bonusErr) {
      console.error('Bonus operation failed:', bonusErr)
    }
    
    // 成功レスポンス
    return NextResponse.json({ 
      success: true,
      user: authData.user,
      message: '登録が完了しました。確認メールをご確認ください。'
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}