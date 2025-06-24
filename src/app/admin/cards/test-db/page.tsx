'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// サービスロールキーで直接接続
const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

export default function TestDbPage() {
  const [result, setResult] = useState<string>('')
  const [testing, setTesting] = useState(false)

  const addResult = (message: string) => {
    setResult(prev => prev + '\n' + `${new Date().toLocaleTimeString()} - ${message}`)
  }

  const testConnection = async () => {
    setTesting(true)
    setResult('')
    
    try {
      addResult('=== データベース接続テスト開始 ===')
      
      // 1. 基本的な接続テスト
      addResult('1. 基本接続テスト中...')
      const { data: connectionTest, error: connectionError } = await supabaseAdmin
        .from('pokemon_cards')
        .select('count', { count: 'exact', head: true })
      
      if (connectionError) {
        addResult(`❌ 接続エラー: ${connectionError.message}`)
        addResult(`エラーコード: ${connectionError.code}`)
        addResult(`詳細: ${JSON.stringify(connectionError, null, 2)}`)
      } else {
        addResult(`✅ 接続成功 - 現在のレコード数: ${connectionTest?.length || 0}件`)
      }
      
      // 2. テーブル構造確認
      addResult('2. テーブル構造確認中...')
      const { data: structureData, error: structureError } = await supabaseAdmin
        .from('pokemon_cards')
        .select('*')
        .limit(1)
      
      if (structureError) {
        addResult(`❌ 構造確認エラー: ${structureError.message}`)
        if (structureError.code === '42P01') {
          addResult('💡 テーブルが存在しません。まずテーブルを作成する必要があります。')
        }
      } else {
        addResult(`✅ テーブル構造確認成功`)
        if (structureData && structureData.length > 0) {
          addResult(`サンプルレコード: ${JSON.stringify(structureData[0], null, 2)}`)
        }
      }
      
      // 3. 単一レコード挿入テスト
      addResult('3. 単一レコード挿入テスト中...')
      const testCard = {
        card_name: 'テストカード',
        product_code: 'TEST-' + Date.now(),
        rarity: 'C',
        image_url: '/images/ngcard.jpg',
        market_price: 100,
        description: 'テスト用カード'
      }
      
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('pokemon_cards')
        .insert(testCard)
        .select()
        .single()
      
      if (insertError) {
        addResult(`❌ 挿入エラー: ${insertError.message}`)
        addResult(`エラーコード: ${insertError.code}`)
        addResult(`詳細: ${JSON.stringify(insertError, null, 2)}`)
      } else {
        addResult(`✅ 挿入成功: ${JSON.stringify(insertData, null, 2)}`)
        
        // 挿入したテストデータを削除
        const { error: deleteError } = await supabaseAdmin
          .from('pokemon_cards')
          .delete()
          .eq('id', insertData.id)
        
        if (deleteError) {
          addResult(`⚠️ テストデータの削除に失敗: ${deleteError.message}`)
        } else {
          addResult(`✅ テストデータを削除しました`)
        }
      }
      
      addResult('=== テスト完了 ===')
      
    } catch (error) {
      addResult(`❌ 予期しないエラー: ${error}`)
      addResult(`エラー詳細: ${JSON.stringify(error, null, 2)}`)
    } finally {
      setTesting(false)
    }
  }

  const createTable = async () => {
    setTesting(true)
    try {
      addResult('テーブル作成中...')
      
      // まずテーブルが存在するかチェック
      const { error: checkError } = await supabaseAdmin
        .from('pokemon_cards')
        .select('count', { count: 'exact', head: true })
      
      if (checkError && checkError.code === '42P01') {
        addResult('テーブルが存在しないため、作成を試みます...')
        addResult('注意: Supabaseダッシュボードでの手動作成を推奨します')
      } else {
        addResult('テーブルは既に存在します')
      }
      
    } catch (error) {
      addResult(`エラー: ${error}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">🔍 データベース診断ツール</h2>
          
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">診断メニュー</h5>
              <div className="d-grid gap-2">
                <button
                  onClick={testConnection}
                  disabled={testing}
                  className="btn btn-primary"
                >
                  {testing ? '診断中...' : '🧪 完全診断を実行'}
                </button>
                
                <button
                  onClick={createTable}
                  disabled={testing}
                  className="btn btn-warning"
                >
                  {testing ? '確認中...' : '🔧 テーブル存在確認'}
                </button>
              </div>
            </div>
          </div>

          {/* 結果表示 */}
          {result && (
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">診断結果</h6>
              </div>
              <div className="card-body">
                <pre 
                  className="bg-dark text-light p-3 rounded font-monospace small" 
                  style={{ maxHeight: '500px', overflow: 'auto', whiteSpace: 'pre-wrap' }}
                >
                  {result}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-3">
            <Link href="/admin/cards" className="btn btn-secondary">
              ← カード管理に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}