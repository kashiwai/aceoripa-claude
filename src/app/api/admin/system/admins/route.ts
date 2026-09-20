import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase-admin'

function requireAdminSession(request: NextRequest) {
  const adminSession = request.cookies.get('admin_session')
  return !!adminSession
}

export async function GET(request: NextRequest) {
  if (!requireAdminSession(request)) {
    return NextResponse.json({ error: '管理者認証が必要です' }, { status: 401 })
  }

  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('id, username, role, created_at, last_login, is_active')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, admins: data || [] })
  } catch (error: any) {
    console.error('Error fetching admin credentials:', error)
    return NextResponse.json({ error: '管理者一覧の取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!requireAdminSession(request)) {
    return NextResponse.json({ error: '管理者認証が必要です' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { username, password, role } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'ユーザー名とパスワードを入力してください' }, { status: 400 })
    }

    const supabase = getServiceClient()
    const passwordHash = Buffer.from(password).toString('base64')

    const { error } = await supabase
      .from('admin_credentials')
      .insert({ username, password_hash: passwordHash, role: role || 'admin', is_active: true })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error creating admin:', error)
    return NextResponse.json({ error: '管理者アカウントの作成に失敗しました' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!requireAdminSession(request)) {
    return NextResponse.json({ error: '管理者認証が必要です' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: '管理者IDが必要です' }, { status: 400 })
    }

    const supabase = getServiceClient()
    const { error } = await supabase.from('admin_credentials').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting admin:', error)
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 })
  }
}
