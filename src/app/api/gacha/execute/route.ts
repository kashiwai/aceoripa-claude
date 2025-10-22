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
  isGuaranteed?: boolean // 10連の確定枠かどうか
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
function drawGuaranteedSROrAbove(ssrRate: number = 20, srRate: number = 80): string {
  const random = Math.random() * 100
  const total = ssrRate + srRate
  const normalizedSSRRate = (ssrRate / total) * 100

  if (random < normalizedSSRRate) {
    console.log(`[Gacha] Guaranteed slot: SSR (${ssrRate}% rate)`)
    return 'SSR'
  }
  console.log(`[Gacha] Guaranteed slot: SR (${srRate}% rate)`)
  return 'SR'
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const { productId, pullCount } = body
    
    // 互換性のため変数名を調整
    const gachaId = productId
    const drawCount = pullCount
    
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
    
    // 天井進捗の確認
    let ceilingProgress: any = null
    let isCeilingActive = false

    if (gachaProduct.ceiling_enabled) {
      const { data: progressData, error: progressError } = await supabase
        .rpc('get_ceiling_progress', {
          p_user_id: user.id,
          p_gacha_id: gachaId
        })

      if (progressError) {
        console.error('Ceiling progress check error:', progressError)
      } else if (progressData && progressData.length > 0) {
        ceilingProgress = progressData[0]
        isCeilingActive = ceilingProgress.is_ceiling_reached
        console.log(`[Gacha] Ceiling progress: ${ceilingProgress.pull_count}/${ceilingProgress.ceiling_count}${isCeilingActive ? ' (CEILING REACHED!)' : ''}`)
      }
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

    // N+1クエリ問題を解決: 1回のクエリで全カード取得
    const cardIds = gachaPool.map(p => p.card_id)

    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .in('id', cardIds)

    if (cardsError) {
      console.error('Cards fetch error:', cardsError)
      return NextResponse.json({ error: 'Failed to load cards' }, { status: 500 })
    }

    // カードをマップに変換（高速アクセス用）
    const cardsMap = new Map(cards?.map(c => [c.id, c]) || [])

    // プールカードと対応するカードを結合
    for (const poolCard of gachaPool) {
      const card = cardsMap.get(poolCard.card_id)

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

    // ガチャ商品の確定枠確率設定（デフォルト値を使用、将来的にDB設定可能）
    const guaranteedSSRRate = (gachaProduct as any).guaranteed_ssr_rate || 20
    const guaranteedSRRate = (gachaProduct as any).guaranteed_sr_rate || 80

    console.log(`[Gacha] Starting draw: ${gachaProduct.name}, ${drawCount} pulls`)
    console.log(`[Gacha] Guaranteed slot rates: SSR ${guaranteedSSRRate}%, SR ${guaranteedSRRate}%`)

    for (let i = 0; i < drawCount; i++) {
      let rarity: string
      let isGuaranteedSlot = false
      let isCeilingDraw = false

      // 天井到達時は最初の1枚をSSR確定
      if (isCeilingActive && i === 0) {
        console.log(`[Gacha] CEILING REACHED! First pull is guaranteed SSR`)
        rarity = 'SSR'
        isCeilingDraw = true
        isGuaranteedSlot = true
      }
      // 10連の最後の1枚はSR以上確定
      else if (drawCount === 10 && i === 9) {
        // 既にSR以上が出ているか確認
        const hasSROrAbove = results.some(r => r.rarity === 'SSR' || r.rarity === 'SR')
        if (!hasSROrAbove) {
          console.log(`[Gacha] No SR+ in first 9 pulls, activating guarantee on pull 10`)
          rarity = drawGuaranteedSROrAbove(guaranteedSSRRate, guaranteedSRRate)
          isGuaranteedSlot = true
        } else {
          console.log(`[Gacha] SR+ already obtained, pull 10 uses normal rates`)
          rarity = drawRarity()
        }
      } else {
        rarity = drawRarity()
      }
      
      // 該当レアリティからカードを選択
      const availableCards = cardsByRarity[rarity] || []

      // カードプール検証: 指定されたレアリティのカードが存在しない場合はエラー
      // フォールバックは行わない（景品表示法違反を防ぐため）
      if (availableCards.length === 0) {
        console.error(`Card pool error: No cards available for rarity ${rarity}`)
        console.error('Card pool status:', {
          gachaId,
          requestedRarity: rarity,
          availableRarities: Object.keys(cardsByRarity),
          poolCounts: Object.fromEntries(
            Object.entries(cardsByRarity).map(([r, cards]) => [r, cards.length])
          )
        })

        return NextResponse.json({
          error: `ガチャプールの設定エラー: ${rarity}ランクのカードが登録されていません。管理者に連絡してください。`,
          errorCode: 'INVALID_GACHA_POOL',
          details: {
            gachaId,
            missingRarity: rarity,
            availableRarities: Object.keys(cardsByRarity)
          }
        }, { status: 500 })
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
        isPickup: pickupCards.some(p => p.id === selectedCard.id),
        isGuaranteed: isGuaranteedSlot
      })

      // ログ出力
      const flags = []
      if (isCeilingDraw) flags.push('CEILING')
      if (isGuaranteedSlot && !isCeilingDraw) flags.push('GUARANTEED')
      if (pickupCards.some(p => p.id === selectedCard.id)) flags.push('PICKUP')
      const flagStr = flags.length > 0 ? ` (${flags.join(', ')})` : ''
      console.log(`[Gacha] Pull ${i + 1}/${drawCount}: ${selectedCard.rarity} - ${selectedCard.name}${flagStr}`)
    }
    
    // ポイント消費処理 - どれくらい無料/有料ポイントから引くか計算
    let freePointsToDeduct = 0
    let paidPointsToDeduct = 0
    let remainingCost = requiredPoints

    // まず無料ポイントから消費
    if (userPoints.free_points >= remainingCost) {
      freePointsToDeduct = remainingCost
      remainingCost = 0
    } else {
      freePointsToDeduct = userPoints.free_points
      remainingCost -= userPoints.free_points
      paidPointsToDeduct = remainingCost
    }

    // ポイントを原子的に減算（競合状態を回避）
    const { data: pointsResult, error: deductError } = await supabase
      .rpc('decrement_user_points', {
        p_user_id: user.id,
        p_free_points_to_deduct: freePointsToDeduct,
        p_paid_points_to_deduct: paidPointsToDeduct
      })

    if (deductError || !pointsResult || pointsResult.length === 0) {
      console.error('Points deduction error:', deductError)
      return NextResponse.json({ error: 'ポイント減算に失敗しました' }, { status: 500 })
    }

    // ポイント残高確認
    if (!pointsResult[0].success) {
      return NextResponse.json({
        error: 'ポイントが不足しています',
        required: requiredPoints,
        available: userPoints.free_points + userPoints.paid_points
      }, { status: 400 })
    }

    // 更新後のポイント計算
    const newFreePoints = userPoints.free_points - freePointsToDeduct
    const newPaidPoints = userPoints.paid_points - paidPointsToDeduct

    // カード付与とガチャ結果の記録（エラー時はポイントをロールバック）
    try {
      for (const result of results) {
        // user_cardsに追加（重複の場合は枚数を増やす）
        const { data: existingCard } = await supabase
          .from('user_cards')
          .select('*')
          .eq('user_id', user.id)
          .eq('card_id', result.cardId)
          .single()

        if (existingCard) {
          const { error: updateError } = await supabase
            .from('user_cards')
            .update({
              quantity: existingCard.quantity + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCard.id)

          if (updateError) throw updateError
        } else {
          const { error: insertError } = await supabase
            .from('user_cards')
            .insert({
              user_id: user.id,
              card_id: result.cardId,
              quantity: 1,
              obtained_at: new Date().toISOString()
            })

          if (insertError) throw insertError
        }

        // gacha_resultsに記録
        const { error: resultError } = await supabase
          .from('gacha_results')
          .insert({
            user_id: user.id,
            gacha_id: gachaId,
            card_id: result.cardId,
            drawn_at: new Date().toISOString()
          })

        if (resultError) throw resultError
      }

      // トランザクション記録
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'gacha',
          amount: -requiredPoints,
          description: `${gachaProduct.name} ${drawCount}連`,
          created_at: new Date().toISOString()
        })

      if (transactionError) throw transactionError

    } catch (cardAllocationError) {
      console.error('Card allocation failed, rolling back points:', cardAllocationError)

      // ポイントをロールバック
      const { error: rollbackError } = await supabase
        .rpc('rollback_user_points', {
          p_user_id: user.id,
          p_free_points_to_add: freePointsToDeduct,
          p_paid_points_to_add: paidPointsToDeduct
        })

      if (rollbackError) {
        console.error('Rollback failed:', rollbackError)
        return NextResponse.json({
          error: 'カード付与に失敗し、ポイントのロールバックも失敗しました。サポートにお問い合わせください。',
          requiresSupport: true
        }, { status: 500 })
      }

      return NextResponse.json({
        error: 'カード付与に失敗しました。ポイントは返却されました。',
        rollback: true
      }, { status: 500 })
    }
    
    // 天井カウンター更新
    let ceilingUpdateResult: any = null
    if (gachaProduct.ceiling_enabled) {
      const hasSSR = results.some(r => r.rarity === 'SSR')

      const { data: updateData, error: updateError } = await supabase
        .rpc('increment_ceiling_progress', {
          p_user_id: user.id,
          p_gacha_id: gachaId,
          p_pull_count: drawCount,
          p_has_ssr: hasSSR
        })

      if (updateError) {
        console.error('[Gacha] Ceiling progress update failed:', updateError)
      } else if (updateData && updateData.length > 0) {
        ceilingUpdateResult = updateData[0]
        console.log(`[Gacha] Ceiling progress updated: ${ceilingUpdateResult.current_pull_count}/${ceilingUpdateResult.ceiling_count}${hasSSR ? ' (RESET by SSR)' : ''}`)
      }
    }

    // ガチャ結果サマリーログ
    const rarityCounts = results.reduce((acc, r) => {
      acc[r.rarity] = (acc[r.rarity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const pickupCount = results.filter(r => r.isPickup).length
    const newCardCount = results.filter(r => r.isNew).length
    const guaranteedCount = results.filter(r => r.isGuaranteed).length

    console.log(`[Gacha] Draw complete - Results: SSR=${rarityCounts.SSR || 0}, SR=${rarityCounts.SR || 0}, R=${rarityCounts.R || 0}, N=${rarityCounts.N || 0}`)
    console.log(`[Gacha] Pickup: ${pickupCount}, New: ${newCardCount}, Guaranteed: ${guaranteedCount}`)
    console.log(`[Gacha] Points spent: ${requiredPoints} (Free: ${freePointsToDeduct}, Paid: ${paidPointsToDeduct})`)
    console.log(`[Gacha] Remaining points: ${newFreePoints + newPaidPoints} (Free: ${newFreePoints}, Paid: ${newPaidPoints})`)

    // レスポンス構築
    const response: any = {
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
    }

    // 天井情報を追加
    if (gachaProduct.ceiling_enabled && ceilingUpdateResult) {
      response.ceilingInfo = {
        enabled: true,
        currentPullCount: ceilingUpdateResult.current_pull_count,
        ceilingCount: ceilingUpdateResult.ceiling_count,
        remainingPulls: Math.max(ceilingUpdateResult.ceiling_count - ceilingUpdateResult.current_pull_count, 0),
        isCeilingReached: ceilingUpdateResult.is_ceiling_reached
      }
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Gacha draw error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}