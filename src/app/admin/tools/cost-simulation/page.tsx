'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CardData {
  name: string
  rarity: string
  price: number
  count: number
}

interface GachaData {
  name: string
  banner: string
  totalCards: number
  averageCost: number
  totalValue: number
  cards: CardData[]
}

const GACHA_SIMULATIONS: GachaData[] = [
  {
    name: 'ピカチュウ大祭り',
    banner: 'S__44392515_0.jpg',
    totalCards: 50,
    averageCost: 0,
    totalValue: 0,
    cards: [
      { name: 'ポンチョを着たピカチュウ(黒リザ) PSA10', rarity: 'SS', price: 50000, count: 1 },
      { name: 'ニンフィアGX PSA10', rarity: 'SS', price: 35000, count: 1 },
      { name: 'ポンチョを着たピカチュウ(黒レックウザ) PSA10', rarity: 'SS', price: 48000, count: 1 },
      { name: 'ナンジャモ PSA10（SAR）', rarity: 'SS', price: 40000, count: 1 },
      { name: 'ポンチョを着たピカチュウ(レックウザ) PSA10', rarity: 'SS', price: 45000, count: 1 },
      { name: 'コイキングごっこピカチュウ PSA10', rarity: 'SS', price: 38000, count: 1 },
      { name: 'ギャラドスごっこピカチュウ PSA10', rarity: 'SS', price: 42000, count: 1 },
      { name: 'セレナ PSA10', rarity: 'SS', price: 25000, count: 1 },
      { name: 'その他Sカード平均', rarity: 'S', price: 5500, count: 12 },
      { name: 'その他Aカード平均', rarity: 'A', price: 2200, count: 10 },
      { name: 'その他Bカード平均', rarity: 'B', price: 900, count: 10 },
      { name: 'その他Cカード平均', rarity: 'C', price: 200, count: 10 }
    ]
  },
  {
    name: 'ナンジャモ大量発生オリパ',
    banner: 'S__44392516_0.jpg',
    totalCards: 56,
    averageCost: 0,
    totalValue: 0,
    cards: [
      { name: 'ナンジャモ SAR PSA10', rarity: 'SS', price: 80000, count: 1 },
      { name: 'ナンジャモSR PSA10', rarity: 'SS', price: 45000, count: 1 },
      { name: 'サナ SR PSA10', rarity: 'SS', price: 38000, count: 1 },
      { name: 'クララSR PSA10', rarity: 'SS', price: 35000, count: 1 },
      { name: 'カトレアSR PSA10', rarity: 'SS', price: 32000, count: 1 },
      { name: 'エリカの招待SR PSA10', rarity: 'SS', price: 30000, count: 1 },
      { name: 'その他Sカード平均', rarity: 'S', price: 6500, count: 10 },
      { name: 'その他Aカード平均', rarity: 'A', price: 5500, count: 10 },
      { name: 'その他Bカード平均', rarity: 'B', price: 2000, count: 10 },
      { name: 'その他Cカード平均', rarity: 'C', price: 400, count: 10 },
      { name: 'その他Dカード平均', rarity: 'D', price: 60, count: 10 }
    ]
  },
  {
    name: 'リザードン祭盤 炎のプレミアオリパ',
    banner: 'S__44392517_0.jpg',
    totalCards: 59,
    averageCost: 0,
    totalValue: 0,
    cards: [
      { name: 'リザードンVMAX(HR仕様) PSA10', rarity: 'SS', price: 120000, count: 1 },
      { name: 'ブラッキーGX HR PSA10', rarity: 'SS', price: 95000, count: 1 },
      { name: 'ナンジャモのハラバリーex PSA10', rarity: 'SS', price: 85000, count: 1 },
      { name: 'ホワイトコレクション 1パック', rarity: 'SS', price: 75000, count: 1 },
      { name: 'オリジンパルキアV(SA)', rarity: 'SS', price: 65000, count: 1 },
      { name: 'イーブイ（SM8b）', rarity: 'SS', price: 55000, count: 1 },
      { name: 'その他Sカード平均', rarity: 'S', price: 18000, count: 18 },
      { name: 'その他Aカード平均', rarity: 'A', price: 3500, count: 13 },
      { name: 'その他Bカード平均', rarity: 'B', price: 1600, count: 12 },
      { name: 'その他Cカード平均', rarity: 'C', price: 180, count: 10 }
    ]
  },
  {
    name: 'ブラッキー超感謝祭',
    banner: 'S__44392521_0.jpg',
    totalCards: 55,
    averageCost: 0,
    totalValue: 0,
    cards: [
      { name: 'ブラッキーVMAX PSA10（PROMO）', rarity: 'SS', price: 150000, count: 1 },
      { name: 'ルチアのアピール PSA10', rarity: 'SS', price: 85000, count: 1 },
      { name: 'ミュウex SAR', rarity: 'SS', price: 75000, count: 1 },
      { name: '霧の水晶 UR', rarity: 'SS', price: 65000, count: 1 },
      { name: 'ムゲンゾーン パック', rarity: 'SS', price: 55000, count: 1 },
      { name: 'その他Sカード平均', rarity: 'S', price: 25000, count: 10 },
      { name: 'その他Aカード平均', rarity: 'A', price: 8500, count: 15 },
      { name: 'その他Bカード平均', rarity: 'B', price: 2500, count: 13 },
      { name: 'その他Cカード平均', rarity: 'C', price: 900, count: 12 }
    ]
  },
  {
    name: 'リーリエ×マリオピカチュウ 超豪華オリパ',
    banner: 'S__44392523_0.jpg',
    totalCards: 58,
    averageCost: 0,
    totalValue: 0,
    cards: [
      { name: 'リーリエ PSA10', rarity: 'SS', price: 200000, count: 1 },
      { name: 'コイキング&ホエルオーGX PSA10', rarity: 'SS', price: 150000, count: 1 },
      { name: 'ホワイトコレクション 1パック', rarity: 'SS', price: 120000, count: 1 },
      { name: 'ピカチュウex（UR）', rarity: 'SS', price: 100000, count: 1 },
      { name: 'ひかるコイキング(25th)', rarity: 'SS', price: 80000, count: 1 },
      { name: 'その他Sカード平均', rarity: 'S', price: 35000, count: 15 },
      { name: 'その他Aカード平均', rarity: 'A', price: 8500, count: 15 },
      { name: 'その他Bカード平均', rarity: 'B', price: 4500, count: 9 },
      { name: 'その他Cカード平均', rarity: 'C', price: 1600, count: 9 }
    ]
  }
]

