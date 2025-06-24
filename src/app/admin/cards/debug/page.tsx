'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

// サービスロールキーで直接接続
const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

export default function DebugPage() {
  const [results, setResults] = useState<string[]>([])
  const [testing, setTesting] = useState(false)
  const supabaseClient = createClientComponentClient()

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
    console.log(message)
  }

  const runDiagnostics = async () => {
    setTesting(true)
    setResults([])

    try {
      addResult('=== 診断開始 ===')

      // 1. サービスクライアントでデータ取得
      addResult('1. サービスクライアントでデータ取得中...')
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('pokemon_cards')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (adminError) {
        addResult(`❌ サービスクライアントエラー: ${adminError.message}`)
      } else {
        addResult(`✅ サービスクライアント成功: ${adminData?.length || 0}件のデータ`)
        if (adminData && adminData.length > 0) {
          addResult(`サンプル: ${adminData[0].card_name} (${adminData[0].product_code})`)
        }
      }

      // 2. 通常クライアントでデータ取得
      addResult('2. 通常クライアントでデータ取得中...')
      const { data: clientData, error: clientError } = await supabaseClient
        .from('pokemon_cards')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (clientError) {
        addResult(`❌ 通常クライアントエラー: ${clientError.message}`)
        addResult(`エラーコード: ${clientError.code}`)
      } else {
        addResult(`✅ 通常クライアント成功: ${clientData?.length || 0}件のデータ`)
      }

      // 3. 認証状態確認
      addResult('3. 認証状態確認中...')
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
      
      if (authError) {
        addResult(`❌ 認証エラー: ${authError.message}`)
      } else if (user) {
        addResult(`✅ ログイン済み: ${user.email}`)
      } else {
        addResult('⚠️ 未ログイン状態')
      }

      // 4. APIルート確認
      addResult('4. APIルート確認中...')
      try {
        const response = await fetch('/api/admin/cards?limit=5')
        const result = await response.json()
        
        if (response.ok) {
          addResult(`✅ APIルート成功: ${result.cards?.length || 0}件のデータ`)
        } else {
          addResult(`❌ APIルートエラー: ${response.status} - ${result.error || 'Unknown error'}`)
        }
      } catch (error) {
        addResult(`❌ APIルート接続エラー: ${error}`)
      }

      // 5. RLS状態確認
      addResult('5. RLS（Row Level Security）状態確認...')
      const { data: rlsData, error: rlsError } = await supabaseAdmin
        .rpc('get_table_rls_status', { table_name: 'pokemon_cards' })
        .single()

      if (rlsError) {
        addResult(`⚠️ RLS状態確認不可: ${rlsError.message}`)
        addResult('RLSは無効化されている可能性があります（これは問題ありません）')
      } else {
        addResult(`RLS状態: ${rlsData?.rls_enabled ? '有効' : '無効'}`)
      }

      // 6. 全データカウント
      addResult('6. 全データカウント中...')
      const { count, error: countError } = await supabaseAdmin
        .from('pokemon_cards')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        addResult(`❌ カウントエラー: ${countError.message}`)
      } else {
        addResult(`✅ 総カード数: ${count}件`)
      }

      addResult('=== 診断完了 ===')

    } catch (error) {
      addResult(`❌ 予期しないエラー: ${error}`)
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    // ページロード時に自動実行
    runDiagnostics()
  }, [])

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">🔧 管理画面デバッグツール</h2>
          
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">診断ツール</h5>
              <p className="card-text">
                管理画面でカードが表示されない問題を診断します。
              </p>
              
              <button
                onClick={runDiagnostics}
                disabled={testing}
                className="btn btn-primary"
              >
                {testing ? '診断中...' : '🔍 再診断を実行'}
              </button>
            </div>
          </div>

          {/* 結果表示 */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">診断結果</h6>
            </div>
            <div className="card-body">
              <div 
                className="bg-dark text-light p-3 rounded font-monospace small" 
                style={{ maxHeight: '500px', overflow: 'auto' }}
              >
                {results.map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <Link href="/admin/cards" className="btn btn-secondary me-2">
              ← カード管理に戻る
            </Link>
            <Link href="/admin/cards/check-data" className="btn btn-info">
              データ確認ページ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}