import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    const page = Number(searchParams.get('page')) || 1
    const perPage = Number(searchParams.get('perPage')) || 20
    const offset = (page - 1) * perPage

    // 交換可能なカードを取得
    let query = supabase
      .from('point_exchange_items')
      .select(`
        id,
        name,
        description,
        point_cost,
        stock_quantity,
        category,
        image_url,
        rarity,
        is_available,
        created_at
      `)
      .eq('is_available', true)
      .order('point_cost', { ascending: true })
      .range(offset, offset + perPage - 1)

    if (category !== 'all') {
      query = query.eq('category', category)
    }

    const { data: items, error, count } = await query

    if (error) {
      console.error('Point exchange items fetch error:', error)
      return NextResponse.json({
        success: false,
        error: 'アイテムの取得に失敗しました'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      items: items || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / perPage),
      currentPage: page
    })

  } catch (error: any) {
    console.error('Point exchange API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'アイテムの取得に失敗しました'
    }, { status: 500 })
  }
}

// ポイント交換実行
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { itemId, quantity = 1 } = await request.json()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'ログインが必要です'
      }, { status: 401 })
    }

    // アイテム情報を取得
    const { data: item, error: itemError } = await supabase
      .from('point_exchange_items')
      .select('*')
      .eq('id', itemId)
      .eq('is_available', true)
      .single()

    if (itemError || !item) {
      return NextResponse.json({
        success: false,
        error: 'アイテムが見つかりません'
      }, { status: 404 })
    }

    // 在庫チェック
    if (item.stock_quantity < quantity) {
      return NextResponse.json({
        success: false,
        error: '在庫が不足しています'
      }, { status: 400 })
    }

    const totalCost = item.point_cost * quantity

    // ユーザーポイントを取得
    const { data: userPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('free_points, paid_points')
      .eq('user_id', user.id)
      .single()

    if (pointsError) {
      return NextResponse.json({
        success: false,
        error: 'ポイント情報の取得に失敗しました'
      }, { status: 500 })
    }

    const totalUserPoints = (userPoints?.free_points || 0) + (userPoints?.paid_points || 0)

    // ポイント不足チェック
    if (totalUserPoints < totalCost) {
      return NextResponse.json({
        success: false,
        error: 'ポイントが不足しています'
      }, { status: 400 })
    }

    // ポイント消費処理（無料ポイント優先）
    let remainingCost = totalCost
    let newFreePoints = userPoints?.free_points || 0
    let newPaidPoints = userPoints?.paid_points || 0

    if (newFreePoints >= remainingCost) {
      newFreePoints -= remainingCost
    } else {
      remainingCost -= newFreePoints
      newFreePoints = 0
      newPaidPoints -= remainingCost
    }

    // トランザクション的な処理
    const { error: updatePointsError } = await supabase
      .from('user_points')
      .update({
        free_points: newFreePoints,
        paid_points: newPaidPoints,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (updatePointsError) {
      return NextResponse.json({
        success: false,
        error: 'ポイント更新に失敗しました'
      }, { status: 500 })
    }

    // 在庫更新
    const { error: stockError } = await supabase
      .from('point_exchange_items')
      .update({
        stock_quantity: item.stock_quantity - quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)

    if (stockError) {
      console.error('Stock update error:', stockError)
    }

    // 交換履歴を記録
    const { error: historyError } = await supabase
      .from('point_exchange_history')
      .insert({
        user_id: user.id,
        item_id: itemId,
        item_name: item.name,
        quantity: quantity,
        point_cost: totalCost,
        status: 'completed',
        created_at: new Date().toISOString()
      })

    if (historyError) {
      console.error('History record error:', historyError)
    }

    // ポイント取引履歴を記録
    const { error: transactionError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: user.id,
        amount: -totalCost,
        type: 'exchange',
        is_paid: false,
        description: `${item.name} x${quantity} との交換`,
        created_at: new Date().toISOString()
      })

    if (transactionError) {
      console.error('Transaction record error:', transactionError)
    }

    return NextResponse.json({
      success: true,
      message: '交換が完了しました',
      data: {
        item_name: item.name,
        quantity: quantity,
        points_used: totalCost,
        remaining_points: newFreePoints + newPaidPoints
      }
    })

  } catch (error: any) {
    console.error('Point exchange POST error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '交換に失敗しました'
    }, { status: 500 })
  }
}