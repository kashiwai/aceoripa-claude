import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const adminClient = createAdminClient()

    // 管理者権限でユーザーのメール確認状態を更新
    const { data, error } = await adminClient
      .from('auth.users')
      .update({ 
        email_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()

    if (error) {
      console.error('Force confirm error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      })
    }

    // ユーザーが見つからない場合
    if (!data || data.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'ユーザーが見つかりません' 
      })
    }

    return NextResponse.json({ 
      success: true,
      message: 'メール確認状態を更新しました',
      user: data[0]
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}