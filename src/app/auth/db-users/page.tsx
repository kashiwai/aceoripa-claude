'use client'

import { useState, useEffect } from 'react'

export default function DBUsersPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/check-all-users')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">データベース ユーザー確認</h1>

        {/* Auth API経由 */}
        <div className="mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-yellow-400">
              1. Auth Admin API（管理画面に表示されるユーザー）
            </h2>
            <p className="mb-4">ユーザー数: {data?.authApi?.count || 0}</p>
            {data?.authApi?.error && (
              <p className="text-red-400 mb-4">エラー: {data.authApi.error}</p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">確認済み</th>
                    <th className="text-left p-2">作成日</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.authApi?.users?.map((user: any) => (
                    <tr key={user.id} className="border-b border-gray-700">
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.email_confirmed_at ? '✅' : '❌'}</td>
                      <td className="p-2">{new Date(user.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* auth.usersテーブル */}
        <div className="mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-400">
              2. auth.users テーブル（実際のDBデータ）
            </h2>
            <p className="mb-4">ユーザー数: {data?.authTable?.count || 0}</p>
            {data?.authTable?.error && (
              <p className="text-red-400 mb-4">エラー: {data.authTable.error}</p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">確認済み</th>
                    <th className="text-left p-2">作成日</th>
                    <th className="text-left p-2">最終ログイン</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.authTable?.users?.map((user: any) => (
                    <tr key={user.id} className="border-b border-gray-700">
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.email_confirmed_at ? '✅' : '❌'}</td>
                      <td className="p-2">{new Date(user.created_at).toLocaleString()}</td>
                      <td className="p-2">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* public.usersテーブル */}
        <div className="mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-green-400">
              3. public.users テーブル（アプリ用データ）
            </h2>
            <p className="mb-4">ユーザー数: {data?.publicTable?.count || 0}</p>
            {data?.publicTable?.error && (
              <p className="text-red-400 mb-4">エラー: {data.publicTable.error}</p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Display Name</th>
                    <th className="text-left p-2">Provider</th>
                    <th className="text-left p-2">作成日</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.publicTable?.users?.map((user: any) => (
                    <tr key={user.id} className="border-b border-gray-700">
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.display_name}</td>
                      <td className="p-2">{user.provider}</td>
                      <td className="p-2">{new Date(user.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 分析 */}
        <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-orange-400">📊 分析</h2>
          <ul className="space-y-2">
            <li>• Auth API: {data?.authApi?.count || 0} ユーザー（確認済みのみ表示）</li>
            <li>• auth.users: {data?.authTable?.count || 0} ユーザー（全ユーザー）</li>
            <li>• public.users: {data?.publicTable?.count || 0} ユーザー（アプリデータ）</li>
          </ul>
          
          {data?.authTable?.count > data?.authApi?.count && (
            <p className="mt-4 text-yellow-300">
              ⚠️ auth.usersテーブルにはユーザーが存在しますが、メール未確認のため管理画面に表示されていません。
            </p>
          )}
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={fetchUsers}
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