'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'react-hot-toast'

export default function AdminLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // セキュアなリダイレクト先検証
  const rawRedirect = searchParams.get('redirect') || '/admin'

  // 検証関数: 内部パスのみ許可（オープンリダイレクト脆弱性対策）
  const validateRedirect = (url: string): string => {
    // 空文字やnullチェック
    if (!url || url.trim() === '') return '/admin'

    // 外部URLチェック（http://, https://, // で始まる場合は拒否）
    if (url.match(/^(https?:)?\/\//i)) {
      console.warn('External redirect attempt blocked:', url)
      return '/admin'
    }

    // /admin で始まるパスのみ許可
    if (!url.startsWith('/admin')) {
      console.warn('Non-admin path redirect attempt blocked:', url)
      return '/admin'
    }

    // パストラバーサル攻撃を防ぐ（../ を含む場合は拒否）
    if (url.includes('../')) {
      console.warn('Path traversal attempt blocked:', url)
      return '/admin'
    }

    return url
  }

  const redirect = validateRedirect(rawRedirect)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // admin_credentialsテーブルから認証
      const { data, error } = await supabase
        .from('admin_credentials')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        toast.error('ユーザー名またはパスワードが正しくありません')
        setIsLoading(false)
        return
      }

      // パスワードの検証（本番環境では適切なハッシュ化を使用）
      // 初期実装では簡易的なBase64エンコーディングを使用
      const encodedPassword = btoa(password)
      if (data.password_hash !== encodedPassword) {
        toast.error('ユーザー名またはパスワードが正しくありません')
        setIsLoading(false)
        return
      }

      // 最終ログイン時刻を更新
      await supabase
        .from('admin_credentials')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id)

      // セッションをCookieに保存
      const session = {
        id: data.id,
        username: data.username,
        role: data.role,
        loginTime: new Date().toISOString()
      }
      
      // Cookieに保存（24時間有効）
      document.cookie = `admin_session=${JSON.stringify(session)}; path=/; max-age=${60 * 60 * 24}`

      toast.success('管理画面にログインしました')
      
      // リダイレクト
      setTimeout(() => {
        window.location.href = redirect // Cookieを確実に保存するためwindow.locationを使用
      }, 500)
    } catch (error) {
      console.error('Login error:', error)
      toast.error('ログインに失敗しました')
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
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              ユーザー名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin"
              required
              autoFocus
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-600 hover:text-gray-800">
            ← ユーザー画面に戻る
          </a>
          <span className="mx-2 text-gray-400">|</span>
          <a href="/admin/login/demo" className="text-sm text-blue-600 hover:text-blue-800">
            デモモードで試す
          </a>
        </div>

      </div>
    </div>
  )
}