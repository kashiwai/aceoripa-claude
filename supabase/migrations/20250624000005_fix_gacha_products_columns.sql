-- gacha_productsテーブルに不足しているカラムを追加
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS single_price INTEGER,
ADD COLUMN IF NOT EXISTS multi_price INTEGER,
ADD COLUMN IF NOT EXISTS banner_image_url TEXT,
ADD COLUMN IF NOT EXISTS featured_card_ids TEXT[],
ADD COLUMN IF NOT EXISTS guarantee_sr_on_multi BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_stock INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;

-- 既存のpriceフィールドからsingle_priceにデータをコピー
UPDATE gacha_products 
SET single_price = price 
WHERE single_price IS NULL;

-- multi_priceをsingle_priceの10倍に設定
UPDATE gacha_products 
SET multi_price = single_price * 10 
WHERE multi_price IS NULL;

-- updated_atカラムを追加（存在しない場合）
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- updated_atトリガーを追加
DROP TRIGGER IF EXISTS update_gacha_products_updated_at ON gacha_products;
CREATE TRIGGER update_gacha_products_updated_at BEFORE UPDATE ON gacha_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();