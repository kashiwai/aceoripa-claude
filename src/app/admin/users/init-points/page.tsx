'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function InitPointsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const supabase = createClientComponentClient()

  const initializeAllUserPoints = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // まず、auth.usersのデータを取得できるか試す
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setResult({ error: 'ログインしていません' })
        setLoading(false)
        return
      }

      // 現在のユーザーのポイントを初期化
      const { data, error } = await supabase
        .from('user_points')
        .upsert({
          user_id: user.id,
          free_points: 1000,
          paid_points: 0,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
      
      if (error) {
        setResult({ error: error.message })
      } else {
        setResult({ 
          success: true, 
          message: '現在のユーザーのポイントを初期化しました',
          data: data
        })
      }
      
    } catch (err: any) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const checkTables = async () => {
    setLoading(true)
    const results: any = {}
    
    try {
      // user_points テーブルの存在確認
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('*')
        .limit(1)
      
      results.user_points = {
        exists: !pointsError || pointsError.code !== '42P01',
        error: pointsError,
        sample: pointsData
      }
      
      // テーブル構造を確認
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_info', { table_name: 'user_points' })
        .single()
      
      results.tableStructure = {
        data: tableInfo,
        error: tableError
      }
      
    } catch (err: any) {
      results.generalError = err.message
    }
    
    setResult(results)
    setLoading(false)
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">ユーザーポイント初期化</h1>
      
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="h5">手順</h3>
          <ol>
            <li>まず「テーブル確認」ボタンでデータベースの状態を確認</li>
            <li>「現在のユーザーのポイントを初期化」ボタンで自分のポイントを初期化</li>
            <li>Supabaseダッシュボードで他のユーザーのポイントを手動で追加</li>
          </ol>
        </div>
      </div>

      <div className="d-flex gap-2 mb-4">
        <button 
          className="btn btn-info"
          onClick={checkTables}
          disabled={loading}
        >
          テーブル確認
        </button>
        <button 
          className="btn btn-primary"
          onClick={initializeAllUserPoints}
          disabled={loading}
        >
          現在のユーザーのポイントを初期化
        </button>
      </div>

      {loading && (
        <div className="alert alert-info">
          処理中...
        </div>
      )}

      {result && (
        <div className="card">
          <div className="card-body">
            <h3 className="h5">結果</h3>
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="card mt-4">
        <div className="card-body">
          <h3 className="h5">Supabaseダッシュボードで実行するSQL</h3>
          <p className="text-muted">以下のSQLをSupabaseのSQL Editorで実行してください：</p>
          <pre className="bg-light p-3 rounded">
{`-- すべてのauth.usersに対してuser_pointsを初期化
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
  u.id,
  u.email,
  up.free_points,
  up.paid_points
FROM auth.users u
LEFT JOIN user_points up ON u.id = up.user_id;`}
          </pre>
        </div>
      </div>

      <div className="mt-4">
        <a href="/admin/users" className="btn btn-secondary">
          ユーザー管理に戻る
        </a>
      </div>
    </div>
  )
}