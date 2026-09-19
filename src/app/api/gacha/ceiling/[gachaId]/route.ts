import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * 天井進捗確認API
 * GET /api/gacha/ceiling/[gachaId]
 *
 * ユーザーの指定ガチャにおける天井進捗を返す
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { gachaId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gachaId = params.gachaId

    // ガチャ商品の存在確認
    const { data: gachaProduct, error: gachaError } = await supabase
      .from('gacha_products')
      .select('id, name, ceiling_count, ceiling_enabled')
      .eq('id', gachaId)
      .single()

    if (gachaError || !gachaProduct) {
      return NextResponse.json({ error: 'Gacha product not found' }, { status: 404 })
    }

    // 天井システムが無効の場合
    if (!gachaProduct.ceiling_enabled) {
      return NextResponse.json({
        enabled: false,
        message: 'このガチャは天井システムが無効です'
      })
    }

    // 天井進捗を取得（ストアドファンクション使用）
    const { data: progressData, error: progressError } = await supabase
      .rpc('get_ceiling_progress', {
        p_user_id: user.id,
        p_gacha_id: gachaId
      })

    if (progressError) {
      console.error('Ceiling progress fetch error:', progressError)
      return NextResponse.json(
        { error: 'Failed to fetch ceiling progress' },
        { status: 500 }
      )
    }

    const progress = progressData && progressData.length > 0 ? progressData[0] : null

    if (!progress) {
      // 進捗がない場合はデフォルト値を返す
      return NextResponse.json({
        enabled: true,
        pullCount: 0,
        ceilingCount: gachaProduct.ceiling_count,
        remainingPulls: gachaProduct.ceiling_count,
        lastSSRAt: null,
        isCeilingReached: false,
        gachaName: gachaProduct.name
      })
    }

    return NextResponse.json({
      enabled: true,
      pullCount: progress.pull_count,
      ceilingCount: progress.ceiling_count,
      remainingPulls: progress.remaining_pulls,
      lastSSRAt: progress.last_ssr_at,
      isCeilingReached: progress.is_ceiling_reached,
      gachaName: gachaProduct.name
    })

  } catch (error) {
    console.error('Ceiling progress API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
