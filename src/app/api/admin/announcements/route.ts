import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: 管理者用 - 全てのお知らせを取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: announcements || []
    })
    
  } catch (error) {
    console.error('Admin announcements fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

// POST: 管理者用 - お知らせの作成
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    console.log('Received POST data:', body)
    
    // 必要なフィールドのバリデーション
    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      )
    }
    
    // データベースに挿入するデータを準備
    const insertData = {
      title: body.title,
      content: body.content,
      type: body.type || 'news',
      status: body.status || 'draft',
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      priority: body.priority || 1,
      show_popup: body.show_popup === true,
      popup_delay_seconds: body.popup_delay_seconds || 0,
      cta_text: body.cta_text || null,
      cta_url: body.cta_url || null,
      image_url: body.image_url || null,
      is_active: body.status === 'published'
    }
    
    // 空文字をnullに変換
    Object.keys(insertData).forEach(key => {
      if (insertData[key] === '') {
        insertData[key] = null
      }
    })
    
    console.log('Insert data:', insertData)
    
    const { data, error } = await supabase
      .from('announcements')
      .insert([insertData])
      .select()
    
    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({
        success: false,
        error: error.message || 'Database insert failed',
        details: error
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Announcement created successfully'
    })
    
  } catch (error: any) {
    console.error('Admin announcement creation error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create announcement', details: error },
      { status: 500 }
    )
  }
}

// PUT: 管理者用 - お知らせの更新
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Announcement ID is required' },
        { status: 400 }
      )
    }
    
    // 更新データを準備
    const updateData = {
      title: body.title,
      content: body.content,
      type: body.type || 'news',
      status: body.status || 'draft',
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      priority: body.priority || 1,
      show_popup: body.show_popup === true,
      popup_delay_seconds: body.popup_delay_seconds || 0,
      cta_text: body.cta_text || null,
      cta_url: body.cta_url || null,
      image_url: body.image_url || null,
      is_active: body.status === 'published'
    }
    
    // 空文字をnullに変換
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '') {
        updateData[key] = null
      }
    })
    
    const { data, error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', body.id)
      .select()
    
    if (error) {
      console.error('Update error:', error)
      throw error
    }
    
    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Announcement updated successfully'
    })
    
  } catch (error) {
    console.error('Admin announcement update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update announcement' },
      { status: 500 }
    )
  }
}

// DELETE: 管理者用 - お知らせの削除
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Announcement ID is required' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Delete error:', error)
      throw error
    }
    
    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    })
    
  } catch (error) {
    console.error('Admin announcement deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete announcement' },
      { status: 500 }
    )
  }
}