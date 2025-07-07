import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const perPage = Number(searchParams.get('perPage')) || 20
    const offset = (page - 1) * perPage
    
    // 管理者権限チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: '認証が必要です'
      }, { status: 401 })
    }

    // user_pointsテーブルから実際のユーザーを取得（これには実際のuser_idが含まれている）
    const { data: userPointsData, count: totalCount, error: pointsError } = await supabase
      .from('user_points')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(offset, offset + perPage - 1)
    
    if (pointsError) {
      console.error('User points error:', pointsError)
      return NextResponse.json({
        success: false,
        error: 'ユーザー情報の取得に失敗しました',
        users: [],
        totalCount: 0
      }, { status: 500 })
    }
    
    if (!userPointsData || userPointsData.length === 0) {
      return NextResponse.json({
        success: true,
        users: [],
        totalCount: 0,
        totalPages: 0
      })
    }
    
    // 各ユーザーの詳細情報を取得
    const userIds = userPointsData.map(up => up.user_id)
    
    // 管理者クライアントで実際の認証ユーザー情報を取得
    let authUsers: any[] = []
    try {
      const adminClient = createAdminClient()
      const { data, error: authError } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000 // 全ユーザーを取得してフィルタリング
      })
      
      if (authError) {
        console.error('Auth admin listUsers error:', authError)
      } else {
        authUsers = data.users || []
      }
    } catch (adminError) {
      console.error('Admin client creation error:', adminError)
      // サービスロールキーの設定問題等でadminクライアントが使用できない場合
      console.log('Falling back to user_points data only')
    }
    
    // カード所持数を取得
    const { data: cardCounts } = await supabase
      .from('user_cards')
      .select('user_id')
      .in('user_id', userIds)
    
    // usersテーブルからも情報を取得
    const { data: usersTableData } = await supabase
      .from('users')
      .select('id, email, display_name, created_at')
      .in('id', userIds)
    
    // データをマッピング
    const authUserMap = (authUsers || []).reduce((acc, user) => {
      acc[user.id] = user
      return acc
    }, {} as Record<string, any>)
    
    const usersTableMap = (usersTableData || []).reduce((acc, user) => {
      acc[user.id] = user
      return acc
    }, {} as Record<string, any>)
    
    const cardCountMap = (cardCounts || []).reduce((acc, card) => {
      acc[card.user_id] = (acc[card.user_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const users = userPointsData.map(userPoint => {
      const authUser = authUserMap[userPoint.user_id]
      const tableUser = usersTableMap[userPoint.user_id]
      
      // 優先順位: authUser > tableUser > フォールバック
      const email = authUser?.email || tableUser?.email || `user-${userPoint.user_id.slice(0, 8)}@example.com`
      const displayName = authUser?.user_metadata?.display_name || tableUser?.display_name || null
      const createdAt = authUser?.created_at || tableUser?.created_at || userPoint.updated_at || new Date().toISOString()
      
      return {
        id: userPoint.user_id,
        email: email,
        display_name: displayName,
        created_at: createdAt,
        email_confirmed: authUser?.email_confirmed_at ? true : false,
        free_points: userPoint.free_points || 0,
        paid_points: userPoint.paid_points || 0,
        total_points: (userPoint.free_points || 0) + (userPoint.paid_points || 0),
        card_count: cardCountMap[userPoint.user_id] || 0,
        last_sign_in: authUser?.last_sign_in_at || null,
        user_source: authUser ? 'auth' : (tableUser ? 'table' : 'fallback')
      }
    })
    
    return NextResponse.json({
      success: true,
      users: users,
      totalCount: totalCount || 0,
      totalPages: Math.ceil((totalCount || 0) / perPage),
      currentPage: page
    })
    
  } catch (error: any) {
    console.error('Users API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'ユーザー情報の取得に失敗しました',
      users: [],
      totalCount: 0
    }, { status: 500 })
  }
}

// ポイント操作API
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    
    // 管理者権限チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: '認証が必要です'
      }, { status: 401 })
    }

    const { userId, action, amount, type, description } = await request.json()
    
    if (!userId || !action || !amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        error: '必要なパラメータが不足しています'
      }, { status: 400 })
    }

    // 現在のポイント残高を取得
    const { data: currentPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('free_points, paid_points')
      .eq('user_id', userId)
      .single()
    
    if (pointsError && pointsError.code !== 'PGRST116') {
      console.error('Points fetch error:', pointsError)
      return NextResponse.json({
        success: false,
        error: 'ポイント情報の取得に失敗しました'
      }, { status: 500 })
    }

    let newFreePoints = currentPoints?.free_points || 0
    let newPaidPoints = currentPoints?.paid_points || 0
    
    // ポイント操作の実行
    if (action === 'add') {
      if (type === 'free') {
        newFreePoints += amount
      } else {
        newPaidPoints += amount
      }
    } else if (action === 'subtract') {
      if (type === 'free') {
        newFreePoints = Math.max(0, newFreePoints - amount)
      } else {
        newPaidPoints = Math.max(0, newPaidPoints - amount)
      }
    }

    // ポイント更新
    const { error: updateError } = await supabase
      .from('user_points')
      .upsert({
        user_id: userId,
        free_points: newFreePoints,
        paid_points: newPaidPoints,
        updated_at: new Date().toISOString()
      })
    
    if (updateError) {
      console.error('Points update error:', updateError)
      return NextResponse.json({
        success: false,
        error: 'ポイントの更新に失敗しました'
      }, { status: 500 })
    }

    // ポイント取引履歴を記録
    const { error: transactionError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        amount: action === 'add' ? amount : -amount,
        type: 'bonus',
        is_paid: type === 'paid',
        description: description || `管理者による${action === 'add' ? '追加' : '減算'}`,
        created_at: new Date().toISOString()
      })
    
    if (transactionError) {
      console.error('Transaction record error:', transactionError)
    }

    return NextResponse.json({
      success: true,
      message: `ポイントを${action === 'add' ? '追加' : '減算'}しました`,
      newPoints: {
        free_points: newFreePoints,
        paid_points: newPaidPoints,
        total_points: newFreePoints + newPaidPoints
      }
    })
    
  } catch (error: any) {
    console.error('Point operation error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'ポイント操作に失敗しました'
    }, { status: 500 })
  }
}