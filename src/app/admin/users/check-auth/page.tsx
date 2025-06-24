'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function CheckAuthUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkAuthUsers()
  }, [])

  const checkAuthUsers = async () => {
    try {
      // Supabase Authから直接ユーザーリストを取得する試み
      // 注: これは管理者権限が必要な場合があります
      const { data, error } = await supabase.auth.admin.listUsers()
      
      if (error) {
        // 管理者権限がない場合は、別の方法を試す
        console.error('Admin API error:', error)
        
        // 現在のユーザーのセッションを確認
        const { data: { session } } = await supabase.auth.getSession()
        setError(`管理者権限エラー: ${error.message}`)
        
        if (session) {
          setUsers([{
            id: session.user.id,
            email: session.user.email,
            created_at: session.user.created_at,
            note: '現在ログイン中のユーザーのみ表示'
          }])
        }
      } else if (data && data.users) {
        setUsers(data.users)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const initializeUserPoints = async (userId: string) => {
    try {
      // user_points テーブルに初期データを挿入
      const { error } = await supabase
        .from('user_points')
        .insert({
          user_id: userId,
          free_points: 1000,
          paid_points: 0,
          created_at: new Date().toISOString()
        })
      
      if (error) {
        if (error.code === '23505') {
          alert('このユーザーのポイントは既に初期化されています')
        } else {
          alert(`エラー: ${error.message}`)
        }
      } else {
        alert('ユーザーポイントを初期化しました')
        window.location.reload()
      }
    } catch (err: any) {
      alert(`エラー: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">Auth ユーザー確認</h1>
      
      {error && (
        <div className="alert alert-warning">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="h5 mb-0">登録済みユーザー</h3>
        </div>
        <div className="card-body">
          {users.length === 0 ? (
            <p>ユーザーが見つかりません</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>メールアドレス</th>
                    <th>登録日時</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="small">{user.id}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.created_at).toLocaleString('ja-JP')}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => initializeUserPoints(user.id)}
                        >
                          ポイント初期化
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users[0]?.note && (
                <p className="text-muted mt-2">{users[0].note}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="h5">手動でユーザーポイントを初期化</h3>
        <p className="text-muted">ユーザーIDがわかっている場合は、以下のボタンから初期化できます</p>
        <form onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const userId = formData.get('userId') as string
          if (userId) {
            initializeUserPoints(userId)
          }
        }}>
          <div className="input-group" style={{ maxWidth: '500px' }}>
            <input 
              type="text" 
              name="userId"
              className="form-control" 
              placeholder="ユーザーID (UUID形式)"
              pattern="[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
              required
            />
            <button type="submit" className="btn btn-primary">
              初期化
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4">
        <a href="/admin/users" className="btn btn-secondary">
          ユーザー管理に戻る
        </a>
      </div>
    </div>
  )
}