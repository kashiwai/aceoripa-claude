import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const gachaProductId = searchParams.get('gacha_product_id')

    if (!gachaProductId) {
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

    // ガチャ商品の無料ガチャ設定確認
    const { data: gachaProduct, error: gachaError } = await supabase
      .from('gacha_products')
      .select('id, title, metadata, start_date, end_date')
      .eq('id', gachaProductId)
      .single()

    if (gachaError || !gachaProduct) {
      return NextResponse.json({
        success: false,
        error: 'ガチャ商品が見つかりません'
      }, { status: 404 })
    }

    const metadata = gachaProduct.metadata || {}
    if (!metadata.is_daily_free_gacha) {
      return NextResponse.json({
        success: false,
        can_use: false,
        error: 'このガチャは無料ガチャではありません'
      })
    }

    // ガチャ期間チェック
    const now = new Date()
    if (gachaProduct.start_date && new Date(gachaProduct.start_date) > now) {
      return NextResponse.json({
        success: true,
        can_use: false,
        reason: 'not_started',
        message: 'ガチャ開始前です',
        start_date: gachaProduct.start_date
      })
    }

    if (gachaProduct.end_date && new Date(gachaProduct.end_date) < now) {
      return NextResponse.json({
        success: true,
        can_use: false,
        reason: 'ended',
        message: 'ガチャが終了しています',
        end_date: gachaProduct.end_date
      })
    }

    // 1日1回制限チェック
    const { data: canUse } = await supabase
      .rpc('can_use_daily_free_gacha', {
        p_user_id: userId,
        p_gacha_product_id: gachaProductId
      })

    if (!canUse) {
      // 次回利用可能時刻を計算（翌日4時）
      const now = new Date()
      const jstNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}))
      let nextReset = new Date(jstNow)
      
      // 今日の4時を計算
      nextReset.setHours(4, 0, 0, 0)
      
      // 現在時刻が4時以降なら、翌日の4時
      if (jstNow.getHours() >= 4) {
        nextReset.setDate(nextReset.getDate() + 1)
      }

      return NextResponse.json({
        success: true,
        can_use: false,
        reason: 'already_used_today',
        message: '本日の無料ガチャはすでに利用済みです',
        next_reset_time: nextReset.toISOString(),
        hours_until_reset: Math.max(0, Math.ceil((nextReset.getTime() - jstNow.getTime()) / (1000 * 60 * 60)))
      })
    }

    return NextResponse.json({
      success: true,
      can_use: true,
      message: '無料ガチャを利用できます',
      gacha_title: gachaProduct.title
    })

  } catch (error) {
    console.error('Free gacha check error:', error)
    return NextResponse.json({
      success: false,
      error: 'サーバーエラーが発生しました'
    }, { status: 500 })
  }
}