'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

interface BatchRun {
  id: string
  batch_name: string
  status: string
  total_cards: number
  processed_cards: number
  successful_cards: number
  failed_cards: number
  total_prices_found: number
  started_at: string
  completed_at: string | null
  error_message: string | null
  metadata: any
}

interface LogEntry {
  timestamp: string
  message: string
  level: 'info' | 'success' | 'warning' | 'error'
}

const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

export default function BatchRunnerPage() {
  const params = useParams()
  const batchRunId = params.id as string
  
  const [batchRun, setBatchRun] = useState<BatchRun | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const addLog = (message: string, level: LogEntry['level'] = 'info') => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString('ja-JP'),
      message,
      level
    }
    setLogs(prev => [...prev, entry])
  }

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [logs])

  const fetchBatchRun = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('price_batch_runs')
        .select('*')
        .eq('id', batchRunId)
        .single()

      if (error) throw error
      setBatchRun(data)
      
      if (data.status === 'running') {
        setIsRunning(true)
      }
    } catch (error) {
      console.error('Error fetching batch run:', error)
      toast.error('バッチ情報の取得に失敗しました')
    }
  }

  useEffect(() => {
    fetchBatchRun()
    
    // 実行中は定期的に状態を更新
    const interval = setInterval(() => {
      if (isRunning) {
        fetchBatchRun()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [batchRunId, isRunning])

  const startBatchExecution = async () => {
    setIsRunning(true)
    addLog('バッチ処理を開始します...', 'info')
    
    try {
      addLog('全サイトからの価格データ取得を開始します', 'info')
      addLog('これには2-3時間かかる可能性があります', 'warning')
      
      const response = await fetch('/api/admin/price-monitoring/run-scheduled-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchRunId })
      })

      if (!response.ok) {
        throw new Error('バッチ実行に失敗しました')
      }

      const data = await response.json()
      
      addLog(`処理完了！`, 'success')
      addLog(`総価格データ数: ${data.result.totalPrices.toLocaleString()}件`, 'success')
      addLog(`- カードラッシュ: ${data.result.cardRushPrices.toLocaleString()}件`, 'info')
      addLog(`- ポケカジラ: ${data.result.pokecazillaPrices.toLocaleString()}件`, 'info')
      addLog(`- カードショップセラ: ${data.result.serraPrices.toLocaleString()}件`, 'info')
      
      if (data.result.errors && data.result.errors.length > 0) {
        data.result.errors.forEach((error: string) => {
          addLog(error, 'error')
        })
      }
      
      toast.success('バッチ処理が完了しました！')
      setIsRunning(false)
      fetchBatchRun()
      
    } catch (error) {
      console.error('Batch execution error:', error)
      addLog(`エラー: ${error instanceof Error ? error.message : '不明なエラー'}`, 'error')
      toast.error('バッチ実行中にエラーが発生しました')
      setIsRunning(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'badge bg-secondary'
      case 'running': return 'badge bg-primary'
      case 'completed': return 'badge bg-success'
      case 'failed': return 'badge bg-danger'
      default: return 'badge bg-secondary'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待機中'
      case 'running': return '実行中'
      case 'completed': return '完了'
      case 'failed': return '失敗'
      default: return status
    }
  }

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'text-success'
      case 'warning': return 'text-warning'
      case 'error': return 'text-danger'
      default: return 'text-light'
    }
  }

  if (!batchRun) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const duration = batchRun.completed_at && batchRun.started_at
    ? new Date(batchRun.completed_at).getTime() - new Date(batchRun.started_at).getTime()
    : null

  return (
    <div>
      {/* ヘッダー */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">バッチ実行: {batchRun.batch_name}</h1>
          <p className="text-muted">
            ID: {batchRunId}
          </p>
        </div>
        <Link href="/admin/price-monitoring/schedule" className="btn btn-secondary">
          スケジュール管理に戻る
        </Link>
      </div>

      {/* ステータス情報 */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="h5 mb-0">実行状態</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="text-muted">ステータス</label>
                <div>
                  <span className={`${getStatusBadge(batchRun.status)} fs-5`}>
                    {getStatusLabel(batchRun.status)}
                  </span>
                </div>
              </div>

              <div className="row">
                <div className="col-6">
                  <label className="text-muted">開始時刻</label>
                  <div>{batchRun.started_at ? new Date(batchRun.started_at).toLocaleString('ja-JP') : '-'}</div>
                </div>
                <div className="col-6">
                  <label className="text-muted">完了時刻</label>
                  <div>{batchRun.completed_at ? new Date(batchRun.completed_at).toLocaleString('ja-JP') : '-'}</div>
                </div>
              </div>

              {duration && (
                <div className="mt-3">
                  <label className="text-muted">所要時間</label>
                  <div>{Math.floor(duration / 1000 / 60)}分</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="h5 mb-0">処理統計</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-6">
                  <label className="text-muted">総カード数</label>
                  <div className="h4">{batchRun.total_cards.toLocaleString()}</div>
                </div>
                <div className="col-6">
                  <label className="text-muted">処理済み</label>
                  <div className="h4">{batchRun.processed_cards.toLocaleString()}</div>
                </div>
                <div className="col-6">
                  <label className="text-muted">成功</label>
                  <div className="h4 text-success">{batchRun.successful_cards.toLocaleString()}</div>
                </div>
                <div className="col-6">
                  <label className="text-muted">取得価格数</label>
                  <div className="h4 text-primary">{batchRun.total_prices_found.toLocaleString()}</div>
                </div>
              </div>

              {batchRun.metadata && (
                <div className="mt-3">
                  <label className="text-muted">詳細情報</label>
                  <div className="small">
                    {batchRun.metadata.cardRushPrices && (
                      <div>カードラッシュ: {batchRun.metadata.cardRushPrices.toLocaleString()}件</div>
                    )}
                    {batchRun.metadata.pokecazillaPrices && (
                      <div>ポケカジラ: {batchRun.metadata.pokecazillaPrices.toLocaleString()}件</div>
                    )}
                    {batchRun.metadata.serraPrices && (
                      <div>カードショップセラ: {batchRun.metadata.serraPrices.toLocaleString()}件</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 実行コントロール */}
      {batchRun.status === 'pending' && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-primary">
              <div className="card-body text-center">
                <h5>バッチ処理を開始する準備ができました</h5>
                <p className="text-muted">
                  3つのサイトから全カードの価格データを取得します。<br />
                  処理には2-3時間かかる可能性があります。
                </p>
                <button
                  onClick={startBatchExecution}
                  disabled={isRunning}
                  className="btn btn-primary btn-lg"
                >
                  {isRunning ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      実行中...
                    </>
                  ) : (
                    '価格データ取得を開始'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 実行ログ */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="h5 mb-0">実行ログ</h3>
            </div>
            <div className="card-body">
              <div 
                className="bg-dark text-light p-3 rounded"
                style={{ height: '400px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.9rem' }}
              >
                {logs.length === 0 ? (
                  <div className="text-muted">実行ログがここに表示されます</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className={getLogColor(log.level)}>
                      [{log.timestamp}] {log.message}
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* エラーメッセージ */}
      {batchRun.error_message && (
        <div className="alert alert-danger mt-4">
          <h6 className="alert-heading">エラー情報</h6>
          <p className="mb-0">{batchRun.error_message}</p>
        </div>
      )}
    </div>
  )
}