-- announcementsテーブルを作成
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_dates ON announcements(start_date, end_date);

-- RLSを有効化
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 読み取り専用ポリシー（全員が読める）
CREATE POLICY "Allow public read access to active announcements" ON announcements
    FOR SELECT USING (is_active = true);

-- サンプルデータを挿入
INSERT INTO announcements (title, content, type, is_active, priority) VALUES
('システムメンテナンスのお知らせ', '本日深夜2:00〜3:00の間、システムメンテナンスを実施します。', 'warning', true, 1),
('新機能リリース', '新しいガチャ演出を追加しました！', 'success', true, 0)
ON CONFLICT DO NOTHING;

-- ガチャテーブルの修正も一緒に実行
-- gacha_productsテーブルに必要なカラムを追加
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS banner_image_url TEXT,
ADD COLUMN IF NOT EXISTS single_price INTEGER,
ADD COLUMN IF NOT EXISTS multi_price INTEGER,
ADD COLUMN IF NOT EXISTS card_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_stock INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;

-- 既存データの移行
UPDATE gacha_products 
SET single_price = COALESCE(single_price, price, 150),
    multi_price = COALESCE(multi_price, single_price * 10, price * 10, 1500),
    card_count = COALESCE(card_count, 1)
WHERE single_price IS NULL OR multi_price IS NULL;