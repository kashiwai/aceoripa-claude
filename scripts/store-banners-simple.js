const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 既存の5つのバナーデザインのガチャ商品データ
const existingBannerGachas = [
  {
    name: 'ピカチュウフェスティバル',
    description: 'ピカチュウの特別なフェスティバルガチャ！レアなピカチュウカードをゲットしよう！',
    banner_image_url: '/images/banners/real-gacha/S__44392515_0.jpg',
    price: 300,
    total_prizes: 50,
    gacha_type: 'limited'
  },
  {
    name: 'ナンジャモコレクション',
    description: 'ナンジャモの魅力的なカードコレクション！美麗イラストが満載！',
    banner_image_url: '/images/banners/real-gacha/S__44392516_0.jpg',
    price: 500,
    total_prizes: 30,
    gacha_type: 'premium'
  },
  {
    name: 'リザードンプレミアム',
    description: 'リザードンの最強コレクション！プレミアムカードが目白押し！',
    banner_image_url: '/images/banners/real-gacha/S__44392517_0.jpg',
    price: 800,
    total_prizes: 20,
    gacha_type: 'premium'
  },
  {
    name: 'ブラッキースペシャル',
    description: 'ブラッキーの特別なスペシャルガチャ！闇属性の魅力を堪能！',
    banner_image_url: '/images/banners/real-gacha/S__44392521_0.jpg',
    price: 400,
    total_prizes: 40,
    gacha_type: 'special'
  },
  {
    name: 'リーリエ×マリオピカチュウ',
    description: 'リーリエとマリオピカチュウのコラボレーション！超レア限定ガチャ！',
    banner_image_url: '/images/banners/real-gacha/S__44392523_0.jpg',
    price: 1000,
    total_prizes: 15,
    gacha_type: 'collaboration'
  }
]

async function storeExistingBannerGachas() {
  console.log('=== 既存の5つのバナーデザインをガチャ商品として格納 ===\n')

  let successCount = 0
  let errorCount = 0

  for (const gacha of existingBannerGachas) {
    try {
      console.log(`🎰 登録中: ${gacha.name}`)
      
      // ガチャ商品として登録（banner_image_urlフィールドを使用）
      const { data, error } = await supabase
        .from('gacha_products')
        .upsert({
          name: gacha.name,
          description: gacha.description,
          price: gacha.price,
          total_prizes: gacha.total_prizes,
          remaining_prizes: gacha.total_prizes,
          gacha_type: gacha.gacha_type,
          banner_image_url: gacha.banner_image_url,
          is_active: true
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
        console.log(`   📸 バナー: ${gacha.banner_image_url}`)
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
    .select('name, banner_image_url, price, gacha_type, is_active')
    .order('created_at')

  if (checkError) {
    console.error('確認エラー:', checkError)
  } else if (gachaCheck && gachaCheck.length > 0) {
    console.log('\n✅ 登録済みガチャ商品:')
    gachaCheck.forEach((gacha, index) => {
      console.log(`  ${index + 1}. 🎰 ${gacha.name}`)
      console.log(`     📸 ${gacha.banner_image_url || 'バナーなし'}`)
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
  console.log('\n注意: バナーはガチャ商品のbanner_image_urlフィールドに保存されています')
}

// 実行
storeExistingBannerGachas().catch(console.error)