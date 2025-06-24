'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ForceLoginPage() {
  const [email, setEmail] = useState('ko.kashiwai@gmail.com')
  const router = useRouter()

  const forceLogin = async () => {
    // SQLを実行するためのAPI呼び出し
    try {
      const response = await fetch('/api/auth/force-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('メール確認状態を更新しました。ログインページから再度ログインしてください。')
        router.push('/auth/login')
      } else {
        alert('エラー: ' + data.error)
      }
    } catch (error) {
      alert('エラーが発生しました')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">メール確認を強制的に完了</h1>
        
        <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-6 mb-6">
          <p className="text-orange-400">
            ⚠️ 開発環境専用：本番環境では使用しないでください
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
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

            <button
              onClick={forceLogin}
              className="px-6 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              メール確認を強制的に完了
            </button>
          </div>
        </div>

        <div className="mt-8 bg-blue-900/30 border border-blue-600 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-400">推奨される解決方法</h2>
          <ol className="space-y-2 text-blue-300 list-decimal list-inside">
            <li>Supabaseダッシュボードでメール確認を無効化</li>
            <li>カスタムSMTPサーバーを設定（SendGrid等）</li>
            <li>開発環境ではGoogle認証を使用</li>
          </ol>
        </div>
      </div>
    </div>
  )
}