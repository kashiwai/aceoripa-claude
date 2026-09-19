-- Supabase Storage設定: 動画アップロード用バケット作成
-- このスクリプトをSupabase Dashboard > SQL Editorで実行してください

-- 1. videosバケットの作成（存在しない場合）
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 既存のポリシーを削除（エラー回避のため）
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own videos" ON storage.objects;

-- 3. バケットのポリシー設定

-- 全員が動画を閲覧可能
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'videos' );

-- 認証済みユーザーが動画をアップロード可能
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos'
  AND auth.role() = 'authenticated'
);

-- 認証済みユーザーが自分の動画を更新可能
CREATE POLICY "Users can update own videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'videos'
  AND auth.role() = 'authenticated'
);

-- 認証済みユーザーが自分の動画を削除可能
CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos'
  AND auth.role() = 'authenticated'
);

-- 完了メッセージ
SELECT 'Storage bucket "videos" has been created successfully!' as message;
