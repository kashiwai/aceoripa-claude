-- ユーザー登録時に自動的にuser_pointsを初期化するトリガー

-- 既存のトリガーを削除（存在する場合）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 新しいユーザーが作成されたときにuser_pointsを初期化する関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- user_pointsテーブルに初期ポイントを挿入
  INSERT INTO public.user_points (user_id, free_points, paid_points, created_at)
  VALUES (new.id, 1000, 0, now())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.usersテーブルにトリガーを作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 既存のユーザーに対してuser_pointsを初期化
INSERT INTO public.user_points (user_id, free_points, paid_points, created_at)
SELECT 
  id,
  1000,
  0,
  COALESCE(created_at, now())
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_points)
ON CONFLICT (user_id) DO NOTHING;