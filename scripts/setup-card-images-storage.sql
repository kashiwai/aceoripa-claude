-- Supabase Storage設定: カード画像用バケット作成
-- このスクリプトをSupabase Dashboard > SQL Editorで実行してください

-- 1. card-imagesバケットの作成（存在しない場合）
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 既存のポリシーを削除（エラー回避のため）
DROP POLICY IF EXISTS "Public Access for card images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload card images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage card images" ON storage.objects;

-- 3. バケットのポリシー設定

-- 全員がカード画像を閲覧可能
CREATE POLICY "Public Access for card images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'card-images' );

-- 認証済みユーザーがカード画像をアップロード可能
CREATE POLICY "Authenticated users can upload card images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'card-images'
  AND auth.role() = 'authenticated'
);

-- サービスロールが全ての操作を実行可能
CREATE POLICY "Service role can manage card images"
ON storage.objects FOR ALL
USING (
  bucket_id = 'card-images'
  AND auth.role() = 'service_role'
);

-- 完了メッセージ
SELECT 'Storage bucket "card-images" has been created successfully!' as message;
