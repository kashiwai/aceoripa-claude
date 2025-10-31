import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { gacha_product_id } = await request.json()

    if (!gacha_product_id) {
      return NextResponse.json({
        success: false,
        error: 'ガチャ商品IDが必要です'
      }, { status: 400 })
    }

    // ユーザー認証チェック
    const cookieStore = await cookies()
    const userSession = cookieStore.get('user_session')
    
    if (!userSession) {
      return NextResponse.json({
        success: false,
        error: 'ログインが必要です'
      }, { status: 401 })
    }

    const session = JSON.parse(userSession.value)
    const userId = session.user_id

    // ガチャ商品の存在確認と無料ガチャ設定チェック
    const { data: gachaProduct, error: gachaError } = await supabase
      .from('gacha_products')
      .select('id, title, metadata, start_date, end_date')
      .eq('id', gacha_product_id)
      .single()

    if (gachaError || !gachaProduct) {
      return NextResponse.json({
        success: false,
        error: 'ガチャ商品が見つかりません'
      }, { status: 404 })
    }

    // 無料ガチャ設定確認
    const metadata = gachaProduct.metadata || {}
    if (!metadata.is_daily_free_gacha) {
      return NextResponse.json({
        success: false,
        error: 'このガチャは無料ガチャではありません'
      }, { status: 400 })
    }

    // ガチャ期間チェック
    const now = new Date()
    if (gachaProduct.start_date && new Date(gachaProduct.start_date) > now) {
      return NextResponse.json({
        success: false,
        error: 'ガチャ開始前です'
      }, { status: 400 })
    }

    if (gachaProduct.end_date && new Date(gachaProduct.end_date) < now) {
      return NextResponse.json({
        success: false,
        error: 'ガチャが終了しています'
      }, { status: 400 })
    }

    // 1日1回制限チェック
    const { data: canUse } = await supabase
      .rpc('can_use_daily_free_gacha', {
        p_user_id: userId,
        p_gacha_product_id: gacha_product_id
      })

    if (!canUse) {
      return NextResponse.json({
        success: false,
        error: '本日の無料ガチャはすでに利用済みです',
        code: 'ALREADY_USED_TODAY'
      }, { status: 400 })
    }

    // ガチャプールから抽選
    const { data: pokemonPool, error: poolError } = await supabase
      .from('gacha_pokemon_pools')
      .select(`
        pokemon_card_id,
        drop_rate,
        pokemon_cards (
          id,
          card_name,
          product_code,
          rarity,
          image_url,
          market_price
        )
      `)
      .eq('gacha_product_id', gacha_product_id)

    if (poolError || !pokemonPool || pokemonPool.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'ガチャプールが設定されていません'
      }, { status: 500 })
    }

    // 抽選処理
    const totalRate = pokemonPool.reduce((sum, item) => sum + item.drop_rate, 0)
    const random = Math.random() * totalRate
    let currentRate = 0
    let selectedCard = null

    for (const item of pokemonPool) {
      currentRate += item.drop_rate
      if (random <= currentRate) {
        selectedCard = item.pokemon_cards
        break
      }
    }

    if (!selectedCard) {
      selectedCard = pokemonPool[pokemonPool.length - 1].pokemon_cards
    }

    // selectedCardがnullでないことを確認
    if (!selectedCard) {
      console.error('Failed to select a card from the pool')
      return NextResponse.json({
        success: false,
        error: 'カードの抽選に失敗しました'
      }, { status: 500 })
    }

    // 無料ガチャ利用記録
    const { error: logError } = await supabase
      .rpc('record_daily_free_gacha_usage', {
        p_user_id: userId,
        p_gacha_product_id: gacha_product_id
      })

    if (logError) {
      console.error('Failed to record free gacha usage:', logError)
      return NextResponse.json({
        success: false,
        error: '利用記録の保存に失敗しました'
      }, { status: 500 })
    }

    // ガチャ結果を記録
    const { data: gachaResult, error: resultError } = await supabase
      .from('gacha_results_pokemon')
      .insert({
        user_id: userId,
        gacha_product_id: gacha_product_id,
        pokemon_card_id: selectedCard.id,
        is_free_gacha: true,
        points_used: 0
      })
      .select()
      .single()

    if (resultError) {
      console.error('Failed to record gacha result:', resultError)
      return NextResponse.json({
        success: false,
        error: 'ガチャ結果の保存に失敗しました'
      }, { status: 500 })
    }

    // ユーザーにカードを付与
    const { error: cardError } = await supabase
      .from('user_pokemon_cards')
      .insert({
        user_id: userId,
        pokemon_card_id: selectedCard.id,
        obtained_from: 'gacha',
        gacha_result_id: gachaResult.id
      })

    if (cardError) {
      console.error('Failed to grant card to user:', cardError)
      return NextResponse.json({
        success: false,
        error: 'カードの付与に失敗しました'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      card: selectedCard,
      gacha_result_id: gachaResult.id,
      message: '無料ガチャを引きました！'
    })

  } catch (error) {
    console.error('Free gacha error:', error)
    return NextResponse.json({
      success: false,
      error: 'サーバーエラーが発生しました'
    }, { status: 500 })
  }
}