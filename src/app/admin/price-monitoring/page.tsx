'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface PriceAlert {
  id: string
  alert_type: string
  threshold_percentage: number
  previous_avg_price: number
  current_avg_price: number
  price_change_percentage: number
  triggered_at: string
  is_resolved: boolean
  pokemon_cards: {
    card_name: string
    product_code: string
    image_url: string
    rarity: string
  }
}

interface BulkUpdateResult {
  cardId: string
  cardName: string
  previousPrice: number
  currentPrice: number
  priceChange: {
    changeAmount: number
    changePercentage: number
    changeType: string
  }
  alertTriggered: boolean
  error?: string
}

export default function PriceMonitoringPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [bulkUpdating, setBulkUpdating] = useState(false)
  const [updateResults, setUpdateResults] = useState<BulkUpdateResult[]>([])
  const [showResolvedAlerts, setShowResolvedAlerts] = useState(false)
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`/api/admin/price-alerts?resolved=${showResolvedAlerts}`)
      if (!response.ok) throw new Error('Failed to fetch alerts')
      
      const data = await response.json()
      setAlerts(data.data || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
      toast.error('アラートの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [showResolvedAlerts])

  const handleBulkPriceUpdate = async () => {
    setBulkUpdating(true)
    setUpdateResults([])
    
    try {
      const response = await fetch('/api/admin/price-monitoring/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 50 })
      })

      if (!response.ok) throw new Error('Failed to update prices')

      const data = await response.json()
      setUpdateResults(data.results || [])
      
      toast.success(`${data.processed}件のカードを更新しました。${data.alertsTriggered}件のアラートが発生しました。`)
      
      // アラート一覧を再取得
      fetchAlerts()
    } catch (error) {
      console.error('Error updating prices:', error)
      toast.error('価格更新に失敗しました')
    } finally {
      setBulkUpdating(false)
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/admin/price-alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      })

      if (!response.ok) throw new Error('Failed to resolve alert')

      toast.success('アラートを解決しました')
      fetchAlerts()
    } catch (error) {
      console.error('Error resolving alert:', error)
      toast.error('アラートの解決に失敗しました')
    }
  }

  const handleBulkResolveAlerts = async () => {
    if (selectedAlerts.length === 0) {
      toast.error('解決するアラートを選択してください')
      return
    }

    try {
      const response = await fetch('/api/admin/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertIds: selectedAlerts })
      })

      if (!response.ok) throw new Error('Failed to resolve alerts')

      toast.success(`${selectedAlerts.length}件のアラートを解決しました`)
      setSelectedAlerts([])
      fetchAlerts()
    } catch (error) {
      console.error('Error resolving alerts:', error)
      toast.error('アラートの一括解決に失敗しました')
    }
  }

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'increase': return '価格上昇'
      case 'decrease': return '価格下降'
      default: return '価格変動'
    }
  }

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'increase': return 'text-success'
      case 'decrease': return 'text-danger'
      default: return 'text-warning'
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

  return (
    <div>
      {/* ヘッダー */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">価格監視システム</h1>
          <p className="text-muted">
            カードの市場価格を監視し、5%以上の変動があったときにアラートを表示します
          </p>
        </div>
        <div>
          <button
            onClick={handleBulkPriceUpdate}
            disabled={bulkUpdating}
            className="btn btn-primary me-2"
          >
            {bulkUpdating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                価格更新中...
              </>
            ) : (
              '価格を一括更新'
            )}
          </button>
          <Link href="/admin/price-monitoring/cardrush-import" className="btn btn-success me-2">
            カードラッシュ価格取得
          </Link>
          <Link href="/admin/price-monitoring/schedule" className="btn btn-primary me-2">
            定期実行スケジュール
          </Link>
          <Link href="/admin/price-monitoring/bulk-scrape" className="btn btn-outline-warning me-2">
            全カード一括取得
          </Link>
          <Link href="/admin/price-monitoring/test-scraping" className="btn btn-outline-info me-2">
            テスト実行
          </Link>
          <Link href="/admin/price-monitoring/settings" className="btn btn-outline-secondary">
            監視設定
          </Link>
        </div>
      </div>

      {/* アラート管理 */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="h5 mb-0">価格変動アラート</h3>
              <div>
                <div className="form-check form-switch d-inline-block me-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={showResolvedAlerts}
                    onChange={(e) => setShowResolvedAlerts(e.target.checked)}
                  />
                  <label className="form-check-label">
                    解決済みを表示
                  </label>
                </div>
                {!showResolvedAlerts && selectedAlerts.length > 0 && (
                  <button
                    onClick={handleBulkResolveAlerts}
                    className="btn btn-sm btn-success"
                  >
                    選択した{selectedAlerts.length}件を解決
                  </button>
                )}
              </div>
            </div>
            <div className="card-body">
              {alerts.length === 0 ? (
                <div className="text-center py-4">
                  <h5 className="text-muted">
                    {showResolvedAlerts ? '解決済みのアラートはありません' : 'アクティブなアラートはありません'}
                  </h5>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        {!showResolvedAlerts && (
                          <th>
                            <input
                              type="checkbox"
                              checked={selectedAlerts.length === alerts.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAlerts(alerts.map(alert => alert.id))
                                } else {
                                  setSelectedAlerts([])
                                }
                              }}
                            />
                          </th>
                        )}
                        <th>カード</th>
                        <th>アラート種別</th>
                        <th>変動率</th>
                        <th>価格変動</th>
                        <th>発生日時</th>
                        <th>アクション</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((alert) => (
                        <tr key={alert.id}>
                          {!showResolvedAlerts && (
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedAlerts.includes(alert.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAlerts([...selectedAlerts, alert.id])
                                  } else {
                                    setSelectedAlerts(selectedAlerts.filter(id => id !== alert.id))
                                  }
                                }}
                              />
                            </td>
                          )}
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={alert.pokemon_cards.image_url || '/images/ngcard.jpg'}
                                alt={alert.pokemon_cards.card_name}
                                className="rounded me-2"
                                style={{ width: '40px', height: '60px', objectFit: 'cover' }}
                              />
                              <div>
                                <div className="fw-bold">{alert.pokemon_cards.card_name}</div>
                                <small className="text-muted">{alert.pokemon_cards.product_code}</small>
                                <br />
                                <span className={`badge ${getRarityColor(alert.pokemon_cards.rarity)}`}>
                                  {alert.pokemon_cards.rarity}賞
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getAlertTypeColor(alert.alert_type)}`}>
                              {getAlertTypeLabel(alert.alert_type)}
                            </span>
                          </td>
                          <td>
                            <span className={getAlertTypeColor(alert.alert_type)}>
                              {alert.price_change_percentage > 0 ? '+' : ''}
                              {alert.price_change_percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td>
                            <div>
                              <small className="text-muted">
                                ¥{alert.previous_avg_price.toLocaleString()} → 
                              </small>
                              <br />
                              <strong>¥{alert.current_avg_price.toLocaleString()}</strong>
                            </div>
                          </td>
                          <td>
                            <small>
                              {new Date(alert.triggered_at).toLocaleString('ja-JP')}
                            </small>
                          </td>
                          <td>
                            {!alert.is_resolved ? (
                              <button
                                onClick={() => handleResolveAlert(alert.id)}
                                className="btn btn-sm btn-outline-success"
                              >
                                解決
                              </button>
                            ) : (
                              <span className="badge bg-success">解決済み</span>
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

      {/* 一括更新結果 */}
      {updateResults.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="h5 mb-0">最新の価格更新結果</h3>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>カード名</th>
                        <th>前回価格</th>
                        <th>現在価格</th>
                        <th>変動率</th>
                        <th>アラート</th>
                      </tr>
                    </thead>
                    <tbody>
                      {updateResults.map((result, index) => (
                        <tr key={index}>
                          <td>
                            {result.error ? (
                              <span className="text-danger">
                                {result.cardId} - エラー: {result.error}
                              </span>
                            ) : (
                              result.cardName
                            )}
                          </td>
                          <td>¥{result.previousPrice?.toLocaleString() || '0'}</td>
                          <td>¥{result.currentPrice?.toLocaleString() || '0'}</td>
                          <td>
                            {result.priceChange && (
                              <span className={
                                result.priceChange.changeType === 'increase' ? 'text-success' :
                                result.priceChange.changeType === 'decrease' ? 'text-danger' : 'text-muted'
                              }>
                                {result.priceChange.changePercentage > 0 ? '+' : ''}
                                {result.priceChange.changePercentage.toFixed(1)}%
                              </span>
                            )}
                          </td>
                          <td>
                            {result.alertTriggered && (
                              <span className="badge bg-warning">アラート発生</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}