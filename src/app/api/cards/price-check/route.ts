import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { cardId, expectedPrice } = await request.json()

    if (!cardId || expectedPrice === undefined) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      )
    }

    // カード情報を取得
    const { data: card, error: cardError } = await supabase
      .from('pokemon_cards')
      .select('*')
      .eq('id', cardId)
      .single()

    if (cardError || !card) {
      return NextResponse.json(
        { error: 'カードが見つかりません' },
        { status: 404 }
      )
    }

    // 上位400位のカードかチェック
    const { data: topCards, error: topCardsError } = await supabase
      .from('pokemon_cards')
      .select('id')
      .order('market_price', { ascending: false })
      .limit(400)

    if (topCardsError) {
      console.error('Top cards fetch error:', topCardsError)
      return NextResponse.json(
        { error: '価格ランキングの取得に失敗しました' },
        { status: 500 }
      )
    }

    const isTopCard = topCards?.some(topCard => topCard.id === cardId)

    if (!isTopCard) {
      return NextResponse.json({
        valid: true,
        message: 'このカードは上位400位外のため、価格チェックは不要です',
        card: {
          id: card.id,
          name: card.card_name,
          marketPrice: card.market_price
        }
      })
    }

    // 最新の価格履歴を取得（過去24時間以内）
    const { data: recentPrices, error: priceError } = await supabase
      .from('card_price_history')
      .select('price, source, fetched_at')
      .eq('card_id', cardId)
      .gte('fetched_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('fetched_at', { ascending: false })
      .limit(10)

    if (priceError) {
      console.error('Price history fetch error:', priceError)
    }

    // 平均価格を計算
    let averagePrice = card.market_price
    if (recentPrices && recentPrices.length > 0) {
      averagePrice = Math.round(
        recentPrices.reduce((sum, p) => sum + Number(p.price), 0) / recentPrices.length
      )
    }

    // 価格の妥当性チェック（±30%以内を許容）
    const minAcceptablePrice = Math.floor(averagePrice * 0.7)
    const maxAcceptablePrice = Math.ceil(averagePrice * 1.3)
    
    const isPriceValid = expectedPrice >= minAcceptablePrice && expectedPrice <= maxAcceptablePrice

    // 価格チェック履歴を記録
    await supabase
      .from('price_check_logs')
      .insert({
        card_id: cardId,
        expected_price: expectedPrice,
        average_price: averagePrice,
        is_valid: isPriceValid,
        checked_at: new Date().toISOString()
      })

    return NextResponse.json({
      valid: isPriceValid,
      card: {
        id: card.id,
        name: card.card_name,
        marketPrice: card.market_price,
        // aceoripaPrice: card.aceoripa_price, // カラムが存在しないため一時的にコメントアウト
        rank: topCards?.findIndex(tc => tc.id === cardId) + 1
      },
      priceInfo: {
        expectedPrice,
        averagePrice,
        minAcceptablePrice,
        maxAcceptablePrice,
        recentPricesCount: recentPrices?.length || 0,
        lastUpdated: recentPrices?.[0]?.fetched_at || null
      },
      message: isPriceValid 
        ? '価格は適正範囲内です' 
        : `価格が適正範囲外です。推奨価格: ${minAcceptablePrice}円 〜 ${maxAcceptablePrice}円`
    })

  } catch (error) {
    console.error('Price check error:', error)
    return NextResponse.json(
      { error: '価格チェック中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 上位400位のカードリストを取得
export async function GET(request: NextRequest) {
  try {
    // top_400_cards_monitoringビューがaceoripa_priceを参照しているため、直接pokemon_cardsから取得
    const { data: topCards, error } = await supabase
      .from('pokemon_cards')
      .select('id, card_name, product_code, market_price, rarity')
      .order('market_price', { ascending: false })
      .limit(400)

    if (error) {
      console.error('Top cards fetch error:', error)
      return NextResponse.json(
        { error: '上位カードの取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      totalCards: topCards?.length || 0,
      cards: topCards?.map((card, index) => ({
        rank: index + 1,
        id: card.id,
        name: card.card_name,
        productCode: card.product_code,
        marketPrice: card.market_price,
        // aceoripaPrice: card.aceoripa_price, // カラムが存在しないため一時的にコメントアウト
        rarity: card.rarity
        // priceDifference: card.price_difference,
        // lastChecked: card.last_price_update
      }))
    })

  } catch (error) {
    console.error('Get top cards error:', error)
    return NextResponse.json(
      { error: 'エラーが発生しました' },
      { status: 500 }
    )
  }
}