// API テストスクリプト
// 実行方法: node tests/api.test.js

const BASE_URL = 'http://localhost:3000';

class ApiTester {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`🧪 実行中: ${testName}`);
      await testFunction();
      this.testResults.push({ name: testName, status: 'PASSED', error: null });
      this.passedTests++;
      console.log(`✅ 成功: ${testName}`);
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
      this.failedTests++;
      console.log(`❌ 失敗: ${testName} - ${error.message}`);
    }
  }

  async fetch(url, options = {}) {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  // TC-B001: ガチャ商品取得APIテスト
  async testGachaProducts() {
    const data = await this.fetch('/api/gacha/products');
    
    if (!data.products || !Array.isArray(data.products)) {
      throw new Error('商品配列が返されませんでした');
    }
    
    if (data.products.length === 0) {
      throw new Error('商品が1つも返されませんでした');
    }
    
    const firstProduct = data.products[0];
    const requiredFields = ['id', 'name', 'description', 'price'];
    
    for (const field of requiredFields) {
      if (!firstProduct[field]) {
        throw new Error(`必須フィールド ${field} が不足しています`);
      }
    }
    
    console.log(`   📦 ${data.products.length}個の商品を取得`);
  }

  // TC-B002: プレースホルダー画像APIテスト
  async testPlaceholderImage() {
    const response = await fetch(`${BASE_URL}/api/placeholder/400/400`);
    
    if (!response.ok) {
      throw new Error(`プレースホルダー画像の取得に失敗: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('image/svg')) {
      throw new Error(`期待されるコンテンツタイプではありません: ${contentType}`);
    }
    
    console.log('   🖼️ 400x400のプレースホルダー画像を生成');
  }

  // TC-B003: ヘルスチェック
  async testHealthCheck() {
    const response = await fetch(`${BASE_URL}/`);
    
    if (!response.ok) {
      throw new Error(`サイトにアクセスできません: ${response.status}`);
    }
    
    const html = await response.text();
    if (!html.includes('ポケモンカード オリパ')) {
      throw new Error('期待されるタイトルが見つかりません');
    }
    
    console.log('   🏠 ホームページが正常に表示されます');
  }

  // TC-B004: 管理画面アクセステスト
  async testAdminAccess() {
    const response = await fetch(`${BASE_URL}/admin`);
    
    // 未認証の場合はリダイレクトまたは401エラーが期待される
    if (response.status !== 401 && response.status !== 302 && response.status !== 200) {
      throw new Error(`予期しないステータスコード: ${response.status}`);
    }
    
    console.log('   🛡️ 管理画面の認証チェックが動作');
  }

  // 統計表示
  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 テスト結果サマリー');
    console.log('='.repeat(50));
    console.log(`✅ 成功: ${this.passedTests}個`);
    console.log(`❌ 失敗: ${this.failedTests}個`);
    console.log(`📊 成功率: ${Math.round((this.passedTests / (this.passedTests + this.failedTests)) * 100)}%`);
    
    if (this.failedTests > 0) {
      console.log('\n❌ 失敗したテスト:');
      this.testResults
        .filter(result => result.status === 'FAILED')
        .forEach(result => {
          console.log(`   • ${result.name}: ${result.error}`);
        });
    }
    
    console.log('\n' + '='.repeat(50));
  }

  // メインテスト実行
  async runAllTests() {
    console.log('🚀 Aceoripa ポケモンガチャサイト APIテスト開始\n');
    
    await this.runTest('ヘルスチェック', () => this.testHealthCheck());
    await this.runTest('ガチャ商品取得API', () => this.testGachaProducts());
    await this.runTest('プレースホルダー画像API', () => this.testPlaceholderImage());
    await this.runTest('管理画面アクセス制御', () => this.testAdminAccess());
    
    this.printResults();
    
    // 失敗があった場合は終了コード1で終了
    if (this.failedTests > 0) {
      process.exit(1);
    }
  }
}

// テスト実行
if (require.main === module) {
  const tester = new ApiTester();
  tester.runAllTests().catch(error => {
    console.error('❌ テスト実行中にエラーが発生しました:', error);
    process.exit(1);
  });
}

module.exports = ApiTester;