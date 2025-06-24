const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 既存の5つのバナーデザインのガチャ商品データ（現在のスキーマに合わせて）
const existingBannerGachas = [
  {
    name: 'ピカチュウフェスティバル',
    description: 'ピカチュウの特別なフェスティバルガチャ！レアなピカチュウカードをゲットしよう！バナー画像: /images/banners/real-gacha/S__44392515_0.jpg',
    price: 300,
    total_prizes: 50,
    gacha_type: 'limited',
    metadata: {
      banner_image_url: '/images/banners/real-gacha/S__44392515_0.jpg',
      theme: 'ピカチュウフェスティバル',
      campaign_period: '2024年限定'
    }
  },
  {
    name: 'ナンジャモコレクション',
    description: 'ナンジャモの魅力的なカードコレクション！美麗イラストが満載！バナー画像: /images/banners/real-gacha/S__44392516_0.jpg',
    price: 500,
    total_prizes: 30,
    gacha_type: 'premium',
    metadata: {
      banner_image_url: '/images/banners/real-gacha/S__44392516_0.jpg',
      theme: 'ナンジャモコレクション',
      rarity_focus: 'SR以上確定'
    }
  },
  {
    name: 'リザードンプレミアム',
    description: 'リザードンの最強コレクション！プレミアムカードが目白押し！バナー画像: /images/banners/real-gacha/S__44392517_0.jpg',
    price: 800,
    total_prizes: 20,
    gacha_type: 'premium',
    metadata: {
      banner_image_url: '/images/banners/real-gacha/S__44392517_0.jpg',
      theme: 'リザードンプレミアム',
      guaranteed_rarity: 'SSR'
    }
  },
  {
    name: 'ブラッキースペシャル',
    description: 'ブラッキーの特別なスペシャルガチャ！闇属性の魅力を堪能！バナー画像: /images/banners/real-gacha/S__44392521_0.jpg',
    price: 400,
    total_prizes: 40,
    gacha_type: 'special',
    metadata: {
      banner_image_url: '/images/banners/real-gacha/S__44392521_0.jpg',
      theme: 'ブラッキースペシャル',
      type_focus: '悪タイプ'
    }
  },
  {
    name: 'リーリエ×マリオピカチュウ',
    description: 'リーリエとマリオピカチュウのコラボレーション！超レア限定ガチャ！バナー画像: /images/banners/real-gacha/S__44392523_0.jpg',
    price: 1000,
    total_prizes: 15,
    gacha_type: 'collaboration',
    metadata: {
      banner_image_url: '/images/banners/real-gacha/S__44392523_0.jpg',
      theme: 'リーリエ×マリオピカチュウ',
      collaboration: 'Nintendo × Pokemon'
    }
  }
]

async function storeExistingBannerGachasCurrentSchema() {
  console.log('=== 既存の5つのバナーデザインを現在のスキーマで格納 ===\n')

  // まず現在のスキーマを確認
  console.log('🔍 現在のガチャ商品テーブル構造を確認中...')
  const { data: existingGachas, error: schemaError } = await supabase
    .from('gacha_products')
    .select('*')
    .limit(1)

  if (schemaError) {
    console.error('スキーマエラー:', schemaError)
    return
  }

  console.log('✅ テーブル構造確認完了\n')

  let successCount = 0
  let errorCount = 0

  for (const gacha of existingBannerGachas) {
    try {
      console.log(`🎰 登録中: ${gacha.name}`)
      
      // 現在のスキーマに合わせてガチャ商品として登録
      const { data, error } = await supabase
        .from('gacha_products')
        .upsert({
          name: gacha.name,
          description: gacha.description,
          price: gacha.price,
          total_prizes: gacha.total_prizes,
          remaining_prizes: gacha.total_prizes,
          gacha_type: gacha.gacha_type,
          is_active: true,
          metadata: gacha.metadata
        }, {
          onConflict: 'name',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (error) {
        console.error(`❌ エラー: ${gacha.name}`)
        console.error(`   ${error.message}`)
        errorCount++
      } else {
        console.log(`✅ 成功: ${gacha.name} (ID: ${data.id})`)
        console.log(`   📸 バナー: ${gacha.metadata.banner_image_url}`)
        console.log(`   💰 価格: ¥${gacha.price}`)
        successCount++
      }

    } catch (err) {
      console.error(`❌ 処理エラー: ${gacha.name}`)
      console.error(`   ${err.message}`)
      errorCount++
    }
  }

  // 結果サマリー
  console.log('\n==========================================')
  console.log('🎯 格納結果:')
  console.log(`✅ 成功: ${successCount}件`)
  console.log(`❌ エラー: ${errorCount}件`)
  console.log(`📁 合計: ${existingBannerGachas.length}件`)
  console.log('==========================================')

  // 登録確認
  console.log('\n🔍 登録されたガチャ商品を確認中...')
  
  const { data: gachaCheck, error: checkError } = await supabase
    .from('gacha_products')
    .select('name, description, price, gacha_type, is_active, metadata')
    .order('created_at')

  if (checkError) {
    console.error('確認エラー:', checkError)
  } else if (gachaCheck && gachaCheck.length > 0) {
    console.log('\n✅ 登録済みガチャ商品:')
    gachaCheck.forEach((gacha, index) => {
      const bannerUrl = gacha.metadata?.banner_image_url || 'バナーURL不明'
      console.log(`  ${index + 1}. 🎰 ${gacha.name}`)
      console.log(`     📸 ${bannerUrl}`)
      console.log(`     💰 ¥${gacha.price} (${gacha.gacha_type})`)
      console.log(`     🔄 ${gacha.is_active ? 'アクティブ' : '非アクティブ'}`)
      console.log('')
    })
  } else {
    console.log('📭 ガチャ商品が見つかりませんでした')
  }

  console.log('🎉 既存5つのバナーデザインの格納が完了しました！')
  console.log('\n管理画面での確認:')
  console.log('  • ガチャ管理: /admin/gacha')
  console.log('  • ホームページ: / (バナーカルーセル)')
  console.log('\n注意: バナーURLはmetadataフィールドのbanner_image_urlに保存されています')
  console.log('バナーカルーセルコンポーネントがmetadataからバナーURLを読み取るように更新する必要があります')
}

// 実行
storeExistingBannerGachasCurrentSchema().catch(console.error)