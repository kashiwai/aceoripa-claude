import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// レアリティ別のデフォルト排出率
const DEFAULT_RATES = {
  SS: 0.005,  // 0.5%
  S: 0.02,    // 2%
  A: 0.10,    // 10%
  B: 0.375,   // 37.5%
  C: 0.50     // 50%
}

export async function POST(request: NextRequest) {
  try {
    // 管理者認証をチェック
    const cookieStore = cookies()
    const adminSession = cookieStore.get('admin_session')
    
    if (!adminSession) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { gachaId } = body
    
    console.log('Analyzing gacha:', gachaId)

    if (!gachaId) {
      return NextResponse.json(
        { error: 'ガチャIDが必要です' },
        { status: 400 }
      )
    }

    // ガチャ情報を取得
    const { data: gacha, error: gachaError } = await supabase
      .from('gacha_products')
      .select('*')
      .eq('id', gachaId)
      .single()

    if (gachaError) {
      console.error('Gacha fetch error:', gachaError)
      return NextResponse.json(
        { error: 'ガチャ情報の取得に失敗しました', details: gachaError.message },
        { status: 500 }
      )
    }
    
    if (!gacha) {
      return NextResponse.json(
        { error: 'ガチャが見つかりません' },
        { status: 404 }
      )
    }

    // ガチャのカードプールを取得
    const { data: poolCards, error: poolError } = await supabase
      .from('gacha_pokemon_pools')
      .select('*')
      .eq('gacha_product_id', gachaId)

    if (poolError) {
      console.error('Pool cards error:', poolError)
      return NextResponse.json(
        { error: 'カードプールの取得に失敗しました', details: poolError.message },
        { status: 500 }
      )
    }

    if (!poolCards || poolCards.length === 0) {
      return NextResponse.json(
        { error: 'このガチャにはカードが登録されていません' },
        { status: 404 }
      )
    }

    // カード情報を個別に取得
    const cardIds = poolCards.map(p => p.pokemon_card_id).filter(Boolean)
    const { data: cards, error: cardsError } = await supabase
      .from('pokemon_cards')
      .select('id, card_name, rarity, market_price')
      .in('id', cardIds)

    if (cardsError) {
      console.error('Cards fetch error:', cardsError)
      return NextResponse.json(
        { error: 'カード情報の取得に失敗しました', details: cardsError.message },
        { status: 500 }
      )
    }

    // レアリティ別にカードを分類
    const cardsByRarity: Record<string, any[]> = {
      SS: [],
      S: [],
      A: [],
      B: [],
      C: []
    }

    let totalWeight = 0
    poolCards.forEach(poolItem => {
      const card = cards?.find(c => c.id === poolItem.pokemon_card_id)
      if (card) {
        const rarity = card.rarity || 'C'
        if (cardsByRarity[rarity]) {
          cardsByRarity[rarity].push({
            ...card,
            weight: poolItem.weight || 100
          })
        }
        totalWeight += poolItem.weight || 100
      }
    })

    // 現在の期待値を計算
    let currentExpectedCost = 0
    let currentExpectedValue = 0
    
    Object.entries(cardsByRarity).forEach(([rarity, cards]) => {
      const rarityWeight = cards.reduce((sum, card) => sum + card.weight, 0)
      const rarityRate = totalWeight > 0 ? rarityWeight / totalWeight : 0
      
      cards.forEach(card => {
        const cardRate = totalWeight > 0 ? card.weight / totalWeight : 0
        const cost = card.market_price || 0  // aceoripa_priceが存在しないため、market_priceを使用
        const value = card.market_price || 0
        
        currentExpectedCost += cost * cardRate
        currentExpectedValue += value * cardRate
      })
    })

    // 現在の利益率
    const currentProfitRate = gacha.price > 0 
      ? ((gacha.price - currentExpectedCost) / gacha.price) * 100 
      : 0

    // 売上データを取得
    const { data: salesData } = await supabase
      .from('gacha_results_pokemon')
      .select('created_at')
      .eq('gacha_product_id', gachaId)

    const totalSales = salesData?.length || 0
    const revenue = totalSales * gacha.price
    const totalCost = totalSales * currentExpectedCost
    const totalProfit = revenue - totalCost

    // 最適化案を生成
    const optimizationPlans = generateOptimizationPlans(
      gacha,
      cardsByRarity,
      currentExpectedCost,
      currentProfitRate
    )

    return NextResponse.json({
      success: true,
      analysis: {
        gachaInfo: {
          id: gacha.id,
          name: gacha.name,
          price: gacha.price,
          totalStock: gacha.total_stock || 1000,
          soldCount: gacha.sold_count || totalSales,
          isActive: gacha.is_active
        },
        currentMetrics: {
          expectedCost: Math.round(currentExpectedCost),
          expectedValue: Math.round(currentExpectedValue),
          profitRate: currentProfitRate.toFixed(2),
          totalCards: poolCards.length,
          rarityDistribution: Object.entries(cardsByRarity).map(([rarity, cards]) => ({
            rarity,
            count: cards.length,
            percentage: poolCards.length > 0 ? (cards.length / poolCards.length * 100).toFixed(2) : '0'
          }))
        },
        salesMetrics: {
          totalSales,
          revenue,
          totalCost: Math.round(totalCost),
          totalProfit: Math.round(totalProfit),
          averageProfitPerSale: totalSales > 0 ? Math.round(totalProfit / totalSales) : 0
        },
        optimizationPlans
      }
    })

  } catch (error) {
    console.error('Gacha analysis error:', error)
    return NextResponse.json(
      { 
        error: '分析中にエラーが発生しました', 
        details: error instanceof Error ? error.message : '不明なエラー',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

function generateOptimizationPlans(
  gacha: any,
  cardsByRarity: Record<string, any[]>,
  currentExpectedCost: number,
  currentProfitRate: number
): any[] {
  const plans = []
  const targetProfitRates = [30, 40, 50] // 目標利益率

  for (const targetRate of targetProfitRates) {
    // プラン1: SSとSを除外
    const plan1 = calculatePlanWithExclusions(
      gacha,
      cardsByRarity,
      ['SS', 'S'],
      targetRate,
      'SSとSレアを除外'
    )
    if (plan1) plans.push(plan1)

    // プラン2: SSのみ除外
    const plan2 = calculatePlanWithExclusions(
      gacha,
      cardsByRarity,
      ['SS'],
      targetRate,
      'SSレアのみ除外'
    )
    if (plan2) plans.push(plan2)

    // プラン3: 価格調整
    const plan3 = calculatePlanWithPriceAdjustment(
      gacha,
      currentExpectedCost,
      targetRate,
      'ガチャ価格を調整'
    )
    if (plan3) plans.push(plan3)

    // プラン4: カード数削減（高コストカードを削減）
    const plan4 = calculatePlanWithCardReduction(
      gacha,
      cardsByRarity,
      targetRate,
      '高コストカードを削減'
    )
    if (plan4) plans.push(plan4)
  }

  // 現在の利益率に最も近いプランを推奨
  plans.sort((a, b) => {
    const diffA = Math.abs(a.projectedProfitRate - 40) // 40%を理想とする
    const diffB = Math.abs(b.projectedProfitRate - 40)
    return diffA - diffB
  })

  return plans.slice(0, 5) // 上位5プランを返す
}

function calculatePlanWithExclusions(
  gacha: any,
  cardsByRarity: Record<string, any[]>,
  excludedRarities: string[],
  targetRate: number,
  planName: string
): any {
  let newExpectedCost = 0
  let totalWeight = 0
  const remainingCards: any[] = []

  Object.entries(cardsByRarity).forEach(([rarity, cards]) => {
    if (!excludedRarities.includes(rarity)) {
      cards.forEach(card => {
        remainingCards.push(card)
        totalWeight += card.weight
      })
    }
  })

  remainingCards.forEach(card => {
    const cardRate = totalWeight > 0 ? card.weight / totalWeight : 0
    const cost = card.market_price || 0  // aceoripa_priceが存在しないため、market_priceを使用
    newExpectedCost += cost * cardRate
  })

  const projectedProfitRate = gacha.price > 0 
    ? ((gacha.price - newExpectedCost) / gacha.price) * 100 
    : 0

  return {
    planName,
    type: 'exclusion',
    description: `${excludedRarities.join('と')}レアのカードを除外することで、期待原価を下げて利益率を改善`,
    changes: {
      excludedRarities,
      remainingCards: remainingCards.length,
      removedCards: cardsByRarity['SS'].length + cardsByRarity['S'].length
    },
    projectedMetrics: {
      expectedCost: Math.round(newExpectedCost),
      profitRate: projectedProfitRate.toFixed(2),
      priceChange: 0
    },
    projectedProfitRate,
    recommendation: projectedProfitRate >= 30 && projectedProfitRate <= 50
  }
}

function calculatePlanWithPriceAdjustment(
  gacha: any,
  currentExpectedCost: number,
  targetRate: number,
  planName: string
): any {
  // 目標利益率から必要な価格を計算
  const requiredPrice = Math.ceil(currentExpectedCost / (1 - targetRate / 100))
  const priceChange = requiredPrice - gacha.price
  const priceChangePercent = (priceChange / gacha.price) * 100

  return {
    planName,
    type: 'price_adjustment',
    description: `ガチャ価格を${requiredPrice}円に調整して目標利益率を達成`,
    changes: {
      newPrice: requiredPrice,
      priceChange,
      priceChangePercent: priceChangePercent.toFixed(2)
    },
    projectedMetrics: {
      expectedCost: Math.round(currentExpectedCost),
      profitRate: targetRate.toFixed(2),
      priceChange
    },
    projectedProfitRate: targetRate,
    recommendation: Math.abs(priceChangePercent) <= 30 // 30%以内の価格変更なら推奨
  }
}

function calculatePlanWithCardReduction(
  gacha: any,
  cardsByRarity: Record<string, any[]>,
  targetRate: number,
  planName: string
): any {
  // 高コストカードを特定してソート
  const allCards: any[] = []
  Object.values(cardsByRarity).forEach(cards => {
    allCards.push(...cards)
  })
  
  allCards.sort((a, b) => {
    const costA = a.market_price || 0
    const costB = b.market_price || 0
    return costB - costA
  })

  // 上位20%の高コストカードを削減対象とする
  const reductionCount = Math.ceil(allCards.length * 0.2)
  const cardsToRemove = allCards.slice(0, reductionCount)
  const remainingCards = allCards.slice(reductionCount)

  let newExpectedCost = 0
  let totalWeight = 0

  remainingCards.forEach(card => {
    totalWeight += card.weight
  })

  remainingCards.forEach(card => {
    const cardRate = totalWeight > 0 ? card.weight / totalWeight : 0
    const cost = card.market_price || 0  // aceoripa_priceが存在しないため、market_priceを使用
    newExpectedCost += cost * cardRate
  })

  const projectedProfitRate = gacha.price > 0 
    ? ((gacha.price - newExpectedCost) / gacha.price) * 100 
    : 0

  return {
    planName,
    type: 'card_reduction',
    description: `高コストカード上位${reductionCount}枚を削減して期待原価を下げる`,
    changes: {
      removedCards: cardsToRemove.map(card => ({
        name: card.card_name,
        rarity: card.rarity,
        cost: card.market_price || 0
      })),
      remainingCardsCount: remainingCards.length
    },
    projectedMetrics: {
      expectedCost: Math.round(newExpectedCost),
      profitRate: projectedProfitRate.toFixed(2),
      priceChange: 0
    },
    projectedProfitRate,
    recommendation: projectedProfitRate >= 30 && projectedProfitRate <= 50
  }
}