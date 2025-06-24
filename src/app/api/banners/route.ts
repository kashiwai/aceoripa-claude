import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// メインバナーの設定を管理するAPI

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: banners, error } = await supabase
      .from('banners')
      .select('*')
      .order('priority', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      // エラー時はフォールバックデータを返す
      return NextResponse.json({
        success: true,
        banners: [
          {
            id: '1',
            title: 'ピカチュウ大祭り！',
            subtitle: 'SSR確率2倍UP開催中',
            description: '期間限定でSSR確率が2倍！この機会をお見逃しなく！',
            imageUrl: '/images/banners/real-gacha/S__44392515_0.jpg',
            linkUrl: '/gacha/1',
            linkType: 'gacha',
            priority: 1,
            isActive: true,
            backgroundColor: 'from-yellow-400 to-orange-500',
            textColor: 'text-white',
            createdAt: '2024-12-01T00:00:00Z'
          }
        ]
      })
    }

    // カラムマッピング（DB → フロントエンド）
    const mappedBanners = banners?.map(banner => ({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      imageUrl: banner.image_url,
      linkUrl: banner.link_url,
      linkType: banner.link_type,
      priority: banner.priority,
      isActive: banner.is_active,
      startDate: banner.start_date,
      endDate: banner.end_date,
      backgroundColor: banner.background_color,
      textColor: banner.text_color,
      createdAt: banner.created_at,
      updatedAt: banner.updated_at
    })) || []

    return NextResponse.json({
      success: true,
      banners: mappedBanners
    })
  } catch (error) {
    console.error('Error fetching banners:', error)
    
    return NextResponse.json({
      success: false,
      error: 'バナーの取得中にエラーが発生しました'
    }, { status: 500 })
  }
}

// バナー作成API（管理者用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { data: banner, error } = await supabase
      .from('banners')
      .insert([{
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        image_url: body.imageUrl,
        link_url: body.linkUrl,
        link_type: body.linkType,
        priority: body.priority,
        is_active: body.isActive,
        start_date: body.startDate,
        end_date: body.endDate,
        background_color: body.backgroundColor,
        text_color: body.textColor
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        success: false,
        error: 'バナーの作成に失敗しました'
      }, { status: 500 })
    }

    // カラムマッピング（DB → フロントエンド）
    const mappedBanner = {
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      imageUrl: banner.image_url,
      linkUrl: banner.link_url,
      linkType: banner.link_type,
      priority: banner.priority,
      isActive: banner.is_active,
      startDate: banner.start_date,
      endDate: banner.end_date,
      backgroundColor: banner.background_color,
      textColor: banner.text_color,
      createdAt: banner.created_at,
      updatedAt: banner.updated_at
    }

    return NextResponse.json({
      success: true,
      banner: mappedBanner
    })
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json({
      success: false,
      error: 'バナーの作成中にエラーが発生しました'
    }, { status: 500 })
  }
}