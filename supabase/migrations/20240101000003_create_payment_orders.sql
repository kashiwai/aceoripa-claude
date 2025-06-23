-- payment_ordersテーブル作成
CREATE TABLE IF NOT EXISTS payment_orders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  points INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT positive_points CHECK (points > 0)
);

-- インデックス作成
CREATE INDEX idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);
CREATE INDEX idx_payment_orders_created_at ON payment_orders(created_at DESC);

-- RLSポリシー設定
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の注文のみ参照可能
CREATE POLICY "Users can view own payment orders" ON payment_orders
  FOR SELECT USING (auth.uid() = user_id);

-- 管理者は全ての注文を参照可能
CREATE POLICY "Admin can view all payment orders" ON payment_orders
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email = current_setting('app.admin_email', true)
    )
  );