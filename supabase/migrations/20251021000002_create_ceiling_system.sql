-- 天井システム実装マイグレーション
-- Issue #10: 天井システムフル実装

-- 1. gacha_productsテーブルに天井回数カラムを追加
ALTER TABLE gacha_products
ADD COLUMN IF NOT EXISTS ceiling_count INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS ceiling_enabled BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN gacha_products.ceiling_count IS '天井到達までの回数（デフォルト: 100連）';
COMMENT ON COLUMN gacha_products.ceiling_enabled IS '天井システムの有効/無効';

-- 2. 天井進捗テーブル作成
CREATE TABLE IF NOT EXISTS gacha_ceiling_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gacha_id UUID NOT NULL REFERENCES gacha_products(id) ON DELETE CASCADE,
  pull_count INTEGER NOT NULL DEFAULT 0,
  last_ssr_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- ユーザーとガチャの組み合わせは一意
  UNIQUE(user_id, gacha_id)
);

COMMENT ON TABLE gacha_ceiling_progress IS 'ユーザーごとのガチャ天井進捗管理';
COMMENT ON COLUMN gacha_ceiling_progress.pull_count IS 'SSR排出後の累計引き数';
COMMENT ON COLUMN gacha_ceiling_progress.last_ssr_at IS '最後にSSRを引いた日時';

-- 3. インデックス作成（パフォーマンス最適化）
CREATE INDEX IF NOT EXISTS idx_ceiling_progress_user_gacha
  ON gacha_ceiling_progress(user_id, gacha_id);

CREATE INDEX IF NOT EXISTS idx_ceiling_progress_user
  ON gacha_ceiling_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_ceiling_progress_updated
  ON gacha_ceiling_progress(updated_at DESC);

-- 4. 自動更新トリガー（updated_atの自動更新）
CREATE OR REPLACE FUNCTION update_ceiling_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ceiling_progress_updated_at
  BEFORE UPDATE ON gacha_ceiling_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_ceiling_progress_updated_at();

-- 5. Row Level Security (RLS) 設定
ALTER TABLE gacha_ceiling_progress ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の進捗のみ閲覧可能
CREATE POLICY "Users can view their own ceiling progress"
  ON gacha_ceiling_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- システムのみが進捗を挿入/更新可能（service_roleで実行）
CREATE POLICY "Service role can manage ceiling progress"
  ON gacha_ceiling_progress
  FOR ALL
  USING (auth.role() = 'service_role');

-- 6. 天井進捗更新用のストアドファンシション
CREATE OR REPLACE FUNCTION increment_ceiling_progress(
  p_user_id UUID,
  p_gacha_id UUID,
  p_pull_count INTEGER,
  p_has_ssr BOOLEAN
)
RETURNS TABLE(
  current_pull_count INTEGER,
  is_ceiling_reached BOOLEAN,
  ceiling_count INTEGER
) AS $$
DECLARE
  v_current_count INTEGER;
  v_ceiling_count INTEGER;
  v_is_reached BOOLEAN;
BEGIN
  -- ガチャ商品の天井回数を取得
  SELECT gp.ceiling_count INTO v_ceiling_count
  FROM gacha_products gp
  WHERE gp.id = p_gacha_id;

  -- 進捗レコードが存在しない場合は作成
  INSERT INTO gacha_ceiling_progress (user_id, gacha_id, pull_count, last_ssr_at)
  VALUES (p_user_id, p_gacha_id, 0, NULL)
  ON CONFLICT (user_id, gacha_id) DO NOTHING;

  -- SSRが出た場合はカウンターリセット
  IF p_has_ssr THEN
    UPDATE gacha_ceiling_progress
    SET
      pull_count = 0,
      last_ssr_at = NOW(),
      updated_at = NOW()
    WHERE user_id = p_user_id AND gacha_id = p_gacha_id
    RETURNING pull_count INTO v_current_count;
  ELSE
    -- SSRが出なかった場合はカウンター増加
    UPDATE gacha_ceiling_progress
    SET
      pull_count = pull_count + p_pull_count,
      updated_at = NOW()
    WHERE user_id = p_user_id AND gacha_id = p_gacha_id
    RETURNING pull_count INTO v_current_count;
  END IF;

  -- 天井到達判定
  v_is_reached := v_current_count >= v_ceiling_count;

  RETURN QUERY SELECT v_current_count, v_is_reached, v_ceiling_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_ceiling_progress IS '天井進捗を更新し、到達状況を返す（SSR排出時はリセット）';

-- 7. 天井進捗確認用のストアドファンション
CREATE OR REPLACE FUNCTION get_ceiling_progress(
  p_user_id UUID,
  p_gacha_id UUID
)
RETURNS TABLE(
  pull_count INTEGER,
  ceiling_count INTEGER,
  remaining_pulls INTEGER,
  last_ssr_at TIMESTAMP WITH TIME ZONE,
  is_ceiling_reached BOOLEAN
) AS $$
DECLARE
  v_pull_count INTEGER;
  v_ceiling_count INTEGER;
  v_last_ssr_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- ガチャ商品の天井回数を取得
  SELECT gp.ceiling_count INTO v_ceiling_count
  FROM gacha_products gp
  WHERE gp.id = p_gacha_id;

  -- 進捗を取得（存在しない場合は0を返す）
  SELECT gcp.pull_count, gcp.last_ssr_at
  INTO v_pull_count, v_last_ssr_at
  FROM gacha_ceiling_progress gcp
  WHERE gcp.user_id = p_user_id AND gcp.gacha_id = p_gacha_id;

  -- レコードが存在しない場合はデフォルト値
  IF v_pull_count IS NULL THEN
    v_pull_count := 0;
  END IF;

  RETURN QUERY SELECT
    v_pull_count,
    v_ceiling_count,
    GREATEST(v_ceiling_count - v_pull_count, 0) AS remaining_pulls,
    v_last_ssr_at,
    v_pull_count >= v_ceiling_count AS is_ceiling_reached;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_ceiling_progress IS 'ユーザーの天井進捗を取得';

-- 8. 既存のガチャ商品にデフォルト値を設定（すでにデータがある場合）
UPDATE gacha_products
SET
  ceiling_count = 100,
  ceiling_enabled = TRUE
WHERE ceiling_count IS NULL;
