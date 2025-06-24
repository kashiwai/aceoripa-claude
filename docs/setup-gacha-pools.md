# ガチャプールデータのセットアップ手順

## 概要
ガチャ詳細ページで表示される「ゲットできるカード一覧」をデータベースから取得するためのセットアップ手順です。

## 1. テーブル構造の確認

### gacha_pokemon_pools テーブル
- ガチャ商品とポケモンカードを紐づけるテーブル
- `weight`フィールドで各カードの排出確率を制御

### レアリティと確率の関係
- SS賞: weight = 1 (約1%)
- S賞: weight = 4 (約4%) 
- A賞: weight = 5 (約15%)
- B賞: weight = 10 (約30%)
- C賞: weight = 16-17 (約50%)

## 2. データ投入手順

### 方法1: Supabase SQL Editorで直接実行
1. Supabaseダッシュボードにログイン
2. SQL Editorを開く
3. `/supabase/migrations/20250624000003_create_gacha_pools.sql`の内容をコピー
4. SQL Editorに貼り付けて実行

### 方法2: マイグレーションとして実行
```bash
# ローカルで実行（Supabase CLIが必要）
supabase db push
```

## 3. データの確認

SQLエディタで以下を実行して確認：

```sql
-- ガチャID 1のカードプールを確認
SELECT 
  gpp.gacha_product_id,
  pc.card_name,
  pc.rarity,
  gpp.weight,
  pc.image_url
FROM gacha_pokemon_pools gpp
JOIN pokemon_cards pc ON gpp.pokemon_card_id = pc.id
WHERE gpp.gacha_product_id = '1'
ORDER BY pc.rarity, gpp.weight DESC;
```

## 4. 動作確認

1. ブラウザで `http://localhost:3000/gacha/1` にアクセス
2. 「ゲットできるカード一覧」セクションを確認
3. データベースから取得したカードが表示されることを確認

## 5. カードプールの追加・編集

新しいカードをガチャに追加する場合：

```sql
-- 例: ガチャID 1に新しいカードを追加
INSERT INTO gacha_pokemon_pools (gacha_product_id, pokemon_card_id, weight) 
VALUES ('1', 'PK-XXXX', 5);
```

カードの排出率を変更する場合：

```sql
-- 例: 特定のカードのweightを変更
UPDATE gacha_pokemon_pools 
SET weight = 10 
WHERE gacha_product_id = '1' AND pokemon_card_id = 'PK-0008';
```

## 6. トラブルシューティング

### カードが表示されない場合
1. pokemon_cardsテーブルにカードデータが存在するか確認
2. gacha_pokemon_poolsテーブルにデータが存在するか確認
3. ブラウザの開発者ツールでAPIレスポンスを確認

### 確率が正しく表示されない場合
- weightの合計が100になるように調整（必須ではないが推奨）
- APIエンドポイント（/api/gacha/products/[id]/pool）のログを確認