import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 認証チェック（Admin専用）
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 管理者権限チェック
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@aceoripa.com';
    if (user.email !== adminEmail) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    // 今日の日付
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // 今月の開始日
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    
    // 並列でデータ取得
    const [
      userStats,
      todaySalesData,
      monthSalesData,
      activeGachaData,
      recentTransactions,
      popularGacha
    ] = await Promise.all([
      // ユーザー統計
      supabase.from('users').select('*', { count: 'exact', head: true }),
      
      // 本日の売上
      supabase
        .from('transactions')
        .select('amount')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .eq('status', 'completed'),
      
      // 今月の売上
      supabase
        .from('transactions')
        .select('amount')
        .gte('created_at', monthStart.toISOString())
        .eq('status', 'completed'),
      
      // アクティブなガチャ数
      supabase
        .from('gacha_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      
      // 最近の取引（5件）
      supabase
        .from('transactions')
        .select(`
          id,
          amount,
          status,
          created_at,
          users (
            id,
            email,
            display_name
          ),
          gacha_products (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5),
      
      // 人気ガチャTOP5
      supabase.rpc('get_popular_gacha', {
        start_date: monthStart.toISOString(),
        limit_count: 5
      })
    ])
    
    // データ集計
    const todayRevenue = todaySalesData.data?.reduce((sum, t) => sum + t.amount, 0) || 0
    const monthRevenue = monthSalesData.data?.reduce((sum, t) => sum + t.amount, 0) || 0
    
    // グラフ用データ（過去7日間）
    const dailySales = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const { data } = await supabase
        .from('transactions')
        .select('amount')
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString())
        .eq('status', 'completed')
      
      dailySales.push({
        date: date.toISOString().split('T')[0],
        amount: data?.reduce((sum, t) => sum + t.amount, 0) || 0
      })
    }
    
    return NextResponse.json({
      stats: {
        users: {
          total: userStats.count || 0,
          new_today: 0, // TODO: 実装
          new_this_month: 0 // TODO: 実装
        },
        sales: {
          today: todayRevenue,
          this_month: monthRevenue,
          average_per_transaction: todayRevenue / (todaySalesData.data?.length || 1)
        },
        gacha: {
          active_count: activeGachaData.count || 0,
          total_draws_today: todaySalesData.data?.length || 0
        }
      },
      charts: {
        daily_sales: dailySales
      },
      recent_transactions: recentTransactions.data || [],
      popular_gacha: popularGacha.data || []
    })
  } catch (error: any) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// カスタムRPC関数が必要な場合は、Supabaseダッシュボードで以下を実行：
/*
CREATE OR REPLACE FUNCTION get_popular_gacha(start_date timestamp, limit_count integer)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  transaction_count bigint,
  total_revenue numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gp.id as product_id,
    gp.name as product_name,
    COUNT(t.id) as transaction_count,
    SUM(t.amount) as total_revenue
  FROM gacha_products gp
  JOIN transactions t ON t.product_id = gp.id
  WHERE t.created_at >= start_date
    AND t.status = 'completed'
  GROUP BY gp.id, gp.name
  ORDER BY transaction_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
*/