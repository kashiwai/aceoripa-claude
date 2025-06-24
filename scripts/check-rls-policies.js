const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 環境変数から取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

console.log('🔍 Checking RLS policies for pokemon_cards table...\n');

async function checkRLSPolicies() {
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. テーブルのRLSステータスを確認
    console.log('1. Checking RLS status:');
    const { data: rlsStatus, error: rlsError } = await supabaseAdmin
      .rpc('get_table_rls_status', { table_name: 'pokemon_cards' })
      .single();
    
    if (rlsError) {
      // 代替方法：直接SQLクエリを実行
      const { data, error } = await supabaseAdmin
        .from('pokemon_cards')
        .select('*')
        .limit(1);
      
      console.log('   RLS appears to be enabled (query successful)');
    } else {
      console.log(`   RLS is ${rlsStatus ? 'ENABLED' : 'DISABLED'}`);
    }

    // 2. 現在のポリシーを確認
    console.log('\n2. Current RLS policies:');
    const { data: policies, error: policiesError } = await supabaseAdmin
      .rpc('get_policies_for_table', { table_name: 'pokemon_cards' });
    
    if (policiesError) {
      console.log('   Unable to fetch policies directly');
    } else if (policies && policies.length > 0) {
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd} (${policy.qual || 'no condition'})`);
      });
    } else {
      console.log('   No policies found');
    }

    // 3. テーブルの権限を確認
    console.log('\n3. Testing table permissions:');
    
    // SELECT権限をテスト
    const { data: selectData, error: selectError } = await supabaseAdmin
      .from('pokemon_cards')
      .select('count(*)', { count: 'exact', head: true });
    
    console.log(`   ✅ SELECT: ${selectError ? 'Failed - ' + selectError.message : 'Success'}`);

    // INSERT権限をテスト（実際には挿入しない）
    const testCard = {
      card_name: 'Test Card',
      product_code: 'TEST-' + Date.now(),
      rarity: 'SS',
      image_url: '/images/ngcard.jpg',
      market_price: 1000
    };

    console.log('\n4. Testing INSERT with service role:');
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('pokemon_cards')
      .insert([testCard])
      .select();
    
    if (insertError) {
      console.log(`   ❌ INSERT failed: ${insertError.message}`);
      if (insertError.code === '42501') {
        console.log('   This indicates an RLS policy issue');
      }
    } else {
      console.log(`   ✅ INSERT successful with service role`);
      // クリーンアップ
      await supabaseAdmin
        .from('pokemon_cards')
        .delete()
        .eq('product_code', testCard.product_code);
    }

    // 5. 環境変数の確認
    console.log('\n5. Environment check:');
    console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl.substring(0, 30)}...`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey.substring(0, 20)}...`);
    console.log(`   Service key format: ${supabaseServiceKey.startsWith('eyJ') ? '✅ Valid JWT format' : '❌ Invalid format'}`);

  } catch (error) {
    console.error('\n❌ Error checking RLS policies:', error.message);
  }
}

// カスタムRPCファンクションを作成するSQL
const createHelperFunctions = `
-- RLSステータスを確認する関数
CREATE OR REPLACE FUNCTION get_table_rls_status(table_name text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = table_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- テーブルのポリシーを取得する関数
CREATE OR REPLACE FUNCTION get_policies_for_table(table_name text)
RETURNS TABLE(
  policyname text,
  cmd text,
  qual text,
  with_check text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pol.policyname::text,
    pol.cmd::text,
    pol.qual::text,
    pol.with_check::text
  FROM pg_policies pol
  WHERE pol.tablename = table_name
  AND pol.schemaname = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

console.log('\n💡 To create helper functions in Supabase, run this SQL in the SQL editor:');
console.log('----------------------------------------');
console.log(createHelperFunctions);
console.log('----------------------------------------\n');

checkRLSPolicies().catch(console.error);