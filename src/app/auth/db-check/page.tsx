'use client'

import { useState, useEffect } from 'react'

export default function DBCheckPage() {
  const [checking, setChecking] = useState(true)
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    try {
      const response = await fetch('/api/auth/check-db')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('DB check error:', error)
      setResults({ success: false, error: 'データベース確認エラー' })
    } finally {
      setChecking(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>データベースを確認中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase データベース診断</h1>
        
        {results && (
          <div className="space-y-6">
            {/* テーブル状態 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">📊</span>
                テーブル状態
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(results.results?.tables || {}).map(([table, status]) => (
                  <div key={table} className="bg-gray-700 rounded p-3">
                    <p className="font-bold">{table}</p>
                    <p className={status === 'OK' ? 'text-green-400' : 'text-red-400'}>
                      {status === 'OK' ? '✅ 正常' : '❌ エラー'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* エラー情報 */}
            {results.results?.errors && results.results.errors.length > 0 && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-red-400">
                  ⚠️ エラー検出
                </h2>
                {results.results.errors.map((error: any, i: number) => (
                  <div key={i} className="mb-4 p-4 bg-red-900/30 rounded">
                    <p className="font-bold">{error.table}テーブル</p>
                    <p className="text-red-400">{error.error}</p>
                    <p className="text-sm text-gray-400">コード: {error.code}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 推奨事項 */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-blue-400">
                  💡 推奨アクション
                </h2>
                {results.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="mb-4">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold mr-2 ${
                        rec.priority === 'high' ? 'bg-red-600' :
                        rec.priority === 'medium' ? 'bg-yellow-600' :
                        'bg-gray-600'
                      }`}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <p className="font-bold">{rec.action}</p>
                    </div>
                    <p className="text-gray-400 text-sm">{rec.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* SQL作成スクリプト */}
            {results.results?.createTableSQL && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">
                  🛠️ テーブル作成SQL
                </h2>
                <p className="text-gray-400 mb-4">
                  以下のSQLをSupabaseのSQL Editorで実行してください：
                </p>
                {Object.entries(results.results.createTableSQL).map(([table, sql]) => (
                  <div key={table} className="mb-6">
                    <h3 className="font-bold mb-2 text-green-400">{table}テーブル:</h3>
                    <div className="bg-gray-900 rounded p-4 overflow-x-auto">
                      <pre className="text-sm font-mono whitespace-pre-wrap">{sql}</pre>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(sql as string)}
                      className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm"
                    >
                      📋 コピー
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 接続情報 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🔌 接続情報</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-bold">Supabase URL:</span>{' '}
                  <span className="text-gray-400">{process.env.NEXT_PUBLIC_SUPABASE_URL}</span>
                </p>
                <p>
                  <span className="font-bold">プロジェクトID:</span>{' '}
                  <span className="text-gray-400">
                    {process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].replace('https://', '')}
                  </span>
                </p>
              </div>
              <div className="mt-4">
                <a
                  href={`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '')}.supabase.com/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].replace('https://', '')}/editor`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                >
                  🚀 Supabase SQL Editorを開く
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}