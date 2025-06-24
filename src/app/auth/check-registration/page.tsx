'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

export default function CheckRegistrationPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const checkRegistration = async () => {
    setLoading(true)
    setResults(null)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // テスト登録を実行
      const testEmail = email || `test${Date.now()}@example.com`
      const testPassword = 'test123456'
      
      console.log('Testing registration with:', testEmail)

      // 1. 登録を試みる
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      // 2. 登録直後のユーザー状態を確認
      const { data: { user: currentUser }, error: getUserError } = await supabase.auth.getUser()

      // 3. セッション状態を確認
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      // 4. 管理者権限でユーザー一覧を確認（APIエンドポイント経由）
      const adminCheckResponse = await fetch('/api/auth/check-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      })
      const adminCheckData = await adminCheckResponse.json()

      setResults({
        testEmail,
        signUpResult: {
          success: !signUpError,
          data: signUpData,
          error: signUpError
        },
        currentUser: {
          success: !getUserError,
          data: currentUser,
          error: getUserError
        },
        session: {
          success: !sessionError,
          data: session,
          error: sessionError
        },
        adminCheck: adminCheckData,
        timestamp: new Date().toISOString()
      })

    } catch (error: any) {
      console.error('Check registration error:', error)
      setResults({
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">新規登録チェックツール</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">テスト用メールアドレス（空欄で自動生成）</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded"
                placeholder="test@example.com"
              />
            </div>

            <button
              onClick={checkRegistration}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600"
            >
              {loading ? 'チェック中...' : '新規登録をテスト'}
            </button>
          </div>
        </div>

        {/* 結果表示 */}
        {results && (
          <div className="space-y-6">
            {/* SignUp結果 */}
            <div className={`bg-gray-800 rounded-lg p-6 ${results.signUpResult?.success ? 'border-green-500' : 'border-red-500'} border`}>
              <h2 className="text-xl font-bold mb-4">1. SignUp API結果</h2>
              <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(results.signUpResult, null, 2)}
              </pre>
            </div>

            {/* Current User */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
              <h2 className="text-xl font-bold mb-4">2. 現在のユーザー状態</h2>
              <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(results.currentUser, null, 2)}
              </pre>
            </div>

            {/* Session */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
              <h2 className="text-xl font-bold mb-4">3. セッション状態</h2>
              <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(results.session, null, 2)}
              </pre>
            </div>

            {/* Admin Check */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
              <h2 className="text-xl font-bold mb-4">4. 管理者権限での確認</h2>
              <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(results.adminCheck, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* 説明 */}
        <div className="mt-8 bg-yellow-900/30 border border-yellow-600 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">⚠️ 重要な確認事項</h2>
          <ul className="space-y-2 text-yellow-300">
            <li>• Supabaseでメール確認が必須になっていると、確認前はログインできません</li>
            <li>• 登録直後はメール確認待ちの状態になることがあります</li>
            <li>• Auth管理画面に表示されるのは確認済みユーザーのみの場合があります</li>
            <li>• ユーザーが作成されてもセッションが開始されない場合があります</li>
          </ul>
        </div>
      </div>
    </div>
  )
}