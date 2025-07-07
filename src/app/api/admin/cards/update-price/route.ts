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

    const session = JSON.parse(adminSession.value)
    if (!session.userId) {
      return NextResponse.json(
        { error: '無効なセッションです' },
        { status: 401 }
      )
    }

    const { cardId, aceoripaPrice, reason } = await request.json()

    if (!cardId || aceoripaPrice === undefined) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      )
    }

    // 現在のカード情報を取得
    const { data: currentCard, error: fetchError } = await supabase
      .from('pokemon_cards')
      .select('aceoripa_price')
      .eq('id', cardId)
      .single()

    if (fetchError) {
      console.error('Card fetch error:', fetchError)
      return NextResponse.json(
        { error: 'カード情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    // 価格を更新
    const { data: updatedCard, error: updateError } = await supabase
      .from('pokemon_cards')
      .update({ 
        aceoripa_price: aceoripaPrice,
        price_updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .select()
      .single()

    if (updateError) {
      console.error('Price update error:', updateError)
      return NextResponse.json(
        { error: '価格の更新に失敗しました' },
        { status: 500 }
      )
    }

    // 価格変更履歴を記録
    await supabase
      .from('aceoripa_price_history')
      .insert({
        card_id: cardId,
        old_price: currentCard.aceoripa_price,
        new_price: aceoripaPrice,
        changed_by: session.userId,
        change_reason: reason || '管理画面から更新'
      })

    return NextResponse.json({
      success: true,
      card: updatedCard,
      message: 'エースオリパ価格を更新しました'
    })

  } catch (error) {
    console.error('Update price error:', error)
    return NextResponse.json(
      { error: 'エラーが発生しました' },
      { status: 500 }
    )
  }
}

// 価格一括更新
export async function PUT(request: NextRequest) {
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

    const session = JSON.parse(adminSession.value)
    if (!session.userId) {
      return NextResponse.json(
        { error: '無効なセッションです' },
        { status: 401 }
      )
    }

    const { updates } = await request.json()

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: '更新データが不正です' },
        { status: 400 }
      )
    }

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // 各カードの価格を更新
    for (const { cardId, aceoripaPrice } of updates) {
      try {
        // 現在の価格を取得
        const { data: currentCard } = await supabase
          .from('pokemon_cards')
          .select('aceoripa_price')
          .eq('id', cardId)
          .single()

        // 価格を更新
        const { error: updateError } = await supabase
          .from('pokemon_cards')
          .update({ 
            aceoripa_price: aceoripaPrice,
            price_updated_at: new Date().toISOString()
          })
          .eq('id', cardId)

        if (updateError) {
          throw updateError
        }

        // 履歴を記録
        await supabase
          .from('aceoripa_price_history')
          .insert({
            card_id: cardId,
            old_price: currentCard?.aceoripa_price,
            new_price: aceoripaPrice,
            changed_by: session.userId,
            change_reason: '一括更新'
          })

        successCount++
      } catch (error) {
        errorCount++
        errors.push(`カードID ${cardId}: 更新失敗`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${successCount}件の価格を更新しました`,
      results: {
        success: successCount,
        error: errorCount,
        errors: errors
      }
    })

  } catch (error) {
    console.error('Bulk update error:', error)
    return NextResponse.json(
      { error: 'エラーが発生しました' },
      { status: 500 }
    )
  }
}