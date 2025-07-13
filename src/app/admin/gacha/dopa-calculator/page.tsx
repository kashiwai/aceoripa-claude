'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

interface GachaProduct {
  id: string
  name: string
  single_price: number
  total_packs: number
  remaining_packs: number
  dopa_settings: any
}

interface DopaCalculation {
  gacha_id: string
  gacha_name: string
  price_per_pull: number
  total_revenue: number
  actual_return_rate: number
  expected_return_amount: number
  physical_card_cost: number
  gross_profit: number
  profit_rate: number
  fractional_charge_effect: number
  estimated_user_payment: number
  final_profit: number
  final_profit_rate: number
  is_profitable: boolean
  needs_adjustment: boolean
}

export default function DopaCalculatorPage() {
  const [gachaProducts, setGachaProducts] = useState<GachaProduct[]>([])
  const [calculations, setCalculations] = useState<DopaCalculation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGacha, setSelectedGacha] = useState<string>('')
  
  // 設定可能パラメータ
  const [parameters, setParameters] = useState({
    actual_return_rate: 0.70,
    physical_card_cost_ratio: 0.05, // 売上の5%がカード原価
    fractional_charge_rate: 0.70,   // 端数課金で実際の課金額は70%
    target_profit_rate: 0.30        // 目標利益率30%
  })
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchGachaProducts()
  }, [])

  useEffect(() => {
    if (gachaProducts.length > 0) {
      calculateAllGacha()
    }
  }, [gachaProducts, parameters])

  const fetchGachaProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('gacha_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setGachaProducts(data || [])
    } catch (error) {
      console.error('Error fetching gacha products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateDopaProfit = (gacha: GachaProduct): DopaCalculation => {
    const totalPulls = gacha.total_packs || 4000
    const pricePerPull = gacha.single_price || 10000
    
    // 基本計算
    const totalRevenue = totalPulls * pricePerPull // 4,000万円
    const expectedReturnAmount = totalRevenue * parameters.actual_return_rate // 2,800万円（70%還元）
    const physicalCardCost = totalRevenue * parameters.physical_card_cost_ratio // 200万円（5%）
    
    // 端数課金効果を考慮した実際の課金額
    const estimatedUserPayment = totalRevenue * parameters.fractional_charge_rate // 2,800万円（実際の課金）
    
    // 利益計算
    const grossProfit = estimatedUserPayment - physicalCardCost // 2,600万円
    const profitRate = grossProfit / estimatedUserPayment // 約92.8%
    
    // 最終利益（端数課金効果を考慮）
    const finalProfit = estimatedUserPayment - physicalCardCost
    const finalProfitRate = finalProfit / totalRevenue // 対売上利益率
    
    const isProfit30Percent = finalProfitRate >= parameters.target_profit_rate
    
    return {
      gacha_id: gacha.id,
      gacha_name: gacha.name,
      price_per_pull: pricePerPull,
      total_revenue: totalRevenue,
      actual_return_rate: parameters.actual_return_rate,
      expected_return_amount: expectedReturnAmount,
      physical_card_cost: physicalCardCost,
      gross_profit: grossProfit,
      profit_rate: profitRate,
      fractional_charge_effect: parameters.fractional_charge_rate,
      estimated_user_payment: estimatedUserPayment,
      final_profit: finalProfit,
      final_profit_rate: finalProfitRate,
      is_profitable: finalProfit > 0,
      needs_adjustment: !isProfit30Percent
    }
  }

  const calculateAllGacha = () => {
    const calcs = gachaProducts.map(gacha => calculateDopaProfit(gacha))
    setCalculations(calcs)
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
          <span className="text-gray-900">DOPA式利益計算</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">DOPA式利益計算ツール</h1>
        <p className="text-gray-600 mt-2">
          実質還元率70%、体感還元率97%、端数課金効果を考慮した利益計算
        </p>
      </div>

      {/* パラメータ設定 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">計算パラメータ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              実質還元率
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={parameters.actual_return_rate}
              onChange={(e) => setParameters({...parameters, actual_return_rate: Number(e.target.value)})}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">ポイント還元率（例: 0.70 = 70%）</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カード原価率
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={parameters.physical_card_cost_ratio}
              onChange={(e) => setParameters({...parameters, physical_card_cost_ratio: Number(e.target.value)})}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">売上に対するカード原価（例: 0.05 = 5%）</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              端数課金率
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={parameters.fractional_charge_rate}
              onChange={(e) => setParameters({...parameters, fractional_charge_rate: Number(e.target.value)})}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">実際の課金額率（例: 0.70 = 70%）</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目標利益率
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={parameters.target_profit_rate}
              onChange={(e) => setParameters({...parameters, target_profit_rate: Number(e.target.value)})}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">最低利益率（例: 0.30 = 30%）</p>
          </div>
        </div>
      </div>

      {/* 計算結果一覧 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">ガチャ別利益計算結果</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ガチャ名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  単価
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  総売上
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  実課金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カード原価
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  利益
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  利益率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状態
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calculations.map((calc) => (
                <tr key={calc.gacha_id} className={calc.needs_adjustment ? 'bg-red-50' : 'bg-green-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{calc.gacha_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calc.price_per_pull.toLocaleString()}P
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(calc.total_revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(calc.estimated_user_payment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(calc.physical_card_cost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(calc.final_profit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${calc.final_profit_rate >= parameters.target_profit_rate ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(calc.final_profit_rate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      calc.needs_adjustment 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {calc.needs_adjustment ? '要調整' : '適正'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 詳細解説 */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">DOPA式計算ロジック説明</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p><strong>実質還元率70%:</strong> ガチャで当たったポイント還元カードの合計 ÷ 使用ポイント</p>
          <p><strong>端数課金効果:</strong> 1,980P、5,600P等の中途半端な数字により、実際の課金額は表面売上の約70%</p>
          <p><strong>カード原価:</strong> 物理カード（当たり枠）の発送コスト。売上の約5%程度</p>
          <p><strong>最終利益計算:</strong> 実課金額 - カード原価 = 最終利益</p>
          <p><strong>目標:</strong> 運営側で最低30%以上の利益率を確保</p>
        </div>
      </div>

      {/* アクション */}
      <div className="flex justify-between items-center">
        <Link
          href="/admin/gacha"
          className="text-blue-600 hover:text-blue-700"
        >
          ← ガチャ管理に戻る
        </Link>
        
        <button
          onClick={calculateAllGacha}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          再計算
        </button>
      </div>
    </div>
  )
}