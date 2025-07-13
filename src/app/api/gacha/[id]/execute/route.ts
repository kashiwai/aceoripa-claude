import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const gachaId = params.id
    const { count } = await request.json()
    
    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // ガチャ商品情報を取得
    const { data: gacha, error: gachaError } = await supabase
      .from('gacha_products')
      .select('*')
      .eq('id', gachaId)
      .eq('is_active', true)
      .single()
    
    if (gachaError || !gacha) {
      return NextResponse.json({ error: 'Gacha not found or inactive' }, { status: 404 })
    }
    
    // カードプールを取得
    const { data: poolData, error: poolError } = await supabase
      .from('gacha_pokemon_pools')
      .select(`
        id,
        weight,
        pokemon_card:pokemon_cards (
          id,
          card_name,
          product_code,
          rarity,
          image_url,
          market_price,
          description
        )
      `)
      .eq('gacha_product_id', gachaId)
    
    if (poolError || !poolData || poolData.length === 0) {
      return NextResponse.json({ error: 'No cards available in this gacha' }, { status: 404 })
    }
    
    // 必要ポイント計算
    const requiredPoints = gacha.single_price * count
    
    // ユーザーのポイント確認
    const { data: userPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('total_points')
      .eq('user_id', user.id)
      .single()
    
    if (pointsError || !userPoints || userPoints.total_points < requiredPoints) {
      return NextResponse.json({ 
        error: 'Insufficient points',
        required: requiredPoints,
        available: userPoints?.total_points || 0
      }, { status: 400 })
    }
    
    // 重み付き抽選の実行
    const results = []
    const totalWeight = poolData.reduce((sum, item) => sum + item.weight, 0)
    
    for (let i = 0; i < count; i++) {
      const random = Math.random() * totalWeight
      let currentWeight = 0
      let selectedCard = null
      
      for (const item of poolData) {
        currentWeight += item.weight
        if (random <= currentWeight) {
          selectedCard = item.pokemon_card
          break
        }
      }
      
      if (selectedCard) {
        results.push({
          id: selectedCard.id,
          name: selectedCard.card_name,
          rarity: selectedCard.rarity,
          imageUrl: selectedCard.image_url,
          description: selectedCard.description,
          market_price: selectedCard.market_price
        })
      }
    }
    
    // ポイント消費
    const { error: pointsUpdateError } = await supabase
      .from('user_points')
      .update({ 
        total_points: userPoints.total_points - requiredPoints,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
    
    if (pointsUpdateError) {
      return NextResponse.json({ error: 'Failed to consume points' }, { status: 500 })
    }
    
    // ガチャ結果をログに記録
    for (const result of results) {
      await supabase
        .from('gacha_results_pokemon')
        .insert({
          user_id: user.id,
          gacha_product_id: gachaId,
          pokemon_card_id: result.id,
          created_at: new Date().toISOString()
        })
    }
    
    // 残りパック数更新
    if (gacha.remaining_packs) {
      await supabase
        .from('gacha_products')
        .update({ 
          remaining_packs: Math.max(0, gacha.remaining_packs - count),
          updated_at: new Date().toISOString()
        })
        .eq('id', gachaId)
    }
    
    return NextResponse.json({
      success: true,
      results,
      pointsConsumed: requiredPoints,
      remainingPoints: userPoints.total_points - requiredPoints
    })
    
  } catch (error: any) {
    console.error('Gacha execution error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}