import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Square バナーの設定を管理するAPI

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Square バナー設定を取得
    const { data: settingsData } = await supabase
      .from('square_banner_settings')
      .select('show_square_banners')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    // Square バナーを取得
    const { data: bannersData, error: bannersError } = await supabase
      .from('square_banners')
      .select('*')
      .order('priority', { ascending: true })

    // console.log('Square banners from DB:', bannersData)
    // console.log('Square banner settings from DB:', settingsData)

    if (bannersError) {
      console.error('Database error:', bannersError)
    }

    const settings = {
      showSquareBanners: settingsData?.show_square_banners ?? true,
      banners: bannersData?.map(banner => ({
        id: banner.id,  // UUIDの場合もそのまま使用
        gachaId: banner.gacha_id,
        title: banner.title,
        subtitle: banner.subtitle,
        color: banner.color,
        image: banner.image,
        isActive: banner.is_active,
        priority: banner.priority
      })) || []
    }
    
    // console.log('Returning settings:', settings)

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error fetching square banner settings:', error)
    
    // フォールバックデータを返す
    const fallbackSettings = {
      showSquareBanners: true,
      banners: [
        { 
          id: 1, 
          gachaId: '1',
          title: '激アツ！ピカチュウ祭り', 
          subtitle: 'マリオピカチュウPSA10確定！', 
          color: 'bg-gradient-to-r from-[#FFD700] to-[#FF6600]',
          image: '/images/basebg/A_luxurious_gold-framed_Pokmon_trading_card_is_t-1750539990520.png',
          isActive: true,
          priority: 1
        }
      ]
    }
    
    return NextResponse.json({ success: true, data: fallbackSettings })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { showSquareBanners, banners } = body
    const supabase = await createClient()

    // Square バナー設定を更新
    // まず既存の設定を取得
    const { data: existingSettings } = await supabase
      .from('square_banner_settings')
      .select('id')
      .limit(1)
      .single()
    
    if (existingSettings?.id) {
      // 既存の設定を更新
      const { error: settingsError } = await supabase
        .from('square_banner_settings')
        .update({
          show_square_banners: showSquareBanners,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)

      if (settingsError) {
        console.error('Settings update error:', settingsError)
      }
    } else {
      // 設定が存在しない場合は新規作成
      const { error: settingsError } = await supabase
        .from('square_banner_settings')
        .insert({
          show_square_banners: showSquareBanners,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (settingsError) {
        console.error('Settings insert error:', settingsError)
      }
    }

    // Square バナーを更新
    for (const banner of banners) {
      // バナーIDがnumberの場合は既存のレコードを更新、それ以外は新規作成とみなす
      const bannerData = {
        gacha_id: banner.gachaId,
        title: banner.title,
        subtitle: banner.subtitle,
        color: banner.color,
        image: banner.image,
        is_active: banner.isActive,
        priority: banner.priority,
        updated_at: new Date().toISOString()
      }

      if (typeof banner.id === 'string' && banner.id.length > 10) {
        // UUIDの場合は更新
        const { error: bannerError } = await supabase
          .from('square_banners')
          .update(bannerData)
          .eq('id', banner.id)

        if (bannerError) {
          console.error('Banner update error:', bannerError)
        }
      } else {
        // それ以外は新規作成
        const { error: bannerError } = await supabase
          .from('square_banners')
          .insert({
            ...bannerData,
            created_at: new Date().toISOString()
          })

        if (bannerError) {
          console.error('Banner insert error:', bannerError)
        }
      }
    }

    // console.log('Square Banner Settings Updated:', { showSquareBanners, banners })

    return NextResponse.json({ 
      success: true, 
      message: 'Square バナー設定を更新しました',
      data: { showSquareBanners, banners }
    })
  } catch (error) {
    console.error('Error updating square banner settings:', error)
    return NextResponse.json(
      { success: false, message: 'エラーが発生しました' },
      { status: 500 }
    )
  }
}