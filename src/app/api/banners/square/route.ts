import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 400x400正方形バナー取得API
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: banners, error } = await supabase
      .from('square_banners')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      // エラー時はフォールバックデータを返す
      return NextResponse.json({
        success: true,
        banners: [
          {
            id: 1,
            gachaId: '1',
            title: 'ポケモンカード151',
            subtitle: 'リザードンex確率UP!',
            color: 'bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]',
            image: '/images/pokemon-151.jpg',
            priority: 1,
            isActive: true
          },
          {
            id: 2,
            gachaId: '2',
            title: 'シャイニートレジャー',
            subtitle: 'SSR確定オリパ',
            color: 'bg-gradient-to-r from-[#FF0033] to-[#FFD700]',
            image: '/images/メインキャンペーンバナー.jpg',
            priority: 2,
            isActive: true
          },
          {
            id: 3,
            gachaId: '3',
            title: '期間限定キャンペーン',
            subtitle: '10連ガチャ20%OFF',
            color: 'bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]',
            image: '/images/ポケモンカード151オリパ.jpg',
            priority: 3,
            isActive: true
          }
        ]
      })
    }

    // データベースのカラム名をフロントエンド用に変換
    const transformedBanners = banners?.map(banner => ({
      id: banner.id,
      gachaId: banner.gacha_id,
      title: banner.title,
      subtitle: banner.subtitle,
      color: banner.background_color || 'bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]',
      image: banner.image_url,
      priority: banner.priority,
      isActive: banner.is_active
    })) || []

    return NextResponse.json({
      success: true,
      banners: transformedBanners
    })
  } catch (error) {
    console.error('Error fetching square banners:', error)
    
    // フォールバックデータを返す
    return NextResponse.json({
      success: true,
      banners: [
        {
          id: 1,
          gachaId: '1',
          title: 'ポケモンカード151',
          subtitle: 'リザードンex確率UP!',
          color: 'bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]',
          image: '/images/pokemon-151.jpg',
          priority: 1,
          isActive: true
        },
        {
          id: 2,
          gachaId: '2',
          title: 'シャイニートレジャー',
          subtitle: 'SSR確定オリパ',
          color: 'bg-gradient-to-r from-[#FF0033] to-[#FFD700]',
          image: '/images/メインキャンペーンバナー.jpg',
          priority: 2,
          isActive: true
        }
      ]
    })
  }
}

// 正方形バナー作成API（管理者用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { data: banner, error } = await supabase
      .from('square_banners')
      .insert([{
        title: body.title,
        subtitle: body.subtitle,
        gacha_id: body.gachaId,
        image_url: body.imageUrl,
        background_color: body.backgroundColor || 'bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]',
        priority: body.priority || 1,
        is_active: body.isActive !== undefined ? body.isActive : true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        success: false,
        error: '正方形バナーの作成に失敗しました'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      banner
    })
  } catch (error) {
    console.error('Error creating square banner:', error)
    return NextResponse.json({
      success: false,
      error: '正方形バナーの作成中にエラーが発生しました'
    }, { status: 500 })
  }
}