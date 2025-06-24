'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

// サービスロールキーで直接接続
const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

// サンプルカードデータ
const sampleCards = [
  { card_name: 'ピカチュウ', product_code: 'SAMPLE-001', rarity: 'SS', market_price: 50000, description: 'ポケモンカード - RankSS' },
  { card_name: 'リザードン', product_code: 'SAMPLE-002', rarity: 'S', market_price: 30000, description: 'ポケモンカード - RankS' },
  { card_name: 'フシギダネ', product_code: 'SAMPLE-003', rarity: 'A', market_price: 15000, description: 'ポケモンカード - RankA' },
  { card_name: 'ゼニガメ', product_code: 'SAMPLE-004', rarity: 'A', market_price: 12000, description: 'ポケモンカード - RankA' },
  { card_name: 'イーブイ', product_code: 'SAMPLE-005', rarity: 'B', market_price: 8000, description: 'ポケモンカード - RankB' },
  { card_name: 'コイキング', product_code: 'SAMPLE-006', rarity: 'B', market_price: 5000, description: 'ポケモンカード - RankB' },
  { card_name: 'ポッポ', product_code: 'SAMPLE-007', rarity: 'C', market_price: 3000, description: 'ポケモンカード - RankC' },
  { card_name: 'キャタピー', product_code: 'SAMPLE-008', rarity: 'C', market_price: 2000, description: 'ポケモンカード - RankC' },
  { card_name: 'ビードル', product_code: 'SAMPLE-009', rarity: 'C', market_price: 1500, description: 'ポケモンカード - RankC' },
  { card_name: 'ミュウ', product_code: 'SAMPLE-010', rarity: 'SS', market_price: 80000, description: 'ポケモンカード - RankSS' }
].map(card => ({
  ...card,
  image_url: '/images/ngcard.jpg'
}))

export default function SampleImportPage() {
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [log, setLog] = useState<string[]>([])
  const router = useRouter()

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
    console.log(message)
  }

  const clearSampleData = async () => {
    try {
      addLog('既存のサンプルデータをクリア中...')
      const { error } = await supabaseAdmin
        .from('pokemon_cards')
        .delete()
        .like('product_code', 'SAMPLE-%')
      
      if (error && error.code !== 'PGRST116') { // No rows found is OK
        addLog(`❌ クリアエラー: ${error.message}`)
      } else {
        addLog('✅ サンプルデータをクリアしました')
      }
    } catch (error) {
      addLog(`❌ クリア中にエラー: ${error}`)
    }
  }

  const importSampleCards = async () => {
    setImporting(true)
    setProgress(0)
    setLog([])
    
    try {
      addLog('サンプルカードインポートを開始します')
      
      // テーブルの存在確認
      addLog('テーブル構造を確認中...')
      const { data: tableCheck, error: checkError } = await supabaseAdmin
        .from('pokemon_cards')
        .select('count', { count: 'exact', head: true })
      
      if (checkError && checkError.code === '42P01') {
        addLog('❌ テーブルが存在しません。Supabaseダッシュボードで先にテーブルを作成してください。')
        toast.error('テーブルが存在しません')
        return
      }
      
      // 既存のサンプルデータをクリア
      await clearSampleData()
      setProgress(20)
      
      // サンプルカードを1件ずつインポート
      addLog(`${sampleCards.length}件のサンプルカードをインポート中...`)
      let imported = 0
      
      for (let i = 0; i < sampleCards.length; i++) {
        const card = sampleCards[i]
        
        const { data, error } = await supabaseAdmin
          .from('pokemon_cards')
          .insert(card)
          .select()
          .single()
        
        if (error) {
          addLog(`❌ ${card.card_name}: ${error.message}`)
        } else {
          imported++
          addLog(`✅ ${card.card_name} をインポートしました`)
        }
        
        setProgress(20 + (i + 1) / sampleCards.length * 70)
      }
      
      // 結果確認
      addLog('インポート結果を確認中...')
      const { data: countData, error: countError } = await supabaseAdmin
        .from('pokemon_cards')
        .select('rarity, product_code', { count: 'exact' })
        .like('product_code', 'SAMPLE-%')
      
      if (countError) {
        addLog(`❌ 確認エラー: ${countError.message}`)
      } else {
        const rarityCount = countData?.reduce((acc, card) => {
          acc[card.rarity] = (acc[card.rarity] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}
        
        addLog(`✅ インポート完了: ${imported}/${sampleCards.length}件`)
        addLog(`レアリティ別: ${Object.entries(rarityCount).map(([r, c]) => `${r}:${c}件`).join(', ')}`)
      }
      
      setProgress(100)
      
      if (imported > 0) {
        toast.success(`${imported}件のサンプルカードをインポートしました！`)
        setTimeout(() => {
          router.push('/admin/cards')
        }, 3000)
      } else {
        toast.error('インポートに失敗しました')
      }
      
    } catch (error) {
      addLog(`❌ エラー: ${error}`)
      toast.error('インポート中にエラーが発生しました')
    } finally {
      setImporting(false)
    }
  }

  const testConnection = async () => {
    try {
      addLog('データベース接続をテスト中...')
      const { data, error } = await supabaseAdmin
        .from('pokemon_cards')
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        addLog(`❌ 接続エラー: ${error.message}`)
        if (error.code === '42P01') {
          addLog('💡 解決方法: Supabaseダッシュボードで先にテーブルを作成してください')
        }
      } else {
        addLog('✅ データベース接続成功')
        addLog(`現在のレコード数: ${data || 0}件`)
      }
    } catch (error) {
      addLog(`❌ 接続テストエラー: ${error}`)
    }
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">
            🧪 サンプルカードインポート（10件）
          </h2>
          
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">テスト用サンプルデータ</h5>
              <p className="card-text">
                10件の確実に動作するサンプルカードをインポートします。<br/>
                このテストが成功すれば、同じ方法で231件の本データもインポートできます。
              </p>
              
              <div className="alert alert-info">
                <strong>含まれるカード:</strong><br/>
                SS: ピカチュウ、ミュウ (2件)<br/>
                S: リザードン (1件)<br/>
                A: フシギダネ、ゼニガメ (2件)<br/>
                B: イーブイ、コイキング (2件)<br/>
                C: ポッポ、キャタピー、ビードル (3件)
              </div>
              
              <div className="d-grid gap-2">
                <button
                  onClick={testConnection}
                  disabled={importing}
                  className="btn btn-info"
                >
                  📡 データベース接続テスト
                </button>
                
                <button
                  onClick={importSampleCards}
                  disabled={importing}
                  className="btn btn-success btn-lg"
                >
                  {importing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      インポート中... {Math.round(progress)}%
                    </>
                  ) : (
                    '🚀 サンプルカードをインポート'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* プログレスバー */}
          {importing && (
            <div className="card mb-4">
              <div className="card-body">
                <div className="progress" style={{ height: '25px' }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                  >
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ログ表示 */}
          {log.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">実行ログ</h6>
              </div>
              <div className="card-body">
                <div 
                  className="bg-dark text-light p-3 rounded font-monospace small" 
                  style={{ maxHeight: '400px', overflow: 'auto' }}
                >
                  {log.map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
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