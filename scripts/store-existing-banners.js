const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 既存の5つのバナーデザインデータ
const existingBanners = [
  {
    name: 'ピカチュウフェスティバル',
    description: 'ピカチュウの特別なフェスティバルガチャ！レアなピカチュウカードをゲットしよう！',
    banner_image_url: '/images/banners/real-gacha/S__44392515_0.jpg',
    price: 300,
    total_prizes: 50,
    gacha_type: 'limited',
    metadata: {
      theme: 'ピカチュウフェスティバル',
      campaign_period: '2024年限定',
      special_features: ['ホロ仕様', '限定イラスト']
    }
  },
  {
    name: 'ナンジャモコレクション',
    description: 'ナンジャモの魅力的なカードコレクション！美麗イラストが満載！',
    banner_image_url: '/images/banners/real-gacha/S__44392516_0.jpg',
    price: 500,
    total_prizes: 30,
    gacha_type: 'premium',
    metadata: {
      theme: 'ナンジャモコレクション',
      rarity_focus: 'SR以上確定',
      special_features: ['美麗イラスト', 'プレミアム仕様']
    }
  },
  {
    name: 'リザードンプレミアム',
    description: 'リザードンの最強コレクション！プレミアムカードが目白押し！',
    banner_image_url: '/images/banners/real-gacha/S__44392517_0.jpg',
    price: 800,
    total_prizes: 20,
    gacha_type: 'premium',
    metadata: {
      theme: 'リザードンプレミアム',
      guaranteed_rarity: 'SSR',
      special_features: ['プレミアム加工', '限定フレーム']
    }
  },
  {
    name: 'ブラッキースペシャル',
    description: 'ブラッキーの特別なスペシャルガチャ！闇属性の魅力を堪能！',
    banner_image_url: '/images/banners/real-gacha/S__44392521_0.jpg',
    price: 400,
    total_prizes: 40,
    gacha_type: 'special',
    metadata: {
      theme: 'ブラッキースペシャル',
      type_focus: '悪タイプ',
      special_features: ['ダーク加工', 'ホログラム']
    }
  },
  {
    name: 'リーリエ×マリオピカチュウ',
    description: 'リーリエとマリオピカチュウのコラボレーション！超レア限定ガチャ！',
    banner_image_url: '/images/banners/real-gacha/S__44392523_0.jpg',
    price: 1000,
    total_prizes: 15,
    gacha_type: 'collaboration',
    metadata: {
      theme: 'リーリエ×マリオピカチュウ',
      collaboration: 'Nintendo × Pokemon',
      special_features: ['コラボ限定', '超レア仕様', 'コレクター必見']
    }
  }
]

