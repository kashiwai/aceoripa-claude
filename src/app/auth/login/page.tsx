'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, loading } = useAuth()
  const [socialLoading, setSocialLoading] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await signIn(email, password)
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'twitter' | 'line') => {
    try {
      setSocialLoading(provider)
      
      // LINEの場合は特別な処理が必要
      if (provider === 'line') {
        // カスタムLINE認証エンドポイントへリダイレクト
        window.location.href = '/api/auth/line?action=login'
        return
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider === 'twitter' ? 'twitter' : 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          }
        })
        if (error) throw error
      }
    } catch (error: any) {
      console.error('Social login error:', error)
      toast.error(error.message || 'ソーシャルログインに失敗しました')
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* ロゴ */}
        <div className="text-center">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]">
            ACEORIPA
          </h1>
          <p className="mt-2 text-gray-400">ログイン</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
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
            
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-300 mb-2">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#FF0033] focus:outline-none transition"
                placeholder="パスワード"
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
                  ログイン中...
                </div>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          {/* ソーシャルログイン */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">または</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {/* Googleログイン */}
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={socialLoading === 'google'}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-xl shadow-sm text-white bg-gray-700 hover:bg-gray-600 transition disabled:opacity-50"
              >
                {socialLoading === 'google' ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Googleでログイン
                  </>
                )}
              </button>

              {/* X (Twitter) ログイン */}
              <button
                onClick={() => handleSocialLogin('twitter')}
                disabled={socialLoading === 'twitter'}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-xl shadow-sm text-white bg-gray-700 hover:bg-gray-600 transition disabled:opacity-50"
              >
                {socialLoading === 'twitter' ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X (Twitter) でログイン
                  </>
                )}
              </button>

              {/* LINEログイン */}
              <button
                onClick={() => handleSocialLogin('line')}
                disabled={socialLoading === 'line'}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-xl shadow-sm text-white bg-[#00B900] hover:bg-[#00A000] transition disabled:opacity-50"
              >
                {socialLoading === 'line' ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                    </svg>
                    LINEでログイン
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* テストアカウント情報 */}
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <p className="text-sm font-bold text-[#FF0033] mb-2">テストアカウント:</p>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Email: test@aceoripa.com</div>
              <div>Password: test123</div>
              <button 
                onClick={() => {
                  setEmail('test@aceoripa.com')
                  setPassword('test123')
                }}
                className="mt-2 text-xs bg-[#FF0033] text-white px-3 py-1 rounded hover:bg-[#FF6B6B] transition"
              >
                テストアカウントでログイン
              </button>
            </div>
          </div>
          
          {/* アカウント作成リンク */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              アカウントをお持ちでない方は
              <Link href="/auth/register" className="text-[#FF0033] hover:text-[#FF6B6B] font-bold ml-1 transition">
                アカウント作成
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
    </main>
  )
}