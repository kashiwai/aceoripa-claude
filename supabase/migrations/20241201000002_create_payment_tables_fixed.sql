-- 決済関連のテーブルを作成（transactions テーブルは既存のため除外）

-- 決済注文テーブル
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL,
    point_amount INTEGER NOT NULL,
    bonus_points INTEGER DEFAULT 0,
    package_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
    payment_method TEXT,
    fincode_payment_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 決済セッションテーブル
CREATE TABLE IF NOT EXISTS payment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, cancelled
    fincode_payment_id TEXT,
    fincode_access_id TEXT,
    fincode_access_token TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 決済履歴テーブル
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    point_amount INTEGER NOT NULL,
    payment_method TEXT NOT NULL, -- card, bank_transfer, etc
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
    fincode_payment_id TEXT,
    fincode_order_id TEXT,
    card_last4 TEXT,
    card_brand TEXT,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ユーザー決済方法（保存カード）テーブル
CREATE TABLE IF NOT EXISTS user_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fincode_customer_id TEXT,
    fincode_card_id TEXT NOT NULL,
    last4 TEXT NOT NULL,
    brand TEXT NOT NULL,
    exp_month INTEGER NOT NULL,
    exp_year INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ポイント履歴テーブル
CREATE TABLE IF NOT EXISTS point_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- 正の値：追加、負の値：使用
    balance_after INTEGER NOT NULL,
    type TEXT NOT NULL, -- purchase, gacha, bonus, refund, etc
    description TEXT,
    related_id UUID, -- 関連するID（payment_history.id, gacha_draws.id など）
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_payment_sessions_user_id ON payment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_session_id ON payment_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON payment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_expires_at ON payment_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at);

CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user_id ON user_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_fincode_customer_id ON user_payment_methods(fincode_customer_id);

CREATE INDEX IF NOT EXISTS idx_point_history_user_id ON point_history(user_id);
CREATE INDEX IF NOT EXISTS idx_point_history_type ON point_history(type);
CREATE INDEX IF NOT EXISTS idx_point_history_created_at ON point_history(created_at);

-- ユーザーごとに1つのデフォルトカードのみを保証するトリガー
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE user_payment_methods 
        SET is_default = false 
        WHERE user_id = NEW.user_id 
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default_payment_method_trigger
BEFORE INSERT OR UPDATE ON user_payment_methods
FOR EACH ROW
EXECUTE FUNCTION ensure_single_default_payment_method();

-- 既存の transactions テーブルに必要なカラムを追加
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'payment';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_order_id UUID REFERENCES payment_orders(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS gacha_product_id UUID;

-- ポイント取引テーブル（存在しない場合は作成）
CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- add, use, bonus, refund
    amount INTEGER NOT NULL,
    point_type TEXT NOT NULL, -- free, paid
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT,
    transaction_id UUID REFERENCES transactions(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ユーザーポイント残高テーブル（存在しない場合は作成）
CREATE TABLE IF NOT EXISTS user_points (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    free_points INTEGER NOT NULL DEFAULT 0,
    paid_points INTEGER NOT NULL DEFAULT 0,
    total_points_earned INTEGER NOT NULL DEFAULT 0,
    total_points_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 既存の決済関連テーブルにインデックスを追加
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON payment_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(type);