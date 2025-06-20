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
    
    // ユーザーのカードコレクションを取得
    const { data, error } = await supabase
      .from('user_cards')
      .select(`
        *,
        card:cards(*)
      `)
      .eq('user_id', user.id)
      .order('obtained_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching user cards:', error)
      return NextResponse.json({ error: 'Failed to fetch user cards' }, { status: 500 })
    }
    
    return NextResponse.json({ cards: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}