import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const adminClient = createAdminClient()

    // Admin APIでユーザー数を取得
    const { data: { users }, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 100
    })

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        totalUsers: 0
      })
    }

    // ユーザーの状態を分類
    const confirmedUsers = users?.filter(u => u.email_confirmed_at) || []
    const unconfirmedUsers = users?.filter(u => !u.email_confirmed_at) || []

    return NextResponse.json({
      totalUsers: users?.length || 0,
      confirmedUsers: confirmedUsers.length,
      unconfirmedUsers: unconfirmedUsers.length,
      users: users?.map(u => ({
        email: u.email,
        confirmed: !!u.email_confirmed_at,
        createdAt: u.created_at
      })) || []
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: `サーバーエラー: ${error.message}`,
      totalUsers: 0
    })
  }
}