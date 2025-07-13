-- DOPA式ポイント還元システムの実装
-- 実質還元率70%、体感還元率97%のシステム

-- 1. カードタイプを拡張してポイント還元カードを追加
ALTER TABLE pokemon_cards ADD COLUMN IF NOT EXISTS card_type TEXT DEFAULT 'physical';
ALTER TABLE pokemon_cards ADD COLUMN IF NOT EXISTS point_value INTEGER DEFAULT 0;

-- カードタイプ: 'physical' (物理カード), 'point_return' (ポイント還元), 'bonus_pack' (お楽しみパック)

-- 2. DOPA式ポイント還元カードの追加
INSERT INTO pokemon_cards (card_name, product_code, rarity, card_type, point_value, image_url, market_price, description) VALUES 
-- 爆アドポイント還元カード（高還元）
('12,000Pお楽しみパック', 'POINT-12K', 'B', 'point_return', 12000, '/images/point-cards/12000p-pack.jpg', 12000, '12,000ポイント還元！次回ガチャで使えます'),
('15,000P爆アドパック', 'POINT-15K', 'A', 'point_return', 15000, '/images/point-cards/15000p-pack.jpg', 15000, '15,000ポイント大還元！超ラッキー'),
('20,000P超爆アドパック', 'POINT-20K', 'S', 'point_return', 20000, '/images/point-cards/20000p-pack.jpg', 20000, '20,000ポイント超大還元！奇跡的確率'),

-- 標準ポイント還元カード（中途半端数字）
('1,980Pちょこっとパック', 'POINT-1980', 'C', 'point_return', 1980, '/images/point-cards/1980p-pack.jpg', 1980, '1,980ポイント還元'),
('3,650P程よいパック', 'POINT-3650', 'C', 'point_return', 3650, '/images/point-cards/3650p-pack.jpg', 3650, '3,650ポイント還元'),
('5,600Pまあまあパック', 'POINT-5600', 'C', 'point_return', 5600, '/images/point-cards/5600p-pack.jpg', 5600, '5,600ポイント還元'),
('6,800Pそこそこパック', 'POINT-6800', 'B', 'point_return', 6800, '/images/point-cards/6800p-pack.jpg', 6800, '6,800ポイント還元'),
('8,900Pいい感じパック', 'POINT-8900', 'B', 'point_return', 8900, '/images/point-cards/8900p-pack.jpg', 8900, '8,900ポイント還元'),

-- 低還元カード（ハズレ扱い）
('850Pおつかれパック', 'POINT-850', 'C', 'point_return', 850, '/images/point-cards/850p-pack.jpg', 850, '850ポイント還元'),
('1,200Pお疲れ様パック', 'POINT-1200', 'C', 'point_return', 1200, '/images/point-cards/1200p-pack.jpg', 1200, '1,200ポイント還元')

ON CONFLICT (product_code) DO UPDATE SET
  card_name = EXCLUDED.card_name,
  rarity = EXCLUDED.rarity,
  card_type = EXCLUDED.card_type,
  point_value = EXCLUDED.point_value,
  image_url = EXCLUDED.image_url,
  market_price = EXCLUDED.market_price,
  description = EXCLUDED.description;

-- 3. ガチャ商品にDOPA式設定を追加
ALTER TABLE gacha_products ADD COLUMN IF NOT EXISTS dopa_settings JSONB DEFAULT '{}';

-- サンプルのDOPA式設定
UPDATE gacha_products SET dopa_settings = jsonb_build_object(
  'actual_return_rate', 0.70,  -- 実質還元率70%
  'display_return_rate', 0.97, -- 体感還元率97%
  'explosion_ad_rate', 0.15,   -- 爆アド出現率15%（3回に1回、5回に1回等）
  'point_return_distribution', jsonb_build_object(
    'low_return', jsonb_build_object('min', 850, 'max', 3650, 'weight', 400),    -- 40% (ハズレ枠)
    'mid_return', jsonb_build_object('min', 5600, 'max', 8900, 'weight', 300),   -- 30% (普通枠)
    'high_return', jsonb_build_object('min', 12000, 'max', 15000, 'weight', 120), -- 12% (爆アド枠)
    'super_return', jsonb_build_object('min', 20000, 'max', 25000, 'weight', 30)  -- 3% (超爆アド枠)
  ),
  'point_return_patterns', jsonb_build_array(
    1980, 3650, 5600, 6800, 8900, 12000, 15000, 20000
  )
) WHERE id IN (
  SELECT id FROM gacha_products LIMIT 4
);

