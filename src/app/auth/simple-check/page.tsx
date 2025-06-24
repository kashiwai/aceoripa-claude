'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'react-hot-toast'

export default function SimpleCheckPage() {
  const [email, setEmail] = useState('ko.kashiwai@gmail.com')
  const [password, setPassword] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const runTests = async () => {
    setLoading(true)
    const testResults: any = {
      timestamp: new Date().toISOString(),
      tests: []
    }

    // Test 1: 新規登録を試みる
    try {
      const testEmail = `test${Date.now()}@example.com`
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'test123456',
      })
      
      testResults.tests.push({
        name: 'テスト登録',
        success: !error,
        data: data?.user ? { id: data.user.id, email: data.user.email } : null,
        error: error?.message
      })
    } catch (e: any) {
      testResults.tests.push({
        name: 'テスト登録',
        success: false,
        error: e.message
      })
    }

    // Test 2: 既存ユーザーでログイン
    if (email && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        testResults.tests.push({
          name: '通常ログイン',
          success: !error,
          data: data?.user ? { id: data.user.id, email: data.user.email } : null,
          error: error?.message
        })
      } catch (e: any) {
        testResults.tests.push({
          name: '通常ログイン',
          success: false,
          error: e.message
        })
      }
    }

    // Test 3: 現在のセッション確認
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      testResults.tests.push({
        name: 'セッション確認',
        success: !error,
        data: session ? { user: session.user.email, expires: session.expires_at } : null,
        error: error?.message
      })
    } catch (e: any) {
      testResults.tests.push({
        name: 'セッション確認',
        success: false,
        error: e.message
      })
    }

    // Test 4: Admin APIでユーザー数を確認
    try {
      const response = await fetch('/api/auth/simple-user-count')
      const data = await response.json()
      
      testResults.tests.push({
        name: 'ユーザー数確認',
        success: response.ok,
        data: data,
        error: data.error
      })
    } catch (e: any) {
      testResults.tests.push({
        name: 'ユーザー数確認',
        success: false,
        error: e.message
      })
    }

    setResults(testResults)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">認証システム簡易チェック</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">テストするメールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded"
                placeholder="email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">パスワード（ログインテスト用）</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded"
                placeholder="パスワード"
              />
            </div>

            <button
              onClick={runTests}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600"
            >
              {loading ? 'テスト実行中...' : 'テストを実行'}
            </button>
          </div>
        </div>

        {/* 結果表示 */}
        {results && (
          <div className="space-y-4">
            {results.tests.map((test: any, index: number) => (
              <div 
                key={index}
                className={`bg-gray-800 rounded-lg p-4 border ${
                  test.success ? 'border-green-600' : 'border-red-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">{test.name}</h3>
                  <span className={test.success ? 'text-green-400' : 'text-red-400'}>
                    {test.success ? '✅ 成功' : '❌ 失敗'}
                  </span>
                </div>
                {test.data && (
                  <pre className="bg-gray-900 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                )}
                {test.error && (
                  <p className="text-red-400 text-sm mt-2">{test.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 解決方法 */}
        <div className="mt-8 bg-yellow-900/30 border border-yellow-600 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">🔧 問題が続く場合の解決方法</h2>
          <ol className="space-y-2 text-yellow-300 list-decimal list-inside">
            <li>Supabaseダッシュボードで「Enable email confirmations」をOFFにする</li>
            <li>環境変数 SUPABASE_SERVICE_ROLE_KEY が正しく設定されているか確認</li>
            <li>Google認証を使用する（メール確認不要）</li>
          </ol>
        </div>
      </div>
    </div>
  )
}