import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const gachaId = params.id

    // ガチャ情報を取得
    const { data: gacha, error: gachaError } = await supabase
      .from('gacha_products')
      .select('*')
      .eq('id', gachaId)
      .single()

    if (gachaError) {
      return NextResponse.json({
        error: 'ガチャ情報取得エラー',
        details: gachaError.message,
        gachaId
      })
    }

    // プール情報を取得
    const { data: pools, error: poolsError } = await supabase
      .from('gacha_pokemon_pools')
      .select('*')
      .eq('gacha_product_id', gachaId)

    // カードIDのリストを作成
    const cardIds = pools?.map(p => p.pokemon_card_id).filter(Boolean) || []

    // カード情報を取得
    let cards = []
    if (cardIds.length > 0) {
      const { data: cardsData, error: cardsError } = await supabase
        .from('pokemon_cards')
        .select('*')
        .in('id', cardIds)
      
      if (cardsError) {
        return NextResponse.json({
          error: 'カード情報取得エラー',
          details: cardsError.message,
          cardIds
        })
      }
      cards = cardsData || []
    }

    // プールとカードを結合
    const poolsWithCards = pools?.map(pool => {
      const card = cards.find(c => c.id === pool.pokemon_card_id)
      return {
        ...pool,
        card: card || null
      }
    }) || []

    return NextResponse.json({
      success: true,
      gacha: {
        id: gacha?.id,
        name: gacha?.name,
        price: gacha?.price,
        is_active: gacha?.is_active
      },
      pools: {
        total: pools?.length || 0,
        data: poolsWithCards.slice(0, 10), // 最初の10件のみ表示
        cardIds: cardIds.slice(0, 10)
      },
      cards: {
        total: cards.length,
        sample: cards.slice(0, 5).map(c => ({
          id: c.id,
          name: c.card_name,
          rarity: c.rarity,
          market_price: c.market_price
          // aceoripa_price: c.aceoripa_price // カラムが存在しないため一時的にコメントアウト
        }))
      },
      debug: {
        hasGacha: !!gacha,
        hasPool: (pools?.length || 0) > 0,
        hasCards: cards.length > 0,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { 
        error: 'デバッグエラー',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}