'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function CheckDataPage() {
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkAllData()
  }, [])

  const checkAllData = async () => {
    const results: any = {}
    
    try {
      // 1. user_points テーブルの全データを取得
      const { data: points, error: pointsError, count } = await supabase
        .from('user_points')
        .select('*')
        .order('created_at', { ascending: false })
      
      results.user_points = {
        data: points,
        error: pointsError,
        count: count
      }
      
      // 2. APIエンドポイントの直接テスト
      try {
        const response = await fetch('/api/admin/users')
        const apiData = await response.json()
        results.api = {
          status: response.status,
          data: apiData
        }
      } catch (err: any) {
        results.api = { error: err.message }
      }
      
      // 3. ユーザー管理ページが期待するデータ形式を確認
      const { data: formattedData } = await supabase
        .from('user_points')
        .select('*')
        .limit(5)
      
      if (formattedData) {
        results.formatted = formattedData.map(up => ({
          id: up.user_id,
          email: 'test@example.com',
          display_name: 'テストユーザー',
          created_at: up.created_at,
          user_points: [{
            free_points: up.free_points,
            paid_points: up.paid_points
          }],
          user_cards: [{ count: 0 }]
        }))
      }
      
    } catch (error: any) {
      results.error = error.message
    }
    
    setData(results)
    setLoading(false)
  }

  const runSQL = async () => {
    setLoading(true)
    try {
      // auth.users から user_points にデータを挿入する SQL を実行
      const { data, error } = await supabase.rpc('execute_sql', {
        query: `
          INSERT INTO public.user_points (user_id, free_points, paid_points)
          SELECT 
            id,
            1000,
            0
          FROM auth.users
          WHERE id NOT IN (SELECT user_id FROM public.user_points)
          ON CONFLICT (user_id) DO NOTHING
          RETURNING *;
        `
      })
      
      if (error) {
        alert('エラー: ' + error.message)
      } else {
        alert('SQLを実行しました')
        checkAllData()
      }
    } catch (err: any) {
      alert('エラー: ' + err.message)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="container py-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">データ確認</h1>
      
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">user_points テーブル</h3>
        </div>
        <div className="card-body">
          {data.user_points?.error ? (
            <div className="alert alert-danger">
              エラー: {JSON.stringify(data.user_points.error)}
            </div>
          ) : (
            <>
              <p>レコード数: {data.user_points?.data?.length || 0}</p>
              {data.user_points?.data?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>user_id</th>
                        <th>free_points</th>
                        <th>paid_points</th>
                        <th>created_at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.user_points.data.map((row: any) => (
                        <tr key={row.id}>
                          <td className="small">{row.user_id}</td>
                          <td>{row.free_points}</td>
                          <td>{row.paid_points}</td>
                          <td>{new Date(row.created_at).toLocaleString('ja-JP')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-warning">
                  データがありません
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">API レスポンス</h3>
        </div>
        <div className="card-body">
          <pre className="bg-light p-3 rounded">
            {JSON.stringify(data.api, null, 2)}
          </pre>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">期待されるデータ形式</h3>
        </div>
        <div className="card-body">
          <pre className="bg-light p-3 rounded">
            {JSON.stringify(data.formatted, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-4">
        <button onClick={checkAllData} className="btn btn-primary me-2">
          再チェック
        </button>
        <a href="/admin/users" className="btn btn-secondary">
          ユーザー管理に戻る
        </a>
      </div>
    </div>
  )
}