# ACEORIPA API Reference

## 概要

ACEORIPA ポケモンカードオリパサイトのAPI仕様書です。

### Base URL
- 開発環境: `http://localhost:3001/api`
- 本番環境: `https://aceoripa.com/api`

### 認証方式
- **Supabase Auth** - JWT Token認証
- **Admin API** - 管理者メール認証

---

## 📊 Admin Dashboard API

### GET /api/admin/dashboard
管理画面ダッシュボード用の統計データを取得

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response
```json
{
  "stats": {
    "users": {
      "total": 1250,
      "new_today": 12,
      "new_this_month": 340
    },
    "sales": {
      "today": 45000,
      "this_month": 1200000,
      "average_per_transaction": 750
    },
    "gacha": {
      "active_count": 8,
      "total_draws_today": 60
    }
  },
  "charts": {
    "daily_sales": [
      {
        "date": "2024-01-20",
        "amount": 45000
      }
    ]
  },
  "recent_transactions": [
    {
      "id": "uuid",
      "amount": 800,
      "status": "completed",
      "created_at": "2024-01-20T10:30:00Z",
      "users": {
        "display_name": "ユーザー太郎"
      },
      "gacha_products": {
        "name": "ポケモンカード151"
      }
    }
  ],
  "popular_gacha": [
    {
      "product_id": "uuid",
      "product_name": "ポケモンカード151",
      "transaction_count": 120,
      "total_revenue": 96000
    }
  ]
}
```

---

## 🎰 Gacha Management API

### GET /api/admin/gacha
ガチャ商品一覧取得（管理者専用）

#### Response
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "ポケモンカード151オリパ",
      "description": "151匹のポケモンが勢揃い！",
      "single_price": 800,
      "multi_price": 8000,
      "banner_image_url": "/images/pokemon-151.png",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "gacha_pools": [
        {
          "id": "uuid",
          "card_id": "uuid",
          "drop_rate": 0.01,
          "cards": {
            "name": "リザードンex",
            "rarity": "SSR",
            "image_url": "/images/cards/charizard.png"
          }
        }
      ],
      "stats": {
        "total_cards": 50,
        "ssr_count": 3,
        "sr_count": 8,
        "r_count": 15,
        "n_count": 24
      }
    }
  ],
  "total": 8
}
```

### POST /api/admin/gacha
新規ガチャ作成

#### Request Body
```json
{
  "name": "新しいオリパ",
  "description": "説明文",
  "single_price": 800,
  "multi_price": 8000,
  "banner_image_url": "/images/banner.png",
  "is_active": true,
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z",
  "featured_card_ids": ["uuid1", "uuid2"],
  "guarantee_sr_on_multi": true
}
```

### GET /api/admin/gacha/[id]
個別ガチャ詳細取得

### PUT /api/admin/gacha/[id]
ガチャ情報更新

### DELETE /api/admin/gacha/[id]
ガチャ削除

---

## 🃏 Public Gacha API

### GET /api/gacha/products
公開ガチャ一覧取得（フロントエンド用）

#### Query Parameters
- `active=true` - アクティブなガチャのみ
- `limit=10` - 取得件数制限
- `offset=0` - オフセット

#### Response
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "ポケモンカード151オリパ",
      "single_price": 800,
      "multi_price": 8000,
      "banner_image_url": "/images/pokemon-151.png",
      "featured_cards": [
        {
          "name": "リザードンex",
          "rarity": "SSR",
          "image_url": "/images/cards/charizard.png"
        }
      ]
    }
  ]
}
```

### POST /api/gacha/execute
ガチャ実行（ユーザー認証必須）

#### Request Body
```json
{
  "product_id": "uuid",
  "count": 1
}
```

#### Response
```json
{
  "success": true,
  "results": [
    {
      "card": {
        "id": "uuid",
        "name": "ピカチュウ",
        "rarity": "SR",
        "image_url": "/images/cards/pikachu.png"
      },
      "animation_data": {
        "effects": ["lightning", "sparkle"],
        "duration": 3000
      }
    }
  ],
  "remaining_points": 4200
}
```

---

## 👤 User API

### GET /api/user/points
ユーザーポイント残高取得

#### Response
```json
{
  "points": 5000,
  "last_updated": "2024-01-20T10:30:00Z"
}
```

### GET /api/user/cards
所持カード一覧

#### Response
```json
{
  "cards": [
    {
      "id": "uuid",
      "card": {
        "name": "リザードンex",
        "rarity": "SSR",
        "image_url": "/images/cards/charizard.png"
      },
      "obtained_at": "2024-01-20T10:30:00Z"
    }
  ],
  "total": 25
}
```

---

## 🎨 AI Generation API

### POST /api/generate-banner
バナー画像生成（バナー生成チーム用）

#### Request Body
```json
{
  "gacha_id": "uuid",
  "style": "premium",
  "rarity": "SSR",
  "text": "大当たり！",
  "format": "mobile"
}
```

#### Response
```json
{
  "success": true,
  "banner_url": "/images/generated/banner_uuid.png",
  "generation_id": "uuid",
  "estimated_time": "30s"
}
```

### POST /api/ai-video-generate
AI動画生成

#### Request Body
```json
{
  "pokemonName": "ピカチュウ",
  "pokemonType": "electric",
  "rarity": "SSR",
  "preferredService": "openai"
}
```

---

## 📈 Analytics API

### GET /api/admin/stats
統計データ取得

### GET /api/transactions
取引履歴（課金チーム用）

#### Query Parameters
- `user_id=uuid` - 特定ユーザー
- `start_date=2024-01-01` - 開始日
- `end_date=2024-01-31` - 終了日
- `status=completed` - ステータス

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Required field 'name' is missing"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Valid JWT token required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Admin access required"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

---

## 🔄 Rate Limiting

- **Public API**: 100 requests/minute
- **User API**: 200 requests/minute  
- **Admin API**: 1000 requests/minute

## 📝 Changelog

### v1.0.0 (2024-01-20)
- Initial API release
- Basic CRUD operations
- Authentication system

### v1.1.0 (2024-01-21)
- AI generation endpoints
- Dashboard analytics
- Enhanced error handling