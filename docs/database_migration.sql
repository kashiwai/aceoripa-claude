-- ポケモンカードテーブルに product_code カラムを追加
ALTER TABLE pokemon_cards 
ADD COLUMN IF NOT EXISTS product_code VARCHAR(100) UNIQUE;

-- 既存データに product_code を設定（一意性を保つため）
UPDATE pokemon_cards 
SET product_code = CONCAT('CARD-', id) 
WHERE product_code IS NULL;

-- product_code のインデックスを作成
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_product_code 
ON pokemon_cards(product_code);

-- レアリティ別の検索用インデックス
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_rarity 
ON pokemon_cards(rarity);

-- 価格範囲検索用インデックス
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_price 
ON pokemon_cards(market_price);

-- 利用可能カード用インデックス
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_available 
ON pokemon_cards(is_available);

-- ガチャアイテム用のテーブル更新
CREATE TABLE IF NOT EXISTS gacha_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gacha_id UUID REFERENCES gachas(id) ON DELETE CASCADE,
  card_id UUID REFERENCES pokemon_cards(id) ON DELETE CASCADE,
  rarity VARCHAR(10) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  remaining_quantity INTEGER NOT NULL DEFAULT 1,
  drop_weight DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ガチャアイテムのインデックス
CREATE INDEX IF NOT EXISTS idx_gacha_items_gacha_id 
ON gacha_items(gacha_id);

CREATE INDEX IF NOT EXISTS idx_gacha_items_rarity 
ON gacha_items(rarity);

CREATE INDEX IF NOT EXISTS idx_gacha_items_remaining 
ON gacha_items(remaining_quantity);

-- ユーザーガチャ履歴テーブルの更新
CREATE TABLE IF NOT EXISTS user_gacha_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  gacha_id UUID REFERENCES gachas(id) ON DELETE CASCADE,
  card_id UUID REFERENCES pokemon_cards(id) ON DELETE CASCADE,
  rarity VARCHAR(10) NOT NULL,
  points_used INTEGER NOT NULL,
  is_shipped BOOLEAN DEFAULT FALSE,
  shipping_address TEXT,
  tracking_number VARCHAR(255),
  shipped_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ガチャ履歴のインデックス
CREATE INDEX IF NOT EXISTS idx_user_gacha_history_user_id 
ON user_gacha_history(user_id);

CREATE INDEX IF NOT EXISTS idx_user_gacha_history_gacha_id 
ON user_gacha_history(gacha_id);

CREATE INDEX IF NOT EXISTS idx_user_gacha_history_shipping 
ON user_gacha_history(is_shipped, shipped_at);

-- 発送管理テーブル
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_gacha_history_id UUID REFERENCES user_gacha_history(id) ON DELETE CASCADE,
  recipient_name VARCHAR(255) NOT NULL,
  shipping_address TEXT NOT NULL,
  phone_number VARCHAR(20),
  tracking_number VARCHAR(255),
  shipping_company VARCHAR(100) DEFAULT 'ヤマト運輸',
  status VARCHAR(50) DEFAULT 'PENDING',
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 発送管理のインデックス
CREATE INDEX IF NOT EXISTS idx_shipments_status 
ON shipments(status);

CREATE INDEX IF NOT EXISTS idx_shipments_tracking 
ON shipments(tracking_number);

-- お知らせテーブル
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  image_url TEXT,
  priority INTEGER DEFAULT 1,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- お知らせのインデックス
CREATE INDEX IF NOT EXISTS idx_announcements_active 
ON announcements(is_active, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_announcements_priority 
ON announcements(priority, created_at);

-- ユーザーランク設定テーブル
CREATE TABLE IF NOT EXISTS user_rank_settings (
  rank_level INTEGER PRIMARY KEY,
  rank_name VARCHAR(100) NOT NULL,
  required_spent_amount INTEGER NOT NULL DEFAULT 0,
  benefits TEXT,
  badge_color VARCHAR(20) DEFAULT '#808080',
  created_at TIMESTAMP DEFAULT NOW()
);

-- デフォルトランク設定
INSERT INTO user_rank_settings (rank_level, rank_name, required_spent_amount, benefits, badge_color) 
VALUES 
  (1, 'ブロンズ', 0, '基本機能', '#CD7F32'),
  (2, 'シルバー', 10000, '限定ガチャアクセス', '#C0C0C0'),
  (3, 'ゴールド', 50000, '特別割引10%', '#FFD700'),
  (4, 'プラチナ', 100000, '限定カード先行販売', '#E5E4E2'),
  (5, 'ダイヤモンド', 500000, 'VIP専用サポート', '#B9F2FF')
ON CONFLICT (rank_level) DO NOTHING;