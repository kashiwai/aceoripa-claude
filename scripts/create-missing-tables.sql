-- referral_campaign_settingsテーブルの作成
CREATE TABLE IF NOT EXISTS public.referral_campaign_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    is_active BOOLEAN DEFAULT true,
    referrer_bonus INTEGER DEFAULT 500,
    referee_bonus INTEGER DEFAULT 300,
    min_purchase_amount INTEGER DEFAULT 0,
    max_uses_per_code INTEGER DEFAULT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 初期データの挿入
INSERT INTO public.referral_campaign_settings (
    is_active,
    referrer_bonus,
    referee_bonus,
    min_purchase_amount
) VALUES (
    true,
    500,
    300,
    0
) ON CONFLICT DO NOTHING;

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_referral_campaign_active ON public.referral_campaign_settings(is_active);