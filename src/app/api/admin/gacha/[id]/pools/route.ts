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
      .from('gacha_pokemon_pools')
      .select(`
        id,
        pokemon_card_id,
        weight,
        pokemon_cards (
          id,
          card_name,
          product_code,
          rarity,
          image_url,
          market_price
        )
      `)
      .eq('gacha_product_id', params.id)
      .order('weight', { ascending: false })
    
    if (error) throw error
    
    // レアリティ別に集計
    const rarityStats = {
      SS: { count: 0, total_rate: 0 },
      S: { count: 0, total_rate: 0 },
      A: { count: 0, total_rate: 0 },
      B: { count: 0, total_rate: 0 },
      C: { count: 0, total_rate: 0 }
    }
    
    pools?.forEach(pool => {
      const rarity = pool.pokemon_cards?.rarity || 'C'
      if (rarityStats[rarity as keyof typeof rarityStats]) {
        rarityStats[rarity as keyof typeof rarityStats].count++
        rarityStats[rarity as keyof typeof rarityStats].total_rate += pool.weight
      }
    })
    
    return NextResponse.json({
      pools,
      rarity_stats: rarityStats,
      total_rate: pools?.reduce((sum, p) => sum + p.weight, 0) || 0
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

// PUT: カードプールを完全に更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { pools } = await request.json()
    const gachaId = params.id
    
    // トランザクション的な処理
    // 1. 既存のプールを削除
    const { error: deleteError } = await supabase
      .from('gacha_pokemon_pools')
      .delete()
      .eq('gacha_product_id', gachaId)
    
    if (deleteError) throw deleteError
    
    // 2. 新しいプールを挿入
    if (pools.length > 0) {
      const poolsToInsert = pools.map((pool: any) => ({
        gacha_product_id: gachaId,
        pokemon_card_id: pool.card_id,
        weight: pool.drop_rate
      }))
      
      const { error: insertError } = await supabase
        .from('gacha_pokemon_pools')
        .insert(poolsToInsert)
      
      if (insertError) throw insertError
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Card pools updated successfully'
    })
    
  } catch (error: any) {
    console.error('Pools update error:', error)
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