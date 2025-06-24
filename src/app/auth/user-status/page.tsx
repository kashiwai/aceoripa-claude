'use client'

import { useState, useEffect } from 'react'

export default function UserStatusPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserStatus()
  }, [])

  const fetchUserStatus = async () => {
    try {
      const response = await fetch('/api/auth/get-all-users-status')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch user status:', error)
      setData({ error: 'データの取得に失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-2xl">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">全ユーザーステータス確認</h1>

        {/* サマリー */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📊 ユーザー統計</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{data?.summary?.total || 0}</div>
              <div className="text-sm text-gray-400">総ユーザー数</div>
            </div>
            <div className="bg-gray-700 rounded p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{data?.summary?.confirmed || 0}</div>
              <div className="text-sm text-gray-400">確認済み</div>
            </div>
            <div className="bg-gray-700 rounded p-4 text-center">
              <div className="text-3xl font-bold text-orange-400">{data?.summary?.unconfirmed || 0}</div>
              <div className="text-sm text-gray-400">未確認</div>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {data?.error && (
          <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-8">
            <p className="text-red-400">{data.error}</p>
          </div>
        )}

        {/* メッセージ */}
        {data?.message && (
          <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-8">
            <p className="text-blue-400">{data.message}</p>
          </div>
        )}

        {/* 未確認ユーザー */}
        {data?.unconfirmedUsers?.length > 0 && (
          <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 text-orange-400">⚠️ メール確認待ちユーザー</h2>
            <div className="space-y-3">
              {data.unconfirmedUsers.map((user: any, index: number) => (
                <div key={index} className="bg-gray-800 rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">{user.email}</p>
                      <p className="text-sm text-gray-400">登録日: {user.createdAt}</p>
                      <p className="text-sm text-orange-400">ステータス: {user.status}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-500">ID: {user.id.substring(0, 8)}...</p>
                      <p className="text-gray-500">プロバイダー: {user.provider}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 確認済みユーザー */}
        {data?.confirmedUsers?.length > 0 && (
          <div className="bg-green-900/30 border border-green-600 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 text-green-400">✅ 確認済みユーザー</h2>
            <div className="space-y-3">
              {data.confirmedUsers.map((user: any, index: number) => (
                <div key={index} className="bg-gray-800 rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">{user.email}</p>
                      <p className="text-sm text-gray-400">登録日: {user.createdAt}</p>
                      <p className="text-sm text-gray-400">確認日: {user.confirmedAt}</p>
                      <p className="text-sm text-gray-400">最終ログイン: {user.lastSignIn}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-500">ID: {user.id.substring(0, 8)}...</p>
                      <p className="text-gray-500">プロバイダー: {user.provider}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 解決方法 */}
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">💡 解決方法</h2>
          <div className="space-y-2 text-yellow-300">
            <p>メール確認待ちのユーザーがいる場合：</p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Supabaseダッシュボード → Authentication → Settings</li>
              <li>「Enable email confirmations」を OFF にする</li>
              <li>既存ユーザーは手動で確認するか、パスワードリセットを実行</li>
            </ol>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={fetchUserStatus}
            className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            再読み込み
          </button>
          <a
            href="/auth/login"
            className="px-6 py-2 bg-gray-600 rounded hover:bg-gray-700"
          >
            ログインページへ
          </a>
        </div>
      </div>
    </div>
  )
}