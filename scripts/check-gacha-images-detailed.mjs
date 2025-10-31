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

async function checkGachaImagesDetailed() {
  console.log('📊 ガチャ商品の画像を詳細確認中...\n')

  // すべてのガチャ商品を取得
  const { data: products, error } = await supabase
    .from('gacha_products')
    .select('id, name, banner_image_url, is_active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  console.log(`総ガチャ商品数: ${products.length}件\n`)

  products.forEach((product, i) => {
    const hasImage = product.banner_image_url ? '✅' : '❌'
    const status = product.is_active ? '🟢 Active' : '🔴 Inactive'

    console.log(`${i + 1}. ${hasImage} ${product.name} ${status}`)
    console.log(`   ID: ${product.id}`)

    if (product.banner_image_url) {
      console.log(`   画像URL: ${product.banner_image_url}`)
    } else {
      console.log(`   画像URL: なし`)
    }
    console.log('')
  })

  // 画像がない商品をカウント
  const withoutImages = products.filter(p => !p.banner_image_url)
  console.log(`\n📊 統計:`)
  console.log(`  画像あり: ${products.length - withoutImages.length}件`)
  console.log(`  画像なし: ${withoutImages.length}件`)
  console.log(`  Active: ${products.filter(p => p.is_active).length}件`)
  console.log(`  Inactive: ${products.filter(p => !p.is_active).length}件`)
}

checkGachaImagesDetailed().catch(console.error)
