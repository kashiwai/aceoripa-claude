'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// サービスロールキーで直接接続
const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

interface Card {
  id: string
  card_name: string
  product_code: string
  rarity: string
  market_price: number
  created_at: string
}

export default function CheckDataPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // console.log('データ確認開始...')
      
      // 全データを取得
      const { data, error: fetchError } = await supabaseAdmin
        .from('pokemon_cards')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) {
        console.error('取得エラー:', fetchError)
        setError(`データ取得エラー: ${fetchError.message}`)
        return
      }
      
      // console.log('取得データ:', data)
      setCards(data || [])
      
    } catch (error) {
      console.error('予期しないエラー:', error)
      setError(`予期しないエラー: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const getRarityBadgeClass = (rarity: string) => {
    switch (rarity) {
      case 'SS': return 'bg-warning text-dark'
      case 'S': return 'bg-info text-white'
      case 'A': return 'bg-primary text-white'
      case 'B': return 'bg-success text-white'
      case 'C': return 'bg-secondary text-white'
      default: return 'bg-light text-dark'
    }
  }

  const rarityStats = cards.reduce((acc, card) => {
    acc[card.rarity] = (acc[card.rarity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">🔍 データベース内容確認</h2>
          
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">データ確認</h5>
              <p className="card-text">
                Supabaseデータベースに実際に保存されているカードデータを直接確認します。
              </p>
              
              <button
                onClick={checkData}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? '確認中...' : '📊 データベース内容を確認'}
              </button>
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {/* 統計情報 */}
          {cards.length > 0 && (
            <div className="row mb-4">
              <div className="col-md-2">
                <div className="card text-center">
                  <div className="card-body">
                    <h4 className="text-primary">{cards.length}</h4>
                    <small className="text-muted">総カード数</small>
                  </div>
                </div>
              </div>
              {Object.entries(rarityStats).map(([rarity, count]) => (
                <div key={rarity} className="col-md-2">
                  <div className="card text-center">
                    <div className="card-body">
                      <h4 className="text-success">{count}</h4>
                      <small className="text-muted">{rarity}賞</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* カード一覧 */}
          {cards.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">データベース内のカード一覧 ({cards.length}件)</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>商品コード</th>
                        <th>カード名</th>
                        <th>レアリティ</th>
                        <th>価格</th>
                        <th>作成日時</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cards.map((card) => (
                        <tr key={card.id}>
                          <td>
                            <code className="text-muted">{card.product_code}</code>
                          </td>
                          <td>
                            <strong>{card.card_name}</strong>
                          </td>
                          <td>
                            <span className={`badge ${getRarityBadgeClass(card.rarity)}`}>
                              {card.rarity}賞
                            </span>
                          </td>
                          <td>
                            <span className="text-success fw-bold">
                              ¥{card.market_price?.toLocaleString() || '0'}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(card.created_at).toLocaleString('ja-JP')}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {cards.length === 0 && !loading && !error && (
            <div className="alert alert-warning">
              データベースにカードが登録されていません。
            </div>
          )}

          <div className="mt-3">
            <Link href="/admin/cards" className="btn btn-secondary me-2">
              ← カード管理に戻る
            </Link>
            <Link href="/admin/cards/sample-import" className="btn btn-success">
              サンプルインポートページ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}