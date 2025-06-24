-- ガチャシステム用テーブル作成SQL

-- 1. カードレアリティテーブル
CREATE TABLE IF NOT EXISTS card_rarities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(10) NOT NULL UNIQUE,
  display_name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#000000',
  weight INTEGER DEFAULT 100,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- レアリティのマスターデータを挿入
INSERT INTO card_rarities (name, display_name, color, weight, sort_order) VALUES
  ('SS', 'SS（ダブルエス）', '#FF0033', 1, 1),
  ('S', 'S（エス）', '#FFD700', 5, 2),
  ('A', 'A（エー）', '#C0C0C0', 15, 3),
  ('B', 'B（ビー）', '#CD7F32', 30, 4),
  ('C', 'C（シー）', '#808080', 49, 5)
ON CONFLICT (name) DO NOTHING;

-- 2. ガチャプールテーブル（ガチャとカードの中間テーブル）
CREATE TABLE IF NOT EXISTS gacha_pokemon_pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gacha_product_id UUID NOT NULL REFERENCES gacha_products(id) ON DELETE CASCADE,
  pokemon_card_id UUID NOT NULL REFERENCES pokemon_cards(id) ON DELETE CASCADE,
  weight INTEGER NOT NULL DEFAULT 100,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(gacha_product_id, pokemon_card_id)
);

-- インデックスの作成
CREATE INDEX idx_gacha_pools_product ON gacha_pokemon_pools(gacha_product_id);
CREATE INDEX idx_gacha_pools_card ON gacha_pokemon_pools(pokemon_card_id);
CREATE INDEX idx_gacha_pools_weight ON gacha_pokemon_pools(weight);

-- RLSポリシー（必要に応じて調整）
ALTER TABLE card_rarities ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_pokemon_pools ENABLE ROW LEVEL SECURITY;

-- 読み取り専用ポリシー（全ユーザー）
CREATE POLICY "Allow read access for all users" ON card_rarities
  FOR SELECT USING (true);

CREATE POLICY "Allow read access for all users" ON gacha_pokemon_pools
  FOR SELECT USING (true);

-- 管理者用の全権限ポリシー
CREATE POLICY "Allow all for authenticated users" ON gacha_pokemon_pools
  FOR ALL USING (auth.role() = 'authenticated');

-- pokemon_cardsテーブルにrarityカラムがない場合は追加
ALTER TABLE pokemon_cards 
ADD COLUMN IF NOT EXISTS rarity VARCHAR(10) DEFAULT 'C',
ADD COLUMN IF NOT EXISTS rarity_id UUID REFERENCES card_rarities(id);

-- 既存のpokemon_cardsにrarityを設定（必要に応じて）
UPDATE pokemon_cards 
SET rarity_id = (SELECT id FROM card_rarities WHERE name = 'C')
WHERE rarity_id IS NULL;