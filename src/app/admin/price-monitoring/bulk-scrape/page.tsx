'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

interface BulkScrapeResult {
  cardId: string
  cardName: string
  totalPricesFound: number
  sourceResults: {
    [key: string]: {
      success: boolean
      priceCount: number
      error?: string
    }
  }
  averagePrice: number
  minPrice: number
  maxPrice: number
  processingTime: number
}

interface ScrapeSession {
  isRunning: boolean
  currentBatch: number
  totalCards: number
  processedCards: number
  totalPricesFound: number
  successfulCards: number
  startTime: Date | null
  estimatedTimeRemaining: number
}

const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

export default function BulkScrapePage() {
  const [session, setSession] = useState<ScrapeSession>({
    isRunning: false,
    currentBatch: 0,
    totalCards: 0,
    processedCards: 0,
    totalPricesFound: 0,
    successfulCards: 0,
    startTime: null,
    estimatedTimeRemaining: 0
  })
  
  const [batchSize, setBatchSize] = useState(10)
  const [results, setResults] = useState<BulkScrapeResult[]>([])
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    // 総カード数を取得
    const fetchTotalCards = async () => {
      try {
        const { count, error } = await supabaseAdmin
          .from('pokemon_cards')
          .select('*', { count: 'exact', head: true })
        
        if (error) throw error
        
        setSession(prev => ({ ...prev, totalCards: count || 0 }))
      } catch (error) {
        console.error('Error fetching total cards:', error)
      }
    }

    fetchTotalCards()
  }, [])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ja-JP')
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const startBulkScraping = async () => {
    setSession(prev => ({
      ...prev,
      isRunning: true,
      currentBatch: 1,
      processedCards: 0,
      totalPricesFound: 0,
      successfulCards: 0,
      startTime: new Date()
    }))
    setResults([])
    setLogs([])

    addLog(`一括スクレイピングを開始します（バッチサイズ: ${batchSize}）`)
    addLog(`対象カード数: ${session.totalCards}件`)

    let startAfter = 0
    let currentBatch = 1

    try {
      while (startAfter < session.totalCards) {
        addLog(`バッチ ${currentBatch} を処理中... (${startAfter + 1} - ${Math.min(startAfter + batchSize, session.totalCards)})`)

        const response = await fetch('/api/admin/price-monitoring/bulk-scrape-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            limit: batchSize, 
            startAfter: startAfter 
          })
        })

        if (!response.ok) {
          throw new Error(`バッチ ${currentBatch} でエラーが発生しました`)
        }

        const data = await response.json()
        
        // 結果を更新
        setResults(prev => [...prev, ...data.results])
        
        setSession(prev => {
          const newProcessedCards = prev.processedCards + data.processed
          const newTotalPricesFound = prev.totalPricesFound + data.totalPricesScraped
          const newSuccessfulCards = prev.successfulCards + data.successfulCards
          
          // 進行状況から残り時間を推定
          const elapsedTime = Date.now() - (prev.startTime?.getTime() || Date.now())
          const cardsPerMs = newProcessedCards / elapsedTime
          const remainingCards = prev.totalCards - newProcessedCards
          const estimatedTimeRemaining = Math.round(remainingCards / cardsPerMs)

          return {
            ...prev,
            currentBatch: currentBatch,
            processedCards: newProcessedCards,
            totalPricesFound: newTotalPricesFound,
            successfulCards: newSuccessfulCards,
            estimatedTimeRemaining: isFinite(estimatedTimeRemaining) ? estimatedTimeRemaining : 0
          }
        })

        addLog(`バッチ ${currentBatch} 完了: ${data.processed}件処理, ${data.totalPricesScraped}件の価格データ取得`)

        if (data.processed === 0) {
          addLog('すべてのカードの処理が完了しました')
          break
        }

        startAfter += batchSize
        currentBatch++

        // バッチ間で少し待機
        await new Promise(resolve => setTimeout(resolve, 3000))
      }

      toast.success('一括スクレイピングが完了しました！')
      addLog('一括スクレイピングが正常に完了しました')
      
    } catch (error) {
      console.error('Bulk scraping error:', error)
      toast.error('一括スクレイピングでエラーが発生しました')
      addLog(`エラー: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setSession(prev => ({ ...prev, isRunning: false }))
    }
  }

  const stopScraping = () => {
    setSession(prev => ({ ...prev, isRunning: false }))
    addLog('スクレイピングを停止しました')
    toast.info('スクレイピングを停止しました')
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}分${seconds}秒`
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'cardrush': return 'カードラッシュ'
      case 'pokecazilla': return 'ポケカジラ'
      case 'serra': return 'カードショップセラ'
      case 'pokeca_chart': return 'ポケカチャート'
      default: return source
    }
  }

  const progressPercentage = session.totalCards > 0 
    ? Math.round((session.processedCards / session.totalCards) * 100) 
    : 0

  return (
    <div>
      {/* ヘッダー */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">全カード一括価格取得</h1>
          <p className="text-muted">
            データベース内の全{session.totalCards.toLocaleString()}枚のカードから市場価格を一括取得します
          </p>
        </div>
        <Link href="/admin/price-monitoring" className="btn btn-secondary">
          価格監視に戻る
        </Link>
      </div>

      {/* 実行設定 */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h3 className="h5 mb-0">設定</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="batchSize" className="form-label">
                  バッチサイズ
                </label>
                <select
                  id="batchSize"
                  className="form-select"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  disabled={session.isRunning}
                >
                  <option value={5}>5件ずつ（安全）</option>
                  <option value={10}>10件ずつ（推奨）</option>
                  <option value={20}>20件ずつ（高速）</option>
                  <option value={50}>50件ずつ（最高速）</option>
                </select>
                <small className="form-text text-muted">
                  小さいほど安全ですが時間がかかります
                </small>
              </div>

              <button
                onClick={session.isRunning ? stopScraping : startBulkScraping}
                className={`btn w-100 ${session.isRunning ? 'btn-danger' : 'btn-primary'}`}
                disabled={session.totalCards === 0}
              >
                {session.isRunning ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    停止
                  </>
                ) : (
                  '一括スクレイピング開始'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 進行状況 */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3 className="h5 mb-0">進行状況</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>進行状況</span>
                  <span>{session.processedCards.toLocaleString()} / {session.totalCards.toLocaleString()} ({progressPercentage}%)</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="row">
                <div className="col-6">
                  <small className="text-muted">現在のバッチ</small>
                  <div className="fw-bold">{session.currentBatch}</div>
                </div>
                <div className="col-6">
                  <small className="text-muted">取得した価格データ</small>
                  <div className="fw-bold text-success">{session.totalPricesFound.toLocaleString()}件</div>
                </div>
                <div className="col-6">
                  <small className="text-muted">成功したカード</small>
                  <div className="fw-bold text-info">{session.successfulCards.toLocaleString()}件</div>
                </div>
                <div className="col-6">
                  <small className="text-muted">推定残り時間</small>
                  <div className="fw-bold">
                    {session.isRunning && session.estimatedTimeRemaining > 0 
                      ? formatTime(session.estimatedTimeRemaining)
                      : '-'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ログ */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="h5 mb-0">実行ログ</h3>
            </div>
            <div className="card-body">
              <div 
                className="bg-dark text-light p-3 rounded"
                style={{ height: '200px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.9rem' }}
              >
                {logs.length === 0 ? (
                  <div className="text-muted">ログはここに表示されます</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 結果サマリー */}
      {results.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="h5 mb-0">処理結果 ({results.length}件)</h3>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>カード名</th>
                        <th>価格データ数</th>
                        <th>平均価格</th>
                        <th>ソース成功率</th>
                        <th>処理時間</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.slice(-20).map((result, index) => {
                        const sources = Object.keys(result.sourceResults)
                        const successfulSources = sources.filter(s => result.sourceResults[s].success).length
                        
                        return (
                          <tr key={index}>
                            <td className="text-truncate" style={{ maxWidth: '200px' }}>
                              {result.cardName}
                            </td>
                            <td>
                              <span className={`badge ${result.totalPricesFound > 0 ? 'bg-success' : 'bg-secondary'}`}>
                                {result.totalPricesFound}
                              </span>
                            </td>
                            <td>
                              {result.averagePrice > 0 
                                ? `¥${result.averagePrice.toLocaleString()}`
                                : '-'
                              }
                            </td>
                            <td>
                              <small>
                                {successfulSources}/{sources.length}
                                {sources.map(source => (
                                  <span 
                                    key={source}
                                    className={`badge ms-1 ${result.sourceResults[source].success ? 'bg-success' : 'bg-danger'}`}
                                    title={getSourceLabel(source)}
                                  >
                                    {source.charAt(0).toUpperCase()}
                                  </span>
                                ))}
                              </small>
                            </td>
                            <td>
                              <small>{formatTime(result.processingTime)}</small>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {results.length > 20 && (
                    <small className="text-muted">最新20件を表示中</small>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 注意事項 */}
      <div className="alert alert-warning">
        <h6 className="alert-heading">⚠️ 重要な注意事項</h6>
        <ul className="mb-0">
          <li><strong>大量実行:</strong> 5,500枚のカードを処理するため、完了まで数時間かかる場合があります</li>
          <li><strong>サーバー負荷:</strong> 対象サイトに負荷をかけないよう適切な間隔を設けています</li>
          <li><strong>レート制限:</strong> サイトによっては一時的にブロックされる可能性があります</li>
          <li><strong>データ量:</strong> 大量の価格履歴データがデータベースに保存されます</li>
          <li><strong>継続実行:</strong> ブラウザを閉じるとスクレイピングが停止します</li>
        </ul>
      </div>
    </div>
  )
}