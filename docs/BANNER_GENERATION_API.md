# バナー生成チーム向けAPI仕様書

## 概要
バナー生成チームが使用するAPI群です。Admin画面からのガチャバナー生成と更新、及び自動バナー生成機能を提供します。

## 1. バナー生成API

### POST /api/generate-banner
ガチャ用バナーを生成します。

#### リクエスト
```json
{
  "gachaId": "gacha-001",
  "bannerType": "main" | "rarity" | "custom",
  "rarity": "N" | "R" | "SR" | "SSR" | "UR" | "PSA10",
  "title": "超激レアガチャ",
  "subtitle": "PSA10確率UP!",
  "colors": ["#FF6B6B", "#4ECDC4"],
  "size": {
    "width": 1024,
    "height": 1024
  },
  "options": {
    "sparkles": 50,
    "cards": 6,
    "font": "Kinkaku",
    "backgroundStyle": "gradient"
  }
}
```

#### レスポンス
```json
{
  "success": true,
  "bannerUrl": "/images/generated-banners/banner-gacha-001-main-1703123456789.png",
  "filename": "banner-gacha-001-main-1703123456789.png",
  "config": {
    "gachaId": "gacha-001",
    "bannerType": "main",
    ...
  }
}
```

#### バナータイプ

**main**: メインガチャバナー
- 虹色グラデーション背景
- 「超激レア」「PSA10確率UP!」テキスト
- 爆発エフェクト
- 金色の星

**rarity**: レアリティ別バナー
- レアリティに応じた色彩設定
- 放射状エフェクト
- スパークル数調整
- 専用フォント使用

**custom**: カスタムバナー
- 任意の色・テキスト指定
- シンプルなグラデーション
- 汎用的なデザイン

#### 使用可能フォント
- `DelaGothicOne` - Dela Gothic One（太字日本語フォント）
- `MOBOFont` - MOBO Font（モダン日本語フォント）
- `BananaSlip` - Banana Slip（ポップ系フォント）
- `CraftMincho` - Craft Mincho（クラフト明朝）
- `Kinkaku` - Kinkaku（金閣フォント）

### GET /api/generate-banner
ガチャIDに関連するバナー一覧を取得します。

#### パラメータ
- `gachaId` (required): ガチャID

#### レスポンス
```json
{
  "gachaId": "gacha-001",
  "banners": [
    {
      "filename": "banner-gacha-001-main-1703123456789.png",
      "url": "/images/generated-banners/banner-gacha-001-main-1703123456789.png",
      "createdAt": "2023-12-21T12:30:56.789Z",
      "sizeBytes": 245760
    }
  ],
  "count": 1
}
```

## 2. Admin ガチャ管理API

### GET /api/admin/gacha
全ガチャ商品一覧を取得します。

#### 認証
- Admin権限が必要
- 環境変数 `ADMIN_EMAIL` で設定されたメールアドレスのユーザーのみアクセス可能

#### レスポンス
```json
{
  "products": [
    {
      "id": "gacha-001",
      "name": "ポケモンカード151オリパ",
      "description": "激レアPSA10確率UP!",
      "single_price": 500,
      "multi_price": 4500,
      "banner_image_url": "/images/generated-banners/banner-gacha-001-main-1703123456789.png",
      "is_active": true,
      "start_date": "2023-12-01T00:00:00Z",
      "end_date": "2023-12-31T23:59:59Z",
      "featured_card_ids": ["card-001", "card-002"],
      "guarantee_sr_on_multi": true,
      "gacha_pools": [
        {
          "id": "pool-001",
          "card_id": "card-001",
          "drop_rate": 0.1,
          "cards": {
            "id": "card-001",
            "name": "ピカチュウPSA10",
            "rarity": "PSA10",
            "image_url": "/images/pokemon-cards/pikachu-psa10.png",
            "description": "完美品ピカチュウカード"
          }
        }
      ]
    }
  ]
}
```

### POST /api/admin/gacha
新規ガチャを作成します。

#### リクエスト
```json
{
  "name": "新春特別ガチャ",
  "description": "2024年限定コレクション",
  "single_price": 600,
  "multi_price": 5400,
  "banner_image_url": "/images/generated-banners/banner-new-year-main.png",
  "is_active": true,
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-01-31T23:59:59Z",
  "featured_card_ids": ["card-101", "card-102"],
  "guarantee_sr_on_multi": true
}
```

