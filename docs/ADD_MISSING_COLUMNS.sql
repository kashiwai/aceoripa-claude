-- gacha_productsテーブルに不足している可能性のあるカラムを追加
-- 実行前に、既存のカラムを確認してください

-- total_stock カラムを追加（総在庫数）
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS total_stock INTEGER DEFAULT 1000;

-- sold_count カラムを追加（販売済み数）
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;

-- metadata カラムが存在しない場合は追加
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 既存のデータにデフォルト値を設定
UPDATE gacha_products 
SET total_stock = COALESCE(total_stock, 1000),
    sold_count = COALESCE(sold_count, 0),
    metadata = COALESCE(metadata, '{}')
WHERE total_stock IS NULL OR sold_count IS NULL OR metadata IS NULL;