# ACEORIPA Admin API 統合ガイド

## 🚀 概要

このガイドでは、ACEORIPA Admin APIの統合方法と各チームとの連携ポイントを説明します。

## 🔐 認証セットアップ

### 1. 環境変数設定

```env
# .env.local
ADMIN_EMAIL=admin@aceoripa.com
ADMIN_PASSWORD=AceoripaAdmin2024!
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Admin認証フロー

```javascript
// Admin login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@aceoripa.com',
    password: 'AceoripaAdmin2024!'
  })
});

const { session } = await loginResponse.json();
const jwt = session.access_token;

// Subsequent API calls
const response = await fetch('/api/admin/dashboard', {
  headers: {
    'Authorization': `Bearer ${jwt}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🎯 チーム別連携ポイント

### 🖥️ フロントエンドチーム

#### 必要なAPI エンドポイント

```javascript
// 1. 公開ガチャ一覧
const getGachaProducts = async () => {
  const response = await fetch('/api/gacha/products?active=true');
  return response.json();
};

// 2. ガチャ実行
const executeGacha = async (productId, count = 1) => {
  const response = await fetch('/api/gacha/execute', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userJWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ product_id: productId, count })
  });
  return response.json();
};

// 3. ユーザーポイント残高
const getUserPoints = async () => {
  const response = await fetch('/api/user/points', {
    headers: { 'Authorization': `Bearer ${userJWT}` }
  });
  return response.json();
};
```

#### 実装例: ガチャページ

```tsx
'use client';
import { useState, useEffect } from 'react';

export default function GachaPage() {
  const [products, setProducts] = useState([]);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    loadGachaProducts();
    loadUserPoints();
  }, []);

  const loadGachaProducts = async () => {
    try {
      const { products } = await getGachaProducts();
      setProducts(products);
    } catch (error) {
      console.error('Failed to load gacha products:', error);
    }
  };

  const executeGachaPull = async (productId) => {
    try {
      const result = await executeGacha(productId);
      if (result.success) {
        // アニメーション実行
        showGachaAnimation(result.results);
        // ポイント更新
        setUserPoints(result.remaining_points);
      }
    } catch (error) {
      console.error('Gacha execution failed:', error);
    }
  };

  return (
    <div>
      <div>現在のポイント: {userPoints}</div>
      {products.map(product => (
        <GachaCard 
          key={product.id} 
          product={product} 
          onExecute={() => executeGachaPull(product.id)}
        />
      ))}
    </div>
  );
}
```

---

### 🎨 バナー生成チーム

#### API 統合手順

```javascript
// 1. バナー生成API
const generateBanner = async (gachaData) => {
  const response = await fetch('/api/generate-banner', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminJWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      gacha_id: gachaData.id,
      style: gachaData.rarity,
      text: gachaData.name,
      format: 'mobile' // mobile, square, wide
    })
  });
  return response.json();
};

// 2. 生成完了後、ガチャ情報更新
const updateGachaBanner = async (gachaId, bannerUrl) => {
  const response = await fetch(`/api/admin/gacha/${gachaId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminJWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      banner_image_url: bannerUrl
    })
  });
  return response.json();
};
```

#### 自動化ワークフロー例

```javascript
// バナー自動生成システム
class BannerGenerationWorkflow {
  async processNewGacha(gachaId) {
    try {
      // 1. ガチャ情報取得
      const gacha = await this.getGachaDetails(gachaId);
      
      // 2. 複数フォーマットでバナー生成
      const formats = ['mobile', 'square', 'wide'];
      const banners = {};
      
      for (const format of formats) {
        const result = await generateBanner({
          ...gacha,
          format
        });
        banners[format] = result.banner_url;
      }
      
      // 3. ガチャ情報にバナーURL更新
      await updateGachaBanner(gachaId, banners.mobile);
      
      // 4. 生成ログ記録
      console.log(`✅ Banners generated for gacha ${gachaId}:`, banners);
      
      return banners;
    } catch (error) {
      console.error(`❌ Banner generation failed for ${gachaId}:`, error);
      throw error;
    }
  }
}
```

---

### 💳 課金・決済チーム

#### 売上データ取得

```javascript
// 1. ダッシュボード統計
const getSalesData = async (period = 'month') => {
  const response = await fetch(`/api/admin/dashboard`, {
    headers: { 'Authorization': `Bearer ${adminJWT}` }
  });
  const data = await response.json();
  return data.stats.sales;
};

// 2. 詳細取引履歴
const getTransactionHistory = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/transactions?${params}`, {
    headers: { 'Authorization': `Bearer ${adminJWT}` }
  });
  return response.json();
};
```

#### 売上分析レポート生成

```javascript
class SalesAnalytics {
  async generateMonthlyReport(year, month) {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    const transactions = await getTransactionHistory({
      start_date: startDate,
      end_date: endDate,
      status: 'completed'
    });
    
    const report = {
      period: `${year}-${month}`,
      total_revenue: transactions.reduce((sum, t) => sum + t.amount, 0),
      transaction_count: transactions.length,
      average_transaction: transactions.length > 0 
        ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length 
        : 0,
      top_gacha: this.getTopPerformingGacha(transactions),
      daily_breakdown: this.getDailyBreakdown(transactions)
    };
    
    return report;
  }
  
