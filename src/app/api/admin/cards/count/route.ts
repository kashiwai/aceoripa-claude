import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // 全カード数を正確にカウント
    const { count: totalCount, error: countError } = await supabase
      .from('pokemon_cards')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      throw countError
    }
    
    // レアリティ別の集計
    const rarities = ['SS', 'S', 'A', 'B', 'C', 'D']
    const rarityCounts: Record<string, number> = {}
    
    for (const rarity of rarities) {
      const { count, error } = await supabase
        .from('pokemon_cards')
        .select('*', { count: 'exact', head: true })
        .eq('rarity', rarity)
      
      if (error) {
        console.error(`Error counting ${rarity}:`, error)
        rarityCounts[rarity] = 0
      } else {
        rarityCounts[rarity] = count || 0
      }
    }
    
    return NextResponse.json({
      totalCount: totalCount || 0,
      rarityCounts,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Card count error:', error)
    return NextResponse.json(
      { error: 'カード数の取得に失敗しました' },
      { status: 500 }
    )
  }
}