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
    
    // ユーザーのポイント情報を取得（user_pointsテーブルから）
    const { data: userData, error: userError } = await supabase
      .from('user_points')
      .select('free_points, paid_points, updated_at')
      .eq('user_id', user.id)
      .single()

    if (userError || !userData) {
      console.error('[Points API] User points not found:', userError)
      // ユーザーポイント情報が存在しない場合は初期値を返す
      return NextResponse.json({
        success: true,
        points: {
          free_points: 0,
          paid_points: 0,
          total_points: 0,
          last_updated: new Date().toISOString()
        }
      })
    }

    console.log(`[Points API] User ${user.id} has ${userData.free_points} free + ${userData.paid_points} paid = ${(userData.free_points || 0) + (userData.paid_points || 0)} total points`)

    const points = {
      free_points: userData.free_points || 0,
      paid_points: userData.paid_points || 0,
      total_points: (userData.free_points || 0) + (userData.paid_points || 0),
      last_updated: userData.updated_at || new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      points
    })
  } catch (error) {
    console.error('Error fetching user points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}