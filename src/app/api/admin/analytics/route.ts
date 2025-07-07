import { NextResponse } from 'next/server'
import { getYesterdayAnalytics, getTodayAnalytics, getWeekAnalytics } from '@/lib/google-analytics-api'

export async function GET(request: Request) {
  try {
    // URLパラメータから期間を取得
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'yesterday'

    let analyticsData;
    
    switch (period) {
      case 'today':
        analyticsData = await getTodayAnalytics()
        break
      case 'week':
        analyticsData = await getWeekAnalytics()
        break
      case 'yesterday':
      default:
        analyticsData = await getYesterdayAnalytics()
        break
    }

    // データが取得できない場合はモックデータを返す
    if (!analyticsData) {
      return NextResponse.json({
        pageViews: 0,
        uniqueUsers: 0,
        sessions: 0,
        avgSessionDuration: 0,
        bounceRate: 0,
        topPages: [],
        trafficSources: {
          organic: 0,
          direct: 0,
          social: 0,
          referral: 0,
          paid: 0,
        },
        message: 'Google Analytics APIが設定されていません。環境変数を確認してください。'
      })
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'アナリティクスデータの取得に失敗しました' },
      { status: 500 }
    )
  }
}