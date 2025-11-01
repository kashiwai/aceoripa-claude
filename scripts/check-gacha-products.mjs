import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vshkekffhjbvszzpagjt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'

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
