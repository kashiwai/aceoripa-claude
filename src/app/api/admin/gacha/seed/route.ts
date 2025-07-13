import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // 現在トップページに表示されているガチャと同じデータ
    const gachaData = [
      {
        name: 'ピカチュウ大祭り',
        description: 'ピカチュウの特別なカードが大量出現！\nSSR確率アップ中！',
        price: 150,
        card_count: 1,
        bonus_cards: 0,
        is_active: true,
        single_price: 150,
        multi_price: 1350,
        banner_image_url: '/images/banners/real-gacha/S__44392515_0.jpg'
      },
      {
        name: 'ナンジャモ大量発生オリパ',
        description: 'ナンジャモの激レアカードが手に入るチャンス！',
        price: 200,
        card_count: 1,
        bonus_cards: 0,
        is_active: true,
        single_price: 200,
        multi_price: 1800,
        banner_image_url: '/images/banners/real-gacha/S__44392516_0.jpg'
      },
      {
        name: 'リザードン祭盤 炎のプレミアオリパ',
        description: '炎タイプの最強カードが集結！リザードンを狙え！',
        price: 300,
        card_count: 1,
        bonus_cards: 0,
        is_active: true,
        single_price: 300,
        multi_price: 2700,
        banner_image_url: '/images/banners/real-gacha/S__44392517_0.jpg'
      },
      {
        name: 'ブラッキー超感謝祭',
        description: 'ブラッキーの特別なカードが登場！ファン必見！',
        price: 250,
        card_count: 1,
        bonus_cards: 0,
        is_active: true,
        single_price: 250,
        multi_price: 2250,
        banner_image_url: '/images/banners/real-gacha/S__44392518_0.jpg'
      },
      {
        name: 'リーリエ×マリオピカチュウ 超豪華オリパ',
        description: '最高級レアカードが勢揃い！プレミアム体験をあなたに！',
        price: 400,
        card_count: 1,
        bonus_cards: 0,
        is_active: true,
        single_price: 400,
        multi_price: 3600,
        banner_image_url: '/images/banners/real-gacha/S__44392519_0.jpg'
      }
    ]

    // 既存のガチャをチェック
    const { data: existingGachas, error: checkError } = await supabase
      .from('gacha_products')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('Database check error:', checkError)
      return NextResponse.json({
        success: false,
        error: 'データベース接続エラー: ' + checkError.message
      }, { status: 500 })
    }

    // 1つずつ挿入
    const insertedGachas = []
    
    for (const gacha of gachaData) {
      try {
        const { data, error } = await supabase
          .from('gacha_products')
          .insert([gacha])
          .select()
          .single()

        if (error) {
          console.error('Individual insert error:', error)
          console.error('Failed gacha data:', gacha)
          return NextResponse.json({
            success: false,
            error: `ガチャ「${gacha.name}」の挿入に失敗: ${error.message}`,
            details: error
          }, { status: 500 })
        }

        insertedGachas.push(data)
      } catch (individualError) {
        console.error('Individual gacha insert failed:', individualError)
        return NextResponse.json({
          success: false,
          error: `ガチャ「${gacha.name}」の処理でエラー: ${individualError}`
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${insertedGachas.length}個のガチャを正常に登録しました`,
      data: insertedGachas
    })

  } catch (error) {
    console.error('Seed gacha API error:', error)
    return NextResponse.json({
      success: false,
      error: 'APIエラー: ' + error
    }, { status: 500 })
  }
}