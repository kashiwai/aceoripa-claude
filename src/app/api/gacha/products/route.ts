import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // データベースからアクティブなガチャ商品を取得
    const { data: gachaProducts, error } = await supabase
      .from('gacha_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 })
    }
    
    // データが存在しない場合は空配列を返す
    if (!gachaProducts || gachaProducts.length === 0) {
      return NextResponse.json({ products: [] })
    }
    
    // データベースのデータをフロントエンド用の形式に変換
    const formattedProducts = gachaProducts.map((product) => {
      // remaining_packsとtotal_packsフィールドを使用
      const total = product.total_packs || 1000
      const remaining = product.remaining_packs || total
      const remainingPercent = (remaining / total) * 100
      
      // ステータスの判定
      let status = 'active'
      if (remaining === 0) {
        status = 'sold_out'
      } else if (remainingPercent < 20) {
        status = 'ending_soon'
      }
      
      return {
        id: product.id,
        name: product.name,
        price: product.single_price, // single_priceを使用
        image: product.banner_image_url,
        remaining: remaining,
        total: total,
        status: status
      }
    })
    
    return NextResponse.json({ products: formattedProducts })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}