import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

config({ path: path.join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function getAllCardsWithoutImages() {
  const { data, error } = await supabase
    .from('pokemon_cards')
    .select('id, card_name, product_code')
    .not('image_url', 'like', '%supabase.co%')
    .order('card_name')

  if (error) {
    console.error('エラー:', error)
    return
  }

  console.log(`\n画像なしカード: ${data.length}件\n`)
  console.log('='.repeat(60))

  data.forEach((card, i) => {
    console.log(`${i + 1}. ${card.card_name}`)
  })

  console.log('='.repeat(60))
  console.log(`\n合計: ${data.length}件`)
}

getAllCardsWithoutImages().catch(console.error)
