'use client'

import { useState, useEffect } from 'react'
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

interface MonitoringSetting {
  id: string
  card_id: string
  monitoring_enabled: boolean
  alert_threshold_percentage: number
  min_price_threshold: number
  max_price_threshold: number | null
  notification_email: string | null
  last_checked_at: string | null
  pokemon_cards?: Card
}

const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

export default function PriceMonitoringSettingsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [settings, setSettings] = useState<MonitoringSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('')

  const fetchData = async () => {
    try {
      // カード一覧を取得
      let cardsQuery = supabaseAdmin
        .from('pokemon_cards')
        .select('*')
        .order('card_name')
        .limit(1000)

      if (filter) {
        cardsQuery = cardsQuery.or(`card_name.ilike.%${filter}%,product_code.ilike.%${filter}%`)
      }
      if (rarityFilter) {
        cardsQuery = cardsQuery.eq('rarity', rarityFilter)
      }

      const { data: cardsData, error: cardsError } = await cardsQuery

      if (cardsError) throw cardsError

      setCards(cardsData || [])

      // 監視設定を取得
      const { data: settingsData, error: settingsError } = await supabaseAdmin
        .from('price_monitoring_settings')
        .select(`
          *,
          pokemon_cards (
            id,
            card_name,
            product_code,
            rarity,
            image_url,
            market_price
          )
        `)

      if (settingsError) throw settingsError

      setSettings(settingsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filter, rarityFilter])

  const handleEnableMonitoring = async (cardId: string, enabled: boolean) => {
    setSaving(true)
    try {
      const existingSetting = settings.find(s => s.card_id === cardId)

      if (existingSetting) {
        // 既存設定を更新
        const { error } = await supabaseAdmin
          .from('price_monitoring_settings')
          .update({ monitoring_enabled: enabled })
          .eq('card_id', cardId)

        if (error) throw error

        setSettings(prev => prev.map(s => 
          s.card_id === cardId ? { ...s, monitoring_enabled: enabled } : s
        ))
      } else if (enabled) {
        // 新規設定を作成
        const { data, error } = await supabaseAdmin
          .from('price_monitoring_settings')
          .insert({
            card_id: cardId,
            monitoring_enabled: true,
            alert_threshold_percentage: 5.0,
            min_price_threshold: 0
          })
          .select()
          .single()

        if (error) throw error

        const card = cards.find(c => c.id === cardId)
        setSettings(prev => [...prev, { ...data, pokemon_cards: card }])
      }

      toast.success(enabled ? '監視を開始しました' : '監視を停止しました')
    } catch (error) {
      console.error('Error updating monitoring:', error)
      toast.error('設定の更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSetting = async (cardId: string, field: string, value: any) => {
    try {
      const { error } = await supabaseAdmin
        .from('price_monitoring_settings')
        .update({ [field]: value })
        .eq('card_id', cardId)

      if (error) throw error

      setSettings(prev => prev.map(s => 
        s.card_id === cardId ? { ...s, [field]: value } : s
      ))
    } catch (error) {
      console.error('Error updating setting:', error)
      toast.error('設定の更新に失敗しました')
    }
  }

  const handleBulkEnableMonitoring = async (rarity?: string) => {
    setSaving(true)
    try {
      let targetCards = cards
      if (rarity) {
        targetCards = cards.filter(card => card.rarity === rarity)
      }

      const promises = targetCards.map(card => {
        const existingSetting = settings.find(s => s.card_id === card.id)
        
        if (existingSetting) {
          return supabaseAdmin
            .from('price_monitoring_settings')
            .update({ monitoring_enabled: true })
            .eq('card_id', card.id)
        } else {
          return supabaseAdmin
            .from('price_monitoring_settings')
            .insert({
              card_id: card.id,
              monitoring_enabled: true,
              alert_threshold_percentage: 5.0,
              min_price_threshold: 0
            })
        }
      })

      await Promise.all(promises)
      
      toast.success(`${targetCards.length}件のカードの監視を有効にしました`)
      fetchData()
    } catch (error) {
      console.error('Error bulk enabling monitoring:', error)
      toast.error('一括設定に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const isMonitored = (cardId: string) => {
    const setting = settings.find(s => s.card_id === cardId)
    return setting?.monitoring_enabled || false
  }

  const getSetting = (cardId: string) => {
    return settings.find(s => s.card_id === cardId)
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
          <h1 className="h2">価格監視設定</h1>
          <p className="text-muted">
            カードごとに価格監視を設定し、変動しきい値をカスタマイズできます
          </p>
        </div>
        <Link href="/admin/price-monitoring" className="btn btn-secondary">
          監視画面に戻る
        </Link>
      </div>

      {/* フィルターと一括操作 */}
      <div className="row mb-4">
        <div className="col-md-4">
          <input
            type="text"
            placeholder="カード名で検索..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="col-md-3">
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="form-select"
          >
            <option value="">全てのレアリティ</option>
            <option value="SS">SS賞</option>
            <option value="S">S賞</option>
            <option value="A">A賞</option>
            <option value="B">B賞</option>
            <option value="C">C賞</option>
            <option value="D">D賞</option>
          </select>
        </div>
        <div className="col-md-5">
          <div className="btn-group">
            <button
              onClick={() => handleBulkEnableMonitoring()}
              disabled={saving}
              className="btn btn-success"
            >
              全カード監視開始
            </button>
            <button
              onClick={() => handleBulkEnableMonitoring('SS')}
              disabled={saving}
              className="btn btn-warning"
            >
              SS賞のみ監視開始
            </button>
            <button
              onClick={() => handleBulkEnableMonitoring('S')}
              disabled={saving}
              className="btn btn-info"
            >
              S賞のみ監視開始
            </button>
          </div>
        </div>
      </div>

      {/* カード一覧 */}
      <div className="row">
        {cards.map((card) => {
          const setting = getSetting(card.id)
          const monitored = isMonitored(card.id)
          
          return (
            <div key={card.id} className="col-xl-4 col-lg-6 mb-4">
              <div className={`card h-100 ${monitored ? 'border-success' : ''}`}>
                <div className="card-body">
                  <div className="d-flex align-items-start mb-3">
                    <img
                      src={card.image_url || '/images/ngcard.jpg'}
                      alt={card.card_name}
                      className="rounded me-3"
                      style={{ width: '60px', height: '80px', objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-1">{card.card_name}</h6>
                      <small className="text-muted d-block">{card.product_code}</small>
                      <span className={`badge ${getRarityColor(card.rarity)} me-2`}>
                        {card.rarity}賞
                      </span>
                      <small className="text-success fw-bold">
                        ¥{card.market_price?.toLocaleString() || '0'}
                      </small>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={monitored}
                        onChange={(e) => handleEnableMonitoring(card.id, e.target.checked)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {monitored && setting && (
                    <div className="border-top pt-3">
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label small">
                            変動しきい値 (%)
                          </label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={setting.alert_threshold_percentage}
                            onChange={(e) => handleUpdateSetting(
                              card.id, 
                              'alert_threshold_percentage', 
                              parseFloat(e.target.value)
                            )}
                            min="0.1"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small">
                            最低価格 (円)
                          </label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={setting.min_price_threshold}
                            onChange={(e) => handleUpdateSetting(
                              card.id, 
                              'min_price_threshold', 
                              parseInt(e.target.value)
                            )}
                            min="0"
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label small">
                            通知メール
                          </label>
                          <input
                            type="email"
                            className="form-control form-control-sm"
                            value={setting.notification_email || ''}
                            onChange={(e) => handleUpdateSetting(
                              card.id, 
                              'notification_email', 
                              e.target.value || null
                            )}
                            placeholder="例: admin@example.com"
                          />
                        </div>
                      </div>
                      
                      {setting.last_checked_at && (
                        <small className="text-muted d-block mt-2">
                          最終チェック: {new Date(setting.last_checked_at).toLocaleString('ja-JP')}
                        </small>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-5">
          <h5 className="text-muted">カードが見つかりません</h5>
          <p className="text-muted">検索条件を変更してください</p>
        </div>
      )}
    </div>
  )
}