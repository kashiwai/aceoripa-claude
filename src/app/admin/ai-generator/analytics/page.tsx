'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import {
  ChartBarIcon,
  CurrencyYenIcon,
  ClockIcon,
  SparklesIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

// 分析期間の選択肢
const PERIOD_OPTIONS = [
  { id: '7d', label: '過去7日間' },
  { id: '30d', label: '過去30日間' },
  { id: '90d', label: '過去90日間' },
  { id: 'all', label: '全期間' }
]

// ダミーデータ（実際はAPIから取得）
const DUMMY_STATS = {
  totalGenerations: 342,
  totalCost: 12450,
  averageTime: 8.5,
  successRate: 94.2,
  byType: {
    gachaBanner: { count: 89, cost: 3560, avgTime: 5.2 },
    cardImage: { count: 156, cost: 4680, avgTime: 7.8 },
    effectVideo: { count: 67, cost: 3350, avgTime: 15.3 },
    '3dModel': { count: 30, cost: 860, avgTime: 12.1 }
  },
  popularPrompts: [
    { prompt: 'ピカチュウex ウルトラレア', count: 23, successRate: 95.7 },
    { prompt: 'ステラミラクル 宇宙背景', count: 18, successRate: 88.9 },
    { prompt: 'ホログラムカード キラ効果', count: 15, successRate: 93.3 },
    { prompt: '伝説のポケモン プレミアム', count: 12, successRate: 91.7 }
  ],
  conversionRates: {
    gachaBanner: { views: 1234, clicks: 567, purchases: 89, rate: 7.2 },
    cardImage: { views: 2345, clicks: 890, purchases: 234, rate: 10.0 },
    effectVideo: { views: 890, clicks: 456, purchases: 123, rate: 13.8 }
  },
  hourlyDistribution: [
    { hour: 0, count: 5 },
    { hour: 1, count: 3 },
    { hour: 2, count: 2 },
    { hour: 3, count: 1 },
    { hour: 4, count: 1 },
    { hour: 5, count: 2 },
    { hour: 6, count: 8 },
    { hour: 7, count: 12 },
    { hour: 8, count: 18 },
    { hour: 9, count: 23 },
    { hour: 10, count: 25 },
    { hour: 11, count: 22 },
    { hour: 12, count: 15 },
    { hour: 13, count: 19 },
    { hour: 14, count: 24 },
    { hour: 15, count: 28 },
    { hour: 16, count: 26 },
    { hour: 17, count: 22 },
    { hour: 18, count: 20 },
    { hour: 19, count: 18 },
    { hour: 20, count: 15 },
    { hour: 21, count: 12 },
    { hour: 22, count: 9 },
    { hour: 23, count: 7 }
  ]
}

