import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const perPage = Number(searchParams.get('perPage')) || 20
    const offset = (page - 1) * perPage
    
    // user_points テーブルから取得
    const { data: userPointsData, count: totalCount, error: pointsError } = await supabase
      .from('user_points')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1)
    
    if (pointsError) {
      console.error('User points error:', pointsError)
      return NextResponse.json({
        success: false,
        error: 'ユーザーポイント情報の取得に失敗しました',
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
    
    // ユーザー情報を構築（現時点ではuser_idとポイント情報のみ）
    const users = userPointsData.map((userPoint, index) => ({
      id: userPoint.user_id,
      email: `user${index + 1}@example.com`, // 一時的なプレースホルダー
      display_name: `ユーザー${index + 1}`,
      created_at: userPoint.created_at || new Date().toISOString(),
      free_points: userPoint.free_points || 0,
      paid_points: userPoint.paid_points || 0,
      total_points: (userPoint.free_points || 0) + (userPoint.paid_points || 0),
      card_count: 0 // 後で取得
    }))
    
    // 各ユーザーのカード所持数を取得
    const userIds = users.map(u => u.id)
    const { data: cardCounts } = await supabase
      .from('user_cards')
      .select('user_id')
      .in('user_id', userIds)
    
    if (cardCounts) {
      const cardCountMap = cardCounts.reduce((acc, card) => {
        acc[card.user_id] = (acc[card.user_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      users.forEach(user => {
        user.card_count = cardCountMap[user.id] || 0
      })
    }
    
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