'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DopaCalculation {
  price_per_pull: number
  total_packs: number
  total_revenue: number
  actual_return_rate: number
  expected_return_amount: number
  physical_card_cost: number
  estimated_user_payment: number
  final_profit: number
  final_profit_rate: number
  is_profitable: boolean
  needs_adjustment: boolean
  breakeven_price: number
  recommended_price: number
}

export default function CreateGachaWithCalculatorPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  
  // ガチャ基本情報
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    single_price: 10000,
    total_packs: 4000,
    banner_image_url: '',
    is_active: true
  })
  
  // DOPA式計算パラメータ
  const [dopaParams, setDopaParams] = useState({
    actual_return_rate: 0.70,        // 実質還元率70%
    physical_card_cost_ratio: 0.05,  // カード原価率5%
    fractional_charge_rate: 0.70,    // 端数課金率70%
    target_profit_rate: 0.30,        // 目標利益率30%
    explosion_ad_rate: 0.15          // 爆アド出現率15%
  })
  
  // 計算結果
  const [calculation, setCalculation] = useState<DopaCalculation | null>(null)
  const [recommendations, setRecommendations] = useState<string[]>([])

  // リアルタイム計算
  useEffect(() => {
    calculateDopaProfit()
  }, [formData.single_price, formData.total_packs, dopaParams])

  const calculateDopaProfit = (): DopaCalculation => {
    const totalRevenue = formData.single_price * formData.total_packs
    const expectedReturnAmount = totalRevenue * dopaParams.actual_return_rate
    const physicalCardCost = totalRevenue * dopaParams.physical_card_cost_ratio
    const estimatedUserPayment = totalRevenue * dopaParams.fractional_charge_rate
    const finalProfit = estimatedUserPayment - physicalCardCost
    const finalProfitRate = finalProfit / totalRevenue
    
    // 損益分岐点計算
    const fixedCosts = physicalCardCost
    const breakeven_price = fixedCosts / (formData.total_packs * dopaParams.fractional_charge_rate)
    const recommended_price = breakeven_price / (1 - dopaParams.target_profit_rate)
    
    const calc: DopaCalculation = {
      price_per_pull: formData.single_price,
      total_packs: formData.total_packs,
      total_revenue: totalRevenue,
      actual_return_rate: dopaParams.actual_return_rate,
      expected_return_amount: expectedReturnAmount,
      physical_card_cost: physicalCardCost,
      estimated_user_payment: estimatedUserPayment,
      final_profit: finalProfit,
      final_profit_rate: finalProfitRate,
      is_profitable: finalProfit > 0,
      needs_adjustment: finalProfitRate < dopaParams.target_profit_rate,
      breakeven_price: breakeven_price,
      recommended_price: recommended_price
    }
    
    setCalculation(calc)
    generateRecommendations(calc)
    return calc
  }

  const generateRecommendations = (calc: DopaCalculation) => {
    const recs: string[] = []
    
    if (calc.needs_adjustment) {
      recs.push(`利益率${(calc.final_profit_rate * 100).toFixed(1)}%は目標${(dopaParams.target_profit_rate * 100)}%を下回っています`)
      recs.push(`推奨価格: ${Math.ceil(calc.recommended_price).toLocaleString()}P (現在: ${calc.price_per_pull.toLocaleString()}P)`)
    } else {
      recs.push('✅ 目標利益率をクリアしています')
    }
    
    if (calc.price_per_pull < 5000) {
      recs.push('⚠️ 単価が低すぎます。ユーザーの課金モチベーションが下がる可能性があります')
    }
    
    if (calc.price_per_pull > 50000) {
      recs.push('⚠️ 単価が高すぎます。課金ハードルが高くなりすぎる可能性があります')
    }
    
    if (calc.total_packs < 1000) {
      recs.push('⚠️ 総口数が少なすぎます。運営期間が短くなります')
    }
    
    if (calc.total_packs > 10000) {
      recs.push('⚠️ 総口数が多すぎます。消化に時間がかかりすぎる可能性があります')
    }
    
    // DOPA式の健全性チェック
    const userReturnRate = calc.expected_return_amount / calc.total_revenue
    if (userReturnRate > 0.80) {
      recs.push('⚠️ 還元率が高すぎます。利益確保が困難になります')
    }
    
    if (userReturnRate < 0.60) {
      recs.push('⚠️ 還元率が低すぎます。ユーザー満足度が下がる可能性があります')
    }
    
    setRecommendations(recs)
  }

  const handleOptimize = () => {
    if (!calculation) return
    
    // 自動最適化
    const optimizedPrice = Math.ceil(calculation.recommended_price / 100) * 100 // 100P単位に丸める
    const optimizedPacks = Math.max(1000, Math.min(10000, formData.total_packs)) // 1000-10000の範囲
    
    setFormData({
      ...formData,
      single_price: optimizedPrice,
      total_packs: optimizedPacks
    })
    
    toast.success('価格を最適化しました')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!calculation || calculation.needs_adjustment) {
      toast.error('利益率が目標を下回っています。価格を調整してください。')
      return
    }
    
    setIsLoading(true)
    
    try {
      // DOPA設定を含むガチャ作成
      const dopaSettings = {
        actual_return_rate: dopaParams.actual_return_rate,
        display_return_rate: 0.97,
        explosion_ad_rate: dopaParams.explosion_ad_rate,
        point_return_distribution: {
          low_return: { min: 850, max: 3650, weight: 400 },
          mid_return: { min: 5600, max: 8900, weight: 300 },
          high_return: { min: 12000, max: 15000, weight: 120 },
          super_return: { min: 20000, max: 25000, weight: 30 }
        },
        profit_calculation: calculation
      }
      
      const response = await fetch('/api/admin/gacha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          multi_price: formData.single_price * 10,
          dopa_settings: dopaSettings,
          metadata: {
            profit_info: calculation,
            dopa_optimized: true,
            created_with_calculator: true
          }
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'ガチャ作成に失敗しました')
      }
      
      toast.success('ガチャを作成しました')
      router.push(`/admin/gacha/${result.gacha.id}/edit`)
      
    } catch (error) {
      console.error('Error creating gacha:', error)
      toast.error('ガチャ作成に失敗しました')
    } finally {
      setIsLoading(false)
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/admin/gacha" className="hover:text-gray-700">
            ガチャ管理
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">利益計算付きガチャ作成</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">利益計算付きガチャ作成</h1>
        <p className="text-gray-600 mt-2">
          DOPA式計算で最適な価格と利益率を自動算出
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側: ガチャ設定フォーム */}
        <div className="space-y-6">
          {/* 基本情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">基本情報</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ガチャ名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="例: ピカチュウ大祭り"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="ガチャの説明を入力..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    単発価格（ポイント）
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="1000"
                    max="100000"
                    value={formData.single_price}
                    onChange={(e) => setFormData({ ...formData, single_price: Number(e.target.value) })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    総口数
                  </label>
                  <select
                    value={formData.total_packs}
                    onChange={(e) => setFormData({ ...formData, total_packs: Number(e.target.value) })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value={1000}>1,000口</option>
                    <option value={2000}>2,000口</option>
                    <option value={3000}>3,000口</option>
                    <option value={4000}>4,000口</option>
                    <option value={5000}>5,000口</option>
                    <option value={10000}>10,000口</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  バナー画像URL
                </label>
                <input
                  type="text"
                  value={formData.banner_image_url}
                  onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="/images/banner.jpg"
                />
              </div>
            </div>
          </div>

          {/* DOPA式パラメータ */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">DOPA式設定</h2>
            <div className="grid grid-cols-2 gap-4">
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
                <p className="text-xs text-gray-500">推奨: 0.70 (70%)</p>
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
                <p className="text-xs text-gray-500">推奨: 0.05 (5%)</p>
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
                <p className="text-xs text-gray-500">推奨: 0.70 (70%)</p>
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
                <p className="text-xs text-gray-500">推奨: 0.30 (30%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右側: 計算結果とレコメンデーション */}
        <div className="space-y-6">
          {/* 利益計算結果 */}
          {calculation && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">利益計算結果</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">総売上:</span>
                  <span className="font-bold">{formatCurrency(calculation.total_revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">実課金額:</span>
                  <span className="font-bold">{formatCurrency(calculation.estimated_user_payment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">カード原価:</span>
                  <span className="font-bold">{formatCurrency(calculation.physical_card_cost)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">最終利益:</span>
                    <span className={`font-bold text-lg ${calculation.final_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(calculation.final_profit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">利益率:</span>
                    <span className={`font-bold text-lg ${calculation.final_profit_rate >= dopaParams.target_profit_rate ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(calculation.final_profit_rate)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 rounded-lg bg-gray-50">
                <div className="text-sm text-gray-600">
                  <div>損益分岐点: {calculation.breakeven_price.toLocaleString()}P</div>
                  <div>推奨価格: {Math.ceil(calculation.recommended_price).toLocaleString()}P</div>
                </div>
              </div>
              
              {calculation.needs_adjustment && (
                <button
                  type="button"
                  onClick={handleOptimize}
                  className="w-full mt-4 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700"
                >
                  価格を自動最適化
                </button>
              )}
            </div>
          )}

          {/* レコメンデーション */}
          {recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">推奨事項</h2>
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      rec.startsWith('✅') 
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : rec.startsWith('⚠️')
                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 作成ボタン */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex space-x-4">
              <Link
                href="/admin/gacha"
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 text-center"
              >
                キャンセル
              </Link>
              <button
                onClick={handleSubmit}
                disabled={isLoading || (calculation?.needs_adjustment)}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '作成中...' : 'ガチャを作成'}
              </button>
            </div>
            
            {calculation?.needs_adjustment && (
              <p className="text-red-600 text-sm mt-2 text-center">
                利益率が目標を下回っています。価格を調整してください。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}