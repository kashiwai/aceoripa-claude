import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const adminClient = createAdminClient()

    // 1. Auth管理APIでユーザー一覧を取得
    const { data: authApiUsers, error: authApiError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 100
    })

    // 2. auth.usersテーブルから直接取得（スキーマを明示的に指定）
    let authTableUsers = null
    let authTableError = null
    
    try {
      // Supabaseのauth.usersテーブルは直接アクセスできない場合がある
      const result = await adminClient
        .from('auth.users')
        .select('id, email, created_at, email_confirmed_at, last_sign_in_at')
        .order('created_at', { ascending: false })
      
      authTableUsers = result.data
      authTableError = result.error
    } catch (e: any) {
      authTableError = { message: 'auth.usersテーブルへのアクセスが制限されています' }
    }

    // 3. publicスキーマのusersテーブルから取得
    const { data: publicUsers, error: publicError } = await adminClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    return NextResponse.json({
      authApi: {
        count: authApiUsers?.length || 0,
        users: authApiUsers || [],
        error: authApiError?.message
      },
      authTable: {
        count: authTableUsers?.length || 0,
        users: authTableUsers || [],
        error: authTableError?.message
      },
      publicTable: {
        count: publicUsers?.length || 0,
        users: publicUsers || [],
        error: publicError?.message
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Check all users error:', error)
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}