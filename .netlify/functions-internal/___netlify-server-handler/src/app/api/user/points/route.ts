import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // 現在のユーザーを取得
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // ユーザーのポイント情報を取得
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching user points:', error)
      return NextResponse.json({ error: 'Failed to fetch user points' }, { status: 500 })
    }
    
    // ポイント情報がない場合は初期値を返す
    const points = data || {
      user_id: user.id,
      free_points: 0,
      paid_points: 0
    }
    
    return NextResponse.json({ points })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}