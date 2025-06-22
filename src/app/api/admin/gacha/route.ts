import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: ガチャ商品一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 管理者権限チェック（本番環境では必須）
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user || user.email !== process.env.ADMIN_EMAIL) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    
    const { data: products, error } = await supabase
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
            image_url
          )
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // 統計情報を追加
    const productsWithStats = products?.map(product => {
      const totalCards = product.gacha_pools?.length || 0
      const ssrCount = product.gacha_pools?.filter((p: any) => p.cards?.rarity === 'SSR').length || 0
      const srCount = product.gacha_pools?.filter((p: any) => p.cards?.rarity === 'SR').length || 0
      
      return {
        ...product,
        stats: {
          total_cards: totalCards,
          ssr_count: ssrCount,
          sr_count: srCount,
          r_count: product.gacha_pools?.filter((p: any) => p.cards?.rarity === 'R').length || 0,
          n_count: product.gacha_pools?.filter((p: any) => p.cards?.rarity === 'N').length || 0
        }
      }
    })
    
    return NextResponse.json({
      products: productsWithStats,
      total: products?.length || 0
    })
  } catch (error: any) {
    console.error('Admin gacha GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: 新規ガチャ作成
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // バリデーション
    if (!body.name || !body.single_price || !body.multi_price) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      )
    }
    
    const { data: product, error } = await supabase
      .from('gacha_products')
      .insert({
        name: body.name,
        description: body.description,
        single_price: body.single_price,
        multi_price: body.multi_price,
        banner_image_url: body.banner_image_url,
        is_active: body.is_active ?? true,
        start_date: body.start_date || null,
        end_date: body.end_date || null,
        featured_card_ids: body.featured_card_ids || [],
        guarantee_sr_on_multi: body.guarantee_sr_on_multi ?? true
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      product,
      message: 'Gacha product created successfully'
    })
  } catch (error: any) {
    console.error('Admin gacha POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}