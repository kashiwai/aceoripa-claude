import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // 現在トップページに表示されているガチャのデータ（手動作成風）
    const gachaProducts = [
      {
        // 基本情報
        name: 'ピカチュウ大祭り',
        description: 'ピカチュウの特別なカードが大量出現！\nSSR確率アップ中！',
        single_price: 150,
        multi_price: 1350,
        is_active: true,
        start_date: null,
        end_date: null,
        banner_image_url: '/images/banners/real-gacha/S__44392515_0.jpg',
        featured_card_ids: [],
        guarantee_sr_on_multi: true,
        
        // レガシーフィールド
        price: 150,
        card_count: 1,
        bonus_cards: 0,
        
        // メタデータ
        metadata: {
          total_stock: 1000,
          is_free_points_only: false,
          required_user_rank: '',
          cost_per_card: 50,
          ss_guarantee_threshold: 0.7,
          animation_settings: {
            SS: 'premium',
            S: 'special',
            A: 'normal',
            B: 'normal',
            C: 'normal'
          },
          theme: 'pikachu'
        }
      },
      {
        name: 'ナンジャモ大量発生オリパ',
        description: 'ナンジャモの激レアカードが手に入るチャンス！',
        single_price: 200,
        multi_price: 1800,
        is_active: true,
        start_date: null,
        end_date: null,
        banner_image_url: '/images/banners/real-gacha/S__44392516_0.jpg',
        featured_card_ids: [],
        guarantee_sr_on_multi: true,
        
        price: 200,
        card_count: 1,
        bonus_cards: 0,
        
        metadata: {
          total_stock: 1000,
          is_free_points_only: false,
          required_user_rank: '',
          cost_per_card: 60,
          ss_guarantee_threshold: 0.7,
          animation_settings: {
            SS: 'premium',
            S: 'special',
            A: 'normal',
            B: 'normal',
            C: 'normal'
          },
          theme: 'nanjamo'
        }
      },
      {
        name: 'リザードン祭盤 炎のプレミアオリパ',
        description: '炎タイプの最強カードが集結！リザードンを狙え！',
        single_price: 300,
        multi_price: 2700,
        is_active: true,
        start_date: null,
        end_date: null,
        banner_image_url: '/images/banners/real-gacha/S__44392517_0.jpg',
        featured_card_ids: [],
        guarantee_sr_on_multi: true,
        
        price: 300,
        card_count: 1,
        bonus_cards: 0,
        
        metadata: {
          total_stock: 1000,
          is_free_points_only: false,
          required_user_rank: '',
          cost_per_card: 80,
          ss_guarantee_threshold: 0.7,
          animation_settings: {
            SS: 'premium',
            S: 'special',
            A: 'normal',
            B: 'normal',
            C: 'normal'
          },
          theme: 'charizard',
          type_filter: 'fire'
        }
      },
      {
        name: 'ブラッキー超感謝祭',
        description: 'ブラッキーの特別なカードが登場！ファン必見！',
        single_price: 250,
        multi_price: 2250,
        is_active: true,
        start_date: null,
        end_date: null,
        banner_image_url: '/images/banners/real-gacha/S__44392518_0.jpg',
        featured_card_ids: [],
        guarantee_sr_on_multi: true,
        
        price: 250,
        card_count: 1,
        bonus_cards: 0,
        
        metadata: {
          total_stock: 1000,
          is_free_points_only: false,
          required_user_rank: '',
          cost_per_card: 70,
          ss_guarantee_threshold: 0.7,
          animation_settings: {
            SS: 'premium',
            S: 'special',
            A: 'normal',
            B: 'normal',
            C: 'normal'
          },
          theme: 'umbreon'
        }
      },
      {
        name: 'リーリエ×マリオピカチュウ 超豪華オリパ',
        description: '最高級レアカードが勢揃い！プレミアム体験をあなたに！',
        single_price: 400,
        multi_price: 3600,
        is_active: true,
        start_date: null,
        end_date: null,
        banner_image_url: '/images/banners/real-gacha/S__44392519_0.jpg',
        featured_card_ids: [],
        guarantee_sr_on_multi: true,
        
        price: 400,
        card_count: 1,
        bonus_cards: 0,
        
        metadata: {
          total_stock: 1000,
          is_free_points_only: false,
          required_user_rank: '',
          cost_per_card: 100,
          ss_guarantee_threshold: 0.7,
          animation_settings: {
            SS: 'premium',
            S: 'special',
            A: 'normal',
            B: 'normal',
            C: 'normal'
          },
          theme: 'premium',
          special: true
        }
      }
    ]

    console.log('=== Auto Create Gacha Products ===')
    console.log('Starting to create', gachaProducts.length, 'gacha products')

    const createdProducts = []
    
    for (let i = 0; i < gachaProducts.length; i++) {
      const gacha = gachaProducts[i]
      
      try {
        console.log(`Creating gacha ${i + 1}/${gachaProducts.length}:`, gacha.name)
        
        const { data, error } = await supabase
          .from('gacha_products')
          .insert([gacha])
          .select()
          .single()

        if (error) {
          console.error(`Failed to create gacha "${gacha.name}":`, error)
          return NextResponse.json({
            success: false,
            error: `ガチャ「${gacha.name}」の作成に失敗しました`,
            details: error,
            gachaData: gacha
          }, { status: 500 })
        }

        console.log(`Successfully created gacha:`, data.id)
        createdProducts.push(data)
        
        // 各ガチャ作成後に少し待機（データベース負荷軽減）
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (individualError) {
        console.error(`Error processing gacha "${gacha.name}":`, individualError)
        return NextResponse.json({
          success: false,
          error: `ガチャ「${gacha.name}」の処理でエラーが発生しました`,
          details: individualError
        }, { status: 500 })
      }
    }

    console.log('=== Auto Create Completed ===')
    console.log('Total created:', createdProducts.length)

    return NextResponse.json({
      success: true,
      message: `${createdProducts.length}個のガチャ商品を正常に作成しました！`,
      products: createdProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.single_price
      }))
    })

  } catch (error) {
    console.error('Auto create API error:', error)
    return NextResponse.json({
      success: false,
      error: 'ガチャ自動作成でエラーが発生しました',
      details: error
    }, { status: 500 })
  }
}