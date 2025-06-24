'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SimpleUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // 直接user_pointsテーブルから取得
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        setError(error.message)
      } else {
        setUsers(data || [])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
      <h1 className="h2 mb-4">ユーザー一覧（シンプル版）</h1>
      
      {error && (
        <div className="alert alert-danger">
          エラー: {error}
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h3 className="h5 mb-0">登録ユーザー: {users.length}人</h3>
        </div>
        <div className="card-body">
          {users.length === 0 ? (
            <p>ユーザーが見つかりません</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ユーザーID</th>
                    <th>無料ポイント</th>
                    <th>有料ポイント</th>
                    <th>合計ポイント</th>
                    <th>登録日時</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td className="small">
                        {user.user_id.substring(0, 8)}...
                        <br />
                        <small className="text-muted">ユーザー{index + 1}</small>
                      </td>
                      <td>{user.free_points}</td>
                      <td>{user.paid_points}</td>
                      <td>
                        <strong>{user.free_points + user.paid_points}</strong>
                      </td>
                      <td>
                        {new Date(user.created_at).toLocaleDateString('ja-JP')}
                        <br />
                        <small className="text-muted">
                          {new Date(user.created_at).toLocaleTimeString('ja-JP')}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <button onClick={fetchUsers} className="btn btn-primary me-2">
          再読み込み
        </button>
        <a href="/admin/users" className="btn btn-secondary">
          通常のユーザー管理へ
        </a>
      </div>
    </div>
  )
}