export default function CostSimulationPage() {
  const [selectedGacha, setSelectedGacha] = useState<GachaData>(GACHA_SIMULATIONS[0])
  const [singlePrice, setSinglePrice] = useState(150)
  const [multiPrice, setMultiPrice] = useState(1500)
  const [totalStock, setTotalStock] = useState(1000)
  const [costPercentage, setCostPercentage] = useState(0.7) // 原価率70%
  
  const [simulation, setSimulation] = useState({
    totalRevenue: 0,
    totalCost: 0,
    averageCost: 0,
    profit: 0,
    profitRate: 0,
    ssGuaranteeActive: false,
    recommendedSinglePrice: 0,
    recommendedMultiPrice: 0
  })

  // 平均原価計算
  useEffect(() => {
    const totalValue = selectedGacha.cards.reduce((sum, card) => sum + (card.price * card.count), 0)
    const totalCards = selectedGacha.cards.reduce((sum, card) => sum + card.count, 0)
    const averageCost = totalValue / totalCards

    setSimulation(prev => ({ ...prev, averageCost }))
  }, [selectedGacha])

  // シミュレーション計算
  useEffect(() => {
    const totalRevenue = singlePrice * totalStock
    const totalCost = simulation.averageCost * totalStock * costPercentage
    const profit = totalRevenue - totalCost
    const profitRate = totalRevenue > 0 ? profit / totalRevenue : 0
    const ssGuaranteeActive = profitRate <= 0.2 // 利益率20%以下でSS確定

    // 推奨価格計算（利益率30%確保）
    const targetProfitRate = 0.3
    const recommendedSinglePrice = Math.ceil((simulation.averageCost * costPercentage) / (1 - targetProfitRate))
    const recommendedMultiPrice = recommendedSinglePrice * 10 * 0.9 // 10%割引

    setSimulation(prev => ({
      ...prev,
      totalRevenue,
      totalCost,
      profit,
      profitRate,
      ssGuaranteeActive,
      recommendedSinglePrice,
      recommendedMultiPrice
    }))
  }, [singlePrice, totalStock, simulation.averageCost, costPercentage])

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/admin" className="hover:text-gray-700">
            管理画面
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">原価計算シミュレーション</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">ガチャ原価計算シミュレーション</h1>
        <p className="text-gray-600 mt-1">リアルガチャの原価と利益率をシミュレーションします</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左側：設定パネル */}
        <div className="space-y-6">
          {/* ガチャ選択 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">ガチャ選択</h2>
            <select
              value={selectedGacha.name}
              onChange={(e) => setSelectedGacha(GACHA_SIMULATIONS.find(g => g.name === e.target.value) || GACHA_SIMULATIONS[0])}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {GACHA_SIMULATIONS.map((gacha) => (
                <option key={gacha.name} value={gacha.name}>
                  {gacha.name} ({gacha.totalCards}枚)
                </option>
              ))}
            </select>
            
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">平均カード価値</p>
              <p className="text-xl font-bold text-gray-800">{formatPrice(simulation.averageCost)}</p>
            </div>
          </div>

          {/* 価格設定 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">価格設定</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  単発価格（ポイント）
                </label>
                <input
                  type="number"
                  value={singlePrice}
                  onChange={(e) => setSinglePrice(Number(e.target.value))}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  10連価格（ポイント）
                </label>
                <input
                  type="number"
                  value={multiPrice}
                  onChange={(e) => setMultiPrice(Number(e.target.value))}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  総販売数
                </label>
                <select
                  value={totalStock}
                  onChange={(e) => setTotalStock(Number(e.target.value))}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value={500}>500回</option>
                  <option value={1000}>1,000回</option>
                  <option value={3000}>3,000回</option>
                  <option value={5000}>5,000回</option>
                  <option value={10000}>10,000回</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  原価率 ({(costPercentage * 100).toFixed(0)}%)
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.05"
                  value={costPercentage}
                  onChange={(e) => setCostPercentage(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>30%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 中央：シミュレーション結果 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 収益シミュレーション */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">収益シミュレーション</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">総売上</p>
                <p className="text-2xl font-bold text-blue-800">{formatPrice(simulation.totalRevenue)}</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">総原価</p>
                <p className="text-2xl font-bold text-red-800">{formatPrice(simulation.totalCost)}</p>
              </div>
              
              <div className={`p-4 rounded-lg ${simulation.profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-sm ${simulation.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>利益</p>
                <p className={`text-2xl font-bold ${simulation.profit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                  {formatPrice(simulation.profit)}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${simulation.profitRate >= 0.2 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <p className={`text-sm ${simulation.profitRate >= 0.2 ? 'text-green-600' : 'text-yellow-600'}`}>利益率</p>
                <p className={`text-2xl font-bold ${simulation.profitRate >= 0.2 ? 'text-green-800' : 'text-yellow-800'}`}>
                  {(simulation.profitRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {simulation.ssGuaranteeActive && (
              <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm text-yellow-800 font-semibold">
                    利益率が20%以下のため、SS賞確定システムが作動します
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 推奨価格 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">推奨価格（利益率30%確保）</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">推奨単発価格</p>
                <p className="text-xl font-bold text-green-800">{simulation.recommendedSinglePrice}pt</p>
                <p className="text-xs text-green-600 mt-1">
                  現在: {singlePrice}pt 
                  {singlePrice < simulation.recommendedSinglePrice ? 
                    ` (${simulation.recommendedSinglePrice - singlePrice}pt 不足)` : 
                    ` (+${singlePrice - simulation.recommendedSinglePrice}pt)`
                  }
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">推奨10連価格</p>
                <p className="text-xl font-bold text-green-800">{simulation.recommendedMultiPrice}pt</p>
                <p className="text-xs text-green-600 mt-1">
                  現在: {multiPrice}pt
                  {multiPrice < simulation.recommendedMultiPrice ? 
                    ` (${simulation.recommendedMultiPrice - multiPrice}pt 不足)` : 
                    ` (+${multiPrice - simulation.recommendedMultiPrice}pt)`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* カード構成 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">カード構成</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">カード名</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">レアリティ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">価格</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">枚数</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">合計価値</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedGacha.cards.map((card, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">{card.name}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          card.rarity === 'SS' ? 'bg-yellow-100 text-yellow-800' :
                          card.rarity === 'S' ? 'bg-purple-100 text-purple-800' :
                          card.rarity === 'A' ? 'bg-blue-100 text-blue-800' :
                          card.rarity === 'B' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {card.rarity}賞
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{formatPrice(card.price)}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{card.count}枚</td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                        {formatPrice(card.price * card.count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}