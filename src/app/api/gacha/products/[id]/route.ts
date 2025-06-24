import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ガチャ詳細データのサンプル
const GACHA_DETAILS = {
  '1': {
    id: '1',
    name: 'ピカチュウ大祭り',
    description: '還元率97%！ポンチョを着たピカチュウPSA10確定！',
    price: 150,
    multi_price: 1500,
    image: '/images/banners/real-gacha/S__44392515_0.jpg',
    remaining: 850,
    total: 1000,
    status: 'active',
    features: [
      '還元率97%',
      'PSA10確定カード',
      'ポンチョピカチュウ系列',
      'SS確定システム'
    ],
    rarity_rates: {
      SS: 0.05,
      S: 0.15,
      A: 0.30,
      B: 0.30,
      C: 0.20
    }
  },
  '2': {
    id: '2',
    name: 'ナンジャモ大量発生オリパ',
    description: '還元率100%超え！ナンジャモSAR PSA10確定！',
    price: 200,
    multi_price: 2000,
    image: '/images/banners/real-gacha/S__44392516_0.jpg',
    remaining: 650,
    total: 1000,
    status: 'active',
    features: [
      '還元率100%超え',
      'ナンジャモSAR PSA10',
      '女性トレーナー系',
      'BOX商品多数'
    ],
    rarity_rates: {
      SS: 0.06,
      S: 0.18,
      A: 0.26,
      B: 0.28,
      C: 0.18,
      D: 0.04
    }
  },
  '3': {
    id: '3',
    name: 'リザードン祭盤 炎のプレミアオリパ',
    description: '還元率97%！リザードンVMAX HR PSA10確定！',
    price: 300,
    multi_price: 3000,
    image: '/images/banners/real-gacha/S__44392517_0.jpg',
    remaining: 420,
    total: 1000,
    status: 'ending_soon',
    features: [
      '還元率97%',
      'リザードンVMAX HR',
      'レアパック1枚',
      'プレミアム演出'
    ],
    rarity_rates: {
      SS: 0.06,
      S: 0.18,
      A: 0.22,
      B: 0.20,
      C: 0.17
    }
  },
  '4': {
    id: '4',
    name: 'ブラッキー超感謝祭',
    description: '還元率120%！ブラッキーVMAX PSA10 PROMO確定！',
    price: 250,
    multi_price: 2500,
    image: '/images/banners/real-gacha/S__44392521_0.jpg',
    remaining: 780,
    total: 1000,
    status: 'active',
    features: [
      '還元率120%',
      'ブラッキーVMAX PROMO',
      'イーブイヒーローズ',
      'レアパック多数'
    ],
    rarity_rates: {
      SS: 0.05,
      S: 0.15,
      A: 0.27,
      B: 0.24,
      C: 0.22
    }
  },
  '5': {
    id: '5',
    name: 'リーリエ×マリオピカチュウ 超豪華オリパ',
    description: 'リーリエPSA10確定！マリオピカチュウ詰め合わせ！',
    price: 400,
    multi_price: 4000,
    image: '/images/banners/real-gacha/S__44392523_0.jpg',
    remaining: 120,
    total: 1000,
    status: 'ending_soon',
    features: [
      'リーリエPSA10確定',
      'マリオピカチュウ系',
      'ホワイトコレクション',
      '超高額カード多数'
    ],
    rarity_rates: {
      SS: 0.05,
      S: 0.16,
      A: 0.26,
      B: 0.16,
      C: 0.15
    }
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const gachaId = params.id
    const supabase = await createClient()
    
    // データベースから実際のデータを取得
    const { data: gacha, error } = await supabase
      .from('gacha_products')
      .select('*')
      .eq('id', gachaId)
      .single()
    
    if (error || !gacha) {
      // エラーの場合はフォールバックデータを使用
      const fallbackDetail = GACHA_DETAILS[gachaId as keyof typeof GACHA_DETAILS]
      if (!fallbackDetail) {
        return NextResponse.json({ error: 'Gacha not found' }, { status: 404 })
      }
      return NextResponse.json({ 
        success: true,
        product: {
          ...fallbackDetail,
          imageUrl: fallbackDetail.image
        }
      })
    }
    
    // データベースのフィールド名をフロントエンドで期待する形式に変換
    const formattedGacha = {
      id: gacha.id,
      name: gacha.name,
      description: gacha.description,
      price: gacha.single_price || gacha.price,
      multi_price: gacha.multi_price,
      imageUrl: gacha.banner_image_url, // banner_image_url を imageUrl にマッピング
      remaining: gacha.metadata?.total_stock ? 
        (gacha.metadata.total_stock - (gacha.sold_count || 0)) : 
        1000,
      total: gacha.metadata?.total_stock || gacha.total_stock || 1000,
      status: gacha.is_active ? 'active' : 'inactive',
      features: gacha.metadata?.features || [],
      rarity_rates: gacha.metadata?.rarity_rates || {
        SS: 0.05,
        S: 0.15,
        A: 0.30,
        B: 0.30,
        C: 0.20
      }
    }
    
    return NextResponse.json({ 
      success: true,
      product: formattedGacha 
    })
  } catch (error) {
    console.error('Error fetching gacha detail:', error)
    
    // エラー時のフォールバック
    const fallbackDetail = GACHA_DETAILS[params.id as keyof typeof GACHA_DETAILS]
    if (fallbackDetail) {
      return NextResponse.json({ 
        success: true,
        product: {
          ...fallbackDetail,
          imageUrl: fallbackDetail.image
        }
      })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}