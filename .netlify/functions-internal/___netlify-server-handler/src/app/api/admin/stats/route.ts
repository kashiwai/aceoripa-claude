// pages/api/admin/stats.ts - 端末2統合版
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // 管理者認証確認
    const { data: { user } } = await supabase.auth.getUser()
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@aceoripa.com'
    
    if (!user || user.email !== adminEmail) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // 並行してデータ取得
    const [
      usersResult,
      gachaHistoryResult,
      pointTransactionsResult,
      revenueResult
    ] = await Promise.all([
      getUserStats(adminClient),
      getGachaStats(adminClient),
      getPointStats(adminClient),
      getRevenueStats(adminClient)
    ])

    // 統計データ構築
    const stats = {
      users: usersResult.data,
      gacha: gachaHistoryResult.data,
      points: pointTransactionsResult.data,
      revenue: revenueResult.data,
      summary: {
        totalUsers: usersResult.data?.total || 0,
        totalGachaPlays: gachaHistoryResult.data?.total || 0,
        totalRevenue: revenueResult.data?.total || 0,
        averagePointsPerUser: calculateAveragePoints(usersResult.data, pointTransactionsResult.data)
      },
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ 
      error: '統計データの取得に失敗しました' 
    }, { status: 500 })
  }
}

// ユーザー統計取得
async function getUserStats(adminClient: any) {
  try {
    // 総ユーザー数
    const { count: totalUsers } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })

    // ランク別分布（簡易版）
    const { data: users } = await adminClient
      .from('users')
      .select('points')

    const rankDistribution = {
      BRONZE: 0,
      SILVER: 0,
      GOLD: 0,
      PLATINUM: 0
    }

    users?.forEach((user: any) => {
      if (user.points < 1000) rankDistribution.BRONZE++
      else if (user.points < 5000) rankDistribution.SILVER++
      else if (user.points < 10000) rankDistribution.GOLD++
      else rankDistribution.PLATINUM++
    })

    // 新規登録数（直近7日）
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: newUsers } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    // アクティブユーザー（直近30日ガチャ実行）
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: activeUserIds } = await adminClient
      .from('gacha_results')
      .select('transaction_id')
      .gte('created_at', thirtyDaysAgo.toISOString())

    const activeUsers = new Set(activeUserIds?.map((h: any) => h.user_id) || []).size

    return {
      data: {
        total: totalUsers || 0,
        newUsers: newUsers || 0,
        activeUsers,
        rankDistribution,
        retention: totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(1) : 0
      },
      error: null
    }

  } catch (error) {
    return { data: null, error }
  }
}

// ガチャ統計取得
async function getGachaStats(adminClient: any) {
  try {
    // 総ガチャ実行数
    const { count: totalPlays } = await adminClient
      .from('gacha_results')
      .select('*', { count: 'exact', head: true })

    // レアリティ別統計（仮データ）
    const rarityStats = {
      SSR: Math.floor((totalPlays || 0) * 0.03),
      SR: Math.floor((totalPlays || 0) * 0.12),
      R: Math.floor((totalPlays || 0) * 0.35),
      N: Math.floor((totalPlays || 0) * 0.50)
    }

    // 直近24時間のガチャ実行数
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { count: recentPlays } = await adminClient
      .from('gacha_results')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString())

    // 人気ガチャランキング（仮データ）
    const popularGachas = [
      { name: 'スタンダードガチャ', count: Math.floor((totalPlays || 0) * 0.6) },
      { name: 'ピックアップガチャ', count: Math.floor((totalPlays || 0) * 0.3) },
      { name: 'イベントガチャ', count: Math.floor((totalPlays || 0) * 0.1) }
    ]

    return {
      data: {
        total: totalPlays || 0,
        recentPlays: recentPlays || 0,
        rarityStats,
        popularGachas
      },
      error: null
    }

  } catch (error) {
    return { data: null, error }
  }
}

// ポイント統計取得
async function getPointStats(adminClient: any) {
  try {
    // 総ポイント発行数
    const { data: pointsData } = await adminClient
      .from('point_transactions')
      .select('type, amount')

    const pointsStats = pointsData?.reduce((acc: any, transaction: any) => {
      if (transaction.amount > 0) {
        acc.issued += transaction.amount
      } else {
        acc.consumed += Math.abs(transaction.amount)
      }
      return acc
    }, { issued: 0, consumed: 0 }) || { issued: 0, consumed: 0 }

    // 現在の総保有ポイント
    const { data: usersPoints } = await adminClient
      .from('users')
      .select('points')

    const totalHeldPoints = usersPoints?.reduce((sum: number, user: any) => sum + (user.points || 0), 0) || 0

    // 直近の取引統計
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: recentTransactions } = await adminClient
      .from('point_transactions')
      .select('type, amount')
      .gte('created_at', yesterday.toISOString())

    const recentStats = recentTransactions?.reduce((acc: any, transaction: any) => {
      acc[transaction.type] = (acc[transaction.type] || 0) + Math.abs(transaction.amount)
      return acc
    }, {}) || {}

    return {
      data: {
        totalIssued: pointsStats.issued,
        totalConsumed: pointsStats.consumed,
        totalHeld: totalHeldPoints,
        recentActivity: recentStats
      },
      error: null
    }

  } catch (error) {
    return { data: null, error }
  }
}

// 売上統計取得
async function getRevenueStats(adminClient: any) {
  try {
    // Square決済からの売上（仮データ）
    const { data: purchases } = await adminClient
      .from('point_transactions')
      .select('amount, created_at')
      .eq('type', 'purchase')

    const totalRevenue = purchases?.reduce((sum: number, purchase: any) => {
      // ポイント購入比率から売上計算（1000PT = 1000円）
      return sum + Math.abs(purchase.amount)
    }, 0) || 0

    // 月別売上
    const monthlyRevenue = purchases?.reduce((acc: any, purchase: any) => {
      const month = purchase.created_at.substring(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + Math.abs(purchase.amount)
      return acc
    }, {}) || {}

    // 直近7日の売上
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentRevenue = purchases?.filter((purchase: any) => 
      new Date(purchase.created_at) >= sevenDaysAgo
    ).reduce((sum: number, purchase: any) => sum + Math.abs(purchase.amount), 0) || 0

    return {
      data: {
        total: totalRevenue,
        recent: recentRevenue,
        monthly: monthlyRevenue,
        averageTransaction: purchases?.length ? (totalRevenue / purchases.length).toFixed(0) : 0
      },
      error: null
    }

  } catch (error) {
    return { data: null, error }
  }
}

// 平均ポイント計算
function calculateAveragePoints(usersData: any, pointsData: any) {
  if (!usersData?.total || !pointsData?.totalIssued) return 0
  return Math.round(pointsData.totalIssued / usersData.total)
}