export default function AIAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState(DUMMY_STATS)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    // 実際はここでデータを取得
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [selectedPeriod])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getChangeIndicator = (value: number) => {
    if (value > 0) {
      return (
        <span className="flex items-center text-green-600 text-sm">
          <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
          +{value}%
        </span>
      )
    } else if (value < 0) {
      return (
        <span className="flex items-center text-red-600 text-sm">
          <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
          {value}%
        </span>
      )
    }
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/admin" className="hover:text-gray-700">
            管理画面
          </Link>
          <span className="mx-2">/</span>
          <Link href="/admin/ai-generator" className="hover:text-gray-700">
            AI生成管理
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">AI分析ダッシュボード</span>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">AI生成分析</h1>
          
          {/* 期間選択 */}
          <div className="flex gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedPeriod(option.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === option.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <>
          {/* 概要カード */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <SparklesIcon className="w-8 h-8 text-purple-600" />
                {getChangeIndicator(12.5)}
              </div>
              <p className="text-gray-600 text-sm">総生成数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGenerations}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <CurrencyYenIcon className="w-8 h-8 text-green-600" />
                {getChangeIndicator(-8.3)}
              </div>
              <p className="text-gray-600 text-sm">API使用料金</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCost)}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <ClockIcon className="w-8 h-8 text-blue-600" />
                {getChangeIndicator(-15.2)}
              </div>
              <p className="text-gray-600 text-sm">平均生成時間</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageTime}秒</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <ChartBarIcon className="w-8 h-8 text-orange-600" />
                {getChangeIndicator(2.1)}
              </div>
              <p className="text-gray-600 text-sm">成功率</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
            </div>
          </div>

          {/* タイプ別統計 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">タイプ別生成統計</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium">ガチャバナー</p>
                    <p className="text-sm text-gray-600">
                      {stats.byType.gachaBanner.count}回 / {formatCurrency(stats.byType.gachaBanner.cost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">平均時間</p>
                    <p className="font-medium">{stats.byType.gachaBanner.avgTime}秒</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">カード画像</p>
                    <p className="text-sm text-gray-600">
                      {stats.byType.cardImage.count}回 / {formatCurrency(stats.byType.cardImage.cost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">平均時間</p>
                    <p className="font-medium">{stats.byType.cardImage.avgTime}秒</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">演出動画</p>
                    <p className="text-sm text-gray-600">
                      {stats.byType.effectVideo.count}回 / {formatCurrency(stats.byType.effectVideo.cost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">平均時間</p>
                    <p className="font-medium">{stats.byType.effectVideo.avgTime}秒</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium">3Dモデル</p>
                    <p className="text-sm text-gray-600">
                      {stats.byType['3dModel'].count}回 / {formatCurrency(stats.byType['3dModel'].cost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">平均時間</p>
                    <p className="font-medium">{stats.byType['3dModel'].avgTime}秒</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 人気プロンプト */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FireIcon className="w-5 h-5 text-red-500 mr-2" />
                人気のプロンプト
              </h2>
              <div className="space-y-3">
                {stats.popularPrompts.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.prompt}</p>
                      <p className="text-xs text-gray-600">使用回数: {item.count}回</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${
                        item.successRate >= 90 ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        成功率 {item.successRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* コンバージョン率 */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">コンテンツ別コンバージョン率</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">ガチャバナー</p>
                <div className="relative w-32 h-32 mx-auto mb-2">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56 * stats.conversionRates.gachaBanner.rate / 100} ${2 * Math.PI * 56}`}
                      className="text-purple-600"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{stats.conversionRates.gachaBanner.rate}%</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>表示: {stats.conversionRates.gachaBanner.views}</p>
                  <p>クリック: {stats.conversionRates.gachaBanner.clicks}</p>
                  <p>購入: {stats.conversionRates.gachaBanner.purchases}</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-600 mb-2">カード画像</p>
                <div className="relative w-32 h-32 mx-auto mb-2">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56 * stats.conversionRates.cardImage.rate / 100} ${2 * Math.PI * 56}`}
                      className="text-blue-600"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{stats.conversionRates.cardImage.rate}%</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>表示: {stats.conversionRates.cardImage.views}</p>
                  <p>クリック: {stats.conversionRates.cardImage.clicks}</p>
                  <p>購入: {stats.conversionRates.cardImage.purchases}</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-600 mb-2">演出動画</p>
                <div className="relative w-32 h-32 mx-auto mb-2">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56 * stats.conversionRates.effectVideo.rate / 100} ${2 * Math.PI * 56}`}
                      className="text-green-600"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{stats.conversionRates.effectVideo.rate}%</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>表示: {stats.conversionRates.effectVideo.views}</p>
                  <p>クリック: {stats.conversionRates.effectVideo.clicks}</p>
                  <p>購入: {stats.conversionRates.effectVideo.purchases}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 時間別分布 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">時間別生成数</h2>
            <div className="h-64 flex items-end justify-between gap-1">
              {stats.hourlyDistribution.map((data) => {
                const maxCount = Math.max(...stats.hourlyDistribution.map(d => d.count))
                const height = (data.count / maxCount) * 100
                return (
                  <div key={data.hour} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                      style={{ height: `${height}%` }}
                      title={`${data.hour}時: ${data.count}回`}
                    />
                    <span className="text-xs text-gray-600 mt-1">
                      {data.hour}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* レコメンデーション */}
          <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">AIからのレコメンデーション</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">コスト最適化の提案</h3>
                <p className="text-sm opacity-90">
                  演出動画の生成頻度が高いため、バッチ処理を導入することで約20%のコスト削減が見込めます。
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">品質向上の提案</h3>
                <p className="text-sm opacity-90">
                  午前9-11時の生成成功率が最も高いため、重要なコンテンツはこの時間帯での生成を推奨します。
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}