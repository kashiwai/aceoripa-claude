import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 管理者権限チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: '認証が必要です'
      }, { status: 401 })
    }

    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      tables: {}
    }

    // 1. user_pointsテーブルのデータ
    const { data: userPoints, count: userPointsCount, error: pointsError } = await supabase
      .from('user_points')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false })
    
    debugInfo.tables.user_points = {
      count: userPointsCount,
      error: pointsError?.message,
      sample_data: userPoints?.slice(0, 3),
      all_user_ids: userPoints?.map(up => up.user_id)
    }

    // 2. usersテーブルのデータ
    const { data: usersTable, count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    
    debugInfo.tables.users = {
      count: usersCount,
      error: usersError?.message,
      sample_data: usersTable?.slice(0, 3)
    }

    // 3. user_cardsテーブルのデータ
    const { data: userCards, count: cardsCount, error: cardsError } = await supabase
      .from('user_cards')
      .select('*', { count: 'exact' })
      .order('obtained_at', { ascending: false })
    
    debugInfo.tables.user_cards = {
      count: cardsCount,
      error: cardsError?.message,
      unique_users: [...new Set(userCards?.map(uc => uc.user_id))],
      sample_data: userCards?.slice(0, 3)
    }

    // 4. point_transactionsテーブルのデータ
    const { data: pointTransactions, count: transactionsCount, error: transactionsError } = await supabase
      .from('point_transactions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    
    debugInfo.tables.point_transactions = {
      count: transactionsCount,
      error: transactionsError?.message,
      unique_users: [...new Set(pointTransactions?.map(pt => pt.user_id))],
      sample_data: pointTransactions?.slice(0, 3)
    }

    // 5. Admin認証ユーザー情報
    try {
      const adminClient = createAdminClient()
      const { data: authData, error: authListError } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      })
      
      debugInfo.auth_users = {
        count: authData?.users?.length || 0,
        error: authListError?.message,
        user_ids: authData?.users?.map(u => u.id),
        sample_emails: authData?.users?.slice(0, 3)?.map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          email_confirmed_at: u.email_confirmed_at,
          last_sign_in_at: u.last_sign_in_at
        }))
      }
    } catch (adminError: any) {
      debugInfo.auth_users = {
        error: `Admin client error: ${adminError.message}`,
        service_role_configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    }

    // 6. データの整合性チェック
    const allUserIds = new Set([
      ...(userPoints?.map(up => up.user_id) || []),
      ...(usersTable?.map(u => u.id) || []),
      ...(userCards?.map(uc => uc.user_id) || []),
      ...(pointTransactions?.map(pt => pt.user_id) || [])
    ])

    debugInfo.consistency_check = {
      total_unique_user_ids: allUserIds.size,
      user_ids_list: Array.from(allUserIds),
      orphaned_data: {
        user_points_without_auth: [],
        user_cards_without_points: [],
        transactions_without_points: []
      }
    }

    // 7. 現在ログイン中のユーザー情報
    debugInfo.current_user = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      has_user_points: userPoints?.some(up => up.user_id === user.id),
      has_user_table_entry: usersTable?.some(u => u.id === user.id),
      has_cards: userCards?.some(uc => uc.user_id === user.id),
      has_transactions: pointTransactions?.some(pt => pt.user_id === user.id)
    }

    return NextResponse.json({
      success: true,
      debug_info: debugInfo
    })
    
  } catch (error: any) {
    console.error('Debug users API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'デバッグ情報の取得に失敗しました'
    }, { status: 500 })
  }
}