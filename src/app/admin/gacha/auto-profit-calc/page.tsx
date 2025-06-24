'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function AutoProfitCalcPage() {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  
  // 入力値
  const [prices, setPrices] = useState({
    single: 0,
    multi: 0
  })
  
  // カード情報（DBから取得）
  const [cardData, setCardData] = useState<any[]>([])
  const [averageCosts, setAverageCosts] = useState({
    SS: 0,
    S: 0,
    A: 0,
    B: 0,
    C: 0
  })
  
  // シミュレーション設定
  const [simulation, setSimulation] = useState({
    targetSales: 1000,
    targetProfitRate: 30, // 目標利益率
    enableSS: false,
    enableS: false
  })
  
  // 計算結果
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    fetchCardData()
  }, [])

  const fetchCardData = async () => {
    try {
      // pokemon_cardsテーブルからレアリティごとの平均価格を取得
      const { data: cards, error } = await supabase
        .from('pokemon_cards')
        .select('id, name, rarity, price')
        .order('rarity', { ascending: true })
      
      if (error) throw error
      
      if (cards && cards.length > 0) {
        // レアリティごとの平均価格を計算
        const rarityPrices: any = {}
        const rarityCounts: any = {}
        
        cards.forEach(card => {
          const rarity = card.rarity || 'C'
          if (!rarityPrices[rarity]) {
            rarityPrices[rarity] = 0
            rarityCounts[rarity] = 0
          }
          rarityPrices[rarity] += (card.price || 0)
          rarityCounts[rarity]++
        })
        
        // 平均を計算
        const avgCosts: any = {}
        Object.keys(rarityPrices).forEach(rarity => {
          avgCosts[rarity] = Math.round(rarityPrices[rarity] / rarityCounts[rarity])
        })
        
        setAverageCosts({
          SS: avgCosts.SS || 50000,
          S: avgCosts.S || 10000,
          A: avgCosts.A || 3000,
          B: avgCosts.B || 1000,
          C: avgCosts.C || 500
        })
        
        setCardData(cards)
      }
    } catch (error) {
      console.error('Error fetching cards:', error)
      // デフォルト値を使用
      setAverageCosts({
        SS: 50000,
        S: 10000,
        A: 3000,
        B: 1000,
        C: 500
      })
    }
  }

  const calculateProfit = () => {
    setLoading(true)
    
    // 基本排出率
    let dropRates = {
      SS: simulation.enableSS ? 0.5 : 0,
      S: simulation.enableS ? 2 : 0,
      A: 10,
      B: 37.5,
      C: 50
    }
    
    // 排出率の正規化（合計100%になるように調整）
    const totalRate = Object.values(dropRates).reduce((sum, rate) => sum + rate, 0)
    Object.keys(dropRates).forEach(rarity => {
      dropRates[rarity as keyof typeof dropRates] = (dropRates[rarity as keyof typeof dropRates] / totalRate) * 100
    })
    
    // 1回あたりの期待原価
    let expectedCostPerPull = 0
    Object.entries(dropRates).forEach(([rarity, rate]) => {
      expectedCostPerPull += (rate / 100) * averageCosts[rarity as keyof typeof averageCosts]
    })
    
    // 単発での計算
    const singleRevenue = prices.single * simulation.targetSales
    const singleCost = expectedCostPerPull * simulation.targetSales
    const singleProfit = singleRevenue - singleCost
    const singleProfitRate = singleRevenue > 0 ? (singleProfit / singleRevenue) * 100 : 0
    
    // 10連での計算（10連 = 10回分）
    const multiPulls = simulation.targetSales / 10
    const multiRevenue = prices.multi * multiPulls
    const multiCost = expectedCostPerPull * simulation.targetSales
    const multiProfit = multiRevenue - multiCost
    const multiProfitRate = multiRevenue > 0 ? (multiProfit / multiRevenue) * 100 : 0
    
    // 目標利益率を達成するための必要販売数（修正版）
    // 利益率 = (売上 - 原価) / 売上
    // 目標利益を達成するための最小販売数を計算
    const minProfitAmount = 100000 // 最低利益額（10万円）
    
    // 単発での必要販売数
    const singleProfitPerUnit = prices.single - expectedCostPerPull
    const requiredSingleForProfit = singleProfitPerUnit > 0 
      ? Math.ceil(minProfitAmount / singleProfitPerUnit)
      : Infinity
    const requiredSingleForRate = prices.single > expectedCostPerPull
      ? Math.ceil((expectedCostPerPull * 100) / (prices.single * simulation.targetProfitRate - expectedCostPerPull * simulation.targetProfitRate))
      : Infinity
    
    // 10連での必要販売数（10連の回数）
    const multiProfitPerUnit = prices.multi - (expectedCostPerPull * 10)
    const requiredMultiForProfit = multiProfitPerUnit > 0
      ? Math.ceil(minProfitAmount / multiProfitPerUnit)
      : Infinity
    const requiredMultiForRate = prices.multi > (expectedCostPerPull * 10)
      ? Math.ceil((expectedCostPerPull * 1000) / (prices.multi * simulation.targetProfitRate - expectedCostPerPull * 10 * simulation.targetProfitRate))
      : Infinity
    
    // 推奨価格（目標利益率を達成する価格）
    const recommendedSinglePrice = Math.ceil(expectedCostPerPull / (1 - simulation.targetProfitRate / 100))
    const recommendedMultiPrice = Math.ceil((expectedCostPerPull * 10) / (1 - simulation.targetProfitRate / 100))
    
    setResults({
      dropRates,
      expectedCostPerPull,
      single: {
        revenue: singleRevenue,
        cost: singleCost,
        profit: singleProfit,
        profitRate: singleProfitRate,
        requiredSales: requiredSingleForRate,
        requiredForProfit: requiredSingleForProfit,
        profitPerUnit: singleProfitPerUnit
      },
      multi: {
        revenue: multiRevenue,
        cost: multiCost,
        profit: multiProfit,
        profitRate: multiProfitRate,
        requiredSales: requiredMultiForRate,
        requiredForProfit: requiredMultiForProfit,
        profitPerUnit: multiProfitPerUnit
      },
      recommendations: {
        singlePrice: recommendedSinglePrice,
        multiPrice: recommendedMultiPrice,
        message: singleProfitRate >= simulation.targetProfitRate 
          ? '現在の価格設定で目標利益率を達成できます' 
          : '価格を上げるか、高レアリティを制限することを推奨します'
      }
    })
    
    setLoading(false)
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">自動収益計算ツール</h1>
      
      <div className="row">
        <div className="col-lg-6">
          {/* 価格設定 */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">💰 価格設定</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label">単発価格（円）</label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    value={prices.single}
                    onChange={(e) => setPrices({...prices, single: Number(e.target.value)})}
                    placeholder="150"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">10連価格（円）</label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    value={prices.multi}
                    onChange={(e) => setPrices({...prices, multi: Number(e.target.value)})}
                    placeholder="1500"
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <small className="text-muted">クイック価格設定：</small>
                <div className="d-flex gap-2 flex-wrap">
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPrices({single: 150, multi: 1350})}
                  >
                    150円
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPrices({single: 300, multi: 2700})}
                  >
                    300円
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPrices({single: 500, multi: 4500})}
                  >
                    500円
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPrices({single: 1000, multi: 9000})}
                  >
                    1000円
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPrices({single: 5000, multi: 45000})}
                  >
                    5000円
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPrices({single: 10000, multi: 90000})}
                  >
                    10000円
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* カード原価（自動取得） */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">📦 カード原価（自動計算）</h5>
            </div>
            <div className="card-body">
              <p className="text-muted small">登録されたカードから自動計算された平均原価</p>
              {Object.entries(averageCosts).map(([rarity, cost]) => (
                <div key={rarity} className="d-flex justify-content-between mb-2">
                  <span className="fw-bold">{rarity}レア:</span>
                  <span>¥{cost.toLocaleString()}</span>
                </div>
              ))}
              <hr />
              <p className="small text-muted mb-0">
                登録カード数: {cardData.length}枚
              </p>
            </div>
          </div>

          {/* シミュレーション設定 */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">⚙️ シミュレーション設定</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">販売目標数</label>
                <input
                  type="number"
                  className="form-control"
                  value={simulation.targetSales}
                  onChange={(e) => setSimulation({...simulation, targetSales: Number(e.target.value)})}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">目標利益率（%）</label>
                <div className="d-flex gap-2 mb-2">
                  <button
                    className={`btn ${simulation.targetProfitRate === 10 ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSimulation({...simulation, targetProfitRate: 10})}
                  >
                    10%
                  </button>
                  <button
                    className={`btn ${simulation.targetProfitRate === 20 ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSimulation({...simulation, targetProfitRate: 20})}
                  >
                    20%
                  </button>
                  <button
                    className={`btn ${simulation.targetProfitRate === 30 ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSimulation({...simulation, targetProfitRate: 30})}
                  >
                    30%
                  </button>
                </div>
                <input
                  type="number"
                  className="form-control"
                  value={simulation.targetProfitRate}
                  onChange={(e) => setSimulation({...simulation, targetProfitRate: Number(e.target.value)})}
                />
              </div>
              
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="enableSS"
                  checked={simulation.enableSS}
                  onChange={(e) => setSimulation({...simulation, enableSS: e.target.checked})}
                />
                <label className="form-check-label" htmlFor="enableSS">
                  SSレアを排出する
                </label>
              </div>
              
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="enableS"
                  checked={simulation.enableS}
                  onChange={(e) => setSimulation({...simulation, enableS: e.target.checked})}
                />
                <label className="form-check-label" htmlFor="enableS">
                  Sレアを排出する
                </label>
              </div>
              
              <button
                onClick={calculateProfit}
                disabled={loading || !prices.single || !prices.multi}
                className="btn btn-primary w-100"
              >
                {loading ? '計算中...' : '収益を計算'}
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          {/* 計算結果 */}
          {results && (
            <>
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">📊 計算結果</h5>
                </div>
                <div className="card-body">
                  <h6>排出率（調整後）</h6>
                  <div className="mb-3">
                    {Object.entries(results.dropRates).map(([rarity, rate]) => (
                      <div key={rarity} className="d-flex justify-content-between small">
                        <span>{rarity}:</span>
                        <span>{(rate as number).toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="alert alert-info">
                    <strong>1回あたりの期待原価:</strong> ¥{Math.round(results.expectedCostPerPull).toLocaleString()}
                  </div>
                  
                  <div className="row">
                    <div className="col-6">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title">単発 ({simulation.targetSales}回)</h6>
                          <p className="mb-1">売上: ¥{results.single.revenue.toLocaleString()}</p>
                          <p className="mb-1">原価: ¥{results.single.cost.toLocaleString()}</p>
                          <p className="mb-1 fw-bold">利益: ¥{results.single.profit.toLocaleString()}</p>
                          <p className={`mb-0 ${results.single.profitRate >= simulation.targetProfitRate ? 'text-success' : 'text-danger'}`}>
                            利益率: {results.single.profitRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title">10連 ({simulation.targetSales/10}回)</h6>
                          <p className="mb-1">売上: ¥{results.multi.revenue.toLocaleString()}</p>
                          <p className="mb-1">原価: ¥{results.multi.cost.toLocaleString()}</p>
                          <p className="mb-1 fw-bold">利益: ¥{results.multi.profit.toLocaleString()}</p>
                          <p className={`mb-0 ${results.multi.profitRate >= simulation.targetProfitRate ? 'text-success' : 'text-danger'}`}>
                            利益率: {results.multi.profitRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">💡 推奨事項</h5>
                </div>
                <div className="card-body">
                  <div className={`alert ${results.single.profitRate >= simulation.targetProfitRate ? 'alert-success' : 'alert-warning'}`}>
                    {results.recommendations.message}
                  </div>
                  
                  <div className="card bg-primary text-white mb-3">
                    <div className="card-body">
                      <h6 className="card-title">🎯 目標利益率 {simulation.targetProfitRate}% を達成するには</h6>
                      
                      <div className="row">
                        <div className="col-6">
                          <p className="mb-1"><strong>単発の場合:</strong></p>
                          <p className="mb-1">必要販売数: {results.single.requiredSales === Infinity ? '不可能' : `${results.single.requiredSales.toLocaleString()}回`}</p>
                          <p className="mb-1">1回あたり利益: ¥{Math.round(results.single.profitPerUnit).toLocaleString()}</p>
                          <p className="mb-0">推奨価格: ¥{results.recommendations.singlePrice.toLocaleString()}</p>
                        </div>
                        <div className="col-6">
                          <p className="mb-1"><strong>10連の場合:</strong></p>
                          <p className="mb-1">必要販売数: {results.multi.requiredSales === Infinity ? '不可能' : `${results.multi.requiredSales.toLocaleString()}回`}</p>
                          <p className="mb-1">1回あたり利益: ¥{Math.round(results.multi.profitPerUnit).toLocaleString()}</p>
                          <p className="mb-0">推奨価格: ¥{results.recommendations.multiPrice.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <hr className="bg-white opacity-50" />
                      
                      <p className="mb-0 small">
                        <strong>10万円の利益を達成するには:</strong><br/>
                        単発: {results.single.requiredForProfit === Infinity ? '不可能' : `${results.single.requiredForProfit.toLocaleString()}回`} / 
                        10連: {results.multi.requiredForProfit === Infinity ? '不可能' : `${results.multi.requiredForProfit.toLocaleString()}回`}
                      </p>
                    </div>
                  </div>
                  
                  {results.single.profitRate < simulation.targetProfitRate && (
                    <div className="mt-3">
                      <h6>改善案:</h6>
                      <ul className="small">
                        <li>価格を推奨価格まで上げる</li>
                        <li>SS/Sレアの排出を制限する</li>
                        <li>より安価なカードの比率を増やす</li>
                      </ul>
                    </div>
                  )}
                  
                  <hr />
                  
                  <Link 
                    href={`/admin/gacha/new?single=${prices.single}&multi=${prices.multi}&disableSS=${!simulation.enableSS}&disableS=${!simulation.enableS}`}
                    className="btn btn-primary w-100"
                  >
                    この設定でガチャを作成
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}