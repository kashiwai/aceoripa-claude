'use client'

export default function FixTablePage() {
  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">user_points テーブル修正</h1>
      
      <div className="alert alert-danger mb-4">
        <h5>エラー: created_at カラムが存在しません</h5>
        <p>user_pointsテーブルに必要なカラムを追加する必要があります。</p>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">手順1: テーブル構造を確認</h3>
        </div>
        <div className="card-body">
          <pre className="bg-light p-3 rounded">
{`-- user_pointsテーブルの現在の構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_points'
ORDER BY ordinal_position;`}
          </pre>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">手順2: created_at カラムを追加</h3>
        </div>
        <div className="card-body">
          <pre className="bg-light p-3 rounded">
{`-- created_at カラムが存在しない場合は追加
ALTER TABLE user_points 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 既存のレコードのcreated_atを更新（updated_atから）
UPDATE user_points 
SET created_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL;`}
          </pre>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">手順3: データを確認</h3>
        </div>
        <div className="card-body">
          <pre className="bg-light p-3 rounded">
{`-- user_pointsテーブルの内容を確認
SELECT * FROM user_points;

-- もしデータが空の場合は、auth.usersから再度挿入
INSERT INTO public.user_points (user_id, free_points, paid_points)
SELECT 
    id,
    1000,
    0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_points)
ON CONFLICT (user_id) DO NOTHING;

-- 結果を確認
SELECT 
    up.*,
    au.email
FROM user_points up
JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at DESC;`}
          </pre>
        </div>
      </div>

      <div className="alert alert-info">
        <h5>💡 ヒント</h5>
        <p>上記のSQLをSupabaseのSQL Editorで順番に実行してください。</p>
        <p>実行後、ユーザー管理画面を再読み込みしてください。</p>
      </div>

      <div className="mt-4">
        <a href="/admin/users" className="btn btn-primary">
          ユーザー管理に戻る
        </a>
        <a href="/admin/users/check-data" className="btn btn-secondary ms-2">
          データ確認ページ
        </a>
      </div>
    </div>
  )
}