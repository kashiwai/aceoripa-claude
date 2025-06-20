import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// レアリティ別の基本確率（%）
const RARITY_RATES = {
  SSR: 3,
  SR: 12,
  R: 35,
  N: 50
}

// ピックアップ確率（SSR内での確率）
const PICKUP_RATE = 50 // 50%

interface GachaDrawRequest {
  gachaId: string
  drawCount: 1 | 10
}

interface DrawResult {
  cardId: string
  cardName: string
  rarity: string
  imageUrl: string
  isNew: boolean
  isPickup?: boolean
}

// レアリティ抽選
function drawRarity(): string {
  const random = Math.random() * 100
  let accumulated = 0
  
  for (const [rarity, rate] of Object.entries(RARITY_RATES)) {
    accumulated += rate
    if (random < accumulated) {
      return rarity
    }
  }
  
  return 'N' // フォールバック
}

// 10連ガチャのSR以上確定枠の抽選
function drawGuaranteedSROrAbove(): string {
  const random = Math.random() * 100
  if (random < 20) return 'SSR' // 20%
  return 'SR' // 80%
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body: GachaDrawRequest = await req.json()
    const { gachaId, drawCount } = body
    
    // ガチャ商品情報の取得
    const { data: gachaProduct, error: gachaError } = await supabase
      .from('gacha_products')
      .select('*')
      .eq('id', gachaId)
      .single()
    
    if (gachaError || !gachaProduct) {
      return NextResponse.json({ error: 'Gacha product not found' }, { status: 404 })
    }
    
    // ポイント確認
    const { data: userPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (pointsError || !userPoints) {
      return NextResponse.json({ error: 'User points not found' }, { status: 404 })
    }
    
    const requiredPoints = gachaProduct.cost * drawCount
    const totalPoints = userPoints.free_points + userPoints.paid_points
    
    if (totalPoints < requiredPoints) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
    }
    
    // ガチャプール情報の取得
    const { data: gachaPool, error: poolError } = await supabase
      .from('gacha_pools')
      .select('*')
      .eq('gacha_id', gachaId)
    
    if (poolError || !gachaPool || gachaPool.length === 0) {
      return NextResponse.json({ error: 'Gacha pool not found' }, { status: 404 })
    }
    
    // カードプールをレアリティ別に分類
    const cardsByRarity: Record<string, any[]> = {}
    const pickupCards: any[] = []
    
    for (const poolCard of gachaPool) {
      const { data: card } = await supabase
        .from('cards')
        .select('*')
        .eq('id', poolCard.card_id)
        .single()
      
      if (card) {
        if (!cardsByRarity[card.rarity]) {
          cardsByRarity[card.rarity] = []
        }
        cardsByRarity[card.rarity].push(card)
        
        if (poolCard.is_pickup) {
          pickupCards.push(card)
        }
      }
    }
    
    // 抽選実行
    const results: DrawResult[] = []
    
    for (let i = 0; i < drawCount; i++) {
      let rarity: string
      
      // 10連の最後の1枚はSR以上確定
      if (drawCount === 10 && i === 9) {
        // 既にSR以上が出ているか確認
        const hasSROrAbove = results.some(r => r.rarity === 'SSR' || r.rarity === 'SR')
        if (!hasSROrAbove) {
          rarity = drawGuaranteedSROrAbove()
        } else {
          rarity = drawRarity()
        }
      } else {
        rarity = drawRarity()
      }
      
      // 該当レアリティからカードを選択
      const availableCards = cardsByRarity[rarity] || []
      if (availableCards.length === 0) {
        // フォールバック: 下位レアリティから選択
        const fallbackRarities = ['N', 'R', 'SR', 'SSR']
        for (const r of fallbackRarities) {
          if (cardsByRarity[r] && cardsByRarity[r].length > 0) {
            availableCards.push(...cardsByRarity[r])
            break
          }
        }
      }
      
      if (availableCards.length === 0) {
        return NextResponse.json({ error: 'No cards available in pool' }, { status: 500 })
      }
      
      // ピックアップ判定（SSRの場合）
      let selectedCard
      if (rarity === 'SSR' && pickupCards.length > 0 && Math.random() < PICKUP_RATE / 100) {
        // ピックアップから選択
        const ssrPickups = pickupCards.filter(c => c.rarity === 'SSR')
        if (ssrPickups.length > 0) {
          selectedCard = ssrPickups[Math.floor(Math.random() * ssrPickups.length)]
        }
      }
      
      // 通常選択
      if (!selectedCard) {
        selectedCard = availableCards[Math.floor(Math.random() * availableCards.length)]
      }
      
      // ユーザーが既に持っているか確認
      const { data: existingCard } = await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('card_id', selectedCard.id)
        .single()
      
      results.push({
        cardId: selectedCard.id,
        cardName: selectedCard.name,
        rarity: selectedCard.rarity,
        imageUrl: selectedCard.image_url || '/images/cards/default.png',
        isNew: !existingCard,
        isPickup: pickupCards.some(p => p.id === selectedCard.id)
      })
    }
    
    // ポイント消費処理
    let remainingCost = requiredPoints
    let newFreePoints = userPoints.free_points
    let newPaidPoints = userPoints.paid_points
    
    // まず無料ポイントから消費
    if (newFreePoints >= remainingCost) {
      newFreePoints -= remainingCost
      remainingCost = 0
    } else {
      remainingCost -= newFreePoints
      newFreePoints = 0
      newPaidPoints -= remainingCost
    }
    
    // ポイント更新
    const { error: updatePointsError } = await supabase
      .from('user_points')
      .update({
        free_points: newFreePoints,
        paid_points: newPaidPoints,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
    
    if (updatePointsError) {
      return NextResponse.json({ error: 'Failed to update points' }, { status: 500 })
    }
    
    // カード付与とガチャ結果の記録
    for (const result of results) {
      // user_cardsに追加（重複の場合は枚数を増やす）
      const { data: existingCard } = await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('card_id', result.cardId)
        .single()
      
      if (existingCard) {
        await supabase
          .from('user_cards')
          .update({
            quantity: existingCard.quantity + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCard.id)
      } else {
        await supabase
          .from('user_cards')
          .insert({
            user_id: user.id,
            card_id: result.cardId,
            quantity: 1,
            obtained_at: new Date().toISOString()
          })
      }
      
      // gacha_resultsに記録
      await supabase
        .from('gacha_results')
        .insert({
          user_id: user.id,
          gacha_id: gachaId,
          card_id: result.cardId,
          drawn_at: new Date().toISOString()
        })
    }
    
    // トランザクション記録
    await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'gacha',
        amount: -requiredPoints,
        description: `${gachaProduct.name} ${drawCount}連`,
        created_at: new Date().toISOString()
      })
    
    // 天井カウンター更新（実装予定）
    // TODO: 天井システムの実装
    
    return NextResponse.json({
      success: true,
      results,
      remainingPoints: {
        free: newFreePoints,
        paid: newPaidPoints,
        total: newFreePoints + newPaidPoints
      },
      gachaInfo: {
        name: gachaProduct.name,
        drawCount
      }
    })
    
  } catch (error) {
    console.error('Gacha draw error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}