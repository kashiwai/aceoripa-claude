import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const debugInfo: any = {
    steps: [],
    errors: [],
    data: {}
  }

  try {
    debugInfo.steps.push('1. リクエスト受信')
    const { email, password, displayName } = await request.json()
    debugInfo.data.email = email
    debugInfo.data.displayName = displayName

    // Supabase接続確認
    debugInfo.steps.push('2. Supabase接続')
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // リクエストヘッダーからホストを取得
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = `${protocol}://${host}`
    debugInfo.data.redirectUrl = `${baseUrl}/auth/callback`
    
    // Auth認証テスト
    debugInfo.steps.push('3. Auth認証開始')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback`
      }
    })
    
    if (authError) {
      debugInfo.errors.push({
        step: 'Auth認証',
        error: authError.message,
        code: authError.code
      })
      return NextResponse.json({ 
        success: false,
        error: authError.message,
        debug: debugInfo 
      }, { status: 400 })
    }
    
    if (!authData.user) {
      debugInfo.errors.push({
        step: 'ユーザー作成',
        error: 'ユーザーオブジェクトが空です'
      })
      return NextResponse.json({ 
        success: false,
        error: 'Failed to create user',
        debug: debugInfo 
      }, { status: 500 })
    }

    debugInfo.data.userId = authData.user.id
    debugInfo.steps.push('4. ユーザー作成成功')

    // テーブル存在確認
    debugInfo.steps.push('5. DBテーブル確認')
    
    // usersテーブルにユーザー情報を作成
    const { data: userData, error: dbError } = await adminClient
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        display_name: displayName || email.split('@')[0],
        provider: 'email',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (dbError) {
      debugInfo.errors.push({
        step: 'users テーブル挿入',
        error: dbError.message,
        code: dbError.code,
        details: dbError.details
      })
      
      // Auth側のユーザーを削除
      await adminClient.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json({ 
        success: false,
        error: 'Failed to create user profile',
        debug: debugInfo 
      }, { status: 500 })
    }

    debugInfo.steps.push('6. usersテーブル挿入成功')

    // user_pointsテーブルに初期ポイントを作成
    const { data: pointsData, error: pointsError } = await adminClient
      .from('user_points')
      .insert({
        user_id: authData.user.id,
        free_points: 0,
        paid_points: 0,
        total_points: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (pointsError) {
      debugInfo.errors.push({
        step: 'user_points テーブル挿入',
        error: pointsError.message,
        code: pointsError.code,
        details: pointsError.details
      })
    } else {
      debugInfo.steps.push('7. user_pointsテーブル挿入成功')
    }

    // 新規登録ボーナスを付与
    const { data: signupBonus, error: bonusError } = await adminClient
      .from('free_point_settings')
      .select('*')
      .eq('type', 'signup')
      .eq('is_active', true)
      .single()

    if (bonusError) {
      debugInfo.errors.push({
        step: 'ボーナス設定取得',
        error: bonusError.message,
        code: bonusError.code
      })
    } else if (signupBonus && signupBonus.points > 0) {
      debugInfo.steps.push('8. ボーナス設定取得成功')
      
      // ポイントを付与
      const { error: updateError } = await adminClient
        .from('user_points')
        .update({ 
          free_points: signupBonus.points,
          total_points: signupBonus.points
        })
        .eq('user_id', authData.user.id)
      
      if (updateError) {
        debugInfo.errors.push({
          step: 'ポイント更新',
          error: updateError.message
        })
      } else {
        debugInfo.steps.push('9. ボーナスポイント付与成功')
        debugInfo.data.bonusPoints = signupBonus.points
      }
    }

    debugInfo.steps.push('10. 登録完了')
    
    return NextResponse.json({ 
      success: true,
      user: authData.user,
      debug: debugInfo
    })
  } catch (error: any) {
    debugInfo.errors.push({
      step: '予期しないエラー',
      error: error.message,
      stack: error.stack
    })
    
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      debug: debugInfo
    }, { status: 500 })
  }
}