-- バナー管理用のテーブルを作成

-- メインバナー用のテーブル
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT NOT NULL,
    link_type TEXT NOT NULL DEFAULT 'gacha', -- 'gacha', 'campaign', 'external'
    priority INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    background_color TEXT DEFAULT 'from-blue-500 to-purple-600',
    text_color TEXT DEFAULT 'text-white',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Square バナー設定用のテーブル
CREATE TABLE IF NOT EXISTS square_banner_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_square_banners BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Square バナー用のテーブル
CREATE TABLE IF NOT EXISTS square_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gacha_id TEXT,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    color TEXT,
    image TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- キャンペーンバナー設定用のテーブル
CREATE TABLE IF NOT EXISTS campaign_banner_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_all_banners BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- キャンペーンバナー用のテーブル
CREATE TABLE IF NOT EXISTS campaign_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    bg_color TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初期データを挿入
INSERT INTO banners (title, subtitle, description, image_url, link_url, link_type, priority, is_active, background_color, text_color) VALUES
('ピカチュウ大祭り！', 'SSR確率2倍UP開催中', '期間限定でSSR確率が2倍！この機会をお見逃しなく！', '/images/banners/real-gacha/S__44392515_0.jpg', '/gacha/1', 'gacha', 1, true, 'from-yellow-400 to-orange-500', 'text-white'),
('ナンジャモコレクション', '新登場プレミアムガチャ', 'ナンジャモの限定カードが大量出現！', '/images/banners/real-gacha/S__44392516_0.jpg', '/gacha/2', 'gacha', 2, true, 'from-purple-500 to-pink-500', 'text-white');

-- Square バナー設定の初期値
INSERT INTO square_banner_settings (show_square_banners) VALUES (true);

-- Square バナーの初期データ
INSERT INTO square_banners (gacha_id, title, subtitle, color, image, is_active, priority) VALUES
('1', '激アツ！ピカチュウ祭り', 'マリオピカチュウPSA10確定！', 'bg-gradient-to-r from-[#FFD700] to-[#FF6600]', '/images/basebg/A_luxurious_gold-framed_Pokmon_trading_card_is_t-1750539990520.png', true, 1),
('2', 'プレミアムBOX', 'SSレア確率50%UP！', 'bg-gradient-to-r from-[#9333EA] to-[#EC4899]', '/images/basebg/A_dazzling_spectacle_featuring_a_dazzling_Pokmon_-1750539986706.png', true, 2),
('3', '限定100パック！', 'ナンジャモ&リーリエ狙い撃ち', 'bg-gradient-to-r from-[#0EA5E9] to-[#6366F1]', '/images/basebg/A_vibrant_and_colorful_backdrop_featuring_a_rainbo-1750539998852.png', true, 3),
('4', '新春超豪華オリパ', 'アセロラPSA10大量封入！', 'bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]', '/images/basebg/A_festive_scene_with_a_large_shimmering_drum_at_t-1750539994085.png', false, 4),
('5', 'ブラッキー感謝祭', 'ブラッキーex PSA10確率3倍！', 'bg-gradient-to-r from-[#1F2937] to-[#7C3AED]', '/images/basebg/A_cosmic_scene_featuring_a_dazzling_trading_card_-1750539978161.png', false, 5);

-- キャンペーンバナー設定の初期値
INSERT INTO campaign_banner_settings (show_all_banners) VALUES (true);

-- キャンペーンバナーの初期データ
INSERT INTO campaign_banners (title, subtitle, bg_color, is_active, priority) VALUES
('🎉 新規登録キャンペーン', '今なら5000ポイントプレゼント！', 'from-purple-600 to-pink-600', true, 1),
('🎁 友達紹介キャンペーン', '友達を紹介して3000ポイントGET！', 'from-blue-600 to-cyan-600', true, 2),
('⚡ 期間限定！SSR確率2倍', '12/25まで全ガチャでSSR確率アップ中', 'from-yellow-500 to-orange-600', false, 3);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_banners_priority ON banners(priority);
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_square_banners_priority ON square_banners(priority);
CREATE INDEX IF NOT EXISTS idx_square_banners_is_active ON square_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_campaign_banners_priority ON campaign_banners(priority);
CREATE INDEX IF NOT EXISTS idx_campaign_banners_is_active ON campaign_banners(is_active);