-- 4. DOPA式確率計算用のview作成
CREATE OR REPLACE VIEW gacha_dopa_probability AS
SELECT 
  gp.id as gacha_product_id,
  gp.name as gacha_name,
  gp.single_price,
  gp.dopa_settings,
  -- 実質還元率計算
  CASE 
    WHEN (gp.dopa_settings->>'actual_return_rate')::numeric IS NOT NULL 
    THEN (gp.dopa_settings->>'actual_return_rate')::numeric
    ELSE 0.70
  END as actual_return_rate,
  -- 体感還元率計算  
  CASE 
    WHEN (gp.dopa_settings->>'display_return_rate')::numeric IS NOT NULL 
    THEN (gp.dopa_settings->>'display_return_rate')::numeric
    ELSE 0.97
  END as display_return_rate,
  -- 期待収益計算（端数課金効果を含む）
  gp.single_price * 0.7 as expected_user_spend_per_round,  -- 端数で70%課金
  gp.single_price - (gp.single_price * 0.7) as revenue_per_round
FROM gacha_products gp
WHERE gp.is_active = true;

-- 5. ポイント還元カード用のガチャプール自動生成関数
CREATE OR REPLACE FUNCTION generate_dopa_gacha_pool(
  p_gacha_product_id UUID,
  p_total_weight INTEGER DEFAULT 1000
) RETURNS INTEGER AS $$
DECLARE
  physical_card_weight INTEGER := 150;  -- 物理カード15%
  point_card_weight INTEGER := 850;    -- ポイント還元カード85%
  inserted_count INTEGER := 0;
BEGIN
  -- 既存のプールをクリア
  DELETE FROM gacha_pokemon_pools WHERE gacha_product_id = p_gacha_product_id;
  
  -- 物理カード（当たり枠）を追加 - 15%
  INSERT INTO gacha_pokemon_pools (gacha_product_id, card_id, weight)
  SELECT 
    p_gacha_product_id,
    pc.id,
    CASE 
      WHEN pc.rarity = 'SS' THEN 5    -- SS: 0.5%
      WHEN pc.rarity = 'S' THEN 25    -- S: 2.5%  
      WHEN pc.rarity = 'A' THEN 50    -- A: 5%
      WHEN pc.rarity = 'B' THEN 70    -- B: 7%
      ELSE 0
    END as weight
  FROM pokemon_cards pc
  WHERE pc.card_type = 'physical' 
    AND pc.rarity IN ('SS', 'S', 'A', 'B')
  ORDER BY RANDOM()
  LIMIT 20;
  
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  
  -- ポイント還元カード（ハズレ枠）を追加 - 85%
  INSERT INTO gacha_pokemon_pools (gacha_product_id, card_id, weight)
  SELECT 
    p_gacha_product_id,
    pc.id,
    CASE 
      WHEN pc.point_value >= 12000 THEN 50    -- 爆アド 5%
      WHEN pc.point_value >= 5600 THEN 200    -- 中還元 20%
      WHEN pc.point_value >= 1980 THEN 350    -- 普通還元 35%
      ELSE 250                                -- 低還元 25%
    END as weight
  FROM pokemon_cards pc
  WHERE pc.card_type = 'point_return'
  ORDER BY pc.point_value DESC;
  
  GET DIAGNOSTICS inserted_count = inserted_count + ROW_COUNT;
  
  RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;

-- 6. 既存のガチャにDOPA式プールを適用
SELECT generate_dopa_gacha_pool(id) FROM gacha_products WHERE is_active = true LIMIT 4;

COMMENT ON COLUMN pokemon_cards.card_type IS 'カードタイプ: physical(物理カード), point_return(ポイント還元), bonus_pack(お楽しみパック)';
COMMENT ON COLUMN pokemon_cards.point_value IS 'ポイント還元カードの還元ポイント数';
COMMENT ON COLUMN gacha_products.dopa_settings IS 'DOPA式ガチャ設定(実質還元率、爆アド設定等)';
COMMENT ON FUNCTION generate_dopa_gacha_pool IS 'DOPA式ガチャプール自動生成(物理カード15%、ポイント還元85%)';