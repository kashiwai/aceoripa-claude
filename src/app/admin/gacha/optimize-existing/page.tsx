'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface GachaData {
  id: string
  name: string
  single_price: number
  total_packs: number
  remaining_packs: number
  is_active: boolean
}

interface DopaOptimization {
  gacha_id: string
  current_price: number
  current_profit_rate: number
  recommended_price: number
  recommended_profit_rate: number
  optimization_type: 'price_increase' | 'price_decrease' | 'pool_adjustment' | 'no_change'
  expected_improvement: number
  risk_level: 'low' | 'medium' | 'high'
  reasoning: string[]
}

export default function OptimizeExistingGachaPage() {
  const [gachaList, setGachaList] = useState<GachaData[]>([])
  const [optimizations, setOptimizations] = useState<DopaOptimization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [selectedGacha, setSelectedGacha] = useState<string>('')
  
  // DOPA式パラメータ（調整可能）
  const [dopaParams, setDopaParams] = useState({
    actual_return_rate: 0.70,
    physical_card_cost_ratio: 0.05,
    fractional_charge_rate: 0.70,
    target_profit_rate: 0.30
  })
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchExistingGacha()
  }, [])

  useEffect(() => {
    if (gachaList.length > 0) {
      generateOptimizations()
    }
  }, [gachaList, dopaParams])

  const fetchExistingGacha = async () => {
    try {
      const { data, error } = await supabase
        .from('gacha_products')
        .select('id, name, single_price, total_packs, remaining_packs, is_active')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setGachaList(data || [])
    } catch (error) {
      console.error('Error fetching gacha:', error)
      toast.error('ガチャ情報の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateCurrentProfitability = (gacha: GachaData) => {
    const totalRevenue = gacha.single_price * gacha.total_packs
    const physicalCardCost = totalRevenue * dopaParams.physical_card_cost_ratio
    const estimatedUserPayment = totalRevenue * dopaParams.fractional_charge_rate
    const finalProfit = estimatedUserPayment - physicalCardCost
    const profitRate = finalProfit / totalRevenue
    
    return {
      totalRevenue,
      physicalCardCost,
      estimatedUserPayment,
      finalProfit,
      profitRate,
      isUnderTarget: profitRate < dopaParams.target_profit_rate
    }
  }

  const generateOptimizations = () => {
    const opts: DopaOptimization[] = gachaList.map(gacha => {
      const current = calculateCurrentProfitability(gacha)
      
      // 最適価格計算
      const fixedCosts = current.physicalCardCost
      const targetRevenue = fixedCosts / (1 - dopaParams.target_profit_rate)
      const recommendedPrice = targetRevenue / (gacha.total_packs * dopaParams.fractional_charge_rate)
      
      // 最適化タイプの決定
      let optimizationType: DopaOptimization['optimization_type']
      let riskLevel: DopaOptimization['risk_level']
      const priceIncrease = (recommendedPrice - gacha.single_price) / gacha.single_price
      
      if (current.isUnderTarget) {
        if (priceIncrease > 0.5) {
          optimizationType = 'pool_adjustment'
          riskLevel = 'medium'
        } else if (priceIncrease > 0.2) {
          optimizationType = 'price_increase'
          riskLevel = 'medium'
        } else {
          optimizationType = 'price_increase'
          riskLevel = 'low'
        }
      } else if (priceIncrease < -0.1) {
        optimizationType = 'price_decrease'
        riskLevel = 'low'
      } else {
        optimizationType = 'no_change'
        riskLevel = 'low'
      }
      
      // 推論ロジック
      const reasoning: string[] = []
      
      if (current.isUnderTarget) {
        reasoning.push(`現在利益率${(current.profitRate * 100).toFixed(1)}%は目標${(dopaParams.target_profit_rate * 100)}%を下回っています`)
      }
      
      if (Math.abs(priceIncrease) > 0.1) {
        if (priceIncrease > 0) {
          reasoning.push(`価格を${(priceIncrease * 100).toFixed(1)}%上昇させることを推奨`)
        } else {
          reasoning.push(`価格を${Math.abs(priceIncrease * 100).toFixed(1)}%下降で競争力向上`)
        }
      }
      
      if (gacha.single_price > 20000) {
        reasoning.push('高価格帯のため課金ハードルが高い可能性')
        riskLevel = 'high'
      }
      
      if (gacha.single_price < 3000) {
        reasoning.push('低価格帯のため課金モチベーション不足の可能性')
      }
      
      const remainingRate = gacha.remaining_packs / gacha.total_packs
      if (remainingRate > 0.8) {
        reasoning.push('売れ行きが悪い可能性。価格見直しを検討')
        riskLevel = 'medium'
      }
      
      if (remainingRate < 0.2) {
        reasoning.push('好調な売れ行き。価格アップの余地あり')
      }
      
      const newProfitability = calculateCurrentProfitability({
        ...gacha,
        single_price: Math.round(recommendedPrice)
      })
      
      return {
        gacha_id: gacha.id,
        current_price: gacha.single_price,
        current_profit_rate: current.profitRate,
        recommended_price: Math.round(recommendedPrice),
        recommended_profit_rate: newProfitability.profitRate,
        optimization_type: optimizationType,
        expected_improvement: newProfitability.profitRate - current.profitRate,
        risk_level: riskLevel,
        reasoning
      }
    })
    
    setOptimizations(opts)
  }

  const applyOptimization = async (gachaId: string, optimization: DopaOptimization) => {
    setIsOptimizing(true)
    
    try {
      const response = await fetch('/api/admin/gacha', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: gachaId,
          single_price: optimization.recommended_price,
          multi_price: optimization.recommended_price * 10,
          metadata: {
            optimization_applied: true,
            optimization_date: new Date().toISOString(),
            previous_price: optimization.current_price,
            optimization_reasoning: optimization.reasoning
          }
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || '更新に失敗しました')
      }
      
      toast.success('価格を最適化しました')
      fetchExistingGacha() // データを再取得
      
    } catch (error) {
      console.error('Error applying optimization:', error)
      toast.error('最適化の適用に失敗しました')
    } finally {
      setIsOptimizing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(1)}億円`
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}万円`
    } else {
      return `${amount.toLocaleString()}円`
    }
  }

  const formatPercent = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`
  }

  const getOptimizationColor = (type: DopaOptimization['optimization_type']) => {
    switch (type) {
      case 'price_increase':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'price_decrease':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'pool_adjustment':
        return 'bg-purple-50 border-purple-200 text-purple-800'
      case 'no_change':
        return 'bg-green-50 border-green-200 text-green-800'
    }
  }

  const getRiskColor = (risk: DopaOptimization['risk_level']) => {
    switch (risk) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-red-600'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/admin/gacha" className="hover:text-gray-700">
            ガチャ管理
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">既存ガチャ最適化</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">既存ガチャ最適化</h1>
        <p className="text-gray-600 mt-2">
          DOPA式計算による既存ガチャの利益最適化シミュレーション
        </p>
      </div>

      {/* パラメータ調整 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">最適化パラメータ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              実質還元率
            </label>
            <input
              type="number"
              step="0.01"
              min="0.5"
              max="0.9"
              value={dopaParams.actual_return_rate}
              onChange={(e) => setDopaParams({...dopaParams, actual_return_rate: Number(e.target.value)})}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カード原価率
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="0.2"
              value={dopaParams.physical_card_cost_ratio}
              onChange={(e) => setDopaParams({...dopaParams, physical_card_cost_ratio: Number(e.target.value)})}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              端数課金率
            </label>
            <input
              type="number"
              step="0.01"
              min="0.5"
              max="0.9"
              value={dopaParams.fractional_charge_rate}
              onChange={(e) => setDopaParams({...dopaParams, fractional_charge_rate: Number(e.target.value)})}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目標利益率
            </label>
            <input
              type="number"
              step="0.01"
              min="0.1"
              max="0.5"
              value={dopaParams.target_profit_rate}
              onChange={(e) => setDopaParams({...dopaParams, target_profit_rate: Number(e.target.value)})}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 最適化結果一覧 */}
      <div className="space-y-4">
        {optimizations.map((opt, index) => {
          const gacha = gachaList.find(g => g.id === opt.gacha_id)
          if (!gacha) return null
          
          return (
            <div key={opt.gacha_id} className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ガチャ情報 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{gacha.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>現在価格: {opt.current_price.toLocaleString()}P</div>
                    <div>総口数: {gacha.total_packs.toLocaleString()}口</div>
                    <div>残り: {gacha.remaining_packs.toLocaleString()}口</div>
                    <div>売れ行き: {(((gacha.total_packs - gacha.remaining_packs) / gacha.total_packs) * 100).toFixed(1)}%</div>
                  </div>
                </div>
                
                {/* 最適化提案 */}
                <div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm border mb-2 ${getOptimizationColor(opt.optimization_type)}`}>
                    {opt.optimization_type === 'price_increase' && '価格アップ推奨'}
                    {opt.optimization_type === 'price_decrease' && '価格ダウン推奨'}
                    {opt.optimization_type === 'pool_adjustment' && 'プール調整推奨'}
                    {opt.optimization_type === 'no_change' && '変更不要'}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div>推奨価格: <span className="font-semibold">{opt.recommended_price.toLocaleString()}P</span></div>
                    <div>現在利益率: <span className={opt.current_profit_rate >= dopaParams.target_profit_rate ? 'text-green-600' : 'text-red-600'}>{formatPercent(opt.current_profit_rate)}</span></div>
                    <div>予想利益率: <span className="text-green-600">{formatPercent(opt.recommended_profit_rate)}</span></div>
                    <div>改善幅: <span className="text-blue-600">+{formatPercent(opt.expected_improvement)}</span></div>
                    <div>リスク: <span className={getRiskColor(opt.risk_level)}>{opt.risk_level.toUpperCase()}</span></div>
                  </div>
                </div>
                
                {/* 推論とアクション */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">推奨理由</h4>
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    {opt.reasoning.map((reason, i) => (
                      <div key={i}>• {reason}</div>
                    ))}
                  </div>
                  
                  {opt.optimization_type !== 'no_change' && (
                    <button
                      onClick={() => applyOptimization(opt.gacha_id, opt)}
                      disabled={isOptimizing}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isOptimizing ? '適用中...' : '最適化を適用'}
                    </button>
                  )}
                  
                  {opt.optimization_type === 'no_change' && (
                    <div className="bg-green-50 text-green-800 py-2 px-4 rounded-md text-center text-sm">
                      最適化済み
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 戻るボタン */}
      <div className="flex justify-between items-center">
        <Link
          href="/admin/gacha"
          className="text-blue-600 hover:text-blue-700"
        >
          ← ガチャ管理に戻る
        </Link>
        
        <Link
          href="/admin/gacha/dopa-calculator"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          利益計算ツール
        </Link>
      </div>
    </div>
  )
}