'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function UserDebugPage() {
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
      
      // 3. user_cards テーブルを確認
      const { data: userCards, error: cardsError, count: cardsCount } = await supabase
        .from('user_cards')
        .select('user_id', { count: 'exact' })
      
      info.userCards = {
        uniqueUsers: [...new Set(userCards?.map(c => c.user_id) || [])],
        error: cardsError,
        count: cardsCount
      }
      
      // 4. gacha_results テーブルを確認
      const { data: gachaResults, error: gachaError, count: gachaCount } = await supabase
        .from('gacha_results')
        .select('user_id', { count: 'exact' })
      
      info.gachaResults = {
        uniqueUsers: [...new Set(gachaResults?.map(g => g.user_id) || [])],
        error: gachaError,
        count: gachaCount
      }
      
      // 5. API エンドポイントをテスト
      try {
        const response = await fetch('/api/admin/users?page=1&perPage=20')
        const apiData = await response.json()
        info.apiResponse = apiData
      } catch (apiError) {
        info.apiError = apiError
      }
      
    } catch (error) {
      info.generalError = error
    }
    
    setDebugInfo(info)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">デバッグ情報を収集中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">ユーザーデータ デバッグ情報</h1>
      
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">user_points テーブル</h3>
        </div>
        <div className="card-body">
          <p>レコード数: {debugInfo.userPoints?.count || 0}</p>
          {debugInfo.userPoints?.error && (
            <div className="alert alert-danger">
              エラー: {JSON.stringify(debugInfo.userPoints.error)}
            </div>
          )}
          {debugInfo.userPoints?.data && (
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(debugInfo.userPoints.data, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">現在のユーザー (auth.users)</h3>
        </div>
        <div className="card-body">
          {debugInfo.currentUser ? (
            <pre className="bg-light p-3 rounded">
              {JSON.stringify({
                id: debugInfo.currentUser.id,
                email: debugInfo.currentUser.email,
                created_at: debugInfo.currentUser.created_at
              }, null, 2)}
            </pre>
          ) : (
            <p>ログインしていません</p>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">user_cards テーブル</h3>
        </div>
        <div className="card-body">
          <p>ユニークユーザー数: {debugInfo.userCards?.uniqueUsers?.length || 0}</p>
          <p>総レコード数: {debugInfo.userCards?.count || 0}</p>
          {debugInfo.userCards?.error && (
            <div className="alert alert-danger">
              エラー: {JSON.stringify(debugInfo.userCards.error)}
            </div>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">gacha_results テーブル</h3>
        </div>
        <div className="card-body">
          <p>ユニークユーザー数: {debugInfo.gachaResults?.uniqueUsers?.length || 0}</p>
          <p>総レコード数: {debugInfo.gachaResults?.count || 0}</p>
          {debugInfo.gachaResults?.error && (
            <div className="alert alert-danger">
              エラー: {JSON.stringify(debugInfo.gachaResults.error)}
            </div>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">API レスポンス (/api/admin/users)</h3>
        </div>
        <div className="card-body">
          {debugInfo.apiResponse ? (
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(debugInfo.apiResponse, null, 2)}
            </pre>
          ) : (
            <p>APIレスポンスなし</p>
          )}
          {debugInfo.apiError && (
            <div className="alert alert-danger">
              APIエラー: {JSON.stringify(debugInfo.apiError)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <button 
          onClick={checkUserData} 
          className="btn btn-primary"
        >
          再チェック
        </button>
        <a href="/admin/users" className="btn btn-secondary ms-2">
          ユーザー管理に戻る
        </a>
      </div>
    </div>
  )
}