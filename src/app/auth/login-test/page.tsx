'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function LoginTestPage() {
  const [email, setEmail] = useState('ko.kashiwai@gmail.com')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const testSignUp = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      setResult({
        action: '新規登録',
        success: !error,
        error: error?.message,
        errorCode: error?.code,
        data: data,
        note: error?.message?.includes('already registered') 
          ? 'このメールアドレスは既に登録されています' 
          : data?.user && !data.user.email_confirmed_at
          ? 'メール確認が必要です（Supabaseでメール確認を無効化してください）'
          : null
      })
    } catch (e: any) {
      setResult({ action: '新規登録', error: e.message })
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (!error && data.user) {
        setResult({
          action: 'ログイン',
          success: true,
          user: data.user.email,
          session: !!data.session
        })
        
        // 成功したらマイページへ
        setTimeout(() => {
          router.push('/mypage')
        }, 2000)
      } else {
        setResult({
          action: 'ログイン',
          success: false,
          error: error?.message,
          errorCode: error?.code,
          note: error?.message?.includes('Invalid login credentials')
            ? 'メールアドレスまたはパスワードが間違っています'
            : error?.message?.includes('Email not confirmed')
            ? 'メール確認が完了していません'
            : null
        })
      }
    } catch (e: any) {
      setResult({ action: 'ログイン', error: e.message })
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      setResult({
        action: 'パスワードリセット',
        success: !error,
        error: error?.message,
        note: !error ? 'メールを送信しました。メールボックスを確認してください。' : null
      })
    } catch (e: any) {
      setResult({ action: 'パスワードリセット', error: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">ログイン問題診断</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded"
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
                onClick={testSignUp}
                disabled={loading || !email || !password}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-600"
              >
                新規登録テスト
              </button>
              
              <button
                onClick={testLogin}
                disabled={loading || !email || !password}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600"
              >
                ログインテスト
              </button>
              
              <button
                onClick={resetPassword}
                disabled={loading || !email}
                className="px-4 py-2 bg-orange-600 rounded hover:bg-orange-700 disabled:bg-gray-600"
              >
                パスワードリセット
              </button>
            </div>
          </div>
        </div>

        {/* 結果表示 */}
        {result && (
          <div className={`bg-gray-800 rounded-lg p-6 mb-6 border ${
            result.success ? 'border-green-600' : 'border-red-600'
          }`}>
            <h2 className={`text-xl font-bold mb-4 ${
              result.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {result.action} - {result.success ? '成功' : '失敗'}
            </h2>
            
            {result.error && (
              <p className="text-red-400 mb-2">エラー: {result.error}</p>
            )}
            
            {result.note && (
              <p className="text-yellow-400 mb-2">📝 {result.note}</p>
            )}
            
            {result.user && (
              <p className="text-green-400">ユーザー: {result.user}</p>
            )}
          </div>
        )}

        {/* 解決手順 */}
        <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-400">🔧 推奨手順</h2>
          <ol className="space-y-3 text-blue-300 list-decimal list-inside">
            <li>
              <strong>新規登録テスト</strong>を実行
              <ul className="ml-6 mt-1 text-sm">
                <li>• 「already registered」→ ユーザーは存在する</li>
                <li>• 成功 → メール確認が必要</li>
              </ul>
            </li>
            <li>
              <strong>ログインテスト</strong>を実行
              <ul className="ml-6 mt-1 text-sm">
                <li>• 「Invalid login credentials」→ パスワードが違う</li>
                <li>• 「Email not confirmed」→ メール未確認</li>
              </ul>
            </li>
            <li>
              ログインできない場合は<strong>パスワードリセット</strong>
            </li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-900/30 rounded">
            <p className="text-yellow-300 text-sm">
              💡 最も簡単な解決策：Supabaseダッシュボードで「Enable email confirmations」をOFFにする
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}