  getTopPerformingGacha(transactions) {
    const gachaStats = {};
    transactions.forEach(t => {
      if (!gachaStats[t.gacha_products.name]) {
        gachaStats[t.gacha_products.name] = {
          revenue: 0,
          count: 0
        };
      }
      gachaStats[t.gacha_products.name].revenue += t.amount;
      gachaStats[t.gacha_products.name].count += 1;
    });
    
    return Object.entries(gachaStats)
      .sort(([,a], [,b]) => b.revenue - a.revenue)
      .slice(0, 5);
  }
}
```

---

## 🔧 開発・テスト環境

### ローカル開発セットアップ

```bash
# 1. 依存関係インストール
npm install

# 2. 環境変数設定
cp .env.example .env.local
# .env.localを編集

# 3. データベースセットアップ
npx supabase start
npx supabase db reset

# 4. 開発サーバー起動
npm run dev
```

### API テストツール

```javascript
// test-admin-api.js
class AdminAPITester {
  constructor(baseURL, adminJWT) {
    this.baseURL = baseURL;
    this.headers = {
      'Authorization': `Bearer ${adminJWT}`,
      'Content-Type': 'application/json'
    };
  }
  
  async testDashboard() {
    const response = await fetch(`${this.baseURL}/api/admin/dashboard`, {
      headers: this.headers
    });
    return this.handleResponse(response, 'Dashboard API');
  }
  
  async testGachaManagement() {
    // GET: ガチャ一覧
    const listResponse = await fetch(`${this.baseURL}/api/admin/gacha`, {
      headers: this.headers
    });
    const listResult = await this.handleResponse(listResponse, 'Gacha List');
    
    // POST: 新規ガチャ作成
    const createResponse = await fetch(`${this.baseURL}/api/admin/gacha`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        name: 'テスト用ガチャ',
        single_price: 500,
        multi_price: 5000,
        description: 'API テスト用'
      })
    });
    const createResult = await this.handleResponse(createResponse, 'Gacha Create');
    
    return { list: listResult, create: createResult };
  }
  
  async handleResponse(response, testName) {
    const data = await response.json();
    const success = response.ok;
    
    console.log(`${success ? '✅' : '❌'} ${testName}:`, {
      status: response.status,
      success,
      data: success ? 'OK' : data.error
    });
    
    return { success, data };
  }
}

// 使用例
const tester = new AdminAPITester('http://localhost:3001', 'your_jwt_token');
await tester.testDashboard();
await tester.testGachaManagement();
```

---

## 🚨 エラーハンドリング

### 共通エラーパターン

```javascript
// API呼び出し共通関数
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new APIError(data.error, response.status, data);
    }
    
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error', 0, { original: error.message });
  }
}

class APIError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

// 使用例
try {
  const result = await apiCall('/api/admin/dashboard', {
    headers: { 'Authorization': `Bearer ${jwt}` }
  });
} catch (error) {
  if (error.status === 401) {
    // 認証エラー - ログイン画面へリダイレクト
    redirectToLogin();
  } else if (error.status === 403) {
    // 権限エラー
    showErrorMessage('管理者権限が必要です');
  } else {
    // その他のエラー
    showErrorMessage(`エラーが発生しました: ${error.message}`);
  }
}
```

---

## 📊 監視・ログ

### API監視ダッシュボード

```javascript
// api-monitor.js
class APIMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: []
    };
  }
  
  logRequest(endpoint, method, responseTime, status) {
    this.metrics.requests++;
    this.metrics.responseTime.push(responseTime);
    
    if (status >= 400) {
      this.metrics.errors++;
    }
    
    console.log(`📊 API Monitor: ${method} ${endpoint} - ${status} (${responseTime}ms)`);
  }
  
  getHealthStatus() {
    const errorRate = this.metrics.errors / this.metrics.requests;
    const avgResponseTime = this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length;
    
    return {
      health: errorRate < 0.05 && avgResponseTime < 1000 ? 'healthy' : 'warning',
      errorRate: (errorRate * 100).toFixed(2) + '%',
      avgResponseTime: avgResponseTime.toFixed(2) + 'ms',
      totalRequests: this.metrics.requests
    };
  }
}
```

---

## 🎉 完了チェックリスト

### フロントエンドチーム
- [ ] ガチャ一覧表示
- [ ] ガチャ実行機能
- [ ] ポイント残高表示
- [ ] エラーハンドリング

### バナー生成チーム
- [ ] バナー生成API統合
- [ ] 自動バナー更新
- [ ] 複数フォーマット対応
- [ ] 生成ログ記録

### 課金チーム
- [ ] 売上データ取得
- [ ] 取引履歴分析
- [ ] レポート生成
- [ ] 監視システム

**🚀 全てのチームがこのAPIを使って効率的に開発を進められます！**