async function storeExistingBanners() {
  console.log('=== 既存の5つのバナーデザインをデータベースに格納中 ===\n')

  try {
    // まず、banners テーブルが存在するかチェック
    console.log('🔍 データベーステーブルの確認中...')
    
    // banners テーブルが存在しない場合は作成
    const { error: createBannersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS banners (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255),
          description TEXT,
          image_url TEXT NOT NULL,
          link_url TEXT,
          link_type VARCHAR(50) DEFAULT 'gacha',
          priority INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
          end_date TIMESTAMP WITH TIME ZONE,
          background_color VARCHAR(7) DEFAULT '#000000',
          text_color VARCHAR(7) DEFAULT '#FFFFFF',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    })

    if (createBannersError) {
      console.log('⚠️  バナーテーブル作成をスキップ（既存またはpermission）')
    }

    let gachaSuccessCount = 0
    let gachaErrorCount = 0

    // 各バナーデザインをガチャ商品として登録
    for (const banner of existingBanners) {
      try {
        console.log(`🎰 ガチャ商品として登録: ${banner.name}`)
        
        const { data, error } = await supabase
          .from('gacha_products')
          .upsert({
            name: banner.name,
            description: banner.description,
            price: banner.price,
            total_prizes: banner.total_prizes,
            remaining_prizes: banner.total_prizes,
            gacha_type: banner.gacha_type,
            banner_image_url: banner.banner_image_url,
            is_active: true,
            metadata: banner.metadata
          }, {
            onConflict: 'name',
            ignoreDuplicates: false
          })
          .select()
          .single()

        if (error) {
          console.error(`❌ エラー: ${banner.name}`)
          console.error(`   ${error.message}`)
          gachaErrorCount++
        } else {
          console.log(`✅ 成功: ${banner.name} (ID: ${data.id})`)
          gachaSuccessCount++
        }

      } catch (err) {
        console.error(`❌ 処理エラー: ${banner.name}`)
        console.error(`   ${err.message}`)
        gachaErrorCount++
      }
    }

    // スタンドアロンバナーとしても登録（表示用）
    console.log('\n🎨 スタンドアロンバナーとして登録中...')
    
    let bannerSuccessCount = 0
    let bannerErrorCount = 0

    for (let i = 0; i < existingBanners.length; i++) {
      const banner = existingBanners[i]
      try {
        const { data, error } = await supabase
          .from('banners')
          .upsert({
            title: banner.name,
            subtitle: banner.gacha_type.toUpperCase() + 'ガチャ',
            description: banner.description,
            image_url: banner.banner_image_url,
            link_url: `/gacha/${banner.name.toLowerCase().replace(/[×\s]/g, '-')}`,
            link_type: 'gacha',
            priority: i + 1,
            is_active: true,
            background_color: '#1a1a1a',
            text_color: '#ffffff'
          }, {
            onConflict: 'title',
            ignoreDuplicates: false
          })
          .select()
          .single()

        if (error) {
          console.error(`❌ バナーエラー: ${banner.name}`)
          console.error(`   ${error.message}`)
          bannerErrorCount++
        } else {
          console.log(`✅ バナー成功: ${banner.name}`)
          bannerSuccessCount++
        }

      } catch (err) {
        console.error(`❌ バナー処理エラー: ${banner.name}`)
        console.error(`   ${err.message}`)
        bannerErrorCount++
      }
    }

    // 結果サマリー
    console.log('\n==========================================')
    console.log('🎯 格納結果サマリー:')
    console.log(`📊 ガチャ商品: 成功 ${gachaSuccessCount}件 / エラー ${gachaErrorCount}件`)
    console.log(`🎨 スタンドアロンバナー: 成功 ${bannerSuccessCount}件 / エラー ${bannerErrorCount}件`)
    console.log(`📁 合計バナーファイル: ${existingBanners.length}件`)
    console.log('==========================================')

    // 登録確認
    console.log('\n🔍 登録確認中...')
    
    const { data: gachaCheck } = await supabase
      .from('gacha_products')
      .select('name, banner_image_url, price, gacha_type')
      .order('created_at')

    if (gachaCheck && gachaCheck.length > 0) {
      console.log('\n✅ 登録済みガチャ商品:')
      gachaCheck.forEach(gacha => {
        console.log(`  🎰 ${gacha.name} (${gacha.gacha_type}) - ¥${gacha.price}`)
        console.log(`     📸 ${gacha.banner_image_url}`)
      })
    }

    const { data: bannerCheck } = await supabase
      .from('banners')
      .select('title, image_url, priority, is_active')
      .order('priority')

    if (bannerCheck && bannerCheck.length > 0) {
      console.log('\n✅ 登録済みスタンドアロンバナー:')
      bannerCheck.forEach(banner => {
        console.log(`  🎨 ${banner.title} (優先度: ${banner.priority}) - ${banner.is_active ? 'アクティブ' : '非アクティブ'}`)
      })
    }

    console.log('\n🎉 既存5つのバナーデザインの格納が完了しました！')
    console.log('\n管理画面での確認:')
    console.log('  • ガチャ管理: /admin/gacha')
    console.log('  • バナー管理: /admin/banners (実装予定)')
    console.log('  • 表示確認: / (ホームページ)')

  } catch (error) {
    console.error('❌ 格納処理エラー:', error)
  }
}

// 実行
storeExistingBanners()