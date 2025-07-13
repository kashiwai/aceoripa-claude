// Manual price scraping test
// このスクリプトは手動でスクレイピング機能をテストします

const fetch = require('node-fetch');
const cheerio = require('cheerio');

// リーリエの価格を手動でチェック
async function manualLillieCheck() {
  console.log('🔍 リーリエの価格を手動チェック開始...\n');
  
  // 1. カードラッシュをテスト
  console.log('📡 1. カードラッシュから価格取得テスト');
  try {
    const searchQuery = encodeURIComponent('リーリエ PROMO');
    const url = `https://cardrush.media/pokemon/buying_prices?search=${searchQuery}`;
    console.log(`URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });
    
    console.log(`レスポンス: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const html = await response.text();
      console.log(`HTML取得成功: ${html.length}文字`);
      
      // 簡単なパース
      const $ = cheerio.load(html);
      const tableRows = $('table tbody tr').length;
      console.log(`テーブル行数: ${tableRows}`);
      
      // リーリエ関連のテキストを検索
      const lillieMatches = html.toLowerCase().match(/リーリエ/g);
      console.log(`"リーリエ"の出現回数: ${lillieMatches ? lillieMatches.length : 0}`);
      
      // 価格パターンを検索
      const priceMatches = html.match(/¥[\d,]+/g);
      console.log(`価格パターン見つかった数: ${priceMatches ? priceMatches.length : 0}`);
      if (priceMatches) {
        console.log(`価格例: ${priceMatches.slice(0, 5).join(', ')}`);
      }
    } else {
      console.log('❌ カードラッシュアクセス失敗');
    }
  } catch (error) {
    console.error('❌ カードラッシュエラー:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 2. ポケカジラをテスト
  console.log('📡 2. ポケカジラから価格取得テスト');
  try {
    const searchQuery = encodeURIComponent('リーリエ');
    const url = `https://pokecazilla.com/search?q=${searchQuery}`;
    console.log(`URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });
    
    console.log(`レスポンス: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const html = await response.text();
      console.log(`HTML取得成功: ${html.length}文字`);
      
      // リーリエ関連のテキストを検索
      const lillieMatches = html.toLowerCase().match(/リーリエ/g);
      console.log(`"リーリエ"の出現回数: ${lillieMatches ? lillieMatches.length : 0}`);
      
      // 価格パターンを検索
      const priceMatches = html.match(/¥[\d,]+/g);
      console.log(`価格パターン見つかった数: ${priceMatches ? priceMatches.length : 0}`);
      if (priceMatches) {
        console.log(`価格例: ${priceMatches.slice(0, 5).join(', ')}`);
      }
    } else {
      console.log('❌ ポケカジラアクセス失敗');
    }
  } catch (error) {
    console.error('❌ ポケカジラエラー:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 3. 現在の相場情報を参考サイトからチェック
  console.log('📡 3. 参考サイトから現在のリーリエ相場をチェック');
  try {
    // メルカリの公開検索を試す
    const searchQuery = encodeURIComponent('リーリエ PSA10');
    const url = `https://mercari.com/jp/search/?keyword=${searchQuery}`;
    console.log(`URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });
    
    console.log(`レスポンス: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const html = await response.text();
      console.log(`HTML取得成功: ${html.length}文字`);
      
      // 価格パターンを検索
      const priceMatches = html.match(/¥[\d,]+/g);
      console.log(`価格パターン見つかった数: ${priceMatches ? priceMatches.length : 0}`);
      if (priceMatches) {
        console.log(`価格例: ${priceMatches.slice(0, 10).join(', ')}`);
      }
    } else {
      console.log('❌ メルカリアクセス失敗');
    }
  } catch (error) {
    console.error('❌ メルカリエラー:', error.message);
  }
  
  console.log('\n🔍 手動テスト完了');
  console.log('\n📋 結論:');
  console.log('- サイトへのアクセスができているかチェック');
  console.log('- HTMLの取得ができているかチェック');
  console.log('- 価格データの存在をチェック');
  console.log('- スクレイピング対象のサイト構造を確認');
}

manualLillieCheck().catch(console.error);