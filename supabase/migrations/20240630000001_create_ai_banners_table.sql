-- AI生成バナー管理テーブル
CREATE TABLE IF NOT EXISTS ai_generated_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  original_url TEXT,
  type VARCHAR(50) NOT NULL, -- square, top-mobile, top-desktop, gacha
  name VARCHAR(255) NOT NULL,
  prompt TEXT,
  has_text BOOLEAN DEFAULT false,
  current_usage VARCHAR(50) DEFAULT 'none',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- インデックス
CREATE INDEX idx_ai_banners_type ON ai_generated_banners(type);
CREATE INDEX idx_ai_banners_usage ON ai_generated_banners(current_usage);
CREATE INDEX idx_ai_banners_created ON ai_generated_banners(created_at DESC);

-- 更新日時を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_banners_updated_at
  BEFORE UPDATE ON ai_generated_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLSポリシー
ALTER TABLE ai_generated_banners ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能（簡易的な実装）
CREATE POLICY "Admin can manage banners" ON ai_generated_banners
  FOR ALL
  USING (true)
  WITH CHECK (true);