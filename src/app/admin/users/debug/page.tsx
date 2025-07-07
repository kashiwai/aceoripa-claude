'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function UserDebugPage() {
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkUserData()
  }, [])

  const checkUserData = async () => {
    const info: any = {}
    
    try {
      // 1. user_points テーブルを確認
      const { data: userPoints, error: pointsError, count: pointsCount } = await supabase
        .from('user_points')
        .select('*', { count: 'exact' })
      
      info.userPoints = {
        data: userPoints,
        error: pointsError,
        count: pointsCount
      }
      
      // 2. auth.users を確認（現在のユーザー）
      const { data: { user } } = await supabase.auth.getUser()
      info.currentUser = user
      
      // 3. users テーブルを確認
      const { data: usersTable, error: usersError, count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
      
      info.usersTable = {
        data: usersTable,
        error: usersError,
        count: usersCount
      }
      
      // 4. user_cards テーブルを確認
      const { data: userCards, error: cardsError, count: cardsCount } = await supabase
        .from('user_cards')
        .select('user_id', { count: 'exact' })
      
      info.userCards = {
        uniqueUsers: [...new Set(userCards?.map(c => c.user_id) || [])],
        error: cardsError,
        count: cardsCount
      }
      
      // 5. point_transactions テーブルを確認
      const { data: pointTransactions, error: transactionsError, count: transactionsCount } = await supabase
        .from('point_transactions')
        .select('user_id, type, amount', { count: 'exact' })
      
      info.pointTransactions = {
        uniqueUsers: [...new Set(pointTransactions?.map(pt => pt.user_id) || [])],
        error: transactionsError,
        count: transactionsCount
      }
      
      // 6. API エンドポイントをテスト
      try {
        const response = await fetch('/api/admin/users?page=1&perPage=20')
        const apiData = await response.json()
        info.apiResponse = apiData
      } catch (apiError) {
        info.apiError = apiError
      }
      
      // 7. 新しいデバッグAPIをテスト
      try {
        const debugResponse = await fetch('/api/admin/debug-users')
        const debugData = await debugResponse.json()
        info.detailedDebug = debugData
      } catch (debugError) {
        info.detailedDebugError = debugError
      }
      
      // 8. 整合性チェック
      const allUserIds = new Set([
        ...(userPoints?.map(up => up.user_id) || []),
        ...(usersTable?.map(u => u.id) || []),
        ...(userCards?.map(uc => uc.user_id) || []),
        ...(pointTransactions?.map(pt => pt.user_id) || [])
      ])
      
      info.consistencyCheck = {
        totalUniqueUsers: allUserIds.size,
        allUserIds: Array.from(allUserIds),
        currentUserExists: {
          inUserPoints: userPoints?.some(up => up.user_id === user?.id),
          inUsersTable: usersTable?.some(u => u.id === user?.id),
          inUserCards: userCards?.some(uc => uc.user_id === user?.id),
          inPointTransactions: pointTransactions?.some(pt => pt.user_id === user?.id)
        }
      }
      
    } catch (error) {
      info.generalError = error
    }
    
    setDebugInfo(info)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">詳細デバッグ情報を収集中...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="d-flex align-items-center mb-4">
        <button onClick={() => router.back()} className="btn btn-outline-secondary me-3">
          <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
        </button>
        <div>
          <h1 className="h2 mb-1">ユーザーデータ デバッグ情報</h1>
          <p className="text-muted mb-0">データベースの整合性とユーザー情報を詳細確認</p>
        </div>
      </div>

      {/* 警告 */}
      <div className="alert alert-warning d-flex align-items-center mb-4">
        <ExclamationTriangleIcon style={{ width: '20px', height: '20px' }} className="me-2" />
        <div>
          <strong>デバッグモード:</strong> この情報は開発・デバッグ用です。本番環境では機密情報が含まれる可能性があります。
        </div>
      </div>

      {/* 現在のユーザー情報 */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="card-title mb-0">現在ログイン中のユーザー</h5>
        </div>
        <div className="card-body">
          {debugInfo.currentUser ? (
            <div className="row">
              <div className="col-md-6">
                <p><strong>ID:</strong> <code>{debugInfo.currentUser.id}</code></p>
                <p><strong>Email:</strong> {debugInfo.currentUser.email}</p>
                <p><strong>作成日:</strong> {new Date(debugInfo.currentUser.created_at).toLocaleString('ja-JP')}</p>
              </div>
              <div className="col-md-6">
                <h6>データ存在確認:</h6>
                <div className="mb-2">
                  <span className="me-2">user_points:</span>
                  <span className={`badge ${debugInfo.consistencyCheck?.currentUserExists?.inUserPoints ? 'bg-success' : 'bg-danger'}`}>
                    {debugInfo.consistencyCheck?.currentUserExists?.inUserPoints ? '存在' : '未登録'}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="me-2">users テーブル:</span>
                  <span className={`badge ${debugInfo.consistencyCheck?.currentUserExists?.inUsersTable ? 'bg-success' : 'bg-warning'}`}>
                    {debugInfo.consistencyCheck?.currentUserExists?.inUsersTable ? '存在' : '未登録'}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="me-2">カード所持:</span>
                  <span className={`badge ${debugInfo.consistencyCheck?.currentUserExists?.inUserCards ? 'bg-success' : 'bg-secondary'}`}>
                    {debugInfo.consistencyCheck?.currentUserExists?.inUserCards ? 'あり' : 'なし'}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="me-2">取引履歴:</span>
                  <span className={`badge ${debugInfo.consistencyCheck?.currentUserExists?.inPointTransactions ? 'bg-success' : 'bg-secondary'}`}>
                    {debugInfo.consistencyCheck?.currentUserExists?.inPointTransactions ? 'あり' : 'なし'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning">ログインしていません</div>
          )}
        </div>
      </div>
      
      {/* テーブル統計サマリー */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">user_points</h5>
              <h3 className="text-primary">{debugInfo.userPoints?.count || 0}</h3>
              <small className="text-muted">ポイント保持ユーザー</small>
              {debugInfo.userPoints?.error && <div className="badge bg-danger mt-2">エラー</div>}
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">users</h5>
              <h3 className="text-info">{debugInfo.usersTable?.count || 0}</h3>
              <small className="text-muted">カスタムユーザー</small>
              {debugInfo.usersTable?.error && <div className="badge bg-danger mt-2">エラー</div>}
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">user_cards</h5>
              <h3 className="text-success">{debugInfo.userCards?.count || 0}</h3>
              <small className="text-muted">カード所持記録</small>
              {debugInfo.userCards?.error && <div className="badge bg-danger mt-2">エラー</div>}
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">総ユニークID</h5>
              <h3 className="text-warning">{debugInfo.consistencyCheck?.totalUniqueUsers || 0}</h3>
              <small className="text-muted">全テーブル統合</small>
            </div>
          </div>
        </div>
      </div>

      {/* 管理画面APIテスト */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">管理画面APIテスト (/api/admin/users)</h5>
        </div>
        <div className="card-body">
          {debugInfo.apiResponse ? (
            <div>
              <div className="row mb-3">
                <div className="col-md-4">
                  <strong>成功:</strong> <span className={`badge ${debugInfo.apiResponse.success ? 'bg-success' : 'bg-danger'}`}>
                    {debugInfo.apiResponse.success ? 'はい' : 'いいえ'}
                  </span>
                </div>
                <div className="col-md-4">
                  <strong>ユーザー数:</strong> {debugInfo.apiResponse.users?.length || 0}
                </div>
                <div className="col-md-4">
                  <strong>総数:</strong> {debugInfo.apiResponse.totalCount || 0}
                </div>
              </div>
              <details>
                <summary className="btn btn-sm btn-outline-secondary">詳細データを表示</summary>
                <pre className="bg-light p-3 rounded mt-2" style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
                  {JSON.stringify(debugInfo.apiResponse, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <p>APIレスポンスなし</p>
          )}
          {debugInfo.apiError && (
            <div className="alert alert-danger">
              <strong>APIエラー:</strong> {JSON.stringify(debugInfo.apiError)}
            </div>
          )}
        </div>
      </div>

      {/* 詳細デバッグAPI */}
      {debugInfo.detailedDebug && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="card-title mb-0">詳細デバッグAPI結果</h5>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <strong>成功:</strong> <span className={`badge ${debugInfo.detailedDebug.success ? 'bg-success' : 'bg-danger'}`}>
                  {debugInfo.detailedDebug.success ? 'はい' : 'いいえ'}
                </span>
              </div>
              <div className="col-md-6">
                <strong>タイムスタンプ:</strong> {debugInfo.detailedDebug.debug_info?.timestamp ? new Date(debugInfo.detailedDebug.debug_info.timestamp).toLocaleString('ja-JP') : 'N/A'}
              </div>
            </div>
            <details>
              <summary className="btn btn-sm btn-outline-secondary">詳細デバッグデータを表示</summary>
              <pre className="bg-light p-3 rounded mt-2" style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
                {JSON.stringify(debugInfo.detailedDebug, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}

      {/* 全ユーザーID一覧 */}
      {debugInfo.consistencyCheck?.allUserIds && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="card-title mb-0">発見された全ユーザーID</h5>
          </div>
          <div className="card-body">
            <p><strong>ユニークユーザー数:</strong> {debugInfo.consistencyCheck.totalUniqueUsers}</p>
            <div className="row">
              {debugInfo.consistencyCheck.allUserIds.map((userId: string, index: number) => (
                <div key={index} className="col-md-6 col-lg-4 mb-2">
                  <div className="d-flex align-items-center">
                    <code className="flex-grow-1 p-2 bg-light rounded me-2">{userId}</code>
                    {debugInfo.currentUser?.id === userId && (
                      <span className="badge bg-primary">現在</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="mt-4">
        <button 
          onClick={checkUserData} 
          className="btn btn-primary me-2"
          disabled={loading}
        >
          {loading ? '更新中...' : '再チェック'}
        </button>
        <button 
          onClick={() => router.push('/admin/users')} 
          className="btn btn-secondary me-2"
        >
          ユーザー管理に戻る
        </button>
        <button 
          onClick={() => router.push('/admin/users/debug')} 
          className="btn btn-outline-info"
        >
          ページ再読み込み
        </button>
      </div>
    </div>
  )
}