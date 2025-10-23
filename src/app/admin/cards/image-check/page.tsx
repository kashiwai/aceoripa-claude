'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Card {
  id: string
  card_name: string
  product_code: string
  image_url: string
  rarity: string
  market_price: number
  created_at: string
}

export default function ImageCheckPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    rarity: 'all',
    hasImage: 'all',
    search: ''
  })
  const [stats, setStats] = useState({
    total: 0,
    withImages: 0,
    withoutImages: 0,
    byRarity: {} as Record<string, number>
  })

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('pokemon_cards')
        .select('id, card_name, product_code, image_url, rarity, market_price, created_at')
        .order('created_at', { ascending: false })
        .limit(1000)

      if (error) throw error

      if (data) {
        setCards(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (cards: Card[]) => {
    const total = cards.length
    const withImages = cards.filter(c =>
      c.image_url &&
      !c.image_url.includes('/images/ngcard.jpg') &&
      c.image_url.includes('supabase.co')
    ).length
    const withoutImages = total - withImages

    const byRarity: Record<string, number> = {}
    cards.forEach(card => {
      byRarity[card.rarity] = (byRarity[card.rarity] || 0) + 1
    })

    setStats({ total, withImages, withoutImages, byRarity })
  }

  const filteredCards = cards.filter(card => {
    // レアリティフィルター
    if (filter.rarity !== 'all' && card.rarity !== filter.rarity) {
      return false
    }

    // 画像有無フィルター
    if (filter.hasImage !== 'all') {
      const hasImage = card.image_url &&
        !card.image_url.includes('/images/ngcard.jpg') &&
        card.image_url.includes('supabase.co')

      if (filter.hasImage === 'yes' && !hasImage) return false
      if (filter.hasImage === 'no' && hasImage) return false
    }

    // 検索フィルター
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      return (
        card.card_name.toLowerCase().includes(searchLower) ||
        card.product_code.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/images/ngcard.jpg'
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/admin/cards" className="hover:text-gray-700">
            カード管理
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">画像確認</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">カード画像確認</h1>
        <p className="text-sm text-gray-600 mt-1">
          データベースに登録されているカードと画像の状況を確認できます
        </p>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">総カード数</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <div className="text-sm text-green-600">画像あり</div>
          <div className="text-2xl font-bold text-green-700">{stats.withImages}</div>
          <div className="text-xs text-green-600">
            {stats.total > 0 ? ((stats.withImages / stats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <div className="text-sm text-red-600">画像なし</div>
          <div className="text-2xl font-bold text-red-700">{stats.withoutImages}</div>
          <div className="text-xs text-red-600">
            {stats.total > 0 ? ((stats.withoutImages / stats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <div className="text-sm text-blue-600">レアリティ種類</div>
          <div className="text-2xl font-bold text-blue-700">
            {Object.keys(stats.byRarity).length}
          </div>
          <div className="text-xs text-blue-600">
            {Object.entries(stats.byRarity).map(([rarity, count]) => (
              <div key={rarity}>{rarity}: {count}</div>
            )).slice(0, 2)}
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              レアリティ
            </label>
            <select
              value={filter.rarity}
              onChange={(e) => setFilter({ ...filter, rarity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">すべて</option>
              {Object.keys(stats.byRarity).map(rarity => (
                <option key={rarity} value={rarity}>{rarity}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              画像状態
            </label>
            <select
              value={filter.hasImage}
              onChange={(e) => setFilter({ ...filter, hasImage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">すべて</option>
              <option value="yes">画像あり</option>
              <option value="no">画像なし</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              検索
            </label>
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="カード名または商品コードで検索"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredCards.length}件 表示中 / {cards.length}件
          </div>
          <button
            onClick={() => setFilter({ rarity: 'all', hasImage: 'all', search: '' })}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            フィルターをリセット
          </button>
        </div>
      </div>

      {/* カード一覧 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCards.map((card) => {
            const hasImage = card.image_url &&
              !card.image_url.includes('/images/ngcard.jpg') &&
              card.image_url.includes('supabase.co')

            return (
              <div
                key={card.id}
                className={`bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow ${
                  hasImage ? 'border-2 border-green-200' : 'border-2 border-red-200'
                }`}
              >
                {/* 画像 */}
                <div className="aspect-[3/4] bg-gray-100 relative">
                  <img
                    src={card.image_url || '/images/ngcard.jpg'}
                    alt={card.card_name}
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                  {/* レアリティバッジ */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      card.rarity === 'SS' ? 'bg-yellow-400 text-yellow-900' :
                      card.rarity === 'S' ? 'bg-purple-400 text-purple-900' :
                      card.rarity === 'A' ? 'bg-blue-400 text-blue-900' :
                      card.rarity === 'B' ? 'bg-green-400 text-green-900' :
                      'bg-gray-400 text-gray-900'
                    }`}>
                      {card.rarity}
                    </span>
                  </div>
                  {/* 画像状態バッジ */}
                  <div className="absolute top-2 left-2">
                    {hasImage ? (
                      <span className="px-2 py-1 text-xs font-bold bg-green-500 text-white rounded">
                        ✓
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded">
                        ✗
                      </span>
                    )}
                  </div>
                </div>

                {/* カード情報 */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                    {card.card_name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-1">
                    {card.product_code}
                  </p>
                  <p className="text-xs font-semibold text-blue-600">
                    ¥{card.market_price.toLocaleString()}
                  </p>

                  {/* 画像URL */}
                  {card.image_url && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <a
                        href={card.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-700 break-all"
                      >
                        画像を開く →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {filteredCards.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">該当するカードが見つかりませんでした</p>
        </div>
      )}
    </div>
  )
}
