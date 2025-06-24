-- 管理者認証テーブルの作成
CREATE TABLE IF NOT EXISTS admin_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- RLSを無効化（管理者テーブルなので）
ALTER TABLE admin_credentials DISABLE ROW LEVEL SECURITY;

-- SQL実行用の関数を作成
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    EXECUTE query;
    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- 初期管理者アカウントを作成（パスワード: admin123）
INSERT INTO admin_credentials (username, password_hash, role) 
VALUES ('admin', encode(digest('admin123', 'sha256'), 'base64'), 'superadmin')
ON CONFLICT (username) DO NOTHING;