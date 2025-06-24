'use client'

import { useState } from 'react'

export default function QuickFixPage() {
  const [showAlternative, setShowAlternative] = useState(false)

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">ユーザーデータ修正（簡易版）</h1>
      
      <div className="alert alert-warning mb-4">
        <h5>重複エラーが発生した場合の対処法</h5>
        <p>public.usersテーブルに既にデータが存在し、auth.usersと同期が取れていない可能性があります。</p>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">方法1: public.usersを一旦クリアして再作成</h3>
        </div>
        <div className="card-body">
          <p className="text-danger">⚠️ この方法は既存のデータを削除します。必要に応じてバックアップを取ってください。</p>
          <pre className="bg-light p-3 rounded">
{`-- 1. 外部キー制約を一時的に無効化
ALTER TABLE user_points DROP CONSTRAINT IF EXISTS user_points_user_id_fkey;
ALTER TABLE user_cards DROP CONSTRAINT IF EXISTS user_cards_user_id_fkey;

-- 2. public.usersテーブルをクリア
TRUNCATE TABLE public.users CASCADE;

-- 3. auth.usersからデータを再挿入
INSERT INTO public.users (id, email, display_name, created_at, updated_at)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'display_name', email),
    created_at,
    NOW()
FROM auth.users;

-- 4. user_pointsテーブルに初期ポイントを設定
INSERT INTO public.user_points (user_id, free_points, paid_points)
SELECT 
    id,
    1000,
    0
FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- 5. 外部キー制約を再設定
ALTER TABLE user_points 
ADD CONSTRAINT user_points_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE user_cards 
ADD CONSTRAINT user_cards_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;`}
          </pre>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">方法2: 外部キー制約を変更（推奨）</h3>
        </div>
        <div className="card-body">
          <p>user_pointsテーブルがauth.usersを直接参照するように変更します。</p>
          <pre className="bg-light p-3 rounded">
{`-- 1. 既存の外部キー制約を削除
ALTER TABLE user_points DROP CONSTRAINT IF EXISTS user_points_user_id_fkey;

-- 2. auth.usersを参照する新しい外部キー制約を作成
ALTER TABLE user_points 
ADD CONSTRAINT user_points_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. auth.usersのすべてのユーザーにポイントを設定
INSERT INTO public.user_points (user_id, free_points, paid_points)
SELECT 
    id,
    1000,
    0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_points)
ON CONFLICT (user_id) DO NOTHING;

-- 4. 結果を確認
SELECT 
    au.id,
    au.email,
    up.free_points,
    up.paid_points
FROM auth.users au
LEFT JOIN user_points up ON au.id = up.user_id
ORDER BY au.created_at DESC;`}
          </pre>
        </div>
      </div>

      <button 
        className="btn btn-info mb-4"
        onClick={() => setShowAlternative(!showAlternative)}
      >
        {showAlternative ? '隠す' : '別の解決方法を表示'}
      </button>

      {showAlternative && (
        <div className="card">
          <div className="card-header">
            <h3 className="h5 mb-0">方法3: APIルートを修正</h3>
          </div>
          <div className="card-body">
            <p>データベースを変更せず、APIルートでauth.usersを直接参照するように修正します。</p>
            <p>この方法では、public.usersテーブルを使用せず、auth.usersから直接ユーザー情報を取得します。</p>
            <pre className="bg-light p-3 rounded">
{`-- user_pointsテーブルのみ確認・修正
INSERT INTO public.user_points (user_id, free_points, paid_points)
SELECT 
    id,
    1000,
    0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_points)
ON CONFLICT (user_id) DO NOTHING;`}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-4">
        <a href="/admin/users" className="btn btn-primary">
          ユーザー管理に戻る
        </a>
        <a href="/admin/users/fix-database" className="btn btn-secondary ms-2">
          詳細修正ページ
        </a>
      </div>
    </div>
  )
}