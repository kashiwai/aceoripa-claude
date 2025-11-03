import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vshkekffhjbvszzpagjt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addTestPackage() {
  console.log('=== 10円テストパッケージの追加 ===\n')

  // まずテーブルが存在するか確認
  const { data: existingData, error: checkError } = await supabase
    .from('point_packages')
    .select('*')
    .limit(1)

  if (checkError) {
    if (checkError.code === '42P01') {
      console.log('⚠️ point_packagesテーブルが存在しません。')
      console.log('Supabaseのダッシュボードで手動でテーブルを作成する必要があります。')
      return
    } else {
      console.error('❌ エラー:', checkError.message)
      return
    }
  }

  // 10円テストパッケージを追加
  const testPackage = {
    id: 'pack_test_10',
    name: '10円テストパック（10ポイント）',
    points: 10,
    bonus: 0,
    price: 10,
    is_active: true,
    is_popular: false,
    sort_order: 0
  }

  console.log('追加するパッケージ:', testPackage)
  console.log()

  const { data, error } = await supabase
    .from('point_packages')
    .upsert(testPackage, { onConflict: 'id' })
    .select()

  if (error) {
    console.error('❌ パッケージ追加エラー:', error.message)
    console.error('詳細:', error)
  } else {
    console.log('✅ 10円テストパッケージを追加しました！')
    console.log('データ:', data)
    console.log('\n本番環境で利用可能になりました。')
  }

  // 全パッケージを確認
  console.log('\n=== 現在のパッケージ一覧 ===')
  const { data: allPackages } = await supabase
    .from('point_packages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (allPackages && allPackages.length > 0) {
    allPackages.forEach((pkg, i) => {
      console.log(`${i + 1}. ${pkg.name} - ${pkg.points}pt (+${pkg.bonus}ボーナス) - ¥${pkg.price}`)
    })
  } else {
    console.log('（パッケージが0件です）')
  }
}

addTestPackage()
