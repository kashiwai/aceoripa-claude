import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const adminClient = createAdminClient()

    // 管理者権限でユーザーを検索
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 100
    })

    // 特定のメールアドレスのユーザーを検索
    const foundUser = users?.find(u => u.email === email)

    // Authスキーマのusersテーブルも直接確認
    const { data: authUsers, error: authError } = await adminClient
      .from('auth.users')
      .select('*')
      .eq('email', email)

    return NextResponse.json({
      totalUsers: users?.length || 0,
      foundUser: foundUser || null,
      authTableUsers: authUsers || [],
      errors: {
        listError: listError?.message || null,
        authError: authError?.message || null
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}