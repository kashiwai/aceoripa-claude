-- 既存ガチャの最適化スクリプト
-- DOPA式に基づく価格・プール調整

-- 1. 価格最適化（段階的実装）

-- Phase 1: ナンジャモ大量発生オリパ（最優先）
UPDATE gacha_products 
SET 
  single_price = 9500,
  multi_price = 95000,
  dopa_settings = jsonb_build_object(
    'actual_return_rate', 0.70,
    'display_return_rate', 0.97,
    'explosion_ad_rate', 0.15,
    'optimization_applied', true,
    'optimization_date', CURRENT_TIMESTAMP,
    'previous_price', 8000,
    'expected_profit_rate', 0.72,
    'point_return_distribution', jsonb_build_object(
      'low_return', jsonb_build_object('min', 850, 'max', 3650, 'weight', 400),
      'mid_return', jsonb_build_object('min', 5600, 'max', 8900, 'weight', 300),
      'high_return', jsonb_build_object('min', 12000, 'max', 15000, 'weight', 120),
      'super_return', jsonb_build_object('min', 20000, 'max', 25000, 'weight', 30)
    )
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE name LIKE '%ナンジャモ%' OR name LIKE '%大量発生%';

-- Phase 2: ブラッキー超感謝祭（高優先）
UPDATE gacha_products 
SET 
  single_price = 13500,
  multi_price = 135000,
  dopa_settings = jsonb_build_object(
    'actual_return_rate', 0.70,
    'display_return_rate', 0.97,
    'explosion_ad_rate', 0.15,
    'optimization_applied', true,
    'optimization_date', CURRENT_TIMESTAMP,
    'previous_price', 12000,
    'expected_profit_rate', 0.75,
    'point_return_distribution', jsonb_build_object(
      'low_return', jsonb_build_object('min', 850, 'max', 3650, 'weight', 350),
      'mid_return', jsonb_build_object('min', 5600, 'max', 8900, 'weight', 300),
      'high_return', jsonb_build_object('min', 12000, 'max', 15000, 'weight', 150),
      'super_return', jsonb_build_object('min', 20000, 'max', 25000, 'weight', 50)
    )
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE name LIKE '%ブラッキー%' OR name LIKE '%感謝祭%';

-- Phase 3: ピカチュウ大祭り（中優先）
UPDATE gacha_products 
SET 
  single_price = 12000,
  multi_price = 120000,
  dopa_settings = jsonb_build_object(
    'actual_return_rate', 0.70,
    'display_return_rate', 0.97,
    'explosion_ad_rate', 0.18,
    'optimization_applied', true,
    'optimization_date', CURRENT_TIMESTAMP,
    'previous_price', 10000,
    'expected_profit_rate', 0.73,
    'point_return_distribution', jsonb_build_object(
      'low_return', jsonb_build_object('min', 850, 'max', 3650, 'weight', 350),
      'mid_return', jsonb_build_object('min', 5600, 'max', 8900, 'weight', 280),
      'high_return', jsonb_build_object('min', 12000, 'max', 15000, 'weight', 180),
      'super_return', jsonb_build_object('min', 20000, 'max', 25000, 'weight', 40)
    )
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE name LIKE '%ピカチュウ%' OR name LIKE '%大祭り%';

-- Phase 4: リザードン祭盤（価格据え置き、プール調整のみ）
UPDATE gacha_products 
SET 
  dopa_settings = jsonb_build_object(
    'actual_return_rate', 0.68,
    'display_return_rate', 0.97,
    'explosion_ad_rate', 0.12,
    'optimization_applied', true,
    'optimization_date', CURRENT_TIMESTAMP,
    'price_maintained', true,
    'reason', '高価格帯のため価格据え置き、プールのみ調整',
    'expected_profit_rate', 0.70,
    'point_return_distribution', jsonb_build_object(
      'low_return', jsonb_build_object('min', 1200, 'max', 5600, 'weight', 450),
      'mid_return', jsonb_build_object('min', 6800, 'max', 12000, 'weight', 250),
      'high_return', jsonb_build_object('min', 15000, 'max', 20000, 'weight', 100),
      'super_return', jsonb_build_object('min', 25000, 'max', 30000, 'weight', 20)
    )
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE name LIKE '%リザードン%' OR name LIKE '%祭盤%';

-- 2. DOPA式カードプールの適用

-- 既存のポイント還元カードが足りない場合は作成
INSERT INTO pokemon_cards (card_name, product_code, rarity, card_type, point_value, image_url, market_price, description) VALUES 
-- 中途半端数字の追加パターン
('2,650Pちょっと得パック', 'POINT-2650', 'C', 'point_return', 2650, '/images/point-cards/2650p-pack.jpg', 2650, '2,650ポイント還元'),
('4,780Pまずまずパック', 'POINT-4780', 'B', 'point_return', 4780, '/images/point-cards/4780p-pack.jpg', 4780, '4,780ポイント還元'),
('7,350Pいい感じパック', 'POINT-7350', 'B', 'point_return', 7,350, '/images/point-cards/7350p-pack.jpg', 7350, '7,350ポイント還元'),
('18,000P超爆アドパック', 'POINT-18K', 'S', 'point_return', 18000, '/images/point-cards/18000p-pack.jpg', 18000, '18,000ポイント超大還元！'),
('22,500P奇跡パック', 'POINT-22500', 'S', 'point_return', 22500, '/images/point-cards/22500p-pack.jpg', 22500, '22,500ポイント奇跡の大還元！'),
('30,000P神引きパック', 'POINT-30K', 'SS', 'point_return', 30000, '/images/point-cards/30000p-pack.jpg', 30000, '30,000ポイント神引き！伝説級還元')

ON CONFLICT (product_code) DO UPDATE SET
  card_name = EXCLUDED.card_name,
  point_value = EXCLUDED.point_value,
  image_url = EXCLUDED.image_url,
  market_price = EXCLUDED.market_price,
  description = EXCLUDED.description;

-- 3. 各ガチャのプール再生成（DOPA式15%物理カード、85%ポイント還元）

-- 既存プールをクリアして再生成
DELETE FROM gacha_pokemon_pools WHERE gacha_product_id IN (
  SELECT id FROM gacha_products WHERE name LIKE '%ナンジャモ%' OR name LIKE '%ブラッキー%' OR name LIKE '%ピカチュウ%' OR name LIKE '%リザードン%'
);

-- DOPA式プールを各ガチャに適用
SELECT generate_dopa_gacha_pool(id) FROM gacha_products 
WHERE name LIKE '%ナンジャモ%' OR name LIKE '%ブラッキー%' OR name LIKE '%ピカチュウ%' OR name LIKE '%リザードン%';

-- 4. 最適化ログの記録
INSERT INTO gacha_optimization_history (gacha_product_id, optimization_type, previous_price, new_price, expected_profit_improvement, applied_at, reasoning)
SELECT 
  id,
  'dopa_price_optimization',
  CASE 
    WHEN name LIKE '%ナンジャモ%' THEN 8000
    WHEN name LIKE '%ブラッキー%' THEN 12000
    WHEN name LIKE '%ピカチュウ%' THEN 10000
    WHEN name LIKE '%リザードン%' THEN 15000
  END,
  single_price,
  CASE 
    WHEN name LIKE '%ナンジャモ%' THEN 0.07
    WHEN name LIKE '%ブラッキー%' THEN 0.10
    WHEN name LIKE '%ピカチュウ%' THEN 0.08
    WHEN name LIKE '%リザードン%' THEN 0.05
  END,
  CURRENT_TIMESTAMP,
  'DOPA式最適化による利益率向上。実質還元率70%、体感還元率97%を維持しながら30%以上の利益率を確保。'
FROM gacha_products 
WHERE name LIKE '%ナンジャモ%' OR name LIKE '%ブラッキー%' OR name LIKE '%ピカチュウ%' OR name LIKE '%リザードン%';

-- 5. 最適化結果の確認クエリ
SELECT 
  name,
  single_price,
  multi_price,
  total_packs,
  remaining_packs,
  (single_price * total_packs) as total_revenue,
  (single_price * total_packs * 0.70) as estimated_user_payment,
  (single_price * total_packs * 0.05) as card_cost,
  (single_price * total_packs * 0.70 - single_price * total_packs * 0.05) as estimated_profit,
  ROUND(((single_price * total_packs * 0.70 - single_price * total_packs * 0.05)::numeric / (single_price * total_packs)::numeric * 100), 2) as profit_rate_percent,
  dopa_settings->>'optimization_applied' as is_optimized,
  dopa_settings->>'optimization_date' as optimization_date
FROM gacha_products 
WHERE name LIKE '%ナンジャモ%' OR name LIKE '%ブラッキー%' OR name LIKE '%ピカチュウ%' OR name LIKE '%リザードン%'
ORDER BY name;

COMMENT ON SCRIPT IS 'DOPA式ガチャ最適化スクリプト - 段階的価格調整とプール再構成';