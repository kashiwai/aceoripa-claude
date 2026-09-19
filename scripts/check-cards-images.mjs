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

async function checkCardsImages() {
  console.log('📊 カード画像の状況を確認中...\n')

  // 全カード数
  const { count: totalCards } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact', head: true })

  console.log(`総カード数: ${totalCards}`)

  // 画像URLがあるカード
  const { count: cardsWithImages } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact', head: true })
    .not('image_url', 'is', null)
    .neq('image_url', '')

  console.log(`画像URLがあるカード: ${cardsWithImages}`)
  console.log(`画像URLがないカード: ${totalCards - cardsWithImages}\n`)

  // サンプルカードを表示
  const { data: sampleCards } = await supabase
    .from('pokemon_cards')
    .select('id, card_name, image_url, rarity')
    .limit(10)

  console.log('サンプルカード（最初の10件）:')
  sampleCards?.forEach((card, i) => {
    const hasImage = card.image_url ? '✅' : '❌'
    console.log(`${i + 1}. ${hasImage} ${card.card_name} (${card.rarity})`)
    if (card.image_url) {
      console.log(`   URL: ${card.image_url.substring(0, 80)}...`)
    }
  })

  // ガチャ商品の画像状況
  console.log('\n🎰 ガチャ商品の画像状況:')
  const { data: gachaProducts } = await supabase
    .from('gacha_products')
    .select('id, name, image_url')
    .limit(10)

  gachaProducts?.forEach((product, i) => {
    const hasImage = product.image_url ? '✅' : '❌'
    console.log(`${i + 1}. ${hasImage} ${product.name}`)
    if (product.image_url) {
      console.log(`   URL: ${product.image_url.substring(0, 80)}...`)
    }
  })
}

checkCardsImages().catch(console.error)
