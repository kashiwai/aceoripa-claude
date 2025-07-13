import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // 管理者権限チェック（Cookieベース）
    const adminSessionCookie = request.cookies.get('admin_session')
    if (!adminSessionCookie) {
      return NextResponse.json({
        success: false,
        error: '管理者認証が必要です'
      }, { status: 401 })
    }

    // ガチャ商品を取得
    const { data: gacha, error: gachaError } = await supabase
      .from('gacha_products')
      .select('id, name, total_packs')
      .eq('id', params.id)
      .single()

    if (gachaError || !gacha) {
      return NextResponse.json({
        success: false,
        error: 'ガチャが見つかりません'
      }, { status: 404 })
    }

    // 購入済み数を計算（gacha_resultsテーブルから）
    const { data: results, error: resultsError } = await supabase
      .from('gacha_results')
      .select('id')
      .eq('gacha_product_id', params.id)

    if (resultsError) {
      console.error('Results fetch error:', resultsError)
      return NextResponse.json({
        success: false,
        error: '購入履歴の取得に失敗しました'
      }, { status: 500 })
    }

    const purchasedCount = results?.length || 0
    const remainingPacks = Math.max(0, (gacha.total_packs || 0) - purchasedCount)

    // remaining_packsを更新
    const { error: updateError } = await supabase
      .from('gacha_products')
      .update({ 
        remaining_packs: remainingPacks,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({
        success: false,
        error: '残り枚数の更新に失敗しました'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '残り枚数を再計算しました',
      data: {
        gacha_name: gacha.name,
        total_packs: gacha.total_packs,
        purchased_count: purchasedCount,
        remaining_packs: remainingPacks
      }
    })

  } catch (error: any) {
    console.error('Recalculate remaining error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '残り枚数の再計算に失敗しました'
    }, { status: 500 })
  }
}