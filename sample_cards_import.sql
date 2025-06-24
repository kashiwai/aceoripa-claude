-- サンプルカードデータのインポート用SQL
-- テーブル作成とRLS無効化
CREATE TABLE IF NOT EXISTS pokemon_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_name VARCHAR(255) NOT NULL,
  product_code VARCHAR(100) UNIQUE NOT NULL,
  rarity VARCHAR(10) NOT NULL,
  image_url TEXT DEFAULT '/images/ngcard.jpg',
  market_price INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLSを無効化
ALTER TABLE pokemon_cards DISABLE ROW LEVEL SECURITY;

-- 既存のサンプルデータをクリア
DELETE FROM pokemon_cards WHERE product_code LIKE 'SAMPLE-%';

-- サンプルカードデータの挿入
INSERT INTO pokemon_cards (card_name, product_code, rarity, image_url, market_price, description) VALUES
('ピカチュウ', 'SAMPLE-001', 'SS', '/images/ngcard.jpg', 50000, 'ポケモンカード - RankSS'),
('リザードン', 'SAMPLE-002', 'S', '/images/ngcard.jpg', 30000, 'ポケモンカード - RankS'),
('フシギダネ', 'SAMPLE-003', 'A', '/images/ngcard.jpg', 15000, 'ポケモンカード - RankA'),
('ゼニガメ', 'SAMPLE-004', 'A', '/images/ngcard.jpg', 12000, 'ポケモンカード - RankA'),
('イーブイ', 'SAMPLE-005', 'B', '/images/ngcard.jpg', 8000, 'ポケモンカード - RankB'),
('コイキング', 'SAMPLE-006', 'B', '/images/ngcard.jpg', 5000, 'ポケモンカード - RankB'),
('ポッポ', 'SAMPLE-007', 'C', '/images/ngcard.jpg', 3000, 'ポケモンカード - RankC'),
('キャタピー', 'SAMPLE-008', 'C', '/images/ngcard.jpg', 2000, 'ポケモンカード - RankC'),
('ビードル', 'SAMPLE-009', 'C', '/images/ngcard.jpg', 1500, 'ポケモンカード - RankC'),
('ミュウ', 'SAMPLE-010', 'SS', '/images/ngcard.jpg', 80000, 'ポケモンカード - RankSS');

-- 確認用クエリ
SELECT COUNT(*) as total_cards FROM pokemon_cards;
SELECT rarity, COUNT(*) as count FROM pokemon_cards GROUP BY rarity ORDER BY rarity;
SELECT * FROM pokemon_cards WHERE product_code LIKE 'SAMPLE-%' ORDER BY product_code;