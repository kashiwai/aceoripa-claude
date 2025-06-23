import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // 一時的にフォールバックデータを返す（リアルガチャバナー付き）
    const sampleProducts = [
      {
        id: '1',
        name: 'ピカチュウ大祭り',
        price: 150,
        image: '/images/banners/real-gacha/S__44392515_0.jpg',
        remaining: 850,
        total: 1000,
        status: 'active'
      },
      {
        id: '2', 
        name: 'ナンジャモ大量発生オリパ',
        price: 200,
        image: '/images/banners/real-gacha/S__44392516_0.jpg',
        remaining: 650,
        total: 1000,
        status: 'active'
      },
      {
        id: '3',
        name: 'リザードン祭盤 炎のプレミアオリパ',
        price: 300,
        image: '/images/banners/real-gacha/S__44392517_0.jpg',
        remaining: 420,
        total: 1000,
        status: 'ending_soon'
      },
      {
        id: '4',
        name: 'ブラッキー超感謝祭',
        price: 250,
        image: '/images/banners/real-gacha/S__44392521_0.jpg',
        remaining: 780,
        total: 1000,
        status: 'active'
      },
      {
        id: '5',
        name: 'リーリエ×マリオピカチュウ 超豪華オリパ',
        price: 400,
        image: '/images/banners/real-gacha/S__44392523_0.jpg',
        remaining: 120,
        total: 1000,
        status: 'ending_soon'
      }
    ]
    
    return NextResponse.json({ products: sampleProducts })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}