import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DOPA式ガチャシステム
// 実質還元率70%、体感還元率97%
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
    
    // ガチャ商品情報とDOPA設定を取得
    const { data: gacha, error: gachaError } = await supabase
      .from('gacha_products')
      .select('*, dopa_settings')
      .eq('id', gachaId)
      .eq('is_active', true)
      .single()
    
    if (gachaError || !gacha) {
      return NextResponse.json({ error: 'Gacha not found or inactive' }, { status: 404 })
    }
    
    // DOPA設定の取得（デフォルト値設定）
    const dopaSettings = gacha.dopa_settings || {
      actual_return_rate: 0.70,
      display_return_rate: 0.97,
      explosion_ad_rate: 0.15
    }
    
    // カードプールを取得（物理カードとポイント還元カード両方）
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
          description,
          card_type,
          point_value
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
    
    // DOPA式重み付き抽選の実行
    const results = []
    const totalWeight = poolData.reduce((sum, item) => sum + item.weight, 0)
    
    for (let i = 0; i < count; i++) {
      const selectedCard = executeDopaGachaRoll(poolData, totalWeight, dopaSettings)
      
      if (selectedCard) {
        results.push({
          id: selectedCard.id,
          name: selectedCard.card_name,
          rarity: selectedCard.rarity,
          imageUrl: selectedCard.image_url,
          description: selectedCard.description,
          market_price: selectedCard.market_price,
          card_type: selectedCard.card_type,
          point_value: selectedCard.point_value || 0,
          is_point_return: selectedCard.card_type === 'point_return',
          is_explosion_ad: selectedCard.point_value >= 12000 // 12000P以上は爆アド
        })
      }
    }
    
    // ポイント還元カードの処理
    let totalPointReturn = 0
    const pointReturnCards = results.filter(card => card.is_point_return)
    
    if (pointReturnCards.length > 0) {
      totalPointReturn = pointReturnCards.reduce((sum, card) => sum + card.point_value, 0)
      
      // ユーザーにポイント還元
      const { error: pointReturnError } = await supabase
        .from('user_points')
        .update({ 
          total_points: userPoints.total_points - requiredPoints + totalPointReturn,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
      
      if (pointReturnError) {
        console.error('Point return error:', pointReturnError)
      }
      
      // ポイント還元ログ
      if (totalPointReturn > 0) {
        await supabase
          .from('point_transactions')
          .insert({
            user_id: user.id,
            amount: totalPointReturn,
            transaction_type: 'gacha_return',
            description: `ガチャポイント還元: ${totalPointReturn}P`,
            gacha_product_id: gachaId,
            created_at: new Date().toISOString()
          })
      }
    } else {
      // ポイント還元カードがない場合の通常ポイント消費
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
    }
    
    // ガチャ使用ポイントのログ
    await supabase
      .from('point_transactions')
      .insert({
        user_id: user.id,
        amount: -requiredPoints,
        transaction_type: 'gacha_pull',
        description: `ガチャ実行: ${count}回`,
        gacha_product_id: gachaId,
        created_at: new Date().toISOString()
      })
    
    // ガチャ結果をログに記録
    for (const result of results) {
      await supabase
        .from('gacha_results_pokemon')
        .insert({
          user_id: user.id,
          gacha_product_id: gachaId,
          pokemon_card_id: result.id,
          is_point_return: result.is_point_return,
          point_value: result.point_value,
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
    
    // DOPA式統計計算
    const statistics = calculateDopaStatistics(results, requiredPoints, totalPointReturn)
    
    return NextResponse.json({
      success: true,
      results,
      pointsConsumed: requiredPoints,
      pointsReturned: totalPointReturn,
      netPointsUsed: requiredPoints - totalPointReturn,
      remainingPoints: (userPoints.total_points - requiredPoints + totalPointReturn),
      statistics,
      explosion_ads: pointReturnCards.filter(card => card.is_explosion_ad).length,
      dopa_info: {
        actual_return_rate: statistics.actual_return_rate,
        effective_cost: statistics.effective_cost,
        is_explosion_round: totalPointReturn > requiredPoints
      }
    })
    
  } catch (error: any) {
    console.error('DOPA Gacha execution error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

// DOPA式ガチャ抽選実行
function executeDopaGachaRoll(poolData: any[], totalWeight: number, dopaSettings: any) {
  const random = Math.random() * totalWeight
  let currentWeight = 0
  
  for (const item of poolData) {
    currentWeight += item.weight
    if (random <= currentWeight) {
      return item.pokemon_card
    }
  }
  
  // フォールバック（最後のアイテム）
  return poolData[poolData.length - 1]?.pokemon_card
}

// DOPA式統計計算
function calculateDopaStatistics(results: any[], pointsConsumed: number, pointsReturned: number) {
  const physicalCards = results.filter(card => card.card_type === 'physical')
  const pointReturnCards = results.filter(card => card.is_point_return)
  const explosionAds = pointReturnCards.filter(card => card.is_explosion_ad)
  
  // 実質還元率計算
  const actual_return_rate = pointsConsumed > 0 ? pointsReturned / pointsConsumed : 0
  
  // 実質コスト計算
  const effective_cost = pointsConsumed - pointsReturned
  
  return {
    total_pulls: results.length,
    physical_cards: physicalCards.length,
    point_return_cards: pointReturnCards.length,
    explosion_ads: explosionAds.length,
    points_consumed: pointsConsumed,
    points_returned: pointsReturned,
    effective_cost: effective_cost,
    actual_return_rate: actual_return_rate,
    is_profitable: pointsReturned > pointsConsumed,
    explosion_ad_rate: results.length > 0 ? explosionAds.length / results.length : 0,
    // レアリティ別統計
    rarity_breakdown: {
      SS: results.filter(r => r.rarity === 'SS').length,
      S: results.filter(r => r.rarity === 'S').length,
      A: results.filter(r => r.rarity === 'A').length,
      B: results.filter(r => r.rarity === 'B').length,
      C: results.filter(r => r.rarity === 'C').length
    }
  }
}