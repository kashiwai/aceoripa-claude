-- ガチャテーブルにバナー画像URLカラムを追加

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS banner_image_url TEXT;