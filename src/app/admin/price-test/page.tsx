'use client'

import { useState } from 'react'

interface ScrapingResult {
  success: boolean
  cardName: string
  productCode?: string
  realScraping?: any
  mockScraping?: any
  analysis?: any
  recommendation?: string
  errors?: string[]
  timestamp: string
}

export default function PriceTestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ScrapingResult | null>(null)
  const [cardName, setCardName] = useState('リーリエ')
  const [productCode, setProductCode] = useState('PROMO')

  const testPriceScraping = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/test-scraping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cardName,
          productCode: productCode || undefined
        })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Test error:', error)
      setResult({
        success: false,
        cardName,
        productCode,
        timestamp: new Date().toISOString(),
        errors: [`Network error: ${error.message}`]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testSpecificCard = (name: string, code?: string) => {
    setCardName(name)
    setProductCode(code || '')
    setTimeout(() => testPriceScraping(), 100)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🔍 カード価格スクレイピングテスト
        </h1>
        
        {/* テスト実行フォーム */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">テスト設定</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カード名
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: リーリエ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品コード（任意）
              </label>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: PROMO"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={testPriceScraping}
                disabled={isLoading || !cardName}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '実行中...' : '価格テスト実行'}
              </button>
            </div>
          </div>
          
          {/* クイックテストボタン */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => testSpecificCard('リーリエ', 'PROMO')}
              disabled={isLoading}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
            >
              リーリエをテスト
            </button>
            <button
              onClick={() => testSpecificCard('マリオピカチュウ', 'PROMO')}
              disabled={isLoading}
              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
            >
              マリオピカチュウをテスト
            </button>
            <button
              onClick={() => testSpecificCard('ポンチョを着たピカチュウ')}
              disabled={isLoading}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
            >
              ポンチョピカチュウをテスト
            </button>
          </div>
        </div>

        {/* ローディング表示 */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">価格データを取得中...</p>
          </div>
        )}

        {/* 結果表示 */}
        {result && (
          <div className="space-y-6">
            {/* 概要 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                テスト結果概要
              </h3>
              <p className="text-blue-700">
                カード: <strong>{result.cardName}</strong>
                {result.productCode && ` (${result.productCode})`}
              </p>
              <p className="text-blue-700">
                実行時刻: {new Date(result.timestamp).toLocaleString('ja-JP')}
              </p>
              {result.recommendation && (
                <p className="mt-2 font-medium text-blue-800">
                  {result.recommendation}
                </p>
              )}
            </div>

            {/* エラー表示 */}
            {result.errors && result.errors.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  エラー
                </h3>
                {result.errors.map((error, index) => (
                  <p key={index} className="text-red-700">
                    • {error}
                  </p>
                ))}
              </div>
            )}

            {/* 実際のスクレイピング結果 */}
            {result.realScraping && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  📡 実際のスクレイピング結果
                </h3>
                {result.realScraping.success ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-white rounded shadow">
                        <p className="text-2xl font-bold text-green-600">
                          ¥{result.realScraping.averagePrice?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">平均価格</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded shadow">
                        <p className="text-xl font-semibold text-blue-600">
                          ¥{result.realScraping.minPrice?.toLocaleString()} 〜 ¥{result.realScraping.maxPrice?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">価格帯</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded shadow">
                        <p className="text-xl font-semibold text-purple-600">
                          {result.realScraping.pricesFound}件
                        </p>
                        <p className="text-sm text-gray-600">取得価格数</p>
                      </div>
                    </div>
                    
                    {/* 詳細価格データ */}
                    {result.realScraping.sources && result.realScraping.sources.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2">取得した価格詳細:</h4>
                        <div className="grid gap-2">
                          {result.realScraping.sources.map((source: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                              <span className="font-medium">{source.source}</span>
                              <span className="text-green-600 font-semibold">
                                ¥{source.price?.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-500">
                                {source.condition}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-red-600">
                    失敗: {result.realScraping.error}
                  </p>
                )}
              </div>
            )}

            {/* モックデータ結果 */}
            {result.mockScraping && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                  🎭 モックデータ結果（比較用）
                </h3>
                {result.mockScraping.success ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white rounded shadow">
                      <p className="text-2xl font-bold text-yellow-600">
                        ¥{result.mockScraping.averagePrice?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">平均価格</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded shadow">
                      <p className="text-xl font-semibold text-blue-600">
                        ¥{result.mockScraping.minPrice?.toLocaleString()} 〜 ¥{result.mockScraping.maxPrice?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">価格帯</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded shadow">
                      <p className="text-xl font-semibold text-purple-600">
                        {result.mockScraping.pricesFound}件
                      </p>
                      <p className="text-sm text-gray-600">取得価格数</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-600">
                    失敗: {result.mockScraping.error}
                  </p>
                )}
              </div>
            )}

            {/* 価格比較分析 */}
            {result.analysis?.priceComparison && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-4">
                  📊 価格比較分析
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-purple-700">
                      実際のスクレイピング: <strong>¥{result.analysis.priceComparison.realAverage?.toLocaleString()}</strong>
                    </p>
                    <p className="text-purple-700">
                      モックデータ: <strong>¥{result.analysis.priceComparison.mockAverage?.toLocaleString()}</strong>
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-700">
                      価格差: <strong>¥{result.analysis.priceComparison.difference?.toLocaleString()}</strong>
                    </p>
                    <p className="text-purple-700">
                      差異率: <strong>{result.analysis.priceComparison.differencePercentage}%</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}