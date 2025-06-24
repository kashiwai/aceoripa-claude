'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'react-hot-toast'

export default function QuickTestPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleAuth = async () => {
    setLoading(true)
    setResult(null)

    try {
      if (mode === 'signup') {
        // 登録
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (error) {
          setResult({ success: false, error: error.message })
          toast.error(error.message)
        } else {
          setResult({ success: true, data })
          toast.success('登録成功！メールを確認してください。')
        }
      } else {
        // ログイン
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) {
          setResult({ success: false, error: error.message })
          toast.error(error.message)
        } else {
          setResult({ success: true, data })
          toast.success('ログイン成功！')
          // ホームへリダイレクト
          setTimeout(() => {
            window.location.href = '/'
          }, 1000)
        }
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message })
      toast.error('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const generateTestEmail = () => {
    const timestamp = Date.now()
    setEmail(`test${timestamp}@example.com`)
    setPassword('test123456')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">認証クイックテスト</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setMode('signup')}
              className={`px-4 py-2 rounded ${mode === 'signup' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              新規登録
            </button>
            <button
              onClick={() => setMode('login')}
              className={`px-4 py-2 rounded ${mode === 'login' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              ログイン
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded"
                placeholder="test@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded"
                placeholder="6文字以上"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={generateTestEmail}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
              >
                テストデータ生成
              </button>
              
              <button
                onClick={handleAuth}
                disabled={loading || !email || !password}
                className="px-6 py-2 bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-600"
              >
                {loading ? '処理中...' : mode === 'signup' ? '登録' : 'ログイン'}
              </button>
            </div>
          </div>
        </div>

        {/* 結果表示 */}
        {result && (
          <div className={`bg-gray-800 rounded-lg p-6 ${result.success ? 'border-green-500' : 'border-red-500'} border`}>
            <h2 className={`text-xl font-bold mb-4 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.success ? '✅ 成功' : '❌ エラー'}
            </h2>
            {result.error && (
              <p className="text-red-400 mb-4">{result.error}</p>
            )}
            {result.data && (
              <div>
                <p className="text-green-400 mb-2">ユーザーID: {result.data.user?.id}</p>
                <p className="text-green-400">メール: {result.data.user?.email}</p>
              </div>
            )}
          </div>
        )}

        {/* 情報 */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">🔗 関連ページ</h2>
          <div className="space-y-2">
            <a href="/auth/login" className="block text-blue-400 hover:underline">
              → 通常のログインページ
            </a>
            <a href="/auth/register" className="block text-blue-400 hover:underline">
              → 通常の登録ページ
            </a>
            <a href="/auth/test-signup" className="block text-blue-400 hover:underline">
              → 登録デバッグページ
            </a>
            <a href="/auth/db-check" className="block text-blue-400 hover:underline">
              → データベース診断ページ
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}