import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: ガチャプール（確率設定）取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: pools, error } = await supabase
      .from('gacha_pools')
      .select(`
        id,
        card_id,
        drop_rate,
        cards (
          id,
          name,
          rarity,
          image_url
        )
      `)
      .eq('product_id', params.id)
      .order('drop_rate', { ascending: false })
    
    if (error) throw error
    
    // レアリティ別に集計
    const rarityStats = {
      SSR: { count: 0, total_rate: 0 },
      SR: { count: 0, total_rate: 0 },
      R: { count: 0, total_rate: 0 },
      N: { count: 0, total_rate: 0 }
    }
    
    pools?.forEach(pool => {
      const rarity = pool.cards?.rarity || 'N'
      if (rarityStats[rarity as keyof typeof rarityStats]) {
        rarityStats[rarity as keyof typeof rarityStats].count++
        rarityStats[rarity as keyof typeof rarityStats].total_rate += pool.drop_rate
      }
    })
    
    return NextResponse.json({
      pools,
      rarity_stats: rarityStats,
      total_rate: pools?.reduce((sum, p) => sum + p.drop_rate, 0) || 0
    })
  } catch (error: any) {
    console.error('Admin gacha pools GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: ガチャプールにカード追加
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // 複数カードの一括追加に対応
    const poolsToInsert = body.cards.map((card: any) => ({
      product_id: params.id,
      card_id: card.card_id,
      drop_rate: card.drop_rate || 100
    }))
    
    const { data: pools, error } = await supabase
      .from('gacha_pools')
      .insert(poolsToInsert)
      .select()
    
    if (error) throw error
    
    return NextResponse.json({
      pools,
      message: 'Cards added to gacha pool successfully'
    })
  } catch (error: any) {
    console.error('Admin gacha pools POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: ガチャプール確率更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // 複数の確率を一括更新
    const updatePromises = body.updates.map((update: any) =>
      supabase
        .from('gacha_pools')
        .update({ drop_rate: update.drop_rate })
        .eq('id', update.pool_id)
    )
    
    const results = await Promise.all(updatePromises)
    
    // エラーチェック
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      throw new Error('Some updates failed')
    }
    
    return NextResponse.json({
      message: 'Drop rates updated successfully'
    })
  } catch (error: any) {
    console.error('Admin gacha pools PUT error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: ガチャプールからカード削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const poolId = searchParams.get('pool_id')
    
    if (!poolId) {
      return NextResponse.json(
        { error: 'pool_id is required' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('gacha_pools')
      .delete()
      .eq('id', poolId)
      .eq('product_id', params.id)
    
    if (error) throw error
    
    return NextResponse.json({
      message: 'Card removed from gacha pool successfully'
    })
  } catch (error: any) {
    console.error('Admin gacha pools DELETE error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}