### PUT /api/admin/gacha/[id]
ガチャ情報を更新します（バナーURL更新もここで実施）。

#### リクエスト
```json
{
  "name": "ポケモンカード151オリパ（更新版）",
  "description": "激レアPSA10確率大幅UP!",
  "single_price": 500,
  "multi_price": 4500,
  "banner_image_url": "/images/generated-banners/banner-gacha-001-main-1703567890123.png",
  "is_active": true,
  "start_date": "2023-12-01T00:00:00Z",
  "end_date": "2023-12-31T23:59:59Z",
  "featured_card_ids": ["card-001", "card-002"],
  "guarantee_sr_on_multi": true
}
```

#### レスポンス
```json
{
  "product": {
    "id": "gacha-001",
    "name": "ポケモンカード151オリパ（更新版）",
    "banner_image_url": "/images/generated-banners/banner-gacha-001-main-1703567890123.png",
    ...
  },
  "message": "Gacha product updated successfully"
}
```

### GET /api/admin/gacha/[id]
特定ガチャの詳細情報を取得します。

### DELETE /api/admin/gacha/[id]
ガチャを削除します（カスケード削除で関連プールも削除）。

## 3. ガチャプール管理API

### GET /api/admin/gacha/[id]/pools
特定ガチャのカードプール一覧を取得します。

### POST /api/admin/gacha/[id]/pools
ガチャにカードを追加します。

#### リクエスト
```json
{
  "card_id": "card-003",
  "drop_rate": 0.05
}
```

### PUT /api/admin/gacha/[id]/pools/[poolId]
カードの排出率を更新します。

### DELETE /api/admin/gacha/[id]/pools/[poolId]
ガチャからカードを除外します。

## 4. バナー生成ワークフロー

### 標準的な流れ

1. **バナー生成**
```bash
curl -X POST /api/generate-banner \
  -H "Content-Type: application/json" \
  -d '{
    "gachaId": "gacha-001",
    "bannerType": "main",
    "title": "新春特別ガチャ",
    "subtitle": "PSA10確率3倍UP!"
  }'
```

2. **ガチャ情報更新**
```bash
curl -X PUT /api/admin/gacha/gacha-001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{
    "banner_image_url": "/images/generated-banners/banner-gacha-001-main-1703567890123.png",
    ...
  }'
```

3. **バナー確認**
```bash
curl /api/generate-banner?gachaId=gacha-001
```

## 5. エラーハンドリング

### 一般的なエラーレスポンス
```json
{
  "error": "Error message",
  "status": 400
}
```

### エラーコード
- `400` - バリデーションエラー（必須パラメータ不足など）
- `401` - 認証エラー（Admin権限なし）
- `403` - 権限エラー（Admin権限不足）
- `404` - リソースが見つからない
- `500` - サーバーエラー（バナー生成失敗など）

## 6. レート制限・パフォーマンス

### バナー生成
- 1つのバナー生成は約2-5秒
- 同時生成数上限: 3バナー
- ファイルサイズ: 通常200-500KB

### ファイル管理
- 生成されたバナーは `public/images/generated-banners/` に保存
- ファイル命名規則: `banner-{gachaId}-{type}-{timestamp}.png`
- 自動クリーンアップは実装されていません（手動管理）

## 7. 開発・テスト

### ローカル環境
```bash
# バナー生成テスト
npm run dev
curl -X POST http://localhost:3000/api/generate-banner \
  -H "Content-Type: application/json" \
  -d '{"gachaId":"test","bannerType":"main","title":"テストバナー"}'
```

### 必要な環境変数
```bash
ADMIN_EMAIL=admin@aceoripa.com
OPENAI_API_KEY=sk-...  # (Optional: generate-bannerで使用)
```

## 8. フォント・アセット管理

### カスタムフォント
- 配置場所: `public/images/font/`
- 自動登録: サーバー起動時に実行
- 対応形式: TTF, OTF

### 背景素材
- AI生成背景: `public/images/basebg/`
- 既存バナー: `public/images/banners/1024x1024/`
- エフェクト: `public/images/effects/`

## サポート
- バナー動画演出担当まで
- 技術的質問: GitHub Issues
- API統合支援: `src/integration/gacha-integration-guide.md` 参照