-- AI動画生成システムのマイグレーション

-- 1. 動画生成ジョブテーブル
CREATE TABLE IF NOT EXISTS ai_video_generation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- プロバイダー情報
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('veo3', 'sora2')),
  provider_job_id VARCHAR(255), -- プロバイダー側のジョブID

  -- リクエスト情報
  prompt TEXT NOT NULL,
  rarity VARCHAR(2) CHECK (rarity IN ('SS', 'S', 'A', 'B', 'C')),
  phase VARCHAR(10) CHECK (phase IN ('intro', 'reveal', 'final_reveal')),
  card_name VARCHAR(255),

  -- 設定
  duration INTEGER DEFAULT 5,
  quality VARCHAR(10) DEFAULT '1080p',
  aspect_ratio VARCHAR(10) DEFAULT '16:9',
  seed INTEGER,

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- 結果
  video_url TEXT,
  thumbnail_url TEXT,
  supabase_storage_path TEXT, -- Supabase Storageのパス

  -- エラー情報
  error TEXT,
  retry_count INTEGER DEFAULT 0,

  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- メタデータ
  metadata JSONB
);

COMMENT ON TABLE ai_video_generation_jobs IS 'AI動画生成ジョブ管理';

-- 2. インデックス作成
CREATE INDEX IF NOT EXISTS idx_video_jobs_user_id
  ON ai_video_generation_jobs(user_id);

CREATE INDEX IF NOT EXISTS idx_video_jobs_status
  ON ai_video_generation_jobs(status);

CREATE INDEX IF NOT EXISTS idx_video_jobs_provider
  ON ai_video_generation_jobs(provider);

CREATE INDEX IF NOT EXISTS idx_video_jobs_rarity_phase
  ON ai_video_generation_jobs(rarity, phase);

CREATE INDEX IF NOT EXISTS idx_video_jobs_created
  ON ai_video_generation_jobs(created_at DESC);

-- 3. 動画ライブラリテーブル（生成済み動画の管理）
CREATE TABLE IF NOT EXISTS gacha_animation_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- レアリティとフェーズ
  rarity VARCHAR(2) NOT NULL CHECK (rarity IN ('SS', 'S', 'A', 'B', 'C')),
  phase VARCHAR(10) NOT NULL CHECK (phase IN ('intro', 'reveal', 'final_reveal')),

  -- 動画情報
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  storage_path TEXT NOT NULL, -- Supabase Storageのパス

  -- プロバイダー情報
  provider VARCHAR(20) NOT NULL,
  generation_job_id UUID REFERENCES ai_video_generation_jobs(id),

  -- メタデータ
  duration INTEGER,
  quality VARCHAR(10),
  file_size BIGINT, -- バイト単位

  -- 使用状況
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE gacha_animation_library IS 'ガチャ演出動画ライブラリ';

-- 4. インデックス
CREATE INDEX IF NOT EXISTS idx_animation_library_rarity_phase
  ON gacha_animation_library(rarity, phase);

CREATE INDEX IF NOT EXISTS idx_animation_library_active
  ON gacha_animation_library(is_active) WHERE is_active = TRUE;

-- 部分的一意制約: 同じレアリティ・フェーズで複数の動画を持てるが、アクティブは1つだけ
CREATE UNIQUE INDEX IF NOT EXISTS idx_animation_library_unique_active
  ON gacha_animation_library(rarity, phase) WHERE is_active = TRUE;

-- 5. 自動更新トリガー
CREATE OR REPLACE FUNCTION update_video_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_video_jobs_updated_at
  BEFORE UPDATE ON ai_video_generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_video_jobs_updated_at();

CREATE TRIGGER trigger_update_animation_library_updated_at
  BEFORE UPDATE ON gacha_animation_library
  FOR EACH ROW
  EXECUTE FUNCTION update_video_jobs_updated_at();

-- 6. Row Level Security (RLS)
ALTER TABLE ai_video_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_animation_library ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のジョブのみ閲覧可能
CREATE POLICY "Users can view their own video jobs"
  ON ai_video_generation_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

-- 管理者は全てのジョブを閲覧・管理可能
CREATE POLICY "Admins can manage all video jobs"
  ON ai_video_generation_jobs
  FOR ALL
  USING (auth.role() = 'service_role');

-- 全員がアクティブな動画ライブラリを閲覧可能
CREATE POLICY "Anyone can view active animations"
  ON gacha_animation_library
  FOR SELECT
  USING (is_active = TRUE);

-- 管理者のみ動画ライブラリを管理可能
CREATE POLICY "Admins can manage animation library"
  ON gacha_animation_library
  FOR ALL
  USING (auth.role() = 'service_role');

-- 7. 便利な関数: アクティブな演出動画取得
CREATE OR REPLACE FUNCTION get_active_gacha_animation(
  p_rarity VARCHAR(2),
  p_phase VARCHAR(10)
)
RETURNS TABLE(
  video_url TEXT,
  thumbnail_url TEXT,
  duration INTEGER
) AS $$
BEGIN
  -- 使用カウントを増やす
  UPDATE gacha_animation_library
  SET
    usage_count = usage_count + 1,
    last_used_at = NOW()
  WHERE rarity = p_rarity
    AND phase = p_phase
    AND is_active = TRUE;

  -- 動画情報を返す
  RETURN QUERY
  SELECT
    gal.video_url,
    gal.thumbnail_url,
    gal.duration
  FROM gacha_animation_library gal
  WHERE gal.rarity = p_rarity
    AND gal.phase = p_phase
    AND gal.is_active = TRUE
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_active_gacha_animation IS 'アクティブなガチャ演出動画を取得（使用カウントも更新）';

-- 8. カード固有のfinal_reveal動画テーブル
CREATE TABLE IF NOT EXISTS card_final_reveal_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- カード情報
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,

  -- 動画情報
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  storage_path TEXT NOT NULL, -- Supabase Storageのパス

  -- プロバイダー情報
  provider VARCHAR(20) NOT NULL,
  generation_job_id UUID REFERENCES ai_video_generation_jobs(id),

  -- メタデータ
  duration INTEGER,
  quality VARCHAR(10),
  file_size BIGINT,

  -- 使用状況
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE card_final_reveal_videos IS 'カード固有のfinal_reveal動画（カード画像を使用したAI生成動画）';

-- インデックス
CREATE INDEX IF NOT EXISTS idx_card_final_reveal_card_id
  ON card_final_reveal_videos(card_id);

CREATE INDEX IF NOT EXISTS idx_card_final_reveal_active
  ON card_final_reveal_videos(is_active) WHERE is_active = TRUE;

-- 部分的一意制約: 1枚のカードにつき1つのアクティブ動画
CREATE UNIQUE INDEX IF NOT EXISTS idx_card_final_reveal_unique_active
  ON card_final_reveal_videos(card_id) WHERE is_active = TRUE;

-- 自動更新トリガー
CREATE TRIGGER trigger_update_card_final_reveal_updated_at
  BEFORE UPDATE ON card_final_reveal_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_video_jobs_updated_at();

-- RLS
ALTER TABLE card_final_reveal_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active card final reveal videos"
  ON card_final_reveal_videos
  FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage card final reveal videos"
  ON card_final_reveal_videos
  FOR ALL
  USING (auth.role() = 'service_role');
