-- pokemon_cardsテーブルにエースオリパ価格カラムを追加
ALTER TABLE pokemon_cards
ADD COLUMN IF NOT EXISTS aceoripa_price INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS price_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_aceoripa_price ON pokemon_cards(aceoripa_price);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_price_updated_at ON pokemon_cards(price_updated_at);

-- コメントを追加
COMMENT ON COLUMN pokemon_cards.aceoripa_price IS 'エースオリパでの販売価格';
COMMENT ON COLUMN pokemon_cards.price_updated_at IS 'エースオリパ価格の最終更新日時';

-- 価格差異ビューを作成
CREATE OR REPLACE VIEW card_price_comparison AS
SELECT 
  pc.id,
  pc.card_name,
  pc.product_code,
  pc.rarity,
  pc.market_price,
  pc.aceoripa_price,
  pc.price_updated_at,
  CASE 
    WHEN pc.aceoripa_price IS NULL THEN '未設定'
    WHEN pc.aceoripa_price = pc.market_price THEN '同額'
    WHEN pc.aceoripa_price > pc.market_price THEN '高値'
    WHEN pc.aceoripa_price < pc.market_price THEN '安値'
  END as price_status,
  CASE 
    WHEN pc.aceoripa_price IS NOT NULL AND pc.market_price > 0 
    THEN ROUND(((pc.aceoripa_price::DECIMAL - pc.market_price::DECIMAL) / pc.market_price::DECIMAL) * 100, 2)
    ELSE NULL
  END as price_difference_percentage,
  ROW_NUMBER() OVER (ORDER BY pc.market_price DESC) as market_price_rank
FROM pokemon_cards pc
WHERE pc.market_price > 0;

-- 上位400カード価格監視ビューを更新
DROP VIEW IF EXISTS top_400_cards_monitoring;
CREATE VIEW top_400_cards_monitoring AS
WITH ranked_cards AS (
  SELECT 
    pc.*,
    ROW_NUMBER() OVER (ORDER BY pc.market_price DESC) as price_rank
  FROM pokemon_cards pc
)
SELECT 
  rc.id,
  rc.card_name,
  rc.product_code,
  rc.rarity,
  rc.market_price,
  rc.aceoripa_price,
  rc.price_updated_at,
  rc.price_rank,
  CASE 
    WHEN rc.aceoripa_price IS NULL THEN '未設定'
    WHEN rc.aceoripa_price = rc.market_price THEN '同額'
    WHEN rc.aceoripa_price > rc.market_price THEN CONCAT('+', ROUND(((rc.aceoripa_price::DECIMAL - rc.market_price::DECIMAL) / rc.market_price::DECIMAL) * 100, 2), '%')
    WHEN rc.aceoripa_price < rc.market_price THEN CONCAT('-', ROUND(((rc.market_price::DECIMAL - rc.aceoripa_price::DECIMAL) / rc.market_price::DECIMAL) * 100, 2), '%')
  END as price_difference,
  COALESCE(cph.avg_recent_price, rc.market_price) as current_avg_price,
  COALESCE(cph.price_variance, 0) as price_variance,
  COALESCE(cph.last_update, rc.updated_at) as last_price_update
FROM ranked_cards rc
LEFT JOIN LATERAL (
  SELECT 
    AVG(price)::DECIMAL(10,2) as avg_recent_price,
    STDDEV(price)::DECIMAL(10,2) as price_variance,
    MAX(fetched_at) as last_update
  FROM card_price_history
  WHERE card_id = rc.id
    AND fetched_at >= NOW() - INTERVAL '7 days'
) cph ON true
WHERE rc.price_rank <= 400
ORDER BY rc.price_rank;

-- エースオリパ価格履歴テーブルを作成
CREATE TABLE IF NOT EXISTS aceoripa_price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES pokemon_cards(id) ON DELETE CASCADE,
  old_price INTEGER,
  new_price INTEGER NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- インデックスを追加
CREATE INDEX idx_aceoripa_price_history_card_id ON aceoripa_price_history(card_id);
CREATE INDEX idx_aceoripa_price_history_created_at ON aceoripa_price_history(created_at);

-- 価格更新時のトリガー関数を作成
CREATE OR REPLACE FUNCTION update_aceoripa_price_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.aceoripa_price IS DISTINCT FROM OLD.aceoripa_price THEN
    NEW.price_updated_at = TIMEZONE('utc', NOW());
    
    -- 価格履歴に記録
    INSERT INTO aceoripa_price_history (card_id, old_price, new_price)
    VALUES (NEW.id, OLD.aceoripa_price, NEW.aceoripa_price);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
CREATE TRIGGER update_aceoripa_price_timestamp_trigger
BEFORE UPDATE ON pokemon_cards
FOR EACH ROW
EXECUTE FUNCTION update_aceoripa_price_timestamp();