-- 価格チェックログテーブルの作成
CREATE TABLE IF NOT EXISTS price_check_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES pokemon_cards(id) ON DELETE CASCADE,
  expected_price DECIMAL(10,2) NOT NULL,
  average_price DECIMAL(10,2) NOT NULL,
  is_valid BOOLEAN NOT NULL,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- インデックスの作成
CREATE INDEX idx_price_check_logs_card_id ON price_check_logs(card_id);
CREATE INDEX idx_price_check_logs_checked_at ON price_check_logs(checked_at);
CREATE INDEX idx_price_check_logs_is_valid ON price_check_logs(is_valid);
CREATE INDEX idx_price_check_logs_user_id ON price_check_logs(user_id);

-- 価格チェックサマリービューの作成
CREATE OR REPLACE VIEW price_check_summary AS
SELECT 
  pc.id,
  pc.card_name,
  pc.product_code,
  pc.market_price,
  pc.rarity,
  COUNT(pcl.id) as total_checks,
  COUNT(CASE WHEN pcl.is_valid THEN 1 END) as valid_checks,
  COUNT(CASE WHEN NOT pcl.is_valid THEN 1 END) as invalid_checks,
  AVG(pcl.expected_price) as avg_expected_price,
  MAX(pcl.checked_at) as last_checked_at
FROM pokemon_cards pc
LEFT JOIN price_check_logs pcl ON pc.id = pcl.card_id
GROUP BY pc.id, pc.card_name, pc.product_code, pc.market_price, pc.rarity;

-- 上位400位カードの価格監視ビュー
CREATE OR REPLACE VIEW top_400_cards_monitoring AS
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
  rc.price_rank,
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

-- RLSポリシーの設定
ALTER TABLE price_check_logs ENABLE ROW LEVEL SECURITY;

-- 管理者は全てのログを見れる
CREATE POLICY "Admins can view all price check logs"
  ON price_check_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- ユーザーは自分のログのみ見れる
CREATE POLICY "Users can view their own price check logs"
  ON price_check_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- システムは全てのログを作成できる
CREATE POLICY "System can insert price check logs"
  ON price_check_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);