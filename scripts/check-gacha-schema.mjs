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

async function checkGachaSchema() {
  console.log('📊 gacha_productsテーブルのカラムを確認中...\n')

  const { data, error } = await supabase
    .from('gacha_products')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  if (data && data.length > 0) {
    console.log('カラム一覧:')
    Object.keys(data[0]).forEach((column, i) => {
      console.log(`${i + 1}. ${column}: ${typeof data[0][column]}`)
    })
  } else {
    console.log('データがありません')
  }
}

checkGachaSchema().catch(console.error)
