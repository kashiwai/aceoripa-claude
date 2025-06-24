import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const adminClient = createAdminClient()

    // 管理者権限でユーザーを検索
    const { data: { users }, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        userFound: false 
      }, { status: 500 })
    }

    // メールアドレスで検索
    const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (user) {
      return NextResponse.json({
        userFound: true,
        userId: user.id,
        email: user.email,
        emailConfirmed: !!user.email_confirmed_at,
        emailConfirmedAt: user.email_confirmed_at,
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at,
        provider: user.app_metadata?.provider || 'email',
        providers: user.app_metadata?.providers || ['email']
      })
    }

    return NextResponse.json({
      userFound: false,
      message: 'ユーザーが見つかりません'
    })

  } catch (error: any) {
    console.error('Check user exists error:', error)
    return NextResponse.json({ 
      error: error.message,
      userFound: false 
    }, { status: 500 })
  }
}