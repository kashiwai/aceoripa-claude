'use client'

import { useState } from 'react'

export default function FixDatabasePage() {
  const [activeTab, setActiveTab] = useState('check')

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">データベース修正</h1>
      
      <div className="alert alert-info mb-4">
        <h5>問題の説明</h5>
        <p>user_pointsテーブルがpublic.usersテーブルを参照していますが、public.usersテーブルが空です。</p>
        <p>以下のSQLをSupabaseのSQL Editorで順番に実行してください。</p>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'check' ? 'active' : ''}`}
            onClick={() => setActiveTab('check')}
          >
            1. 現状確認
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'fix' ? 'active' : ''}`}
            onClick={() => setActiveTab('fix')}
          >
            2. 修正SQL
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'verify' ? 'active' : ''}`}
            onClick={() => setActiveTab('verify')}
          >
            3. 確認
          </button>
        </li>
      </ul>

      {activeTab === 'check' && (
        <div className="card">
          <div className="card-body">
            <h3 className="h5">ステップ1: 現状確認</h3>
            <p>以下のSQLで現在の状態を確認します：</p>
            <pre className="bg-light p-3 rounded">
{`-- auth.usersテーブルの確認
SELECT id, email, created_at 
FROM auth.users 
LIMIT 10;

-- public.usersテーブルの確認
SELECT * FROM public.users LIMIT 10;

-- user_pointsテーブルの外部キー制約を確認
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f'
AND conrelid::regclass::text = 'user_points';`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'fix' && (
        <div className="card">
          <div className="card-body">
            <h3 className="h5">ステップ2: 修正SQL</h3>
            <p>以下のSQLを順番に実行してください：</p>
            
            <h5 className="mt-4">2-1. public.usersテーブルにデータを挿入</h5>
            <pre className="bg-light p-3 rounded">
{`-- まず現在の状態を確認
SELECT 
    au.id as auth_id,
    au.email as auth_email,
    u.id as users_id,
    u.email as users_email
FROM auth.users au
FULL OUTER JOIN public.users u ON au.id = u.id;

-- auth.usersからpublic.usersにデータを同期（重複を避ける）
INSERT INTO public.users (id, email, display_name, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'display_name', au.email),
    au.created_at,
    NOW()
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = au.id OR u.email = au.email
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- 既存のusersテーブルのIDをauth.usersのIDに更新（必要な場合）
UPDATE public.users u
SET id = au.id
FROM auth.users au
WHERE u.email = au.email AND u.id != au.id;`}
            </pre>

            <h5 className="mt-4">2-2. user_pointsテーブルに初期データを挿入</h5>
            <pre className="bg-light p-3 rounded">
{`-- user_pointsに初期ポイントを設定
INSERT INTO public.user_points (user_id, free_points, paid_points)
SELECT 
    id,
    1000,  -- 初期無料ポイント
    0      -- 初期有料ポイント
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.user_points)
ON CONFLICT (user_id) DO NOTHING;`}
            </pre>

            <h5 className="mt-4">2-3. 今後の自動同期設定（オプション）</h5>
            <pre className="bg-light p-3 rounded">
{`-- auth.usersに新規ユーザーが追加されたときに
-- 自動的にpublic.usersとuser_pointsを作成するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- public.usersに挿入
  INSERT INTO public.users (id, email, display_name, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', new.email),
    new.created_at,
    NOW()
  );
  
  -- user_pointsに初期ポイントを挿入
  INSERT INTO public.user_points (user_id, free_points, paid_points)
  VALUES (new.id, 1000, 0);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーを作成（既存の場合は削除してから作成）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'verify' && (
        <div className="card">
          <div className="card-body">
            <h3 className="h5">ステップ3: 確認</h3>
            <p>修正が正しく適用されたか確認します：</p>
            <pre className="bg-light p-3 rounded">
{`-- ユーザー情報の確認
SELECT 
    u.id,
    u.email,
    u.display_name,
    up.free_points,
    up.paid_points,
    u.created_at
FROM public.users u
LEFT JOIN public.user_points up ON u.id = up.user_id
ORDER BY u.created_at DESC;

-- 総ユーザー数の確認
SELECT 
    COUNT(DISTINCT au.id) as auth_users_count,
    COUNT(DISTINCT u.id) as public_users_count,
    COUNT(DISTINCT up.user_id) as user_points_count
FROM auth.users au
FULL OUTER JOIN public.users u ON au.id = u.id
FULL OUTER JOIN public.user_points up ON u.id = up.user_id;`}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-4">
        <a href="/admin/users" className="btn btn-primary">
          ユーザー管理に戻る
        </a>
        <a href="/admin/users/debug" className="btn btn-secondary ms-2">
          デバッグページ
        </a>
      </div>
    </div>
  )
}