'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setSent(true)
      toast.success('パスワードリセットメールを送信しました')
    } catch (error: any) {
      console.error('Password reset error:', error)
      toast.error(error.message || 'パスワードリセットメールの送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* ロゴ */}
          <div className="text-center">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]">
              ACEORIPA
            </h1>
            <p className="mt-2 text-gray-400">パスワードリセット</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-xl font-bold text-white mb-4">
                メールを送信しました
              </h2>
              
              <p className="text-gray-300 mb-6">
                <span className="text-[#FF0033] font-semibold">{email}</span> 宛に<br />
                パスワードリセット用のリンクを送信しました。<br />
                メール内のリンクをクリックして、新しいパスワードを設定してください。
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSent(false)
                    setEmail('')
                  }}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl transition"
                >
                  別のメールアドレスで試す
                </button>
                
                <Link
                  href="/auth/login"
                  className="block w-full bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white font-bold py-3 px-4 rounded-xl text-center hover:scale-105 transform transition"
                >
                  ログインページに戻る
                </Link>
              </div>
            </div>
          </div>
          
          {/* ホームに戻る */}
          <div className="text-center">
            <Link href="/" className="text-gray-400 hover:text-white transition">
              ← ホームに戻る
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* ロゴ */}
        <div className="text-center">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]">
            ACEORIPA
          </h1>
          <p className="mt-2 text-gray-400">パスワードリセット</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white">
              パスワードをお忘れですか？
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              ご登録いただいたメールアドレスに<br />
              パスワードリセット用のリンクをお送りします
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-300 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#FF0033] focus:outline-none transition"
                placeholder="email@example.com"
              />
            </div>
            
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
                  送信中...
                </div>
              ) : (
                'リセットメールを送信'
              )}
            </button>
          </form>
          
          {/* ログインページに戻る */}
          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-[#FF0033] hover:text-[#FF6B6B] font-bold transition">
              ← ログインページに戻る
            </Link>
          </div>
        </div>
        
        {/* ホームに戻る */}
        <div className="text-center">
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </main>
  )
}