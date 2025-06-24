'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'react-hot-toast'

export default function TestLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const testLogin = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log('Testing login for:', email)
      
      // まずはユーザーの存在確認
      const { data: userData, error: userError } = await supabase.auth.getUser()
      console.log('Current user:', userData)

      // ログイン試行
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      const testResult = {
        success: !error,
        data: data,
        error: error,
        timestamp: new Date().toISOString(),
        userExists: !!data.user,
        emailConfirmed: data.user?.email_confirmed_at ? true : false
      }

      setResult(testResult)
      // console.log('Login test result:', testResult)

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('ログイン成功！')
      }
    } catch (error: any) {
      const testResult = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
      setResult(testResult)
      console.error('Login test error:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkUser = async () => {
    try {
      // Supabaseでユーザー情報を直接検索
      const { data: users, error } = await supabase
        .from('auth.users')
        .select('*')
        .eq('email', email)

      // console.log('User check result:', { users, error })
      
      if (error) {
        toast.error('ユーザー検索エラー: ' + error.message)
      } else {
        toast.success(`見つかったユーザー数: ${users?.length || 0}`)
      }
    } catch (error: any) {
      console.error('User check error:', error)
      toast.error('ユーザー検索に失敗: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">ログイン機能テスト</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
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
                placeholder="パスワード"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={testLogin}
                disabled={loading || !email || !password}
                className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600"
              >
                {loading ? 'テスト中...' : 'ログインテスト'}
              </button>
              
              <button
                onClick={checkUser}
                disabled={!email}
                className="px-6 py-2 bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-600"
              >
                ユーザー存在確認
              </button>
            </div>
          </div>
        </div>

        {/* 結果表示 */}
        {result && (
          <div className={`bg-gray-800 rounded-lg p-6 ${result.success ? 'border-green-500' : 'border-red-500'} border`}>
            <h2 className={`text-xl font-bold mb-4 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.success ? '✅ ログイン成功' : '❌ ログイン失敗'}
            </h2>
            
            <div className="space-y-2 text-sm">
              <p><strong>タイムスタンプ:</strong> {result.timestamp}</p>
              
              {result.error && (
                <div>
                  <strong className="text-red-400">エラー:</strong>
                  <pre className="bg-gray-900 p-2 rounded mt-1 text-red-300">
                    {JSON.stringify(result.error, null, 2)}
                  </pre>
                </div>
              )}
              
              {result.data && (
                <div>
                  <strong className="text-green-400">データ:</strong>
                  <pre className="bg-gray-900 p-2 rounded mt-1 text-green-300 max-h-40 overflow-y-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
              
              {result.userExists !== undefined && (
                <p><strong>ユーザー存在:</strong> {result.userExists ? 'Yes' : 'No'}</p>
              )}
              
              {result.emailConfirmed !== undefined && (
                <p><strong>メール確認済み:</strong> {result.emailConfirmed ? 'Yes' : 'No'}</p>
              )}
            </div>
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
              → 登録ページ
            </a>
            <a href="/auth/quick-test" className="block text-blue-400 hover:underline">
              → 認証クイックテスト
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}