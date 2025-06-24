'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function GachaProfitCalculatorPage() {
  const [formData, setFormData] = useState({
    // 価格設定
    singlePrice: 0,
    multiPrice: 0,
    
    // カード原価
    cardCosts: {
      SS: 50000,  // SSカードの仕入れ値
      S: 10000,   // Sカードの仕入れ値
      A: 3000,    // Aカードの仕入れ値
      B: 1000,    // Bカードの仕入れ値
      C: 500      // Cカードの仕入れ値
    },
    
    // 排出率（%）
    dropRates: {
      SS: 0.5,
      S: 2,
      A: 10,
      B: 37.5,
      C: 50
    },
    
    // 販売目標
    targetSales: 1000,  // 販売目標数
    
    // 排出制御
    disableRarities: {
      SS: true,  // 初期はSSを出さない
      S: true    // 初期はSも出さない
    }
  })

  const [calculations, setCalculations] = useState({
    expectedRevenue: 0,
    expectedCost: 0,
    expectedProfit: 0,
    profitMargin: 0,
    breakEvenPoint: 0,
    adjustedDropRates: {},
    riskLevel: ''
  })

  // 計算ロジック
  useEffect(() => {
    calculateProfitability()
  }, [formData])

  const calculateProfitability = () => {
    const { singlePrice, cardCosts, dropRates, targetSales, disableRarities } = formData
    
    // 排出率の調整（無効化されたレアリティを考慮）
    let adjustedRates = { ...dropRates }
    let disabledTotal = 0
    
    // 無効化されたレアリティの排出率を合計
    Object.entries(disableRarities).forEach(([rarity, disabled]) => {
      if (disabled) {
        disabledTotal += dropRates[rarity as keyof typeof dropRates]
        adjustedRates[rarity as keyof typeof dropRates] = 0
      }
    })
    
    // 無効化された分を他のレアリティに配分
    if (disabledTotal > 0) {
      const enabledRarities = Object.entries(adjustedRates)
        .filter(([_, rate]) => rate > 0)
      
      enabledRarities.forEach(([rarity, rate]) => {
        const ratio = rate / (100 - disabledTotal)
        adjustedRates[rarity as keyof typeof adjustedRates] = rate + (disabledTotal * ratio)
      })
    }
    
    // 期待原価の計算
    let expectedCostPerPull = 0
    Object.entries(adjustedRates).forEach(([rarity, rate]) => {
      expectedCostPerPull += (rate / 100) * cardCosts[rarity as keyof typeof cardCosts]
    })
    
    // 収益計算
    const totalRevenue = singlePrice * targetSales
    const totalCost = expectedCostPerPull * targetSales
    const profit = totalRevenue - totalCost
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0
    
    // 損益分岐点（何回引かれたら赤字になるか）
    const breakEven = singlePrice > 0 ? Math.floor(totalRevenue / expectedCostPerPull) : 0
    
    // リスクレベル判定
    let riskLevel = 'low'
    if (margin < 30) riskLevel = 'high'
    else if (margin < 50) riskLevel = 'medium'
    
    setCalculations({
      expectedRevenue: totalRevenue,
      expectedCost: totalCost,
      expectedProfit: profit,
      profitMargin: margin,
      breakEvenPoint: breakEven,
      adjustedDropRates: adjustedRates,
      riskLevel
    })
  }

  const handleRarityToggle = (rarity: string) => {
    setFormData(prev => ({
      ...prev,
      disableRarities: {
        ...prev.disableRarities,
        [rarity]: !prev.disableRarities[rarity as keyof typeof prev.disableRarities]
      }
    }))
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">ガチャ収益計算・排出制御</h1>

      <div className="row">
        <div className="col-lg-6">
          {/* 設定フォーム */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">価格・原価設定</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label">単発価格</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.singlePrice}
                    onChange={(e) => setFormData({...formData, singlePrice: Number(e.target.value)})}
                    placeholder="150"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">10連価格</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.multiPrice}
                    onChange={(e) => setFormData({...formData, multiPrice: Number(e.target.value)})}
                    placeholder="1500"
                  />
                </div>
              </div>

              <h6 className="mt-4 mb-3">カード仕入れ値（円）</h6>
              {Object.entries(formData.cardCosts).map(([rarity, cost]) => (
                <div key={rarity} className="row mb-2">
                  <div className="col-3">
                    <label className="form-label">{rarity}レア</label>
                  </div>
                  <div className="col-9">
                    <input
                      type="number"
                      className="form-control"
                      value={cost}
                      onChange={(e) => setFormData({
                        ...formData,
                        cardCosts: {
                          ...formData.cardCosts,
                          [rarity]: Number(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>
              ))}

              <div className="mt-4">
                <label className="form-label">販売目標数</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.targetSales}
                  onChange={(e) => setFormData({...formData, targetSales: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>

          {/* 排出制御 */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">排出制御</h5>
            </div>
            <div className="card-body">
              <p className="text-muted">初期段階で出したくないレアリティを無効化できます</p>
              
              {['SS', 'S', 'A'].map((rarity) => (
                <div key={rarity} className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`disable${rarity}`}
                    checked={formData.disableRarities[rarity as keyof typeof formData.disableRarities] || false}
                    onChange={() => handleRarityToggle(rarity)}
                  />
                  <label className="form-check-label" htmlFor={`disable${rarity}`}>
                    <strong>{rarity}レアを出さない</strong>
                    {formData.disableRarities[rarity as keyof typeof formData.disableRarities] && 
                      <span className="text-danger ms-2">（無効化中）</span>
                    }
                  </label>
                </div>
              ))}

              <hr />

              <h6>調整後の排出率</h6>
              <div className="small">
                {Object.entries(calculations.adjustedDropRates).map(([rarity, rate]) => (
                  <div key={rarity} className="d-flex justify-content-between mb-1">
                    <span>{rarity}:</span>
                    <span className={rate === 0 ? 'text-muted' : ''}>
                      {(rate as number).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          {/* 収益計算結果 */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">収益シミュレーション</h5>
            </div>
            <div className="card-body">
              <div className={`alert alert-${
                calculations.riskLevel === 'low' ? 'success' : 
                calculations.riskLevel === 'medium' ? 'warning' : 'danger'
              }`}>
                <h6>リスクレベル: {
                  calculations.riskLevel === 'low' ? '低' :
                  calculations.riskLevel === 'medium' ? '中' : '高'
                }</h6>
              </div>

              <div className="row mb-3">
                <div className="col-6">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="card-title text-muted">予想売上</h6>
                      <h4 className="mb-0">¥{calculations.expectedRevenue.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="card-title text-muted">予想原価</h6>
                      <h4 className="mb-0">¥{calculations.expectedCost.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-primary text-white mb-3">
                <div className="card-body">
                  <h6 className="card-title">予想利益</h6>
                  <h3 className="mb-0">¥{calculations.expectedProfit.toLocaleString()}</h3>
                  <p className="mb-0">利益率: {calculations.profitMargin.toFixed(1)}%</p>
                </div>
              </div>

              <div className="alert alert-info">
                <strong>損益分岐点:</strong> {calculations.breakEvenPoint}回
                <br />
                <small>この回数を超えると赤字リスクが高まります</small>
              </div>

              <h6 className="mt-4">推奨事項</h6>
              <ul className="small">
                {calculations.profitMargin < 30 && (
                  <li className="text-danger">利益率が低すぎます。価格を上げるか、高レアリティを制限してください</li>
                )}
                {calculations.profitMargin > 70 && (
                  <li className="text-success">十分な利益率です。段階的に高レアリティを解放できます</li>
                )}
                {formData.disableRarities.SS && formData.disableRarities.S && (
                  <li>初期段階として高レアリティを制限しています</li>
                )}
              </ul>
            </div>
          </div>

          {/* アクション */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">この設定でガチャを作成</h5>
              <p className="text-muted small">計算結果を元にガチャを作成できます</p>
              <Link 
                href={`/admin/gacha/new?price=${formData.singlePrice}&multiPrice=${formData.multiPrice}&disableSS=${formData.disableRarities.SS}&disableS=${formData.disableRarities.S}`}
                className="btn btn-primary w-100"
              >
                この設定でガチャ作成へ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}