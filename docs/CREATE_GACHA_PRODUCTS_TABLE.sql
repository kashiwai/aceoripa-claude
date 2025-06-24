-- gacha_productsテーブルを正しい構造で作成するSQL
-- Supabase SQL Editorで実行してください

-- 1. 既存のテーブルがある場合は削除（注意：データが失われます）
-- DROP TABLE IF EXISTS gacha_products CASCADE;

-- 2. gacha_productsテーブルを作成
CREATE TABLE IF NOT EXISTS gacha_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  single_price INTEGER NOT NULL DEFAULT 100,
  multi_price INTEGER NOT NULL DEFAULT 900,
  is_active BOOLEAN DEFAULT true,
  banner_image_url TEXT,
  featured_card_id UUID,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  total_stock INTEGER DEFAULT 1000,
  sold_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLSを有効化
ALTER TABLE gacha_products ENABLE ROW LEVEL SECURITY;

-- 4. 一時的に全アクセスを許可するポリシー
CREATE POLICY "Enable read access for all users" ON gacha_products
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON gacha_products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON gacha_products
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON gacha_products
  FOR DELETE USING (true);

-- 5. インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_gacha_products_is_active ON gacha_products(is_active);
CREATE INDEX IF NOT EXISTS idx_gacha_products_created_at ON gacha_products(created_at);

-- 6. updated_atを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. トリガーを作成
CREATE TRIGGER update_gacha_products_updated_at BEFORE UPDATE
  ON gacha_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();