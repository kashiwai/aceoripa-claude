-- announcementsテーブルの作成
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- bannersテーブルの作成
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_type VARCHAR(50),
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  background_color VARCHAR(100),
  text_color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLSを無効にする（開発環境用）
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;

-- インデックスの作成
CREATE INDEX idx_announcements_active ON announcements(is_active);
CREATE INDEX idx_announcements_dates ON announcements(start_date, end_date);
CREATE INDEX idx_banners_active ON banners(is_active);
CREATE INDEX idx_banners_priority ON banners(priority);

-- サンプルデータの挿入
INSERT INTO announcements (title, content, type, is_active) VALUES
  ('ようこそ！', '新しいガチャシステムへようこそ！', 'info', true),
  ('メンテナンスのお知らせ', '毎週火曜日の深夜2:00-5:00はメンテナンスを行います。', 'warning', true);

INSERT INTO banners (title, subtitle, description, image_url, link_url, link_type, priority, is_active) VALUES
  ('新規登録キャンペーン', '今なら500Pプレゼント！', '新規登録で500ポイントをプレゼント中！', '/images/banner1.jpg', '/auth/register', 'internal', 1, true),
  ('友達紹介キャンペーン', '最大1000Pゲット！', '友達を紹介して1000ポイントをゲット！', '/images/banner2.jpg', '/mypage/referral', 'internal', 2, true);