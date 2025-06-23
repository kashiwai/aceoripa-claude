-- 紹介コードテーブル
CREATE TABLE referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 紹介関係テーブル
CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 紹介者
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 被紹介者
  referral_code VARCHAR(20) NOT NULL REFERENCES referral_codes(code),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_payment_at TIMESTAMP WITH TIME ZONE, -- 初回決済日時
  referrer_points_awarded INTEGER DEFAULT 0, -- 紹介者に付与したポイント
  referred_points_awarded INTEGER DEFAULT 0, -- 被紹介者に付与したポイント
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 紹介キャンペーン設定テーブル
CREATE TABLE referral_campaign_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_bonus_points INTEGER DEFAULT 1000, -- 紹介者ボーナスポイント
  referred_bonus_points INTEGER DEFAULT 500, -- 被紹介者ボーナスポイント
  min_payment_amount INTEGER DEFAULT 100, -- 最小決済金額
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初期キャンペーン設定
INSERT INTO referral_campaign_settings (referrer_bonus_points, referred_bonus_points, min_payment_amount) 
VALUES (1000, 500, 100);

-- インデックスの作成
CREATE INDEX idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_referrals_status ON referrals(status);

-- 更新日時の自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_referral_codes_updated_at BEFORE UPDATE ON referral_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_campaign_settings_updated_at BEFORE UPDATE ON referral_campaign_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 紹介コード生成関数
CREATE OR REPLACE FUNCTION generate_referral_code(user_id_param UUID)
RETURNS VARCHAR AS $$
DECLARE
  new_code VARCHAR(20);
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- ランダムな8文字の英数字コードを生成
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 1, 8));
    
    -- コードが既に存在するかチェック
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
    
    IF NOT code_exists THEN
      -- 新しいコードを挿入
      INSERT INTO referral_codes (user_id, code, is_active) 
      VALUES (user_id_param, new_code, false)
      ON CONFLICT (user_id) DO UPDATE 
      SET code = new_code, updated_at = NOW();
      
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ユーザーテーブルにカラム追加（既存のusersテーブルに追加）
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_points_earned INTEGER DEFAULT 0;