'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface User {
  id: string
  email: string
  created_at: string
  free_points: number
  paid_points: number
  total_points: number
  card_count: number
}

export default function UserPointsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const userId = params.id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [operationLoading, setOperationLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [pointType, setPointType] = useState('free')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      
      const data = await response.json()
      if (data.success) {
        const foundUser = data.users.find((u: User) => u.id === userId)
        if (foundUser) {
          setUser(foundUser)
        } else {
          setError('ユーザーが見つかりません')
        }
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error('Error fetching user:', err)
      setError('ユーザー情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handlePointOperation = async (action: 'add' | 'subtract') => {
    if (!amount || Number(amount) <= 0) {
      setError('有効な金額を入力してください')
      return
    }

    setOperationLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
          amount: Number(amount),
          type: pointType,
          description
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(data.message)
        setAmount('')
        setDescription('')
        
        // ユーザー情報を更新
        if (user) {
          setUser({
            ...user,
            free_points: data.newPoints.free_points,
            paid_points: data.newPoints.paid_points,
            total_points: data.newPoints.total_points
          })
        }
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error('Point operation error:', err)
      setError(err instanceof Error ? err.message : 'ポイント操作に失敗しました')
    } finally {
      setOperationLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="alert alert-danger">
        <h4>エラー</h4>
        <p>{error || 'ユーザーが見つかりません'}</p>
        <button 
          onClick={() => router.back()} 
          className="btn btn-outline-secondary"
        >
          <ArrowLeftIcon style={{ width: '16px', height: '16px' }} className="me-1" />
          戻る
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="d-flex align-items-center mb-4">
        <button 
          onClick={() => router.back()} 
          className="btn btn-outline-secondary me-3"
        >
          <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
        </button>
        <div>
          <h1 className="h2 mb-1">ポイント管理</h1>
          <p className="text-muted mb-0">{user.email}</p>
        </div>
      </div>

      {/* アラート */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccess('')}
          ></button>
        </div>
      )}

      <div className="row">
        {/* 現在のポイント残高 */}
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">現在のポイント残高</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">無料ポイント</span>
                  <span className="h5 mb-0 text-success">{user.free_points.toLocaleString()}pt</span>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">有料ポイント</span>
                  <span className="h5 mb-0 text-primary">{user.paid_points.toLocaleString()}pt</span>
                </div>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">合計</span>
                <span className="h4 mb-0 text-dark">{user.total_points.toLocaleString()}pt</span>
              </div>
            </div>
          </div>

          {/* ユーザー情報 */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">ユーザー情報</h5>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <small className="text-muted">ユーザーID</small>
                <div className="font-monospace">{user.id}</div>
              </div>
              <div className="mb-2">
                <small className="text-muted">メールアドレス</small>
                <div>{user.email}</div>
              </div>
              <div className="mb-2">
                <small className="text-muted">登録日</small>
                <div>{new Date(user.created_at).toLocaleString('ja-JP')}</div>
              </div>
              <div>
                <small className="text-muted">所持カード数</small>
                <div>{user.card_count}枚</div>
              </div>
            </div>
          </div>
        </div>

        {/* ポイント操作フォーム */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">ポイント操作</h5>
            </div>
            <div className="card-body">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">ポイント種別</label>
                    <select 
                      className="form-select"
                      value={pointType}
                      onChange={(e) => setPointType(e.target.value)}
                    >
                      <option value="free">無料ポイント</option>
                      <option value="paid">有料ポイント</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">金額</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="金額を入力"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                        max="1000000"
                      />
                      <span className="input-group-text">pt</span>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">備考（オプション）</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="操作の理由や備考を入力..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="d-grid gap-2 d-md-flex">
                  <button
                    type="button"
                    className="btn btn-success flex-fill"
                    onClick={() => handlePointOperation('add')}
                    disabled={operationLoading || !amount}
                  >
                    {operationLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        処理中...
                      </>
                    ) : (
                      <>
                        <PlusIcon style={{ width: '16px', height: '16px' }} className="me-1" />
                        ポイント追加
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-warning flex-fill"
                    onClick={() => handlePointOperation('subtract')}
                    disabled={operationLoading || !amount}
                  >
                    {operationLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        処理中...
                      </>
                    ) : (
                      <>
                        <MinusIcon style={{ width: '16px', height: '16px' }} className="me-1" />
                        ポイント減算
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="card mt-4">
            <div className="card-header bg-warning">
              <h6 className="card-title mb-0 text-dark">⚠️ 注意事項</h6>
            </div>
            <div className="card-body">
              <ul className="mb-0">
                <li>ポイント操作は即座に反映され、取り消しできません</li>
                <li>減算時、残高がマイナスになることはありません（0ptが最小値）</li>
                <li>すべての操作は履歴として記録されます</li>
                <li>大量のポイント操作を行う際は事前に確認してください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}