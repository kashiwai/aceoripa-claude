'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SimpleCheckPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    runChecks()
  }, [])

  const runChecks = async () => {
    const data: any = {}
    
    try {
      // 1. 最もシンプルなクエリ
      const { data: simpleData, error: simpleError } = await supabase
        .from('user_points')
        .select('user_id, free_points, paid_points')
      
      data.simple = {
        success: !simpleError,
        error: simpleError,
        count: simpleData?.length || 0,
        data: simpleData
      }
      
      // 2. updated_atなしでクエリ
      const { data: noOrderData, error: noOrderError } = await supabase
        .from('user_points')
        .select('*')
        .limit(10)
      
      data.noOrder = {
        success: !noOrderError,
        error: noOrderError,
        data: noOrderData
      }
      
      // 3. カラム一覧を取得するRPC（もし存在すれば）
      try {
        const { data: columns, error: columnsError } = await supabase
          .rpc('get_columns', { table_name: 'user_points' })
        
        data.columns = { data: columns, error: columnsError }
      } catch (e) {
        data.columns = { error: 'RPC not available' }
      }
      
    } catch (err: any) {
      data.generalError = err.message
    }
    
    setResults(data)
    setLoading(false)
  }

  if (loading) {
    return <div className="container py-4 text-center">読み込み中...</div>
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">シンプルデータチェック</h1>
      
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">1. 最小クエリ結果</h3>
        </div>
        <div className="card-body">
          <p>レコード数: {results.simple?.count || 0}</p>
          {results.simple?.error && (
            <div className="alert alert-danger">
              エラー: {JSON.stringify(results.simple.error)}
            </div>
          )}
          {results.simple?.data && results.simple.data.length > 0 && (
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(results.simple.data, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">2. 全カラム取得（ソートなし）</h3>
        </div>
        <div className="card-body">
          {results.noOrder?.error && (
            <div className="alert alert-danger">
              エラー: {JSON.stringify(results.noOrder.error)}
            </div>
          )}
          {results.noOrder?.data && (
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(results.noOrder.data, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">対処法</h3>
        </div>
        <div className="card-body">
          <h5>Supabaseダッシュボードで以下を実行してください：</h5>
          
          <h6 className="mt-3">1. まずauth.usersを確認</h6>
          <pre className="bg-light p-3 rounded">
{`SELECT COUNT(*) as user_count FROM auth.users;`}
          </pre>
          
          <h6 className="mt-3">2. user_pointsテーブルを確認</h6>
          <pre className="bg-light p-3 rounded">
{`SELECT COUNT(*) as points_count FROM user_points;`}
          </pre>
          
          <h6 className="mt-3">3. もしuser_pointsが空なら実行</h6>
          <pre className="bg-light p-3 rounded">
{`-- user_pointsテーブルにデータを挿入
INSERT INTO user_points (user_id, free_points, paid_points, updated_at)
SELECT 
    id as user_id,
    1000 as free_points,
    0 as paid_points,
    NOW() as updated_at
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 確認
SELECT * FROM user_points;`}
          </pre>
        </div>
      </div>

      <div className="mt-4">
        <button onClick={runChecks} className="btn btn-primary me-2">
          再チェック
        </button>
        <a href="/admin/users" className="btn btn-secondary">
          ユーザー管理に戻る
        </a>
      </div>
    </div>
  )
}