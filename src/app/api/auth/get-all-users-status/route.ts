import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const adminClient = createAdminClient()

    // Admin APIで全ユーザーを取得（確認済み・未確認両方）
    const { data: { users }, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })

    if (error) {
      return NextResponse.json({ 
        error: `Admin API エラー: ${error.message}`,
        users: []
      })
    }

    // ユーザー情報を整形
    const userList = users?.map(user => ({
      email: user.email,
      status: user.email_confirmed_at 
        ? '✅ メール確認完了' 
        : '⚠️ メール確認待ち',
      confirmed: !!user.email_confirmed_at,
      createdAt: new Date(user.created_at).toLocaleString('ja-JP'),
      confirmedAt: user.email_confirmed_at 
        ? new Date(user.email_confirmed_at).toLocaleString('ja-JP')
        : '未確認',
      lastSignIn: user.last_sign_in_at
        ? new Date(user.last_sign_in_at).toLocaleString('ja-JP')
        : 'まだログインしていません',
      provider: user.app_metadata?.provider || 'email',
      id: user.id
    })) || []

    // ステータス別に分類
    const confirmedUsers = userList.filter(u => u.confirmed)
    const unconfirmedUsers = userList.filter(u => !u.confirmed)

    return NextResponse.json({
      summary: {
        total: userList.length,
        confirmed: confirmedUsers.length,
        unconfirmed: unconfirmedUsers.length
      },
      users: userList,
      confirmedUsers,
      unconfirmedUsers,
      message: userList.length === 0 
        ? 'ユーザーが登録されていません' 
        : `${userList.length}人のユーザーが見つかりました`
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: `サーバーエラー: ${error.message}`,
      users: []
    }, { status: 500 })
  }
}