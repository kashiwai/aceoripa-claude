-- banner_image_urlカラムが存在しない場合は追加
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS banner_image_url TEXT;

-- 既存データに画像を設定（名前に基づいて）
UPDATE gacha_products 
SET banner_image_url = CASE 
  WHEN name LIKE '%ピカチュウ%' THEN '/images/banners/real-gacha/S__44392515_0.jpg'
  WHEN name LIKE '%ナンジャモ%' THEN '/images/banners/real-gacha/S__44392516_0.jpg'
  WHEN name LIKE '%リザードン%' THEN '/images/banners/real-gacha/S__44392517_0.jpg'
  WHEN name LIKE '%ブラッキー%' THEN '/images/banners/real-gacha/S__44392521_0.jpg'
  WHEN name LIKE '%リーリエ%' OR name LIKE '%マリオ%' THEN '/images/banners/real-gacha/S__44392523_0.jpg'
  ELSE banner_image_url -- 既存の値を保持
END
WHERE banner_image_url IS NULL OR banner_image_url = '';

-- テーブル構造を確認（デバッグ用）
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'gacha_products' 
-- ORDER BY ordinal_position;