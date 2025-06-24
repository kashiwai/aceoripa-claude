'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function QuickImportPage() {
  const [importing, setImporting] = useState(false)
  const router = useRouter()

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

  const importFromCSV = async () => {
    setImporting(true)

    try {
      // CSVファイルの内容を直接読み込む
      // publicフォルダに配置されたCSVファイルを読み込む
      const csvText = `カテゴリー名,新コード,商品名,ランク,交換ポイント
ポケモン,A-O=N-000001,ナンジャモ SAR PSA10,RankSS,128000
ポケモン,A-O=N-000002,ナンジャモSR PSA10,RankA,27800
ポケモン,A-O=N-000003,サナ　SR PSA10,RankA,24800
ポケモン,A-O=N-000004,クララSR PSA10,RankA,32800
ポケモン,A-O=N-000005,おじょうさまSR PSA10,RankA,24800
ポケモン,A-O=N-000006,ルリナSR PSA10,RankA,13800
ポケモン,A-O=N-000007,サイトウSR PSA10,RankB,9800
ポケモン,A-O=N-000008,フウロSR PSA10,RankB,9800
ポケモン,A-O=N-000009,ユウリSR PSA10,RankA,18500
ポケモン,A-O=N-000010,ルチアSR PSA10,RankA,15800`
      
      const lines = csvText.split('\n')
      const cards = []

      // ヘッダー行をスキップして、データ行を処理
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const [category, productCode, cardName, rank, price] = line.split(',')
        
        if (productCode && cardName) {
          // ランクをレアリティにマッピング
          let rarity = 'C'
          const rankLower = rank?.toLowerCase().replace('rank', '')
          switch (rankLower) {
            case 'ss': rarity = 'SS'; break
            case 's': rarity = 'S'; break
            case 'a': rarity = 'A'; break
            case 'b': rarity = 'B'; break
            case 'c': rarity = 'C'; break
          }

          cards.push({
            card_name: cardName.trim(),
            product_code: productCode.trim(),
            rarity,
            image_url: '/images/ngcard.jpg',
            market_price: parseInt(price?.trim() || '0'),
            description: `${category}カード - ${rank}`
          })
        }
      }

      console.log(`Importing ${cards.length} cards...`)

      // バッチサイズを50に設定して順次インポート
      const batchSize = 50
      let imported = 0
      let failed = 0

      for (let i = 0; i < cards.length; i += batchSize) {
        const batch = cards.slice(i, i + batchSize)
        
        const { data, error } = await supabaseAdmin
          .from('pokemon_cards')
          .upsert(batch, { 
            onConflict: 'product_code',
            ignoreDuplicates: false 
          })
          .select()

        if (error) {
          console.error(`Batch ${i/batchSize + 1} error:`, error)
          failed += batch.length
        } else {
          imported += data?.length || 0
          // console.log(`Batch ${i/batchSize + 1} imported: ${data?.length} cards`)
        }
      }

      toast.success(`インポート完了: ${imported}件成功, ${failed}件失敗`)
      
      // 3秒後にカード管理画面へリダイレクト
      setTimeout(() => {
        router.push('/admin/cards')
      }, 3000)

    } catch (error) {
      console.error('Import error:', error)
      toast.error('インポートエラーが発生しました')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="card-title mb-4">クイックインポート</h3>
              
              <p className="text-muted mb-4">
                carddata_images_no.csvから<br/>
                231件のカードデータを一括インポートします
              </p>

              <button
                onClick={importFromCSV}
                disabled={importing}
                className="btn btn-primary btn-lg w-100"
              >
                {importing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    インポート中...
                  </>
                ) : (
                  '今すぐインポート'
                )}
              </button>

              {importing && (
                <div className="alert alert-info mt-3">
                  <small>処理中です。しばらくお待ちください...</small>
                </div>
              )}
            </div>
          </div>
          
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