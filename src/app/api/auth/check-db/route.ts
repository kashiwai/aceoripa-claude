import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const adminClient = createAdminClient()
  const results: any = {
    tables: {},
    errors: [],
    suggestions: []
  }

  try {
    // 1. usersテーブルの確認
    const { data: usersTable, error: usersError } = await adminClient
      .from('users')
      .select('*')
      .limit(0)

    if (usersError) {
      results.errors.push({
        table: 'users',
        error: usersError.message,
        code: usersError.code
      })
      
      if (usersError.code === '42P01') {
        results.suggestions.push('usersテーブルが存在しません。Supabaseダッシュボードで作成してください。')
      }
    } else {
      results.tables.users = 'OK'
    }

    // 2. user_pointsテーブルの確認
    const { data: pointsTable, error: pointsError } = await adminClient
      .from('user_points')
      .select('*')
      .limit(0)

    if (pointsError) {
      results.errors.push({
        table: 'user_points',
        error: pointsError.message,
        code: pointsError.code
      })
      
      if (pointsError.code === '42P01') {
        results.suggestions.push('user_pointsテーブルが存在しません。')
      }
    } else {
      results.tables.user_points = 'OK'
    }

    // 3. free_point_settingsテーブルの確認
    const { data: settingsTable, error: settingsError } = await adminClient
      .from('free_point_settings')
      .select('*')
      .limit(0)

    if (settingsError) {
      results.errors.push({
        table: 'free_point_settings',
        error: settingsError.message,
        code: settingsError.code
      })
    } else {
      results.tables.free_point_settings = 'OK'
    }

    // 4. RLSポリシーの確認
    const { data: policies, error: policiesError } = await adminClient
      .rpc('get_policies', {})
      .catch(() => ({ data: null, error: 'RLS policies check not available' }))

    if (policies) {
      results.policies = policies
    }

    // 5. 必要なテーブルを作成するSQL
    if (results.errors.length > 0) {
      results.createTableSQL = generateCreateTableSQL()
    }

    return NextResponse.json({
      success: true,
      results,
      recommendations: getRecommendations(results)
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      results
    }, { status: 500 })
  }
}

function generateCreateTableSQL() {
  return {
    users: `
-- usersテーブル作成
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  provider TEXT DEFAULT 'email',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLSを有効化
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLSポリシー作成
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
`,
    user_points: `
-- user_pointsテーブル作成
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  free_points INTEGER DEFAULT 0,
  paid_points INTEGER DEFAULT 0,
  total_points INTEGER GENERATED ALWAYS AS (free_points + paid_points) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- インデックス作成
CREATE INDEX idx_user_points_user_id ON public.user_points(user_id);

-- RLSを有効化
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- RLSポリシー作成
CREATE POLICY "Users can view own points" ON public.user_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage points" ON public.user_points
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');
`,
    free_point_settings: `
-- free_point_settingsテーブル作成
CREATE TABLE IF NOT EXISTS public.free_point_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT UNIQUE NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 初期データ挿入
INSERT INTO public.free_point_settings (type, points, description) VALUES
  ('signup', 1000, '新規登録ボーナス'),
  ('daily_login', 100, 'デイリーログインボーナス'),
  ('referral', 500, '友達紹介ボーナス')
ON CONFLICT (type) DO NOTHING;
`,
    point_history: `
-- point_historyテーブル作成
CREATE TABLE IF NOT EXISTS public.point_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  balance_after INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- インデックス作成
CREATE INDEX idx_point_history_user_id ON public.point_history(user_id);
CREATE INDEX idx_point_history_created_at ON public.point_history(created_at DESC);

-- RLSを有効化
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;

-- RLSポリシー作成
CREATE POLICY "Users can view own history" ON public.point_history
  FOR SELECT USING (auth.uid() = user_id);
`
  }
}

function getRecommendations(results: any) {
  const recommendations = []
  
  if (results.errors.some((e: any) => e.code === '42P01')) {
    recommendations.push({
      priority: 'high',
      action: 'Supabaseダッシュボードでテーブルを作成',
      description: '上記のSQLをSupabaseのSQL Editorで実行してください'
    })
  }
  
  if (!results.policies || results.policies.length === 0) {
    recommendations.push({
      priority: 'medium',
      action: 'RLSポリシーの設定',
      description: 'Row Level Securityポリシーを設定してセキュリティを向上させてください'
    })
  }
  
  recommendations.push({
    priority: 'low',
    action: 'Supabase Authの設定確認',
    description: 'Authentication > Providers でメール認証が有効になっていることを確認してください'
  })
  
  return recommendations
}