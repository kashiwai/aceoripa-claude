import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

// レアリティ別の基本確率（%）
const RARITY_RATES = {
  SS: 3,   // 最高レア
  S: 12,   // 高レア
  A: 40,   // 中レア
  B: 45    // 低レア
}

// ピックアップ確率（SS内での確率）
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

  return 'B' // フォールバック（最低レア）
}

// 10連ガチャのS以上確定枠の抽選
function drawGuaranteedSOrAbove(ssRate: number = 20, sRate: number = 80): string {
  const random = Math.random() * 100
  const total = ssRate + sRate
  const normalizedSSRate = (ssRate / total) * 100

  if (random < normalizedSSRate) {
    console.log(`[Gacha] Guaranteed slot: SS (${ssRate}% rate)`)
    return 'SS'
  }
  console.log(`[Gacha] Guaranteed slot: S (${sRate}% rate)`)
  return 'S'
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const adminClient = createAdminClient()

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
      .from('gacha_pokemon_pools')
      .select(`
        id,
        weight,
        pokemon_card:pokemon_cards (
          id,
          card_name,
          rarity,
          image_url
        )
      `)
      .eq('gacha_product_id', gachaId)

    if (poolError || !gachaPool || gachaPool.length === 0) {
      console.error('Pool fetch error:', poolError)
      return NextResponse.json({ error: 'Gacha pool not found' }, { status: 404 })
    }
    
    // カードプールをレアリティ別に分類
    const cardsByRarity: Record<string, any[]> = {}
    const pickupCards: any[] = []

    // プールからカードを抽出（既にpokemon_cardが含まれている）
    for (const poolItem of gachaPool) {
      if (!poolItem.pokemon_card) continue

      const card = {
        id: poolItem.pokemon_card.id,
        name: poolItem.pokemon_card.card_name,
        rarity: poolItem.pokemon_card.rarity,
        image_url: poolItem.pokemon_card.image_url
      }

      if (!cardsByRarity[card.rarity]) {
        cardsByRarity[card.rarity] = []
      }
      cardsByRarity[card.rarity].push(card)

      // TODO: ピックアップフラグが必要な場合はテーブルに追加
      // if (poolItem.is_pickup) {
      //   pickupCards.push(card)
      // }
    }
    
    // 抽選実行
    const results: DrawResult[] = []

    // ガチャ商品の確定枠確率設定（デフォルト値を使用、将来的にDB設定可能）
    const guaranteedSSRate = (gachaProduct as any).guaranteed_ss_rate || 20
    const guaranteedSRate = (gachaProduct as any).guaranteed_s_rate || 80

    console.log(`[Gacha] Starting draw: ${gachaProduct.name}, ${drawCount} pulls`)
    console.log(`[Gacha] Guaranteed slot rates: SSR ${guaranteedSSRate}%, SR ${guaranteedSRate}%`)

    for (let i = 0; i < drawCount; i++) {
      let rarity: string
      let isGuaranteedSlot = false
      let isCeilingDraw = false

      // 天井到達時は最初の1枚をSSR確定
      if (isCeilingActive && i === 0) {
        console.log(`[Gacha] CEILING REACHED! First pull is guaranteed SSR`)
        rarity = 'SS'
        isCeilingDraw = true
        isGuaranteedSlot = true
      }
      // 10連の最後の1枚はSR以上確定
      else if (drawCount === 10 && i === 9) {
        // 既にSR以上が出ているか確認
        const hasSOrAbove = results.some(r => r.rarity === 'SS' || r.rarity === 'S')
        if (!hasSOrAbove) {
          console.log(`[Gacha] No S+ in first 9 pulls, activating guarantee on pull 10`)
          rarity = drawGuaranteedSOrAbove(guaranteedSSRate, guaranteedSRate)
          isGuaranteedSlot = true
        } else {
          console.log(`[Gacha] S+ already obtained, pull 10 uses normal rates`)
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
      if (rarity === 'SS' && pickupCards.length > 0 && Math.random() < PICKUP_RATE / 100) {
        // ピックアップから選択
        const ssPickups = pickupCards.filter(c => c.rarity === 'SS')
        if (ssPickups.length > 0) {
          selectedCard = ssPickups[Math.floor(Math.random() * ssPickups.length)]
        }
      }
      
      // 通常選択
      if (!selectedCard) {
        selectedCard = availableCards[Math.floor(Math.random() * availableCards.length)]
      }
      
      // ユーザーが既に持っているか確認
      const { data: existingCard } = await supabase
        .from('user_pokemon_cards')
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

    // NULL対策: free_pointsとpaid_pointsがnullの場合は0として扱う
    const currentFreePoints = userPoints.free_points || 0
    const currentPaidPoints = userPoints.paid_points || 0

    // まず無料ポイントから消費
    if (currentFreePoints >= remainingCost) {
      freePointsToDeduct = remainingCost
      remainingCost = 0
    } else {
      freePointsToDeduct = currentFreePoints
      remainingCost -= currentFreePoints
      paidPointsToDeduct = remainingCost
    }

    // point_transactionsテーブルに消費履歴を記録
    // 注意: user_pointsは自動同期トリガー(sync_points_after_transaction)で更新されるため、
    // 直接UPDATEは不要。トランザクション記録だけで自動的にポイントが減算される。

    // point_transactionsテーブルに消費履歴を記録（無料ポイント）
    if (freePointsToDeduct > 0) {
      const { error: freeTransactionError } = await adminClient
        .from('point_transactions')
        .insert({
          user_id: user.id,
          amount: -freePointsToDeduct,
          type: 'use',  // CHECK制約: 'purchase', 'use', 'bonus', 'refund'のみ許可
          is_paid: false,
          description: `${gachaProduct.name} ${drawCount}連（無料ポイント消費）`,
          created_at: new Date().toISOString()
        })

      if (freeTransactionError) {
        console.error('Free point transaction record error:', freeTransactionError)
        return NextResponse.json({ error: 'ポイント減算に失敗しました（無料ポイント）' }, { status: 500 })
      }
    }

    // point_transactionsテーブルに消費履歴を記録（有料ポイント）
    if (paidPointsToDeduct > 0) {
      const { error: paidTransactionError } = await adminClient
        .from('point_transactions')
        .insert({
          user_id: user.id,
          amount: -paidPointsToDeduct,
          type: 'use',  // CHECK制約: 'purchase', 'use', 'bonus', 'refund'のみ許可
          is_paid: true,
          description: `${gachaProduct.name} ${drawCount}連（有料ポイント消費）`,
          created_at: new Date().toISOString()
        })

      if (paidTransactionError) {
        console.error('Paid point transaction record error:', paidTransactionError)
        return NextResponse.json({ error: 'ポイント減算に失敗しました（有料ポイント）' }, { status: 500 })
      }
    }

    // 更新後のポイント計算
    const newFreePoints = userPoints.free_points - freePointsToDeduct
    const newPaidPoints = userPoints.paid_points - paidPointsToDeduct

    // カード付与（エラー時はポイントをロールバック）
    try {
      console.log(`[Gacha] Cards drawn successfully, starting card allocation`)
      console.log(`[Gacha] User ${user.id} received ${results.length} cards`)

      // 各カードをuser_cardsテーブルに保存
      for (const result of results) {
        // user_cardsテーブルに追加（シンプルに毎回新規レコードを追加）
        const { error: insertError } = await adminClient
          .from('user_cards')
          .insert({
            user_id: user.id,
            card_id: result.cardId,
            obtained_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('[Gacha] Card insert error:', insertError)
          console.error('[Gacha] Error details:', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint
          })
          throw new Error(`カード付与に失敗しました: ${insertError.message}`)
        }

        console.log(`[Gacha] Added card: ${result.cardName} (${result.rarity})`)
      }

      console.log(`[Gacha] All ${results.length} cards allocated successfully`)

      // トランザクション記録（adminClientでRLSをバイパス）
      // 注意: transactionsテーブルはproduct_idが必須カラムなので、ガチャIDを指定
      console.log(`[Gacha] Recording transaction`)
      const { error: transactionError } = await adminClient
        .from('transactions')
        .insert({
          user_id: user.id,
          product_id: gachaId,
          amount: requiredPoints,
          status: 'completed',
          metadata: {
            draw_count: drawCount,
            free_points_used: freePointsToDeduct,
            paid_points_used: paidPointsToDeduct
          },
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })

      if (transactionError) {
        console.error(`[Gacha] transactions insert error:`, transactionError)
        // トランザクション記録失敗は致命的ではないのでログだけ出す
        console.log(`[Gacha] Transaction recording failed, but continuing...`)
      } else {
        console.log(`[Gacha] Transaction recorded successfully`)
      }

    } catch (cardAllocationError: any) {
      console.error('Card allocation failed, rolling back points:', {
        message: cardAllocationError?.message,
        code: cardAllocationError?.code,
        details: cardAllocationError?.details,
        hint: cardAllocationError?.hint,
        full: cardAllocationError
      })

      // ポイントをロールバック（直接UPDATE、adminClientでRLSをバイパス）
      const { error: rollbackError } = await adminClient
        .from('user_points')
        .update({
          free_points: currentFreePoints,
          paid_points: currentPaidPoints,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (rollbackError) {
        console.error('Rollback failed:', rollbackError)
        return NextResponse.json({
          error: 'カード付与に失敗し、ポイントのロールバックも失敗しました。サポートにお問い合わせください。',
          requiresSupport: true
        }, { status: 500 })
      }

      // ロールバック履歴をpoint_transactionsに記録（無料ポイント）
      if (freePointsToDeduct > 0) {
        await adminClient
          .from('point_transactions')
          .insert({
            user_id: user.id,
            amount: freePointsToDeduct,
            type: 'refund',
            is_paid: false,
            description: `${gachaProduct.name} ${drawCount}連（カード付与失敗による返却）`,
            created_at: new Date().toISOString()
          })
      }

      // ロールバック履歴をpoint_transactionsに記録（有料ポイント）
      if (paidPointsToDeduct > 0) {
        await adminClient
          .from('point_transactions')
          .insert({
            user_id: user.id,
            amount: paidPointsToDeduct,
            type: 'refund',
            is_paid: true,
            description: `${gachaProduct.name} ${drawCount}連（カード付与失敗による返却）`,
            created_at: new Date().toISOString()
          })
      }

      return NextResponse.json({
        error: 'カード付与に失敗しました。ポイントは返却されました。',
        rollback: true
      }, { status: 500 })
    }
    
    // 天井カウンター更新
    let ceilingUpdateResult: any = null
    if (gachaProduct.ceiling_enabled) {
      const hasSS = results.some(r => r.rarity === 'SS')

      const { data: updateData, error: updateError } = await supabase
        .rpc('increment_ceiling_progress', {
          p_user_id: user.id,
          p_gacha_id: gachaId,
          p_pull_count: drawCount,
          p_has_ss: hasSS
        })

      if (updateError) {
        console.error('[Gacha] Ceiling progress update failed:', updateError)
      } else if (updateData && updateData.length > 0) {
        ceilingUpdateResult = updateData[0]
        console.log(`[Gacha] Ceiling progress updated: ${ceilingUpdateResult.current_pull_count}/${ceilingUpdateResult.ceiling_count}${hasSS ? ' (RESET by SSR)' : ''}`)
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

    console.log(`[Gacha] Draw complete - Results: SS=${rarityCounts.SSR || 0}, S=${rarityCounts.SR || 0}, A=${rarityCounts.R || 0}, B=${rarityCounts.N || 0}`)
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