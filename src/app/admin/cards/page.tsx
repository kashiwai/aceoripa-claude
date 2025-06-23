'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Card {
  id: string
  card_name: string
  product_code: string
  rarity: string
  image_url: string
  market_price: number
  description?: string
  created_at: string
}

const RARITY_LABELS = {
  'SS': 'SS賞',
  'S': 'S賞', 
  'A': 'A賞',
  'B': 'B賞',
  'C': 'C賞'
}

const RARITY_COLORS = {
  'SS': 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500',
  'S': 'bg-gradient-to-r from-purple-400 to-pink-400',
  'A': 'bg-gradient-to-r from-blue-400 to-cyan-400',
  'B': 'bg-gradient-to-r from-green-400 to-emerald-400',
  'C': 'bg-gradient-to-r from-gray-400 to-gray-500'
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('')
  
  const supabase = createClientComponentClient()

  const fetchCards = async () => {
    try {
      let query = supabase
        .from('pokemon_cards')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter) {
        query = query.ilike('card_name', `%${filter}%`)
      }
      
      if (rarityFilter) {
        query = query.eq('rarity', rarityFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setCards(data || [])
    } catch (error) {
      console.error('Error fetching cards:', error)
      toast.error('カード一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCards()
  }, [filter, rarityFilter])

  const deleteCard = async (id: string) => {
    if (!confirm('このカードを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('pokemon_cards')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('カードを削除しました')
      fetchCards()
    } catch (error) {
      console.error('Error deleting card:', error)
      toast.error('カードの削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">カード管理</h1>
          <div className="flex gap-2">
            <Link
              href="/admin/cards/import"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              CSVインポート
            </Link>
            <Link
              href="/admin/cards/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              新規カード追加
            </Link>
          </div>
        </div>

        {/* フィルター */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="カード名で検索..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm"
            />
          </div>
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="border-gray-300 rounded-lg shadow-sm"
          >
            <option value="">全てのレアリティ</option>
            <option value="SS">SS賞</option>
            <option value="S">S賞</option>
            <option value="A">A賞</option>
            <option value="B">B賞</option>
            <option value="C">C賞</option>
          </select>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">総カード数</p>
            <p className="text-2xl font-bold text-gray-800">{cards.length}</p>
          </div>
          {Object.keys(RARITY_LABELS).map(rarity => {
            const count = cards.filter(card => card.rarity === rarity).length
            return (
              <div key={rarity} className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">{RARITY_LABELS[rarity as keyof typeof RARITY_LABELS]}</p>
                <p className="text-2xl font-bold text-gray-800">{count}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* カード一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* カード画像 */}
            <div className="relative aspect-[2/3] bg-gray-100">
              <Image
                src={card.image_url || '/images/ngcard.jpg'}
                alt={card.card_name}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/ngcard.jpg'
                }}
              />
              {/* レアリティバッジ */}
              <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold text-white ${RARITY_COLORS[card.rarity as keyof typeof RARITY_COLORS]}`}>
                {RARITY_LABELS[card.rarity as keyof typeof RARITY_LABELS]}
              </div>
            </div>

            {/* カード情報 */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2 truncate">
                {card.card_name}
              </h3>
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p>商品コード: {card.product_code}</p>
                <p className="font-semibold text-lg text-green-600">
                  ¥{card.market_price?.toLocaleString() || '0'}
                </p>
              </div>

              {/* アクション */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/cards/${card.id}/edit`}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-center text-sm flex items-center justify-center gap-1"
                >
                  <PencilIcon className="w-4 h-4" />
                  編集
                </Link>
                <button
                  onClick={() => deleteCard(card.id)}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm flex items-center justify-center"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">カードがありません</h3>
          <p className="text-gray-500 mb-4">新しいカードを追加してください</p>
          <Link
            href="/admin/cards/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            新規カード追加
          </Link>
        </div>
      )}
    </div>
  )
}