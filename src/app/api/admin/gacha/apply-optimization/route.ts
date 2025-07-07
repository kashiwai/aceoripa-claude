import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    const { gachaId, plan } = await request.json()

    if (!gachaId || !plan) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      )
    }

    let updateResult = null

    switch (plan.type) {
      case 'exclusion':
        updateResult = await applyExclusionPlan(gachaId, plan)
        break
      
      case 'price_adjustment':
        updateResult = await applyPriceAdjustment(gachaId, plan)
        break
      
      case 'card_reduction':
        updateResult = await applyCardReduction(gachaId, plan)
        break
      
      default:
        return NextResponse.json(
          { error: '不明なプランタイプです' },
          { status: 400 }
        )
    }

    if (!updateResult.success) {
      return NextResponse.json(
        { error: updateResult.error || '更新に失敗しました' },
        { status: 500 }
      )
    }

    // 変更履歴を記録
    await supabase
      .from('gacha_optimization_history')
      .insert({
        gacha_id: gachaId,
        plan_type: plan.type,
        plan_name: plan.planName,
        plan_details: plan,
        applied_by: JSON.parse(adminSession.value).userId,
        applied_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      message: '最適化プランを適用しました',
      result: updateResult
    })

  } catch (error) {
    console.error('Apply optimization error:', error)
    return NextResponse.json(
      { error: 'エラーが発生しました' },
      { status: 500 }
    )
  }
}

async function applyExclusionPlan(gachaId: string, plan: any) {
  try {
    // 除外するレアリティのカードを取得
    const { data: cardsToExclude } = await supabase
      .from('gacha_pokemon_pools')
      .select(`
        id,
        pokemon_cards!inner (
          rarity
        )
      `)
      .eq('gacha_product_id', gachaId)
      .in('pokemon_cards.rarity', plan.changes.excludedRarities)

    if (!cardsToExclude || cardsToExclude.length === 0) {
      return { success: true, message: '除外対象のカードがありません' }
    }

    // カードを無効化（削除ではなく重みを0にする）
    const updates = cardsToExclude.map(card => ({
      id: card.id,
      weight: 0
    }))

    for (const update of updates) {
      await supabase
        .from('gacha_pokemon_pools')
        .update({ weight: update.weight })
        .eq('id', update.id)
    }

    return {
      success: true,
      excludedCount: updates.length,
      message: `${updates.length}枚のカードを除外しました`
    }
  } catch (error) {
    console.error('Exclusion plan error:', error)
    return { success: false, error: '除外プランの適用に失敗しました' }
  }
}

async function applyPriceAdjustment(gachaId: string, plan: any) {
  try {
    const { error } = await supabase
      .from('gacha_products')
      .update({
        price: plan.changes.newPrice,
        single_price: plan.changes.newPrice,
        multi_price: Math.floor(plan.changes.newPrice * 9.5), // 10連は5%割引
        updated_at: new Date().toISOString()
      })
      .eq('id', gachaId)

    if (error) {
      throw error
    }

    return {
      success: true,
      newPrice: plan.changes.newPrice,
      message: `価格を${plan.changes.newPrice}円に更新しました`
    }
  } catch (error) {
    console.error('Price adjustment error:', error)
    return { success: false, error: '価格調整の適用に失敗しました' }
  }
}

async function applyCardReduction(gachaId: string, plan: any) {
  try {
    const cardIdsToRemove = plan.changes.removedCards.map((card: any) => card.id)

    if (!cardIdsToRemove || cardIdsToRemove.length === 0) {
      // カード名から検索して削除
      const cardNames = plan.changes.removedCards.map((card: any) => card.name)
      
      const { data: cardsToRemove } = await supabase
        .from('gacha_pokemon_pools')
        .select(`
          id,
          pokemon_cards!inner (
            card_name
          )
        `)
        .eq('gacha_product_id', gachaId)
        .in('pokemon_cards.card_name', cardNames)

      if (cardsToRemove && cardsToRemove.length > 0) {
        for (const card of cardsToRemove) {
          await supabase
            .from('gacha_pokemon_pools')
            .delete()
            .eq('id', card.id)
        }

        return {
          success: true,
          removedCount: cardsToRemove.length,
          message: `${cardsToRemove.length}枚のカードを削除しました`
        }
      }
    } else {
      // IDで削除
      for (const cardId of cardIdsToRemove) {
        await supabase
          .from('gacha_pokemon_pools')
          .delete()
          .eq('gacha_product_id', gachaId)
          .eq('pokemon_card_id', cardId)
      }

      return {
        success: true,
        removedCount: cardIdsToRemove.length,
        message: `${cardIdsToRemove.length}枚のカードを削除しました`
      }
    }

    return {
      success: true,
      message: '削除対象のカードが見つかりませんでした'
    }
  } catch (error) {
    console.error('Card reduction error:', error)
    return { success: false, error: 'カード削減の適用に失敗しました' }
  }
}