import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// キャンペーンバナーの設定を管理するAPI

export async function GET() {
  try {
    const supabase = await createClient()
    
    // キャンペーンバナー設定を取得
    const { data: settingsData } = await supabase
      .from('campaign_banner_settings')
      .select('show_all_banners')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    // キャンペーンバナーを取得
    const { data: bannersData, error: bannersError } = await supabase
      .from('campaign_banners')
      .select('*')
      .order('priority', { ascending: true })

    if (bannersError) {
      console.error('Database error:', bannersError)
    }

    const settings = {
      showAllBanners: settingsData?.show_all_banners ?? true,
      banners: bannersData?.map(banner => ({
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle,
        bgColor: banner.bg_color,
        isActive: banner.is_active,
        priority: banner.priority
      })) || []
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error fetching campaign banner settings:', error)
    
    // フォールバックデータを返す
    const fallbackSettings = {
      showAllBanners: true,
      banners: [
        {
          id: '1',
          title: '🎉 新規登録キャンペーン',
          subtitle: '今なら5000ポイントプレゼント！',
          bgColor: 'from-purple-600 to-pink-600',
          isActive: true,
          priority: 1,
        }
      ]
    }
    
    return NextResponse.json({ success: true, data: fallbackSettings })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { showAllBanners, banners } = body
    const supabase = await createClient()

    // キャンペーンバナー設定を更新
    // まず既存の設定を取得
    const { data: existingSettings } = await supabase
      .from('campaign_banner_settings')
      .select('id')
      .limit(1)
      .single()
    
    if (existingSettings?.id) {
      // 既存の設定を更新
      const { error: settingsError } = await supabase
        .from('campaign_banner_settings')
        .update({
          show_all_banners: showAllBanners,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)

      if (settingsError) {
        console.error('Settings update error:', settingsError)
      }
    } else {
      // 設定が存在しない場合は新規作成
      const { error: settingsError } = await supabase
        .from('campaign_banner_settings')
        .insert({
          show_all_banners: showAllBanners,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (settingsError) {
        console.error('Settings insert error:', settingsError)
      }
    }

    // キャンペーンバナーを更新
    for (const banner of banners) {
      const { error: bannerError } = await supabase
        .from('campaign_banners')
        .upsert({
          id: banner.id,
          title: banner.title,
          subtitle: banner.subtitle,
          bg_color: banner.bgColor,
          is_active: banner.isActive,
          priority: banner.priority,
          updated_at: new Date().toISOString()
        })

      if (bannerError) {
        console.error('Banner update error:', bannerError)
      }
    }

    // console.log('Campaign Banner Settings Updated:', { showAllBanners, banners })

    return NextResponse.json({ 
      success: true, 
      message: 'キャンペーンバナー設定を更新しました',
      data: { showAllBanners, banners }
    })
  } catch (error) {
    console.error('Error updating campaign banner settings:', error)
    return NextResponse.json(
      { success: false, message: 'エラーが発生しました' },
      { status: 500 }
    )
  }
}