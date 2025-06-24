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

    const updateData: any = {}
    
    // フロントエンド → DB カラムマッピング
    if (body.title !== undefined) updateData.title = body.title
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle
    if (body.description !== undefined) updateData.description = body.description
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl
    if (body.linkUrl !== undefined) updateData.link_url = body.linkUrl
    if (body.linkType !== undefined) updateData.link_type = body.linkType
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.isActive !== undefined) updateData.is_active = body.isActive
    if (body.startDate !== undefined) updateData.start_date = body.startDate
    if (body.endDate !== undefined) updateData.end_date = body.endDate
    if (body.backgroundColor !== undefined) updateData.background_color = body.backgroundColor
    if (body.textColor !== undefined) updateData.text_color = body.textColor
    
    updateData.updated_at = new Date().toISOString()

    const { data: banner, error } = await supabase
      .from('banners')
      .update(updateData)
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

    // カラムマッピング（DB → フロントエンド）
    const mappedBanner = {
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      imageUrl: banner.image_url,
      linkUrl: banner.link_url,
      linkType: banner.link_type,
      priority: banner.priority,
      isActive: banner.is_active,
      startDate: banner.start_date,
      endDate: banner.end_date,
      backgroundColor: banner.background_color,
      textColor: banner.text_color,
      createdAt: banner.created_at,
      updatedAt: banner.updated_at
    }

    return NextResponse.json({
      success: true,
      banner: mappedBanner
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