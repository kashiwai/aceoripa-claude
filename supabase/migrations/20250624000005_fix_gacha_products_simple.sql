-- 最小限の必要なカラムのみ追加（エラーを回避するため）

-- banner_image_urlカラムを追加（バナー画像保存用）
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS banner_image_url TEXT;

-- single_priceとmulti_priceカラムを追加
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS single_price INTEGER;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS multi_price INTEGER;

-- 既存のpriceフィールドからsingle_priceにデータをコピー
UPDATE gacha_products 
SET single_price = price 
WHERE single_price IS NULL AND price IS NOT NULL;

-- multi_priceをsingle_priceの10倍に設定
UPDATE gacha_products 
SET multi_price = COALESCE(single_price, price) * 10 
WHERE multi_price IS NULL;