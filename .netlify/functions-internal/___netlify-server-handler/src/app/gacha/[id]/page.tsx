'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Card {
  id: string
  name: string
  rarity: string
  imageUrl: string
  description?: string
}

interface GachaProduct {
  id: string
  name: string
  description: string
  imageUrl: string
  price: number
}

const RARITY_ORDER = ['SS', 'S', 'A', 'B', 'C']
const RARITY_LABELS: { [key: string]: string } = {
  'SS': 'SS賞',
  'S': 'S賞',
  'A': 'A賞',
  'B': 'B賞',
  'C': 'C賞'
}

export default function GachaDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const gachaId = params.id as string
  const countParam = searchParams.get('count')
  
  const [gacha, setGacha] = useState<GachaProduct | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [customCount, setCustomCount] = useState(1)

  useEffect(() => {
    fetchGachaDetails()
  }, [gachaId])

  const fetchGachaDetails = async () => {
    try {
      // ガチャ情報を取得
      const gachaResponse = await fetch(`/api/gacha/products/${gachaId}`)
      const gachaData = await gachaResponse.json()
      setGacha(gachaData.product)

      // カード一覧を取得（実際はガチャに紐づくカードを取得）
      const cardsResponse = await fetch('/api/cards')
      const cardsData = await cardsResponse.json()
      setCards(cardsData.cards || [])
    } catch (error) {
      console.error('Failed to fetch gacha details:', error)
    } finally {
      setLoading(false)
    }
  }

  // カードをレアリティ別にグループ化
  const cardsByRarity = cards.reduce((acc, card) => {
    const rarity = card.rarity.toUpperCase()
    if (!acc[rarity]) acc[rarity] = []
    acc[rarity].push(card)
    return acc
  }, {} as { [key: string]: Card[] })

  const handleGacha = (count: number) => {
    // ガチャ実行処理
    console.log(`${count}回ガチャを実行`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                ← 戻る
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {gacha?.name || 'ガチャ詳細'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* ガチャ画像と固定ボタン */}
      <div className="sticky top-16 bg-white shadow-lg z-40">
        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-square">
            <Image
              src={gacha?.imageUrl || '/api/placeholder/1024/1024'}
              alt={gacha?.name || 'ガチャ'}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4 bg-white">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleGacha(1)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition"
              >
                1回
              </button>
              <button
                onClick={() => handleGacha(5)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition"
              >
                5回
              </button>
              <button
                onClick={() => handleGacha(10)}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition"
              >
                10回
              </button>
              <button
                onClick={() => {
                  const count = prompt('回数を入力してください', '1')
                  if (count && !isNaN(Number(count)) && Number(count) > 0) {
                    handleGacha(Number(count))
                  }
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition"
              >
                好きな数だけ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* カード一覧 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {RARITY_ORDER.map((rarity) => {
            const rarityCards = cardsByRarity[rarity]
            if (!rarityCards || rarityCards.length === 0) return null

            return (
              <div key={rarity} className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 text-center">
                  {RARITY_LABELS[rarity]}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {rarityCards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={card.imageUrl || '/api/placeholder/400/400'}
                          alt={card.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {card.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* 説明文 */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ガチャ詳細
          </h3>
          <p className="text-gray-700 whitespace-pre-line">
            {gacha?.description || 'このガチャの説明文です。'}
          </p>
        </div>
      </main>
    </div>
  )
}