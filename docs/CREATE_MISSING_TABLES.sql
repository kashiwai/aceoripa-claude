-- ポケモンカード関連のテーブルを作成するSQL
-- 必要に応じてSupabase SQL Editorで実行してください

-- 1. ポケモンカードマスターテーブル
CREATE TABLE IF NOT EXISTS pokemon_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_name VARCHAR(255) NOT NULL,
  product_code VARCHAR(100),
  rarity VARCHAR(10),
  image_url TEXT,
  market_price INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ガチャプール（ガチャとカードの関連）テーブル
CREATE TABLE IF NOT EXISTS gacha_pokemon_pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gacha_product_id UUID REFERENCES gacha_products(id) ON DELETE CASCADE,
  pokemon_card_id UUID REFERENCES pokemon_cards(id) ON DELETE CASCADE,
  weight INTEGER DEFAULT 1, -- 排出重み（確率計算用）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gacha_product_id, pokemon_card_id)
);

-- 3. カードレアリティテーブル
CREATE TABLE IF NOT EXISTS card_rarities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rarity_code VARCHAR(10) UNIQUE NOT NULL,
  rarity_name VARCHAR(50) NOT NULL,
  display_order INTEGER DEFAULT 0,
  base_drop_rate DECIMAL(5,2) DEFAULT 0, -- 基本排出率（%）
  color_code VARCHAR(7), -- 表示用カラーコード
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLSポリシーを設定
ALTER TABLE pokemon_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_pokemon_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_rarities ENABLE ROW LEVEL SECURITY;

-- 全アクセス許可（開発用）
CREATE POLICY "Allow all access" ON pokemon_cards FOR ALL USING (true);
CREATE POLICY "Allow all access" ON gacha_pokemon_pools FOR ALL USING (true);
CREATE POLICY "Allow all access" ON card_rarities FOR ALL USING (true);

-- 5. インデックスを作成
CREATE INDEX IF NOT EXISTS idx_gacha_pools_gacha_id ON gacha_pokemon_pools(gacha_product_id);
CREATE INDEX IF NOT EXISTS idx_gacha_pools_card_id ON gacha_pokemon_pools(pokemon_card_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_rarity ON pokemon_cards(rarity);

-- 6. サンプルレアリティデータを挿入
INSERT INTO card_rarities (rarity_code, rarity_name, display_order, base_drop_rate, color_code) VALUES
  ('SS', 'SSレア', 1, 0.5, '#FF0000'),
  ('S', 'Sレア', 2, 2.0, '#FFA500'),
  ('A', 'Aレア', 3, 10.0, '#FFD700'),
  ('B', 'Bレア', 4, 37.5, '#90EE90'),
  ('C', 'Cレア', 5, 50.0, '#87CEEB')
ON CONFLICT (rarity_code) DO NOTHING;