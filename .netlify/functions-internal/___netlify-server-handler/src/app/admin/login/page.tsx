'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'react-hot-toast'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Supabaseクライアントを作成
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Supabase認証
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('メールアドレスまたはパスワードが正しくありません')
        } else if (error.message.includes('Email not confirmed')) {
          setError('メールアドレスが確認されていません')
        } else {
          setError(error.message)
        }
        return
      }

      // Admin権限チェック（簡易版：メールアドレスで判定）
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@aceoripa.com'
      if (data.user?.email === adminEmail) {
        toast.success('管理画面にログインしました')
        router.push('/admin')
      } else {
        // 非管理者の場合はログアウト
        await supabase.auth.signOut()
        setError('管理者権限がありません')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError('ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">ACEorIPA Admin</h1>
          <p className="text-gray-600 mt-2">管理者ログイン</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@aceoripa.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-800">
            ← ユーザー画面に戻る
          </Link>
          <span className="mx-2 text-gray-400">|</span>
          <Link href="/admin/login/demo" className="text-sm text-blue-600 hover:text-blue-800">
            デモモードで試す
          </Link>
        </div>

        {/* ヘルプ情報 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">ログインできない場合</h3>
          <ol className="text-xs text-blue-700 space-y-1">
            <li>1. Supabaseダッシュボードで管理者ユーザーを作成</li>
            <li>2. Email: <code className="bg-blue-100 px-1 rounded">admin@aceoripa.com</code> で登録</li>
            <li>3. Auto Confirm User にチェック</li>
            <li>4. 環境変数が正しく設定されているか確認</li>
          </ol>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-700">
              詳細は <code className="bg-blue-100 px-1 rounded">/docs/ADMIN_LOGIN_SETUP.md</code> を参照
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}