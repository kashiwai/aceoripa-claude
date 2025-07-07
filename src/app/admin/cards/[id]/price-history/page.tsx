'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

interface Card {
  id: string
  card_name: string
  product_code: string
  rarity: string
  image_url: string
  market_price: number
}

interface PriceHistory {
  id: string
  source: string
  price: number
  condition: string
  listing_url: string
  listed_at: string
  fetched_at: string
}

interface ChartData {
  date: string
  averagePrice: number
  minPrice: number
  maxPrice: number
  count: number
}

const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

export default function CardPriceHistoryPage() {
  const params = useParams()
  const cardId = params.id as string

  const [card, setCard] = useState<Card | null>(null)
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchCardData = async () => {
    try {
      // カード情報を取得
      const { data: cardData, error: cardError } = await supabaseAdmin
        .from('pokemon_cards')
        .select('*')
        .eq('id', cardId)
        .single()

      if (cardError) throw cardError
      setCard(cardData)

      // 価格履歴を取得
      const response = await fetch(`/api/admin/price-monitoring?cardId=${cardId}&limit=100`)
      if (!response.ok) throw new Error('Failed to fetch price history')

      const data = await response.json()
      setPriceHistory(data.data.priceHistory || [])
      setChartData(data.data.chartData || [])
    } catch (error) {
      console.error('Error fetching card data:', error)
      toast.error('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cardId) {
      fetchCardData()
    }
  }, [cardId])

  const handleUpdatePrice = async () => {
    if (!card) return

    setUpdating(true)
    try {
      const response = await fetch('/api/admin/price-monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card.id,
          cardName: card.card_name,
          productCode: card.product_code
        })
      })

      if (!response.ok) throw new Error('Failed to update price')

      const data = await response.json()
      
      toast.success(
        data.data.alertTriggered 
          ? '価格を更新しました。アラートが発生しました！'
          : '価格を更新しました'
      )
      
      // データを再取得
      fetchCardData()
    } catch (error) {
      console.error('Error updating price:', error)
      toast.error('価格更新に失敗しました')
    } finally {
      setUpdating(false)
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'mercari': return 'メルカリ'
      case 'yahoo_auction': return 'ヤフオク'
      case 'magi': return 'マギ'
      case 'pokemon_card_station': return 'ポケカステーション'
      default: return source
    }
  }

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'mint': return '美品'
      case 'near_mint': return 'ほぼ美品'
      case 'excellent': return '良好'
      case 'good': return '一般的'
      case 'poor': return '劣化'
      default: return condition
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SS': return 'bg-warning text-dark'
      case 'S': return 'bg-info text-white'
      case 'A': return 'bg-primary text-white'
      case 'B': return 'bg-success text-white'
      case 'C': return 'bg-secondary text-white'
      case 'D': return 'bg-dark text-white'
      default: return 'bg-light text-dark'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="text-center py-5">
        <h4>カードが見つかりません</h4>
        <Link href="/admin/cards" className="btn btn-primary">
          カード一覧に戻る
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">価格履歴 - {card.card_name}</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/admin/cards">カード管理</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/admin/price-monitoring">価格監視</Link>
              </li>
              <li className="breadcrumb-item active">{card.card_name}</li>
            </ol>
          </nav>
        </div>
        <button
          onClick={handleUpdatePrice}
          disabled={updating}
          className="btn btn-primary"
        >
          {updating ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              価格更新中...
            </>
          ) : (
            '価格を更新'
          )}
        </button>
      </div>

      {/* カード情報 */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <img
                  src={card.image_url || '/images/ngcard.jpg'}
                  alt={card.card_name}
                  className="rounded me-3"
                  style={{ width: '80px', height: '120px', objectFit: 'cover' }}
                />
                <div>
                  <h5 className="card-title">{card.card_name}</h5>
                  <p className="text-muted mb-1">{card.product_code}</p>
                  <span className={`badge ${getRarityColor(card.rarity)} me-2`}>
                    {card.rarity}賞
                  </span>
                  <div className="mt-2">
                    <strong className="text-success">
                      現在価格: ¥{card.market_price?.toLocaleString() || '0'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 価格統計 */}
        <div className="col-md-8">
          {chartData.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">価格推移（日別平均）</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>日付</th>
                        <th>平均価格</th>
                        <th>最低価格</th>
                        <th>最高価格</th>
                        <th>データ数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.slice(0, 10).map((data, index) => (
                        <tr key={index}>
                          <td>
                            {new Date(data.date).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="text-success fw-bold">
                            ¥{data.averagePrice.toLocaleString()}
                          </td>
                          <td>¥{data.minPrice.toLocaleString()}</td>
                          <td>¥{data.maxPrice.toLocaleString()}</td>
                          <td>{data.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 価格履歴詳細 */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                詳細価格履歴 ({priceHistory.length}件)
              </h5>
            </div>
            <div className="card-body">
              {priceHistory.length === 0 ? (
                <div className="text-center py-4">
                  <h5 className="text-muted">価格履歴がありません</h5>
                  <p className="text-muted">「価格を更新」ボタンで価格データを取得してください</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>取得日時</th>
                        <th>サイト</th>
                        <th>価格</th>
                        <th>状態</th>
                        <th>出品日</th>
                        <th>リンク</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceHistory.map((history) => (
                        <tr key={history.id}>
                          <td>
                            <small>
                              {new Date(history.fetched_at).toLocaleString('ja-JP')}
                            </small>
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {getSourceLabel(history.source)}
                            </span>
                          </td>
                          <td className="fw-bold text-success">
                            ¥{history.price.toLocaleString()}
                          </td>
                          <td>
                            {getConditionLabel(history.condition)}
                          </td>
                          <td>
                            <small>
                              {history.listed_at 
                                ? new Date(history.listed_at).toLocaleDateString('ja-JP')
                                : '-'
                              }
                            </small>
                          </td>
                          <td>
                            {history.listing_url && (
                              <a
                                href={history.listing_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                              >
                                開く
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}