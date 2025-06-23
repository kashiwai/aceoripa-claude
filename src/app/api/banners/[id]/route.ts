import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// バナー更新API
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { data: banner, error } = await supabase
      .from('banners')
      .update({
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        image_url: body.imageUrl,
        link_url: body.linkUrl,
        link_type: body.linkType,
        priority: body.priority,
        is_active: body.isActive,
        start_date: body.startDate,
        end_date: body.endDate,
        background_color: body.backgroundColor,
        text_color: body.textColor,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        success: false,
        error: 'バナーの更新に失敗しました'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      banner
    })
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json({
      success: false,
      error: 'バナーの更新中にエラーが発生しました'
    }, { status: 500 })
  }
}

// バナー削除API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        success: false,
        error: 'バナーの削除に失敗しました'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json({
      success: false,
      error: 'バナーの削除中にエラーが発生しました'
    }, { status: 500 })
  }
}