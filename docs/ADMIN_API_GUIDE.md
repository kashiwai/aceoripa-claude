# Admin API 統合ガイド

## 概要
Aceoripa管理画面のAPI統合方法と、フロントエンド・バナー生成システムとの連携方法をまとめたガイドです。

## API構成

### 1. Admin専用APIエンドポイント

```
/api/admin/
├── dashboard/          # ダッシュボード統計
├── gacha/             # ガチャ管理CRUD
│   └── [id]/
│       └── pools/     # 確率設定
├── cards/             # カード管理
│   ├── import/        # CSV一括インポート
│   └── sample-csv/    # サンプルCSVダウンロード
└── stats/             # 詳細統計
```

### 2. 共通API（フロント・Admin両方で使用）

```
/api/
├── auth/              # 認証
├── gacha/
│   ├── products/      # ガチャ商品一覧
│   └── execute/       # ガチャ実行
├── user/
│   ├── points/        # ポイント管理
│   └── cards/         # 所持カード
└── generate-banner/   # バナー生成
```

## 連携フロー

### 1. ガチャ作成から公開までの流れ

```javascript
// 1. Admin: 新規ガチャ作成
const response = await fetch('/api/admin/gacha', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'ポケモンカード151',
    description: '限定カード多数！',
    single_price: 800,
    multi_price: 8000,
    is_active: false // 一旦非公開で作成
  })
})

const { product } = await response.json()

// 2. Admin: カードプール設定
await fetch(`/api/admin/gacha/${product.id}/pools`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    cards: [
      { card_id: 'xxx', drop_rate: 300 },  // SSR: 3%
      { card_id: 'yyy', drop_rate: 1200 }, // SR: 12%
      // ...
    ]
  })
})

// 3. バナー生成: AI画像生成
const bannerResponse = await fetch('/api/generate-banner', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: product.name,
    style: 'premium',
    category: 'pokemon'
  })
})

const { image_url } = await bannerResponse.json()

// 4. Admin: バナーURL更新＆公開
await fetch(`/api/admin/gacha/${product.id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    banner_image_url: image_url,
    is_active: true // 公開
  })
})
```

### 2. リアルタイムデータ同期

```javascript
// Admin Dashboard
const getDashboardData = async () => {
  const response = await fetch('/api/admin/dashboard')
  const data = await response.json()
  
  // データ構造
  // {
  //   stats: {
  //     users: { total, new_today, new_this_month },
  //     sales: { today, this_month, average_per_transaction },
  //     gacha: { active_count, total_draws_today }
  //   },
  //   charts: { daily_sales: [...] },
  //   recent_transactions: [...],
  //   popular_gacha: [...]
  // }
  
  return data
}

// 定期的に更新（WebSocketまたはポーリング）
setInterval(getDashboardData, 30000) // 30秒ごと
```

### 3. フロントエンドとの連携

```javascript
// Frontend: ガチャ一覧取得（公開されているもののみ）
const getPublicGacha = async () => {
  const response = await fetch('/api/gacha/products')
  const { products } = await response.json()
  
  // is_active=trueのガチャのみ返される
  return products
}

// Frontend: ガチャ実行
const executeGacha = async (productId, count) => {
  const response = await fetch('/api/gacha/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      product_id: productId,
      count: count
    })
  })
  
  const { results, remaining_points } = await response.json()
  return { results, remaining_points }
}
```

## セキュリティ考慮事項

### 1. 認証・認可

```javascript
// Adminルートの保護
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const token = request.headers.get('authorization')?.split(' ')[1]
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // トークン検証とAdmin権限チェック
    const isAdmin = await verifyAdminToken(token)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }
  
  return NextResponse.next()
}
```

### 2. レート制限

```javascript
// API レート制限の実装例
const rateLimiter = new Map()

export function rateLimit(identifier: string, limit: number = 100) {
  const now = Date.now()
  const windowStart = now - 60000 // 1分間
  
  const requests = rateLimiter.get(identifier) || []
  const recentRequests = requests.filter((time: number) => time > windowStart)
  
  if (recentRequests.length >= limit) {
    throw new Error('Rate limit exceeded')
  }
  
  recentRequests.push(now)
  rateLimiter.set(identifier, recentRequests)
}
```

## データフロー図

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Admin UI  │────▶│  Admin API  │────▶│  Supabase   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    ▲
       │                    ▼                    │
       │            ┌─────────────┐              │
       └───────────▶│ Banner Gen  │              │
                    └─────────────┘              │
                            │                    │
                            ▼                    │
                    ┌─────────────┐              │
                    │ Frontend UI │──────────────┘
                    └─────────────┘
```

## エラーハンドリング

```javascript
// 統一エラーレスポンス
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
  }
}

// 使用例
try {
  // API処理
} catch (error) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      },
      { status: error.statusCode }
    )
  }
  
  // 予期しないエラー
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
    { status: 500 }
  )
}
```

## 開発ツール

### Postmanコレクション
`/docs/postman/aceoripa-admin-api.json`

### APIテストスクリプト
```bash
# Admin API テスト実行
npm run test:api:admin

# 統合テスト
npm run test:integration
```

## トラブルシューティング

### よくある問題

1. **CORS エラー**
   - Next.jsのAPI Routeは同一オリジンのみ
   - 外部からのアクセスは`next.config.js`で設定

2. **認証エラー**
   - トークンの有効期限確認
   - Admin権限の確認

3. **データ同期の遅延**
   - Supabaseのリアルタイム機能を活用
   - キャッシュ戦略の見直し