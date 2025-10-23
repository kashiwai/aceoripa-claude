import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // 現在のユーザーを取得
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // ポイント情報を取得
    const { data: pointsData, error: pointsError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // ガチャ履歴を取得
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select(`
        *,
        gacha_products (
          name,
          price,
          card_count
        ),
        gacha_results (
          card_id,
          cards (
            name,
            rarity,
            image_url
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10)

    // 統計情報を計算
    const totalSpent = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
    const totalCards = await supabase
      .from('user_cards')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    const profile = {
      id: user.id,
      email: user.email!,
      name: userData?.display_name || user.email?.split('@')[0] || 'ユーザー',
      avatar: userData?.avatar_url || user.user_metadata.avatar_url,
      points: (pointsData?.free_points || 0) + (pointsData?.paid_points || 0),
      freePoints: pointsData?.free_points || 0,
      paidPoints: pointsData?.paid_points || 0,
      level: Math.floor(totalSpent / 10000) + 1, // 10000円ごとにレベルアップ
      totalSpent,
      totalCards: totalCards?.count || 0,
      joinDate: user.created_at,
      provider: userData?.provider || user.app_metadata.provider
    }

    // ガチャ履歴を整形
    const gachaHistory = transactions?.map(t => ({
      id: t.id,
      gachaName: t.gacha_products?.name || 'Unknown',
      date: t.created_at,
      count: t.gacha_products?.card_count || 0,
      amount: t.amount,
      results: t.gacha_results?.map((r: any) => ({
        id: r.card_id,
        name: r.cards?.name || 'Unknown',
        rarity: r.cards?.rarity || 'N',
        imageUrl: r.cards?.image_url || '/images/ngcard.jpg'
      })) || []
    })) || []

    return NextResponse.json({ 
      profile,
      gachaHistory
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}