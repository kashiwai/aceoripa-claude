import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // ユーザーのポイント情報を取得（usersテーブルから）
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('free_points, paid_points')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData) {
      // ユーザー情報が存在しない場合は初期値を返す
      return NextResponse.json({ 
        free_points: 0,
        paid_points: 0,
        total: 0
      })
    }
    
    const points = {
      free_points: userData.free_points || 0,
      paid_points: userData.paid_points || 0,
      total: (userData.free_points || 0) + (userData.paid_points || 0)
    }
    
    return NextResponse.json(points)
  } catch (error) {
    console.error('Error fetching user points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}