import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // トップ400カードを価格順（降順）で取得
    const { data: cards, error } = await supabase
      .from('pokemon_cards')
      .select(`
        id,
        card_name,
        product_code,
        rarity,
        market_price,
        image_url,
        created_at,
        updated_at
      `)
      .order('market_price', { ascending: false })
      .limit(400)

    if (error) {
      console.error('Error fetching top cards:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch top cards' 
      }, { status: 500 })
    }

    // フロントエンド用のフォーマットに変換
    const formattedCards = cards?.map(card => ({
      id: card.id,
      name: card.card_name,
      set_name: card.product_code, // product_codeをset_nameとして使用
      rarity: card.rarity,
      current_price: card.market_price,
      previous_price: card.market_price, // 現在は同じ値を使用
      change_percentage: 0, // 現在は0%変動として扱う
      last_updated: card.updated_at || card.created_at
    })) || []

    return NextResponse.json({
      success: true,
      cards: formattedCards,
      total: cards?.length || 0
    })

  } catch (error) {
    console.error('Error in top-cards-price API:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}