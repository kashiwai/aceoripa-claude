-- 価格バッチ実行履歴テーブル
CREATE TABLE IF NOT EXISTS price_batch_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  total_cards INTEGER DEFAULT 0,
  processed_cards INTEGER DEFAULT 0,
  successful_cards INTEGER DEFAULT 0,
  failed_cards INTEGER DEFAULT 0,
  total_prices_found INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- バッチスケジュール設定テーブル
CREATE TABLE IF NOT EXISTS price_batch_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_name VARCHAR(255) NOT NULL,
  frequency VARCHAR(50) NOT NULL, -- 'monthly_3times', 'monthly_4times', 'weekly', 'custom'
  day_of_month INTEGER[], -- [1, 10, 20] for 3 times a month
  is_active BOOLEAN DEFAULT true,
  last_run_id UUID REFERENCES price_batch_runs(id),
  next_run_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- カード別最終取得日時テーブル（効率化のため）
CREATE TABLE IF NOT EXISTS card_last_price_update (
  card_id UUID PRIMARY KEY REFERENCES pokemon_cards(id) ON DELETE CASCADE,
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_batch_run_id UUID REFERENCES price_batch_runs(id),
  update_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- インデックス
CREATE INDEX idx_batch_runs_status ON price_batch_runs(status);
CREATE INDEX idx_batch_runs_created ON price_batch_runs(created_at DESC);
CREATE INDEX idx_card_last_update ON card_last_price_update(last_updated_at);

-- デフォルトスケジュールを作成（月3回: 1日、10日、20日）
INSERT INTO price_batch_schedule (schedule_name, frequency, day_of_month, is_active, next_run_date)
VALUES (
  'デフォルトスケジュール（月3回）',
  'monthly_3times',
  ARRAY[1, 10, 20],
  true,
  CASE 
    WHEN EXTRACT(DAY FROM CURRENT_DATE) < 1 THEN DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '0 days'
    WHEN EXTRACT(DAY FROM CURRENT_DATE) < 10 THEN DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '9 days'
    WHEN EXTRACT(DAY FROM CURRENT_DATE) < 20 THEN DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '19 days'
    ELSE DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month') + INTERVAL '0 days'
  END
);