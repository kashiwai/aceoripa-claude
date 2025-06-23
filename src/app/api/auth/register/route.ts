import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { email, password, username, referralCode } = await request.json()

    // バリデーション
    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上で設定してください' },
        { status: 400 }
      )
    }

    // メールアドレスの重複チェック
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      )
    }

    // 紹介コードの検証
    let referrerId = null
    if (referralCode) {
      const { data: referralCodeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('user_id, is_active')
        .eq('code', referralCode)
        .single()

      if (codeError || !referralCodeData || !referralCodeData.is_active) {
        return NextResponse.json(
          { error: '無効な紹介コードです' },
          { status: 400 }
        )
      }

      referrerId = referralCodeData.user_id
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // 新規ユーザーの作成
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        username: username || email.split('@')[0],
        referred_by: referrerId,
        points: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('ユーザー作成エラー:', createError)
      return NextResponse.json(
        { error: 'アカウントの作成に失敗しました' },
        { status: 500 }
      )
    }

    // 紹介関係の記録
    if (referrerId && referralCode) {
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrerId,
          referred_id: newUser.id,
          referral_code: referralCode,
          status: 'pending'
        })

      if (referralError) {
        console.error('紹介関係の記録エラー:', referralError)
      }

      // 紹介者の紹介数を更新
      await supabase.rpc('increment', {
        table_name: 'users',
        row_id: referrerId,
        column_name: 'total_referrals',
        increment_value: 1
      })
    }

    // 新規ユーザーの紹介コードを生成
    await supabase.rpc('generate_referral_code', {
      user_id_param: newUser.id
    })

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
      }
    })
  } catch (error) {
    console.error('登録エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}