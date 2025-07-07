import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: 特定のガチャ詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // 管理者権限チェック（Cookieベース）
    const adminSessionCookie = request.cookies.get('admin_session')
    if (!adminSessionCookie) {
      return NextResponse.json({
        success: false,
        error: '管理者認証が必要です'
      }, { status: 401 })
    }
    
    try {
      const adminSession = JSON.parse(adminSessionCookie.value)
      if (!adminSession.id || !adminSession.username) {
        return NextResponse.json({
          success: false,
          error: '無効なセッションです'
        }, { status: 401 })
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: '無効なセッションです'
      }, { status: 401 })
    }
    
    const { data: product, error } = await supabase
      .from('gacha_products')
      .select(`
        *,
        gacha_pools (
          id,
          card_id,
          drop_rate,
          cards (
            id,
            name,
            rarity,
            image_url,
            description
          )
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (error) throw error
    
    if (!product) {
      return NextResponse.json(
        { error: 'Gacha product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      product 
    })
  } catch (error: any) {
    console.error('Admin gacha GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: ガチャ更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data: product, error } = await supabase
      .from('gacha_products')
      .update({
        name: body.name,
        description: body.description,
        single_price: body.single_price,
        multi_price: body.multi_price,
        banner_image_url: body.banner_image_url,
        is_active: body.is_active,
        start_date: body.start_date || null,
        end_date: body.end_date || null,
        featured_card_ids: body.featured_card_ids || [],
        guarantee_sr_on_multi: body.guarantee_sr_on_multi
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      product,
      message: 'Gacha product updated successfully'
    })
  } catch (error: any) {
    console.error('Admin gacha PUT error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: ガチャ削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // ガチャプールも自動的に削除される（CASCADE設定）
    const { error } = await supabase
      .from('gacha_products')
      .delete()
      .eq('id', params.id)
    
    if (error) throw error
    
    return NextResponse.json({
      message: 'Gacha product deleted successfully'
    })
  } catch (error: any) {
    console.error('Admin gacha DELETE error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}