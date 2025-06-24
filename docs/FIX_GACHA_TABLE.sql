-- gacha_productsテーブルを修正するSQL
-- Supabase SQL Editorで順番に実行してください

-- 1. まず現在のテーブル構造を確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gacha_products' 
AND table_schema = 'public';

-- 2. 基本的なカラムを追加（エラーが出ても続行）
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT 'Unknown';

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS single_price INTEGER NOT NULL DEFAULT 100;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS multi_price INTEGER DEFAULT 900;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS banner_image_url TEXT;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. もしまだidカラムがない場合
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

-- 4. idを主キーに設定（まだ設定されていない場合）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'gacha_products_pkey'
  ) THEN
    ALTER TABLE gacha_products ADD PRIMARY KEY (id);
  END IF;
END $$;

-- 5. テーブル構造を再確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'gacha_products' 
AND table_schema = 'public'
ORDER BY ordinal_position;