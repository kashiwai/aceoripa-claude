-- カード価格履歴テーブル
CREATE TABLE IF NOT EXISTS card_price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES pokemon_cards(id) ON DELETE CASCADE,
  source VARCHAR(100) NOT NULL, -- 'mercari', 'yahoo_auction', 'magi', 'pokemon_card_station'
  price DECIMAL(10,2) NOT NULL,
  condition VARCHAR(50), -- 'mint', 'near_mint', 'excellent', 'good', 'poor'
  listing_url TEXT,
  listed_at TIMESTAMP WITH TIME ZONE,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 価格アラートテーブル
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES pokemon_cards(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'increase', 'decrease', 'threshold'
  threshold_percentage DECIMAL(5,2), -- 5% = 5.00
  threshold_price DECIMAL(10,2),
  previous_avg_price DECIMAL(10,2),
  current_avg_price DECIMAL(10,2),
  price_change_percentage DECIMAL(5,2),
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 価格監視設定テーブル
CREATE TABLE IF NOT EXISTS price_monitoring_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES pokemon_cards(id) ON DELETE CASCADE,
  monitoring_enabled BOOLEAN DEFAULT true,
  alert_threshold_percentage DECIMAL(5,2) DEFAULT 5.00,
  min_price_threshold DECIMAL(10,2) DEFAULT 0.00,
  max_price_threshold DECIMAL(10,2),
  notification_email VARCHAR(255),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(card_id)
);

-- インデックス
CREATE INDEX idx_price_history_card_id ON card_price_history(card_id);
CREATE INDEX idx_price_history_source ON card_price_history(source);
CREATE INDEX idx_price_history_fetched_at ON card_price_history(fetched_at DESC);
CREATE INDEX idx_price_alerts_card_id ON price_alerts(card_id);
CREATE INDEX idx_price_alerts_triggered_at ON price_alerts(triggered_at DESC);
CREATE INDEX idx_price_alerts_resolved ON price_alerts(is_resolved);

-- 更新日時を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_price_monitoring_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_price_monitoring_settings_updated_at
  BEFORE UPDATE ON price_monitoring_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_price_monitoring_updated_at();

-- RLSポリシー
ALTER TABLE card_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_monitoring_settings ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能
CREATE POLICY "Admin can manage price history" ON card_price_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can manage price alerts" ON price_alerts
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can manage monitoring settings" ON price_monitoring_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);