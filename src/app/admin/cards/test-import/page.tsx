'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'

// Supabaseクライアントを直接作成（サービスロールキー使用）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default function TestImportPage() {
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<string>('')

  const testImport = async () => {
    setImporting(true)
    setResult('')

    try {
      // テストデータ
      const testCard = {
        card_name: 'テストカード',
        product_code: 'TEST-001',
        rarity: 'A',
        image_url: '/images/ngcard.jpg',
        market_price: 1000,
        description: 'インポートテスト用カード'
      }

      // 挿入を試みる
      const { data, error } = await supabaseAdmin
        .from('pokemon_cards')
        .insert([testCard])
        .select()

      if (error) {
        console.error('Import error:', error)
        setResult(`エラー: ${error.message}\n\n詳細: ${JSON.stringify(error, null, 2)}`)
        toast.error('インポート失敗')
      } else {
        // console.log('Import success:', data)
        setResult(`成功！\n\nインポートされたデータ: ${JSON.stringify(data, null, 2)}`)
        toast.success('インポート成功！')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setResult(`予期しないエラー: ${error}`)
    } finally {
      setImporting(false)
    }
  }

  const checkTableStructure = async () => {
    setImporting(true)
    setResult('')

    try {
      // テーブル情報を取得
      const { data, error } = await supabaseAdmin
        .from('pokemon_cards')
        .select('*')
        .limit(1)

      if (error) {
        setResult(`テーブル確認エラー: ${error.message}`)
      } else {
        setResult(`テーブル構造確認OK\n\nサンプルデータ: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`エラー: ${error}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">インポートテスト</h1>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">テスト機能</h5>
              
              <div className="d-grid gap-2">
                <button
                  onClick={checkTableStructure}
                  disabled={importing}
                  className="btn btn-info"
                >
                  テーブル構造を確認
                </button>
                
                <button
                  onClick={testImport}
                  disabled={importing}
                  className="btn btn-primary"
                >
                  テストカードをインポート
                </button>
              </div>
              
              {importing && (
                <div className="text-center mt-3">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">結果</h5>
              <pre className="bg-light p-3 rounded" style={{ maxHeight: '400px', overflow: 'auto' }}>
                {result || '結果がここに表示されます'}
              </pre>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <a href="/admin/cards" className="btn btn-secondary">戻る</a>
      </div>
    </div>
  )
}