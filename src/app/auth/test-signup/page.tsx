'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function TestSignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setDebugInfo(null)

    try {
      const response = await fetch('/api/auth/signup-debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName })
      })

      const data = await response.json()
      setDebugInfo(data.debug)

      if (data.success) {
        toast.success('登録成功！')
      } else {
        toast.error(data.error || '登録に失敗しました')
      }
    } catch (error: any) {
      toast.error('ネットワークエラー')
      console.error('Signup error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">新規登録デバッグページ</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 登録フォーム */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">登録フォーム</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-700 rounded"
                  placeholder="test@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-700 rounded"
                  placeholder="6文字以上"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">表示名（オプション）</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 rounded"
                  placeholder="ユーザー名"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-2 px-4 rounded font-bold"
              >
                {loading ? '処理中...' : '登録テスト'}
              </button>
            </form>
          </div>
          
          {/* デバッグ情報 */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">デバッグ情報</h2>
            {debugInfo ? (
              <div className="space-y-4">
                {/* 処理ステップ */}
                <div>
                  <h3 className="font-bold text-green-400 mb-2">処理ステップ:</h3>
                  <ul className="list-disc list-inside text-sm">
                    {debugInfo.steps.map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
                
                {/* エラー情報 */}
                {debugInfo.errors.length > 0 && (
                  <div>
                    <h3 className="font-bold text-red-400 mb-2">エラー:</h3>
                    {debugInfo.errors.map((error: any, i: number) => (
                      <div key={i} className="bg-red-900/20 p-3 rounded mb-2">
                        <p className="font-bold">{error.step}</p>
                        <p className="text-red-400">{error.error}</p>
                        {error.code && <p className="text-xs">Code: {error.code}</p>}
                        {error.details && (
                          <pre className="text-xs mt-2 overflow-auto">
                            {JSON.stringify(error.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* データ */}
                <div>
                  <h3 className="font-bold text-blue-400 mb-2">データ:</h3>
                  <pre className="bg-gray-900 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">登録を実行するとデバッグ情報が表示されます</p>
            )}
          </div>
        </div>
        
        {/* 環境情報 */}
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">環境情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-bold">Supabase URL:</p>
              <p className="text-gray-400 break-all">{process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            </div>
            <div>
              <p className="font-bold">認証タイプ:</p>
              <p className="text-gray-400">Supabase Auth (Email/Password)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}