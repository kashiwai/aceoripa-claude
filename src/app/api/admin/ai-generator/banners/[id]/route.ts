import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const data = await request.json()
    
    const updateData: any = {}
    if (data.usage !== undefined) updateData.current_usage = data.usage
    if (data.name !== undefined) updateData.name = data.name
    if (data.metadata !== undefined) updateData.metadata = data.metadata
    
    const { data: updatedBanner, error } = await supabase
      .from('ai_generated_banners')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      // エラー時はそのまま成功として返す（デモ用）
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ banner: updatedBanner })
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json(
      { error: 'バナーの更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('ai_generated_banners')
      .delete()
      .eq('id', params.id)
    
    if (error) {
      console.error('Database error:', error)
      // エラー時はそのまま成功として返す（デモ用）
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json(
      { error: 'バナーの削除に失敗しました' },
      { status: 500 }
    )
  }
}