'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function AdminDemoLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('demo@aceoripa.com')
  const [password, setPassword] = useState('demo123')
  const [isLoading, setIsLoading] = useState(false)

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // デモモード: 固定認証
    if (email === 'demo@aceoripa.com' && password === 'demo123') {
      toast.success('デモモードでログインしました')
      // Cookieにデモフラグを保存（middlewareで確認するため）
      document.cookie = 'adminDemo=true; path=/; max-age=3600'
      // セッションストレージにも保存
      sessionStorage.setItem('adminDemo', 'true')
      // 少し待ってからデモページへリダイレクト
      setTimeout(() => {
        router.push('/admin/demo')
      }, 100)
    } else {
      toast.error('デモ認証情報が正しくありません')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-600 mt-2">デモモード</p>
        </div>

        <form onSubmit={handleDemoLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="demo@aceoripa.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="demo123"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>デモ認証情報:</strong><br />
              メール: demo@aceoripa.com<br />
              パスワード: demo123
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition duration-200 disabled:opacity-50"
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-purple-600 hover:text-purple-700 text-sm">
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}