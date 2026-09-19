import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// デフォルトのガチャ画像URL
const DEFAULT_GACHA_IMAGE = 'https://vshkekffhjbvszzpagjt.supabase.co/storage/v1/object/public/gacha-images/default-gacha.jpg'

async function fixGachaImages() {
  console.log('🔧 ガチャ商品の画像を修正中...\n')

  // 画像URLがないガチャ商品を取得
  const { data: products, error } = await supabase
    .from('gacha_products')
    .select('id, name, banner_image_url')
    .or('banner_image_url.is.null,banner_image_url.eq.')

  if (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  console.log(`画像なしのガチャ商品: ${products.length}件\n`)

  for (const product of products) {
    console.log(`📝 ${product.name}`)

    // デフォルト画像を設定
    const { error: updateError } = await supabase
      .from('gacha_products')
      .update({ banner_image_url: DEFAULT_GACHA_IMAGE })
      .eq('id', product.id)

    if (updateError) {
      console.error(`  ❌ 更新失敗: ${updateError.message}`)
    } else {
      console.log(`  ✅ デフォルト画像を設定しました`)
    }
  }

  console.log(`\n🎉 完了！${products.length}件のガチャ商品に画像を設定しました`)
}

fixGachaImages().catch(console.error)
