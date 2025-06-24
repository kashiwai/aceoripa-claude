'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'react-hot-toast'

export default function UserCheckPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const checkUserStatus = async () => {
    setLoading(true)
    setResults(null)

    try {
      // 1. 登録を試みる（既に存在する場合はエラーになる）
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: 'testpassword123', // テスト用の仮パスワード
      })

      // 2. パスワードリセットを試みる（ユーザーが存在すれば成功する）
      const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      // 3. APIでユーザー存在確認
      const response = await fetch('/api/auth/check-user-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const apiResult = await response.json()

      setResults({
        email,
        signUpAttempt: {
          success: !signUpError,
          error: signUpError?.message,
          errorCode: signUpError?.code,
          data: signUpData
        },
        passwordResetAttempt: {
          success: !resetError,
          error: resetError?.message,
          data: resetData
        },
        apiCheck: apiResult,
        analysis: analyzeResults(signUpError, resetError, apiResult)
      })

    } catch (error: any) {
      console.error('Check error:', error)
      setResults({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const analyzeResults = (signUpError: any, resetError: any, apiResult: any) => {
    const analysis: any = {
      userExists: false,
      emailConfirmed: null,
      possibleIssues: []
    }

    // SignUpエラーから判断
    if (signUpError?.message?.includes('already registered')) {
      analysis.userExists = true
      analysis.possibleIssues.push('ユーザーは既に登録されています')
    }

    if (signUpError?.message?.includes('Email rate limit exceeded')) {
      analysis.possibleIssues.push('メール送信の制限に達しています（1時間に3通まで）')
    }

    // パスワードリセットが成功した場合、ユーザーは存在する
    if (!resetError) {
      analysis.userExists = true
      analysis.possibleIssues.push('パスワードリセットメールを送信しました')
    }

    // APIチェック結果
    if (apiResult.userFound) {
      analysis.userExists = true
      analysis.emailConfirmed = apiResult.emailConfirmed
      
      if (!apiResult.emailConfirmed) {
        analysis.possibleIssues.push('メールアドレスが未確認です')
      }
    }

    return analysis
  }

  const resetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) {
        toast.error('パスワードリセットエラー: ' + error.message)
      } else {
        toast.success('パスワードリセットメールを送信しました')
      }
    } catch (error: any) {
      toast.error('エラー: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">ユーザー状態確認ツール</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">確認したいメールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded"
                placeholder="user@example.com"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={checkUserStatus}
                disabled={loading || !email}
                className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600"
              >
                {loading ? '確認中...' : 'ユーザー状態を確認'}
              </button>
              
              <button
                onClick={resetPassword}
                disabled={!email}
                className="px-6 py-2 bg-orange-600 rounded hover:bg-orange-700 disabled:bg-gray-600"
              >
                パスワードリセット
              </button>
            </div>
          </div>
        </div>

        {/* 結果表示 */}
        {results && !results.error && (
          <div className="space-y-6">
            {/* 分析結果 */}
            <div className="bg-gray-800 rounded-lg p-6 border border-yellow-600">
              <h2 className="text-xl font-bold mb-4 text-yellow-400">📊 分析結果</h2>
              <div className="space-y-2">
                <p className="text-lg">
                  ユーザー存在: 
                  <span className={results.analysis.userExists ? 'text-green-400' : 'text-red-400'}>
                    {results.analysis.userExists ? ' ✅ 存在します' : ' ❌ 存在しません'}
                  </span>
                </p>
                
                {results.analysis.emailConfirmed !== null && (
                  <p>
                    メール確認: 
                    <span className={results.analysis.emailConfirmed ? 'text-green-400' : 'text-orange-400'}>
                      {results.analysis.emailConfirmed ? ' ✅ 確認済み' : ' ⚠️ 未確認'}
                    </span>
                  </p>
                )}
                
                {results.analysis.possibleIssues.length > 0 && (
                  <div className="mt-4">
                    <p className="font-bold mb-2">可能性のある問題:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {results.analysis.possibleIssues.map((issue: string, i: number) => (
                        <li key={i} className="text-yellow-300">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* 詳細結果 */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
              <h2 className="text-xl font-bold mb-4">🔍 詳細結果</h2>
              <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* 解決策 */}
        <div className="mt-8 bg-blue-900/30 border border-blue-600 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-400">💡 解決策</h2>
          <ul className="space-y-2 text-blue-300">
            <li>• ユーザーが既に存在する場合: パスワードリセットを実行</li>
            <li>• メール未確認の場合: Supabaseでメール確認を無効化</li>
            <li>• 新規登録の場合: 別のメールアドレスで試す</li>
            <li>• Google認証を使用する（メール確認不要）</li>
          </ul>
        </div>
      </div>
    </div>
  )
}