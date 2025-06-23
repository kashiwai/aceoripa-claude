import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// バナー取得API
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: banners, error } = await supabase
      .from('banners')
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
            textColor: 'text-white'
          },
          {
            id: '2',
            title: 'ナンジャモコレクション',
            subtitle: '新登場プレミアムガチャ',
            description: 'ナンジャモの限定カードが大量出現！',
            imageUrl: '/images/banners/real-gacha/S__44392516_0.jpg',
            linkUrl: '/gacha/2',
            linkType: 'gacha',
            priority: 2,
            isActive: true,
            backgroundColor: 'from-purple-500 to-pink-500',
            textColor: 'text-white'
          }
        ]
      })
    }

    return NextResponse.json({
      success: true,
      banners: banners || []
    })
  } catch (error) {
    console.error('Error fetching banners:', error)
    
    // フォールバックデータを返す
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
          textColor: 'text-white'
        },
        {
          id: '2',
          title: 'ナンジャモコレクション',
          subtitle: '新登場プレミアムガチャ',
          description: 'ナンジャモの限定カードが大量出現！',
          imageUrl: '/images/banners/real-gacha/S__44392516_0.jpg',
          linkUrl: '/gacha/2',
          linkType: 'gacha',
          priority: 2,
          isActive: true,
          backgroundColor: 'from-purple-500 to-pink-500',
          textColor: 'text-white'
        }
      ]
    })
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
        text_color: body.textColor,
        created_at: new Date().toISOString()
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

    return NextResponse.json({
      success: true,
      banner
    })
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json({
      success: false,
      error: 'バナーの作成中にエラーが発生しました'
    }, { status: 500 })
  }
}