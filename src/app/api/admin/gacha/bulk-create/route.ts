import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CardData {
  name: string
  points: number
  price_range: string
  rarity: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 管理者権限チェック（Cookieベース）
    const adminSessionCookie = request.cookies.get('admin_session')
    if (!adminSessionCookie) {
      return NextResponse.json({
        success: false,
        error: '管理者認証が必要です'
      }, { status: 401 })
    }

    const { gachaData, cardData } = await request.json()

    // 1. ガチャ商品を作成
    const { data: gachaProduct, error: gachaError } = await supabase
      .from('gacha_products')
      .insert({
        name: gachaData.name,
        description: gachaData.description,
        single_price: gachaData.price,
        multi_price: gachaData.price * 10,
        total_packs: gachaData.total_packs,
        remaining_packs: gachaData.total_packs,
        banner_image_url: gachaData.banner_image_url,
        is_active: true,
        guarantee_sr_on_multi: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (gachaError) {
      console.error('Gacha creation error:', gachaError)
      return NextResponse.json({
        success: false,
        error: 'ガチャの作成に失敗しました'
      }, { status: 500 })
    }

    // 2. カードデータを登録
    const cardInserts = []
    const poolInserts = []

    for (const card of cardData) {
      // カード登録
      const { data: cardRecord, error: cardError } = await supabase
        .from('pokemon_cards')
        .insert({
          card_name: card.name,
          rarity: card.rarity,
          product_code: `${card.rarity}-${Date.now()}`,
          market_price: card.points,
          image_url: card.image_url || '',
          description: `価格相場: ${card.price_range}`,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (cardError) {
        console.error('Card creation error:', cardError)
        continue
      }

      // プール登録（重みを設定）
      let weight = 1
      switch (card.rarity) {
        case 'SS': weight = 1; break    // 一等：最も低い確率
        case 'S': weight = 2; break     // 二等
        case 'A': weight = 5; break     // 三等
        case 'B': weight = 15; break    // 四等
        case 'C': weight = 30; break    // 五等：最も高い確率
      }

      poolInserts.push({
        gacha_product_id: gachaProduct.id,
        pokemon_card_id: cardRecord.id,
        weight: weight
      })
    }

    // 3. プールデータを一括登録
    const { error: poolError } = await supabase
      .from('gacha_pokemon_pools')
      .insert(poolInserts)

    if (poolError) {
      console.error('Pool creation error:', poolError)
      return NextResponse.json({
        success: false,
        error: 'プールの作成に失敗しました'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'ガチャとカードデータを作成しました',
      gacha_id: gachaProduct.id,
      created_cards: cardData.length
    })

  } catch (error: any) {
    console.error('Bulk create error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'ガチャの作成に失敗しました'
    }, { status: 500 })
  }
}