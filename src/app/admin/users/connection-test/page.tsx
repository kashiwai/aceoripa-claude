'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ConnectionTestPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    const testResults: any = {}
    
    try {
      // 1. Supabase接続確認
      const supabase = createClientComponentClient()
      testResults.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'
      testResults.hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      // 2. 最もシンプルなクエリ
      try {
        const { data, error } = await supabase
          .from('user_points')
          .select('count')
          .single()
        
        testResults.countQuery = { data, error }
      } catch (e: any) {
        testResults.countQuery = { error: e.message }
      }
      
      // 3. 1件だけ取得
      try {
        const { data, error } = await supabase
          .from('user_points')
          .select('user_id')
          .limit(1)
          .single()
        
        testResults.singleQuery = { data, error }
      } catch (e: any) {
        testResults.singleQuery = { error: e.message }
      }
      
      // 4. RLSポリシーを無視してみる（publicスキーマの確認）
      try {
        const { data, error } = await supabase
          .rpc('get_user_points_count')
        
        testResults.rpcQuery = { data, error }
      } catch (e: any) {
        testResults.rpcQuery = { note: 'RPC function not available' }
      }
      
      // 5. 現在のユーザー確認
      const { data: { user } } = await supabase.auth.getUser()
      testResults.currentUser = user ? { id: user.id, email: user.email } : null
      
    } catch (err: any) {
      testResults.generalError = err.message
    }
    
    setResults(testResults)
    setLoading(false)
  }

  if (loading) {
    return <div className="container py-4 text-center">接続テスト中...</div>
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">Supabase接続テスト</h1>
      
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">環境変数</h3>
        </div>
        <div className="card-body">
          <p>Supabase URL: <code>{results.supabaseUrl}</code></p>
          <p>Anon Key設定: {results.hasAnonKey ? '✅ 設定済み' : '❌ 未設定'}</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">テスト結果</h3>
        </div>
        <div className="card-body">
          <pre className="bg-light p-3 rounded">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">考えられる原因</h3>
        </div>
        <div className="card-body">
          <ol>
            <li><strong>RLS（Row Level Security）が有効</strong>
              <p>user_pointsテーブルにRLSポリシーが設定されている可能性があります。</p>
              <pre className="bg-light p-3 rounded">
{`-- RLSを一時的に無効化（Supabaseダッシュボードで実行）
ALTER TABLE user_points DISABLE ROW LEVEL SECURITY;`}
              </pre>
            </li>
            
            <li><strong>権限の問題</strong>
              <p>anonキーに読み取り権限がない可能性があります。</p>
              <pre className="bg-light p-3 rounded">
{`-- 読み取り権限を付与（Supabaseダッシュボードで実行）
GRANT SELECT ON user_points TO anon;
GRANT SELECT ON user_points TO authenticated;`}
              </pre>
            </li>
            
            <li><strong>スキーマの問題</strong>
              <p>user_pointsテーブルがpublicスキーマにない可能性があります。</p>
              <pre className="bg-light p-3 rounded">
{`-- テーブルの存在確認（Supabaseダッシュボードで実行）
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'user_points';`}
              </pre>
            </li>
          </ol>
        </div>
      </div>

      <div className="mt-4">
        <button onClick={runTests} className="btn btn-primary me-2">
          再テスト
        </button>
        <a href="/admin/users" className="btn btn-secondary">
          ユーザー管理に戻る
        </a>
      </div>
    </div>
  )
}