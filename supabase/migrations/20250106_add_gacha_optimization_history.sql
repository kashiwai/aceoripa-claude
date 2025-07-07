-- ガチャ最適化履歴テーブルの作成
CREATE TABLE IF NOT EXISTS gacha_optimization_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gacha_id UUID NOT NULL REFERENCES gacha_products(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('exclusion', 'price_adjustment', 'card_reduction')),
  plan_name VARCHAR(255) NOT NULL,
  plan_details JSONB NOT NULL,
  applied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- インデックスの作成
CREATE INDEX idx_gacha_optimization_history_gacha_id ON gacha_optimization_history(gacha_id);
CREATE INDEX idx_gacha_optimization_history_applied_at ON gacha_optimization_history(applied_at);
CREATE INDEX idx_gacha_optimization_history_plan_type ON gacha_optimization_history(plan_type);

-- コメントを追加
COMMENT ON TABLE gacha_optimization_history IS 'ガチャのAI最適化履歴を記録するテーブル';
COMMENT ON COLUMN gacha_optimization_history.plan_type IS '最適化プランのタイプ（exclusion: レアリティ除外, price_adjustment: 価格調整, card_reduction: カード削減）';
COMMENT ON COLUMN gacha_optimization_history.plan_details IS 'プランの詳細情報（JSON形式）';

-- ガチャ収益分析ビューの作成
CREATE OR REPLACE VIEW gacha_profitability_analysis AS
WITH gacha_stats AS (
  SELECT 
    gp.id,
    gp.name,
    gp.price,
    gp.is_active,
    gp.created_at,
    COUNT(DISTINCT gpp.pokemon_card_id) as total_cards,
    COUNT(DISTINCT CASE WHEN pc.rarity = 'SS' THEN gpp.pokemon_card_id END) as ss_cards,
    COUNT(DISTINCT CASE WHEN pc.rarity = 'S' THEN gpp.pokemon_card_id END) as s_cards,
    COUNT(DISTINCT CASE WHEN pc.rarity = 'A' THEN gpp.pokemon_card_id END) as a_cards,
    COUNT(DISTINCT CASE WHEN pc.rarity = 'B' THEN gpp.pokemon_card_id END) as b_cards,
    COUNT(DISTINCT CASE WHEN pc.rarity = 'C' THEN gpp.pokemon_card_id END) as c_cards
  FROM gacha_products gp
  LEFT JOIN gacha_pokemon_pools gpp ON gp.id = gpp.gacha_product_id
  LEFT JOIN pokemon_cards pc ON gpp.pokemon_card_id = pc.id
  GROUP BY gp.id, gp.name, gp.price, gp.is_active, gp.created_at
),
gacha_costs AS (
  SELECT 
    gp.id,
    SUM(
      CASE 
        WHEN gpp.weight > 0 
        THEN (gpp.weight::DECIMAL / NULLIF(SUM(gpp.weight) OVER (PARTITION BY gp.id), 0)) * COALESCE(pc.aceoripa_price, pc.market_price, 0)
        ELSE 0 
      END
    ) as expected_cost
  FROM gacha_products gp
  LEFT JOIN gacha_pokemon_pools gpp ON gp.id = gpp.gacha_product_id
  LEFT JOIN pokemon_cards pc ON gpp.pokemon_card_id = pc.id
  GROUP BY gp.id
),
gacha_sales AS (
  SELECT 
    gacha_product_id,
    COUNT(*) as total_sales,
    MAX(created_at) as last_sale_at
  FROM gacha_results_pokemon
  GROUP BY gacha_product_id
)
SELECT 
  gs.id,
  gs.name,
  gs.price,
  gs.is_active,
  gs.total_cards,
  gs.ss_cards,
  gs.s_cards,
  gs.a_cards,
  gs.b_cards,
  gs.c_cards,
  COALESCE(gc.expected_cost, 0) as expected_cost,
  CASE 
    WHEN gs.price > 0 
    THEN ((gs.price - COALESCE(gc.expected_cost, 0)) / gs.price * 100)
    ELSE 0 
  END as profit_rate,
  COALESCE(gsl.total_sales, 0) as total_sales,
  COALESCE(gsl.total_sales * gs.price, 0) as total_revenue,
  COALESCE(gsl.total_sales * gc.expected_cost, 0) as total_cost,
  COALESCE(gsl.total_sales * gs.price - gsl.total_sales * gc.expected_cost, 0) as total_profit,
  gsl.last_sale_at,
  gs.created_at
FROM gacha_stats gs
LEFT JOIN gacha_costs gc ON gs.id = gc.id
LEFT JOIN gacha_sales gsl ON gs.id = gsl.gacha_product_id
ORDER BY gs.created_at DESC;

-- RLSポリシーの設定
ALTER TABLE gacha_optimization_history ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能
CREATE POLICY "Admins can manage optimization history"
  ON gacha_optimization_history
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );