'use client'

import { useState } from 'react'

export default function TestApiPage() {
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testApi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users?page=1&perPage=20')
      const data = await response.json()
      setApiResponse({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      })
    } catch (error: any) {
      setApiResponse({ error: error.message })
    }
    setLoading(false)
  }

  const testDirectFetch = async () => {
    setLoading(true)
    try {
      // 環境変数からURLを取得
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const response = await fetch(`${baseUrl}/api/admin/users`)
      const data = await response.json()
      setApiResponse({
        url: `${baseUrl}/api/admin/users`,
        status: response.status,
        data: data
      })
    } catch (error: any) {
      setApiResponse({ error: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">API テスト</h1>
      
      <div className="d-flex gap-2 mb-4">
        <button 
          onClick={testApi} 
          className="btn btn-primary"
          disabled={loading}
        >
          APIをテスト
        </button>
        <button 
          onClick={testDirectFetch} 
          className="btn btn-secondary"
          disabled={loading}
        >
          完全URLでテスト
        </button>
      </div>

      {loading && (
        <div className="alert alert-info">
          読み込み中...
        </div>
      )}

      {apiResponse && (
        <div className="card">
          <div className="card-header">
            <h3 className="h5 mb-0">APIレスポンス</h3>
          </div>
          <div className="card-body">
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="card mt-4">
        <div className="card-header">
          <h3 className="h5 mb-0">期待される成功レスポンス</h3>
        </div>
        <div className="card-body">
          <pre className="bg-light p-3 rounded">
{`{
  "success": true,
  "users": [
    {
      "id": "user-id-here",
      "email": "user1@example.com",
      "display_name": "ユーザー1",
      "created_at": "2025-06-24T16:28:01.963577Z",
      "free_points": 1000,
      "paid_points": 0,
      "total_points": 1000,
      "card_count": 0
    }
  ],
  "totalCount": 6,
  "totalPages": 1,
  "currentPage": 1
}`}
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