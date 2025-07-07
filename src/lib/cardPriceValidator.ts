import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CardPriceValidationResult {
  isValid: boolean
  card: {
    id: string
    name: string
    marketPrice: number
    rank?: number
  }
  priceInfo?: {
    expectedPrice: number
    averagePrice: number
    minAcceptablePrice: number
    maxAcceptablePrice: number
  }
  message: string
}

/**
 * カードの価格を検証する
 * 上位400位のカードの場合は市場価格との乖離をチェック
 */
export async function validateCardPrice(
  cardId: string,
  expectedPrice: number
): Promise<CardPriceValidationResult> {
  try {
    const response = await fetch('/api/cards/price-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cardId,
        expectedPrice
      })
    })

    if (!response.ok) {
      throw new Error('価格チェックに失敗しました')
    }

    return await response.json()
  } catch (error) {
    console.error('Card price validation error:', error)
    return {
      isValid: false,
      card: {
        id: cardId,
        name: '不明',
        marketPrice: 0
      },
      message: '価格検証中にエラーが発生しました'
    }
  }
}

/**
 * 複数のカードの価格を一括で検証する
 */
export async function validateMultipleCardPrices(
  cards: Array<{ id: string; expectedPrice: number }>
): Promise<Map<string, CardPriceValidationResult>> {
  const results = new Map<string, CardPriceValidationResult>()

  // 並列で価格チェックを実行
  const promises = cards.map(async ({ id, expectedPrice }) => {
    const result = await validateCardPrice(id, expectedPrice)
    results.set(id, result)
  })

  await Promise.all(promises)
  return results
}

/**
 * カードが上位400位以内かチェックする
 */
export async function isTop400Card(cardId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/cards/price-check')
    const data = await response.json()
    
    if (data.success && data.cards) {
      return data.cards.some((card: any) => card.id === cardId)
    }
    
    return false
  } catch (error) {
    console.error('Error checking top 400 status:', error)
    return false
  }
}

/**
 * ガチャ結果の価格妥当性を検証する
 */
export async function validateGachaResult(
  gachaResult: Array<{ cardId: string; estimatedValue: number }>
): Promise<{
  isValid: boolean
  totalValue: number
  invalidCards: Array<{ cardId: string; reason: string }>
}> {
  const invalidCards: Array<{ cardId: string; reason: string }> = []
  let totalValue = 0
  let isValid = true

  for (const { cardId, estimatedValue } of gachaResult) {
    const validation = await validateCardPrice(cardId, estimatedValue)
    
    if (!validation.isValid && validation.card.rank && validation.card.rank <= 400) {
      isValid = false
      invalidCards.push({
        cardId,
        reason: validation.message
      })
    }
    
    totalValue += validation.priceInfo?.averagePrice || estimatedValue
  }

  return {
    isValid,
    totalValue,
    invalidCards
  }
}

/**
 * 価格異常を検知して通知する
 */
export async function detectPriceAnomaly(
  cardId: string,
  newPrice: number
): Promise<boolean> {
  try {
    // 最近の価格履歴を取得
    const { data: priceHistory } = await supabase
      .from('card_price_history')
      .select('price')
      .eq('card_id', cardId)
      .gte('fetched_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('fetched_at', { ascending: false })
      .limit(20)

    if (!priceHistory || priceHistory.length < 5) {
      // 十分な履歴がない場合は異常とは判定しない
      return false
    }

    const prices = priceHistory.map(p => Number(p.price))
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
    const stdDev = Math.sqrt(
      prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
    )

    // 3シグマを超える場合は異常と判定
    const isAnomaly = Math.abs(newPrice - avgPrice) > 3 * stdDev

    if (isAnomaly) {
      // 価格異常アラートを作成
      await supabase
        .from('price_alerts')
        .insert({
          card_id: cardId,
          alert_type: 'anomaly',
          threshold_price: newPrice,
          previous_avg_price: avgPrice,
          current_avg_price: newPrice,
          price_change_percentage: ((newPrice - avgPrice) / avgPrice) * 100
        })
    }

    return isAnomaly
  } catch (error) {
    console.error('Error detecting price anomaly:', error)
    return false
  }
}