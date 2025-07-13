'use client'

import { useState, useEffect } from 'react'

interface TopCard {
  id: string
  name: string
  set_name: string
  rarity: string
  current_price: number
  previous_price: number
  change_percentage: number
  last_updated: string
}

export default function TopCardsPricePage() {
  const [topCards, setTopCards] = useState<TopCard[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTopCards()
  }, [])

  const fetchTopCards = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/top-cards-price')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTopCards(data.cards || [])
      } else {
        setError(data.error || 'データの取得に失敗しました')
      }
    } catch (error) {
      console.error('Error fetching top cards:', error)
      setError('データの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePrices = async () => {
    setUpdating(true)
    try {
      const response = await fetch('/api/admin/top-cards-price/update', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        await fetchTopCards()
      } else {
        setError(data.error || '価格更新に失敗しました')
      }
    } catch (error) {
      console.error('Error updating prices:', error)
      setError('価格更新中にエラーが発生しました')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>エラー: {error}</p>
          <button 
            onClick={fetchTopCards}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">トップカード価格管理</h1>
        <button
          onClick={handleUpdatePrices}
          disabled={updating}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          {updating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              更新中...
            </>
          ) : (
            '価格更新'
          )}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            高額カード価格一覧 ({topCards.length}件)
          </h3>
        </div>
        <div className="p-6">
          {topCards.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">データがありません</p>
              <button 
                onClick={fetchTopCards}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                再読み込み
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      カード名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品コード
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      レアリティ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      現在価格
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      前回価格
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      変動率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最終更新
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topCards.map((card, index) => (
                    <tr key={card.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {card.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {card.set_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          card.rarity === 'SS' ? 'bg-red-100 text-red-800' : 
                          card.rarity === 'S' ? 'bg-yellow-100 text-yellow-800' : 
                          card.rarity === 'A' ? 'bg-blue-100 text-blue-800' :
                          card.rarity === 'B' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {card.rarity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ¥{card.current_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ¥{card.previous_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          card.change_percentage > 0 ? 'bg-green-100 text-green-800' : 
                          card.change_percentage < 0 ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {card.change_percentage > 0 ? '+' : ''}{card.change_percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(card.last_updated).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}