'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function BasicTestPage() {
  const [result, setResult] = useState<string>('')

  const testConnection = () => {
    try {
      // 環境変数の確認
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!url || !key) {
        setResult('❌ 環境変数が設定されていません\n\n必要な環境変数:\n- NEXT_PUBLIC_SUPABASE_URL\n- NEXT_PUBLIC_SUPABASE_ANON_KEY')
        return
      }

      // Supabaseクライアントの作成を試みる
      const supabase = createBrowserClient(url, key)
      
      setResult(`✅ Supabase接続設定OK\n\nURL: ${url}\nKey: ${key.substring(0, 20)}...`)
      
      // 簡単な認証テスト
      supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
          setResult(prev => prev + `\n\n❌ セッション取得エラー: ${error.message}`)
        } else {
          setResult(prev => prev + `\n\n✅ セッション確認OK\nログイン状態: ${data.session ? 'ログイン中' : '未ログイン'}`)
        }
      })
    } catch (error: any) {
      setResult(`❌ エラーが発生しました: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">基本接続テスト</h1>
        
        <button
          onClick={testConnection}
          className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 mb-6"
        >
          接続テスト実行
        </button>

        {result && (
          <div className="bg-gray-800 rounded-lg p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm">{result}</pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-900/30 border border-yellow-600 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-2 text-yellow-400">エラーが出る場合</h2>
          <ol className="space-y-2 text-yellow-300 list-decimal list-inside text-sm">
            <li>ブラウザのコンソール（F12）でエラーメッセージを確認</li>
            <li>.env.localファイルが正しく設定されているか確認</li>
            <li>開発サーバーを再起動（Ctrl+C → npm run dev）</li>
          </ol>
        </div>
      </div>
    </div>
  )
}