# Aceoripa API リファレンス

## 概要
AceoripaのAPIエンドポイント一覧と使用方法をまとめたドキュメントです。

## 認証
すべてのAPIリクエストには認証が必要です（一部の公開APIを除く）。

### 認証ヘッダー
```
Authorization: Bearer <token>
```

## API エンドポイント一覧

### 1. 認証 (Authentication)

#### POST /api/auth/login
ユーザーログイン
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "ユーザー名"
  },
  "token": "jwt_token"
}
```

#### POST /api/auth/logout
ログアウト

#### GET /api/auth/me
現在のユーザー情報取得

### 2. ガチャ商品 (Gacha Products)

#### GET /api/gacha/products
ガチャ商品一覧取得
```json
Response:
{
  "products": [
    {
      "id": "uuid",
      "name": "ポケモンカード151",
      "description": "説明文",
      "single_price": 800,
      "multi_price": 8000,
      "banner_image_url": "https://...",
      "is_active": true,
      "remaining": 1100,
      "total": 3000
    }
  ]
}
```

#### POST /api/gacha/execute
ガチャ実行
```json
Request:
{
  "product_id": "uuid",
  "count": 10
}

Response:
{
  "results": [
    {
      "card_id": "uuid",
      "card_name": "リザードンex",
      "rarity": "SSR",
      "card_image": "https://..."
    }
  ],
  "transaction_id": "uuid",
  "remaining_points": 7000
}
```

### 3. カード管理 (Cards)

#### GET /api/cards
カード一覧取得
```json
Query Parameters:
- rarity: SSR, SR, R, N
- category: pokemon, onepiece, etc
- limit: 数値（デフォルト: 20）
- offset: 数値（デフォルト: 0）

Response:
{
  "cards": [
    {
      "id": "uuid",
      "name": "リザードンex",
      "rarity": "SSR",
      "image_url": "https://...",
      "category": "pokemon"
    }
  ],
  "total": 150
}
```

### 4. ユーザー管理 (User)

#### GET /api/user/points
ユーザーポイント取得
```json
Response:
{
  "free_points": 1000,
  "paid_points": 5000,
  "total_points": 6000
}
```

#### GET /api/user/cards
ユーザー所持カード一覧
```json
Response:
{
  "cards": [
    {
      "id": "uuid",
      "card": {
        "name": "リザードンex",
        "rarity": "SSR",
        "image_url": "https://..."
      },
      "obtained_at": "2024-06-20T10:00:00Z",
      "is_favorite": false
    }
  ]
}
```

### 5. 管理画面専用 (Admin Only)

#### GET /api/admin/stats
統計情報取得
```json
Response:
{
  "users": {
    "total": 1234,
    "new_today": 56,
    "new_this_month": 789
  },
  "sales": {
    "today": 150000,
    "yesterday": 120000,
    "this_month": 3500000,
    "last_month": 3200000
  },
  "gacha": {
    "active_products": 12,
    "total_draws_today": 456
  }
}
```

#### POST /api/admin/cards/import
カード一括インポート（CSV）
```
Content-Type: multipart/form-data
File: cards.csv
```

### 6. 画像生成 (Image Generation)

#### POST /api/generate-banner
バナー画像生成
```json
Request:
{
  "title": "新ガチャ登場",
  "subtitle": "SSR確率UP",
  "style": "premium",
  "category": "pokemon"
}

Response:
{
  "image_url": "https://...",
  "generation_id": "uuid"
}
```

#### POST /api/ai-video-generate
AI動画生成
```json
Request:
{
  "template": "ssr_explosion",
  "card_name": "リザードンex",
  "duration": 3
}

Response:
{
  "video_url": "https://...",
  "thumbnail_url": "https://...",
  "generation_id": "uuid"
}
```

### 7. 通知 (Notifications)

#### POST /api/notifications/subscribe
プッシュ通知購読
```json
Request:
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

#### POST /api/notifications/send
通知送信（Admin Only）
```json
Request:
{
  "title": "新ガチャ登場！",
  "body": "ポケモンカード151が登場しました",
  "icon": "/icon-192x192.png",
  "badge": "/badge-72x72.png",
  "data": {
    "url": "/gacha/1"
  }
}
```

## エラーレスポンス

すべてのAPIは以下の形式でエラーを返します：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {}
  }
}
```

### エラーコード一覧
- `UNAUTHORIZED`: 認証エラー
- `FORBIDDEN`: 権限エラー
- `NOT_FOUND`: リソースが見つからない
- `BAD_REQUEST`: リクエスト不正
- `INSUFFICIENT_POINTS`: ポイント不足
- `SERVER_ERROR`: サーバーエラー

## レート制限

- 一般API: 100リクエスト/分
- 画像生成API: 10リクエスト/分
- ガチャ実行API: 30リクエスト/分

## 開発環境

### ローカル開発
```
http://localhost:3000/api/...
```

### ステージング環境
```
https://staging.aceoripa.com/api/...
```

### 本番環境
```
https://aceoripa.com/api/...
```