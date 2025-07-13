// リーリエの価格調査テストスクリプト
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testLilliePriceCheck() {
  console.log('🔍 リーリエカード価格調査開始...');
  
  try {
    // 1. リーリエカードをDBから検索
    console.log('\n📋 Step 1: DBからリーリエカードを検索');
    const { data: lillieCards, error: searchError } = await supabase
      .from('pokemon_cards')
      .select('*')
      .ilike('card_name', '%リーリエ%')
      .order('market_price', { ascending: false });
    
    if (searchError) {
      console.error('❌ 検索エラー:', searchError);
      return;
    }
    
    console.log(`✅ 見つかったリーリエカード: ${lillieCards?.length || 0}枚`);
    lillieCards?.forEach((card, index) => {
      console.log(`${index + 1}. ${card.card_name} - ¥${card.market_price?.toLocaleString()} (ID: ${card.id})`);
    });
    
    // 2. 最も高価なリーリエカードの価格を実際にチェック
    if (lillieCards && lillieCards.length > 0) {
      const topLillie = lillieCards[0];
      console.log(`\n🎯 Step 2: ${topLillie.card_name} の現在価格を調査`);
      console.log(`現在のDB価格: ¥${topLillie.market_price?.toLocaleString()}`);
      
      // 3. 価格監視APIを呼び出し
      console.log('\n📡 Step 3: 価格監視APIでリアルタイム価格取得');
      
      const priceCheckResponse = await fetch('http://localhost:3000/api/admin/price-monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cardId: topLillie.id,
          cardName: topLillie.card_name,
          productCode: topLillie.product_code
        })
      });
      
      if (priceCheckResponse.ok) {
        const priceResult = await priceCheckResponse.json();
        console.log('✅ 価格取得成功:');
        console.log(`- 平均価格: ¥${priceResult.data.averagePrice?.toLocaleString()}`);
        console.log(`- 最低価格: ¥${priceResult.data.minPrice?.toLocaleString()}`);
        console.log(`- 最高価格: ¥${priceResult.data.maxPrice?.toLocaleString()}`);
        console.log(`- 取得価格数: ${priceResult.data.prices?.length}件`);
        console.log(`- 価格変動: ${priceResult.data.priceChange?.changePercentage}% (${priceResult.data.priceChange?.changeType})`);
        
        if (priceResult.data.prices) {
          console.log('\n📊 取得した価格詳細:');
          priceResult.data.prices.forEach((price, index) => {
            console.log(`${index + 1}. ${price.source}: ¥${price.price?.toLocaleString()} (${price.condition})`);
          });
        }
      } else {
        console.error('❌ 価格取得API失敗:', priceCheckResponse.status);
        const errorText = await priceCheckResponse.text();
        console.error('エラー詳細:', errorText);
      }
      
      // 4. 更新後のDB価格を確認
      console.log('\n🔄 Step 4: 更新後のDB価格を確認');
      const { data: updatedCard } = await supabase
        .from('pokemon_cards')
        .select('market_price')
        .eq('id', topLillie.id)
        .single();
      
      if (updatedCard) {
        console.log(`更新後のDB価格: ¥${updatedCard.market_price?.toLocaleString()}`);
        if (updatedCard.market_price !== topLillie.market_price) {
          console.log('✅ 価格が更新されました！');
        } else {
          console.log('⚠️ 価格は変更されませんでした');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
  }
}

// 環境変数チェック
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 環境変数が設定されていません');
  console.log('以下の環境変数を.env.localに設定してください:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
} else {
  testLilliePriceCheck();
}