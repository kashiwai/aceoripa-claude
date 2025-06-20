// pages/api/auth/signup-v2.ts - 端末2統合版
import { NextResponse } from 'next/server'
import { auth, handleSupabaseError } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email, password, nickname } = await request.json()

    // バリデーション
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'メールアドレスとパスワードは必須です' 
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        error: 'パスワードは6文字以上で入力してください' 
      }, { status: 400 })
    }

    // ユーザー登録（1000ポイント自動付与）
    const { data, error } = await auth.signUp(email, password, {
      nickname: nickname || 'ユーザー'
    })

    if (error) {
      return NextResponse.json({ 
        error: handleSupabaseError(error) 
      }, { status: 400 })
    }

    // 成功レスポンス
    return NextResponse.json({
      message: '登録が完了しました！1000ポイントを付与しました。',
      user: {
        id: data.user.id,
        email: data.user.email,
        nickname: data.user.user_metadata?.nickname
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ 
      error: '登録中にエラーが発生しました' 
    }, { status: 500 })
  }
}