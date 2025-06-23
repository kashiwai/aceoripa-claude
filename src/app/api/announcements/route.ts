import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: 有効なお知らせを取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 現在有効なお知らせを取得
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('status', 'published')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${new Date().toISOString()}`)
      .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // ユーザーがログインしている場合は既読情報も取得
    const { data: { user } } = await supabase.auth.getUser()
    
    let announcementsWithReadStatus = announcements || []
    
    if (user) {
      // 既読情報を取得
      const { data: reads } = await supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('user_id', user.id)
      
      const readAnnouncementIds = new Set(reads?.map(r => r.announcement_id) || [])
      
      announcementsWithReadStatus = announcements?.map(announcement => ({
        ...announcement,
        is_read: readAnnouncementIds.has(announcement.id)
      })) || []
    }
    
    return NextResponse.json({
      announcements: announcementsWithReadStatus,
      total: announcementsWithReadStatus.length
    })
    
  } catch (error) {
    console.error('Announcements fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

// POST: お知らせを既読にする
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // ユーザー認証チェック
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { announcementId } = await request.json()
    
    if (!announcementId) {
      return NextResponse.json({ error: 'Announcement ID required' }, { status: 400 })
    }
    
    // 既読として記録
    const { error } = await supabase
      .from('announcement_reads')
      .upsert({
        user_id: user.id,
        announcement_id: announcementId,
        read_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Mark as read error:', error)
      throw error
    }
    
    return NextResponse.json({
      success: true,
      message: 'Marked as read'
    })
    
  } catch (error) {
    console.error('Mark announcement as read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark as read' },
      { status: 500 }
    )
  }
}