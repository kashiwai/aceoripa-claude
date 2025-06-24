'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function GachaProfitControlPage() {
  const params = useParams()
  const gachaId = params.id as string
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [gachaData, setGachaData] = useState<any>(null)
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalCost: 0,
    currentProfit: 0,
    profitMargin: 0
  })
  
  const [rarityControl, setRarityControl] = useState({
    SS: { enabled: false, currentRate: 0.5, adjustedRate: 0 },
    S: { enabled: false, currentRate: 2, adjustedRate: 0 },
    A: { enabled: true, currentRate: 10, adjustedRate: 15 },
    B: { enabled: true, currentRate: 37.5, adjustedRate: 40 },
    C: { enabled: true, currentRate: 50, adjustedRate: 45 }
  })

  useEffect(() => {
    fetchGachaData()
    fetchSalesData()
  }, [gachaId])

  const fetchGachaData = async () => {
    try {
      const { data, error } = await supabase
        .from('gacha_products')
        .select('*')
        .eq('id', gachaId)
        .single()
      
      if (error) throw error
      setGachaData(data)
      
      // メタデータから現在の設定を読み込む
      if (data.metadata?.rarityControl) {
        setRarityControl(data.metadata.rarityControl)
      }
    } catch (error) {
      console.error('Error fetching gacha:', error)
      toast.error('ガチャデータの取得に失敗しました')
    }
  }

  const fetchSalesData = async () => {
    try {
      // 実際の売上データを取得（ダミーデータ）
      const sales = 523
      const revenue = sales * (gachaData?.single_price || 150)
      const avgCost = 2500 // 平均原価
      const cost = sales * avgCost
      const profit = revenue - cost
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0

      setSalesData({
        totalSales: sales,
        totalRevenue: revenue,
        totalCost: cost,
        currentProfit: profit,
        profitMargin: margin
      })
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRarity = (rarity: string) => {
    const newControl = { ...rarityControl }
    newControl[rarity as keyof typeof rarityControl].enabled = 
      !newControl[rarity as keyof typeof rarityControl].enabled
    
    // 排出率を再計算
    recalculateRates(newControl)
  }

  const recalculateRates = (control: typeof rarityControl) => {
    let totalDisabled = 0
    let totalEnabled = 0
    
    // 無効化されたレアリティと有効なレアリティの合計を計算
    Object.entries(control).forEach(([_, settings]) => {
      if (!settings.enabled) {
        totalDisabled += settings.currentRate
      } else {
        totalEnabled += settings.currentRate
      }
    })
    
    // 有効なレアリティに再配分
    Object.entries(control).forEach(([rarity, settings]) => {
      if (!settings.enabled) {
        control[rarity as keyof typeof control].adjustedRate = 0
      } else {
        const ratio = settings.currentRate / totalEnabled
        control[rarity as keyof typeof control].adjustedRate = 
          settings.currentRate + (totalDisabled * ratio)
      }
    })
    
    setRarityControl(control)
  }

  const saveSettings = async () => {
    try {
      const { error } = await supabase
        .from('gacha_products')
        .update({
          metadata: {
            ...gachaData.metadata,
            rarityControl: rarityControl,
            lastUpdated: new Date().toISOString()
          }
        })
        .eq('id', gachaId)
      
      if (error) throw error
      toast.success('設定を保存しました')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('設定の保存に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">{gachaData?.name} - 収益管理</h1>
          <p className="text-muted">リアルタイムの収益状況と排出制御</p>
        </div>
        <Link href={`/admin/gacha/${gachaId}`} className="btn btn-secondary">
          ← ガチャ詳細に戻る
        </Link>
      </div>

      <div className="row">
        {/* 現在の収益状況 */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">📊 現在の収益状況</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted">総販売数</small>
                <h4>{salesData.totalSales}回</h4>
              </div>
              <div className="mb-3">
                <small className="text-muted">売上高</small>
                <h4>¥{salesData.totalRevenue.toLocaleString()}</h4>
              </div>
              <div className="mb-3">
                <small className="text-muted">原価合計</small>
                <h4 className="text-danger">¥{salesData.totalCost.toLocaleString()}</h4>
              </div>
              <hr />
              <div className={`card ${salesData.currentProfit > 0 ? 'bg-success' : 'bg-danger'} text-white`}>
                <div className="card-body">
                  <small>現在の利益</small>
                  <h3 className="mb-0">¥{salesData.currentProfit.toLocaleString()}</h3>
                  <p className="mb-0">利益率: {salesData.profitMargin.toFixed(1)}%</p>
                </div>
              </div>

              {salesData.profitMargin < 30 && (
                <div className="alert alert-warning mt-3">
                  <small>⚠️ 利益率が低下しています。高レアリティの排出を制限することを推奨します。</small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 排出制御 */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🎮 排出率リアルタイム制御</h5>
              <button onClick={saveSettings} className="btn btn-primary btn-sm">
                設定を保存
              </button>
            </div>
            <div className="card-body">
              <p className="text-muted mb-4">
                レアリティごとの排出を有効/無効にできます。無効にした分は他のレアリティに自動配分されます。
              </p>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>レアリティ</th>
                      <th>基本排出率</th>
                      <th>調整後排出率</th>
                      <th>状態</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(rarityControl).map(([rarity, settings]) => (
                      <tr key={rarity} className={!settings.enabled ? 'table-secondary' : ''}>
                        <td>
                          <strong className={`text-${
                            rarity === 'SS' ? 'danger' : 
                            rarity === 'S' ? 'warning' : 
                            'secondary'
                          }`}>
                            {rarity}
                          </strong>
                        </td>
                        <td>{settings.currentRate}%</td>
                        <td>
                          <strong className={settings.adjustedRate === 0 ? 'text-muted' : 'text-primary'}>
                            {settings.adjustedRate.toFixed(2)}%
                          </strong>
                        </td>
                        <td>
                          {settings.enabled ? (
                            <span className="badge bg-success">有効</span>
                          ) : (
                            <span className="badge bg-danger">無効</span>
                          )}
                        </td>
                        <td>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={settings.enabled}
                              onChange={() => toggleRarity(rarity)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="alert alert-info mt-3">
                <h6 className="alert-heading">💡 運営のコツ</h6>
                <ul className="mb-0 small">
                  <li>初期段階: SS/Sを無効化し、利益を確保</li>
                  <li>中期段階: 売上が安定したらSを解放</li>
                  <li>後期段階: 十分な利益が出たらSSを解放してプレイヤー満足度を向上</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 予測シミュレーション */}
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">📈 今後の予測</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>現在の設定で1000回販売した場合</h6>
                  <ul className="list-unstyled">
                    <li>予想売上: ¥{((gachaData?.single_price || 150) * 1000).toLocaleString()}</li>
                    <li>予想原価: ¥{(2500 * 1000).toLocaleString()}</li>
                    <li>予想利益: ¥{(((gachaData?.single_price || 150) - 2500) * 1000).toLocaleString()}</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>SSを1枚出した場合の影響</h6>
                  <ul className="list-unstyled text-danger">
                    <li>SSカード原価: ¥50,000</li>
                    <li>必要販売数: {Math.ceil(50000 / (gachaData?.single_price || 150))}回</li>
                    <li>利益への影響: -¥50,000</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}