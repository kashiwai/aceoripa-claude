'use client'

import { useState, useEffect } from 'react'
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
  created_at: string
}

interface BatchSchedule {
  id: string
  schedule_name: string
  frequency: string
  day_of_month: number[]
  is_active: boolean
  last_run_id: string | null
  next_run_date: string
}

const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

export default function PriceSchedulePage() {
  const [schedules, setSchedules] = useState<BatchSchedule[]>([])
  const [batchRuns, setBatchRuns] = useState<BatchRun[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFrequency, setSelectedFrequency] = useState('monthly_3times')
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 10, 20])

  const fetchData = async () => {
    try {
      // スケジュール設定を取得
      const { data: scheduleData, error: scheduleError } = await supabaseAdmin
        .from('price_batch_schedule')
        .select('*')
        .order('created_at', { ascending: false })

      if (scheduleError) throw scheduleError
      setSchedules(scheduleData || [])

      // バッチ実行履歴を取得
      const { data: runData, error: runError } = await supabaseAdmin
        .from('price_batch_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (runError) throw runError
      setBatchRuns(runData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const updateSchedule = async () => {
    try {
      const activeSchedule = schedules.find(s => s.is_active)
      if (!activeSchedule) return

      // 次回実行日を計算
      const today = new Date()
      const currentDay = today.getDate()
      let nextDay = selectedDays.find(d => d > currentDay) || selectedDays[0]
      let nextDate = new Date(today)
      
      if (nextDay <= currentDay) {
        // 来月の実行日
        nextDate.setMonth(nextDate.getMonth() + 1)
      }
      nextDate.setDate(nextDay)

      const { error } = await supabaseAdmin
        .from('price_batch_schedule')
        .update({
          frequency: selectedFrequency,
          day_of_month: selectedDays,
          next_run_date: nextDate.toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', activeSchedule.id)

      if (error) throw error

      toast.success('スケジュールを更新しました')
      fetchData()
    } catch (error) {
      console.error('Error updating schedule:', error)
      toast.error('スケジュールの更新に失敗しました')
    }
  }

  const startManualBatch = async () => {
    if (!confirm('手動でバッチ処理を開始しますか？これには数時間かかる可能性があります。')) {
      return
    }

    try {
      // バッチ実行レコードを作成
      const { data: batchRun, error: createError } = await supabaseAdmin
        .from('price_batch_runs')
        .insert({
          batch_name: `手動実行 - ${new Date().toLocaleString('ja-JP')}`,
          status: 'pending',
          total_cards: 0,
          processed_cards: 0,
          successful_cards: 0,
          failed_cards: 0,
          total_prices_found: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) throw createError

      toast.success('バッチ処理を開始しました。進行状況は別画面で確認してください。')
      
      // バッチ実行画面へ遷移
      window.location.href = `/admin/price-monitoring/batch-runner/${batchRun.id}`
      
    } catch (error) {
      console.error('Error starting batch:', error)
      toast.error('バッチ処理の開始に失敗しました')
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

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'monthly_3times': return '月3回'
      case 'monthly_4times': return '月4回'
      case 'weekly': return '週1回'
      case 'custom': return 'カスタム'
      default: return frequency
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const activeSchedule = schedules.find(s => s.is_active)

  return (
    <div>
      {/* ヘッダー */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">定期価格取得スケジュール</h1>
          <p className="text-muted">
            全カードの価格を定期的に自動取得するスケジュールを管理します
          </p>
        </div>
        <Link href="/admin/price-monitoring" className="btn btn-secondary">
          価格監視に戻る
        </Link>
      </div>

      {/* 現在のスケジュール設定 */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="h5 mb-0">スケジュール設定</h3>
            </div>
            <div className="card-body">
              {activeSchedule && (
                <>
                  <div className="mb-3">
                    <label className="form-label">現在の設定</label>
                    <div className="alert alert-info">
                      <strong>{activeSchedule.schedule_name}</strong><br />
                      頻度: {getFrequencyLabel(activeSchedule.frequency)}<br />
                      実行日: 毎月 {activeSchedule.day_of_month.join(', ')}日<br />
                      次回実行予定: {new Date(activeSchedule.next_run_date).toLocaleDateString('ja-JP')}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="frequency" className="form-label">頻度</label>
                    <select
                      id="frequency"
                      className="form-select"
                      value={selectedFrequency}
                      onChange={(e) => setSelectedFrequency(e.target.value)}
                    >
                      <option value="monthly_3times">月3回（推奨）</option>
                      <option value="monthly_4times">月4回</option>
                      <option value="weekly">週1回</option>
                    </select>
                  </div>

                  {selectedFrequency.startsWith('monthly') && (
                    <div className="mb-3">
                      <label className="form-label">実行日（毎月）</label>
                      <div className="row">
                        {[1, 5, 10, 15, 20, 25].map(day => (
                          <div key={day} className="col-4 mb-2">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`day-${day}`}
                                checked={selectedDays.includes(day)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedDays([...selectedDays, day].sort((a, b) => a - b))
                                  } else {
                                    setSelectedDays(selectedDays.filter(d => d !== day))
                                  }
                                }}
                              />
                              <label className="form-check-label" htmlFor={`day-${day}`}>
                                {day}日
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={updateSchedule}
                    className="btn btn-primary"
                    disabled={selectedDays.length === 0}
                  >
                    スケジュール更新
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 手動実行 */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="h5 mb-0">手動実行</h3>
            </div>
            <div className="card-body">
              <p className="text-muted">
                スケジュールとは別に、今すぐ全カードの価格取得を開始できます。
              </p>
              
              <div className="alert alert-warning">
                <strong>注意事項:</strong>
                <ul className="mb-0">
                  <li>約6,000件のカードすべてを処理します</li>
                  <li>完了まで数時間かかる可能性があります</li>
                  <li>実行中はブラウザを閉じても処理は継続されます</li>
                  <li>サイトへの負荷を考慮して適切な間隔で実行してください</li>
                </ul>
              </div>

              <button
                onClick={startManualBatch}
                className="btn btn-warning w-100"
              >
                手動でバッチ処理を開始
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 実行履歴 */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="h5 mb-0">バッチ実行履歴</h3>
            </div>
            <div className="card-body">
              {batchRuns.length === 0 ? (
                <div className="text-center py-4">
                  <h5 className="text-muted">まだ実行履歴がありません</h5>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>実行名</th>
                        <th>ステータス</th>
                        <th>進行状況</th>
                        <th>取得価格数</th>
                        <th>開始日時</th>
                        <th>完了日時</th>
                        <th>所要時間</th>
                        <th>詳細</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchRuns.map((run) => {
                        const duration = run.completed_at && run.started_at
                          ? new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()
                          : null
                        
                        return (
                          <tr key={run.id}>
                            <td>{run.batch_name}</td>
                            <td>
                              <span className={getStatusBadge(run.status)}>
                                {getStatusLabel(run.status)}
                              </span>
                            </td>
                            <td>
                              {run.total_cards > 0 && (
                                <>
                                  <div className="small">
                                    {run.processed_cards.toLocaleString()} / {run.total_cards.toLocaleString()}
                                  </div>
                                  <div className="progress" style={{ height: '5px' }}>
                                    <div 
                                      className="progress-bar"
                                      style={{ width: `${(run.processed_cards / run.total_cards) * 100}%` }}
                                    ></div>
                                  </div>
                                </>
                              )}
                            </td>
                            <td className="text-success">
                              {run.total_prices_found.toLocaleString()}
                            </td>
                            <td>
                              <small>
                                {new Date(run.started_at).toLocaleString('ja-JP')}
                              </small>
                            </td>
                            <td>
                              {run.completed_at ? (
                                <small>
                                  {new Date(run.completed_at).toLocaleString('ja-JP')}
                                </small>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td>
                              {duration ? (
                                <small>
                                  {Math.floor(duration / 1000 / 60)}分
                                </small>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td>
                              <Link
                                href={`/admin/price-monitoring/batch-runner/${run.id}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                詳細
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
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