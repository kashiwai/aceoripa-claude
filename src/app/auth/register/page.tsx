'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('パスワードが一致しません')
      return
    }
    
    if (password.length < 6) {
      toast.error('パスワードは6文字以上で入力してください')
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, username)
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* ロゴ */}
        <div className="text-center">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]">
            ACEORIPA
          </h1>
          <p className="mt-2 text-gray-400">アカウント作成</p>
        </div>

        {/* 登録フォーム */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ユーザー名 */}
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-gray-300 mb-2">
                ユーザー名
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#FF0033] focus:outline-none transition"
                placeholder="ユーザー名を入力"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-300 mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#FF0033] focus:outline-none transition"
                placeholder="email@example.com"
              />
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-300 mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#FF0033] focus:outline-none transition"
                placeholder="6文字以上"
              />
            </div>

            {/* パスワード確認 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-300 mb-2">
                パスワード確認
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#FF0033] focus:outline-none transition"
                placeholder="パスワードを再入力"
              />
            </div>

            {/* 登録ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white font-bold py-3 px-4 rounded-xl hover:scale-105 transform transition shadow-lg disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  アカウント作成中...
                </div>
              ) : (
                'アカウント作成'
              )}
            </button>
          </form>

          {/* ログインリンク */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              既にアカウントをお持ちですか？
              <Link href="/auth/login" className="text-[#FF0033] hover:text-[#FF6B6B] font-bold ml-1 transition">
                ログイン
              </Link>
            </p>
          </div>
        </div>

        {/* ホームに戻る */}
        <div className="text-center">
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}