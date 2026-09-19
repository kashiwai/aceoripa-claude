import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// .env.localを読み込み
config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkImageStatus() {
  console.log('📊 データベースの画像状態を確認中...\n')

  // 全カード数
  const { count: totalCount } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact', head: true })

  console.log(`総カード数: ${totalCount}件`)

  // 画像ありカード（supabase.co を含む）
  const { count: withSupabaseImages } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact', head: true })
    .like('image_url', '%supabase.co%')

  console.log(`Supabase画像あり: ${withSupabaseImages}件`)

  // image_url が null
  const { count: nullImages } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact', head: true })
    .is('image_url', null)

  console.log(`image_url が null: ${nullImages}件`)

  // ngcard.jpg を含む
  const { count: ngcardImages } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact', head: true })
    .like('image_url', '%ngcard.jpg%')

  console.log(`ngcard.jpg: ${ngcardImages}件`)

  // 画像なし（null または ngcard.jpg または supabase.co を含まない）
  const withoutImages = totalCount - withSupabaseImages

  console.log(`\n画像なしカード: ${withoutImages}件`)
  console.log(`カバー率: ${((withSupabaseImages / totalCount) * 100).toFixed(1)}%`)

  // サンプルを取得
  console.log('\n━━━━━━━━━━━━━━━━━━━━')
  console.log('📝 画像なしカードのサンプル（5件）:')
  const { data: samples } = await supabase
    .from('pokemon_cards')
    .select('id, card_name, image_url')
    .not('image_url', 'like', '%supabase.co%')
    .limit(5)

  if (samples && samples.length > 0) {
    samples.forEach((card, i) => {
      console.log(`\n${i + 1}. ${card.card_name}`)
      console.log(`   ID: ${card.id}`)
      console.log(`   image_url: ${card.image_url || '(null)'}`)
    })
  } else {
    console.log('画像なしカードは見つかりませんでした')
  }
}

checkImageStatus().catch(console.error)
