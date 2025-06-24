'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

// サービスロールキーで直接接続（RLSをバイパス）
const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default function DirectImportPage() {
  const [importing, setImporting] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const router = useRouter()

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  const importCards = async () => {
    setImporting(true)
    setLog([])
    addLog('インポート開始...')

    try {
      // まずテーブルの存在を確認
      addLog('テーブル構造を確認中...')
      const { error: checkError } = await supabaseAdmin
        .from('pokemon_cards')
        .select('count', { count: 'exact', head: true })

      if (checkError) {
        addLog(`エラー: ${checkError.message}`)
        
        // テーブルが存在しない場合は作成
        if (checkError.code === '42P01') {
          addLog('テーブルが存在しません。作成を試みます...')
          
          const { error: createError } = await supabaseAdmin.rpc('create_pokemon_cards_table', {
            sql: `
              CREATE TABLE IF NOT EXISTS pokemon_cards (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                card_name VARCHAR(255) NOT NULL,
                product_code VARCHAR(100) UNIQUE NOT NULL,
                rarity VARCHAR(10) NOT NULL,
                image_url TEXT DEFAULT '/images/ngcard.jpg',
                market_price INTEGER DEFAULT 0,
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
              );
              
              ALTER TABLE pokemon_cards DISABLE ROW LEVEL SECURITY;
            `
          })
          
          if (createError) {
            addLog(`テーブル作成エラー: ${createError.message}`)
            toast.error('テーブル作成に失敗しました')
            return
          }
        }
      }

      // 10件のテストデータをインポート
      addLog('テストデータを準備中...')
      const testCards = [
        { card_name: 'ナンジャモ SAR PSA10', product_code: 'A-O=N-000001', rarity: 'SS', market_price: 128000 },
        { card_name: 'ナンジャモSR PSA10', product_code: 'A-O=N-000002', rarity: 'A', market_price: 27800 },
        { card_name: 'サナ SR PSA10', product_code: 'A-O=N-000003', rarity: 'A', market_price: 24800 },
        { card_name: 'クララSR PSA10', product_code: 'A-O=N-000004', rarity: 'A', market_price: 32800 },
        { card_name: 'おじょうさまSR PSA10', product_code: 'A-O=N-000005', rarity: 'A', market_price: 24800 },
        { card_name: 'ルリナSR PSA10', product_code: 'A-O=N-000006', rarity: 'A', market_price: 13800 },
        { card_name: 'サイトウSR PSA10', product_code: 'A-O=N-000007', rarity: 'B', market_price: 9800 },
        { card_name: 'フウロSR PSA10', product_code: 'A-O=N-000008', rarity: 'B', market_price: 9800 },
        { card_name: 'ユウリSR PSA10', product_code: 'A-O=N-000009', rarity: 'A', market_price: 18500 },
        { card_name: 'ルチアSR PSA10', product_code: 'A-O=N-000010', rarity: 'A', market_price: 15800 }
      ].map(card => ({
        ...card,
        image_url: '/images/ngcard.jpg',
        description: `ポケモンカード - ${card.rarity}ランク`
      }))

      addLog(`${testCards.length}件のカードをインポート中...`)

      // 一件ずつインポート（エラーを詳細に確認するため）
      let successCount = 0
      let errorCount = 0

      for (const card of testCards) {
        const { data, error } = await supabaseAdmin
          .from('pokemon_cards')
          .upsert(card, { onConflict: 'product_code' })
          .select()
          .single()

        if (error) {
          errorCount++
          addLog(`❌ ${card.card_name}: ${error.message}`)
        } else {
          successCount++
          addLog(`✅ ${card.card_name} をインポートしました`)
        }
      }

      addLog(`完了: ${successCount}件成功, ${errorCount}件失敗`)

      if (successCount > 0) {
        toast.success(`${successCount}件のカードをインポートしました`)
        
        // 3秒後にリダイレクト
        setTimeout(() => {
          router.push('/admin/cards')
        }, 3000)
      } else {
        toast.error('インポートに失敗しました')
      }

    } catch (error) {
      addLog(`予期しないエラー: ${error}`)
      toast.error('エラーが発生しました')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">ダイレクトインポート</h2>
          
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">インポート実行</h5>
              <p className="card-text">
                10件のテストカードデータを直接インポートします。
              </p>
              
              <button
                onClick={importCards}
                disabled={importing}
                className="btn btn-primary btn-lg"
              >
                {importing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    処理中...
                  </>
                ) : (
                  'インポート開始'
                )}
              </button>
            </div>
          </div>

          {/* ログ表示 */}
          {log.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">実行ログ</h6>
              </div>
              <div className="card-body">
                <div className="bg-dark text-white p-3 rounded" style={{ maxHeight: '400px', overflow: 'auto' }}>
                  {log.map((line, index) => (
                    <div key={index} className="font-monospace small">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-3">
            <a href="/admin/cards" className="btn btn-secondary">
              ← カード管理に戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}