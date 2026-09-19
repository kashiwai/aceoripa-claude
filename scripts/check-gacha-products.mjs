import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vshkekffhjbvszzpagjt.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkGachaProducts() {
  console.log('=== ガチャ商品テーブル確認 ===\n')

  const { data, error } = await supabase
    .from('gacha_products')
    .select('id, name, price, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('エラー:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('ガチャ商品が見つかりません')
    return
  }

  console.log(`${data.length}件のガチャ商品が見つかりました:\n`)
  data.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`)
    console.log(`   ID: ${product.id}`)
    console.log(`   価格: ${product.price} ポイント`)
    console.log(`   状態: ${product.is_active ? '有効' : '無効'}`)
    console.log(`   作成日: ${product.created_at}`)
    console.log('')
  })
}

checkGachaProducts()
