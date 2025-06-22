'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Card {
  id: string
  name: string
  rarity: string
  imageUrl: string
  description?: string
  probability?: number
}

interface GachaProduct {
  id: string
  name: string
  description: string
  imageUrl: string
  price: number
  remaining?: number
  total?: number
  status?: string
}

const RARITY_ORDER = ['SSR', 'SR', 'R', 'N']
const RARITY_LABELS: { [key: string]: string } = {
  'SSR': 'SSR賞',
  'SR': 'SR賞', 
  'R': 'R賞',
  'N': 'N賞'
}

const RARITY_COLORS: { [key: string]: string } = {
  'SSR': 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500',
  'SR': 'bg-gradient-to-r from-purple-400 to-pink-400',
  'R': 'bg-gradient-to-r from-blue-400 to-cyan-400',
  'N': 'bg-gradient-to-r from-gray-400 to-gray-500'
}

export default function GachaDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const gachaId = params.id as string
  const countParam = searchParams.get('count')
  
  const [gacha, setGacha] = useState<GachaProduct | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [customCount, setCustomCount] = useState('')

  // ダミーデータを設定（実際のAPIが整うまで）
  useEffect(() => {
    // ダミーのガチャ情報
    const dummyGacha: GachaProduct = {
      id: gachaId,
      name: 'ポケモンカード151オリパ',
      description: '151番限定の激レアカードが出現！\nリザードンexやミュウexなど豪華ラインナップ！',
      imageUrl: '/images/ポケモンカード151オリパ.png',
      price: 800,
      remaining: 1100,
      total: 3000,
      status: 'active'
    }

    // ダミーのカード情報
    const dummyCards: Card[] = [
      // SSR (3%)
      { id: '1', name: 'リザードンex', rarity: 'SSR', imageUrl: '/api/placeholder/400/400?text=リザードンex', probability: 1 },
      { id: '2', name: 'ミュウex', rarity: 'SSR', imageUrl: '/api/placeholder/400/400?text=ミュウex', probability: 1 },
      { id: '3', name: 'ピカチュウex', rarity: 'SSR', imageUrl: '/api/placeholder/400/400?text=ピカチュウex', probability: 1 },
      // SR (12%)
      { id: '4', name: 'フシギバナex', rarity: 'SR', imageUrl: '/api/placeholder/400/400?text=フシギバナex', probability: 3 },
      { id: '5', name: 'カメックスex', rarity: 'SR', imageUrl: '/api/placeholder/400/400?text=カメックスex', probability: 3 },
      { id: '6', name: 'フリーザーex', rarity: 'SR', imageUrl: '/api/placeholder/400/400?text=フリーザーex', probability: 3 },
      { id: '7', name: 'サンダーex', rarity: 'SR', imageUrl: '/api/placeholder/400/400?text=サンダーex', probability: 3 },
      // R (25%)
      { id: '8', name: 'ニドクイン', rarity: 'R', imageUrl: '/api/placeholder/400/400?text=ニドクイン', probability: 5 },
      { id: '9', name: 'ニドキング', rarity: 'R', imageUrl: '/api/placeholder/400/400?text=ニドキング', probability: 5 },
      { id: '10', name: 'ゴルダック', rarity: 'R', imageUrl: '/api/placeholder/400/400?text=ゴルダック', probability: 5 },
      { id: '11', name: 'ウインディ', rarity: 'R', imageUrl: '/api/placeholder/400/400?text=ウインディ', probability: 5 },
      { id: '12', name: 'アラカザム', rarity: 'R', imageUrl: '/api/placeholder/400/400?text=アラカザム', probability: 5 },
      // N (60%)
      { id: '13', name: 'フシギダネ', rarity: 'N', imageUrl: '/api/placeholder/400/400?text=フシギダネ', probability: 10 },
      { id: '14', name: 'ヒトカゲ', rarity: 'N', imageUrl: '/api/placeholder/400/400?text=ヒトカゲ', probability: 10 },
      { id: '15', name: 'ゼニガメ', rarity: 'N', imageUrl: '/api/placeholder/400/400?text=ゼニガメ', probability: 10 },
      { id: '16', name: 'ピカチュウ', rarity: 'N', imageUrl: '/api/placeholder/400/400?text=ピカチュウ', probability: 10 },
      { id: '17', name: 'ニャース', rarity: 'N', imageUrl: '/api/placeholder/400/400?text=ニャース', probability: 10 },
      { id: '18', name: 'コダック', rarity: 'N', imageUrl: '/api/placeholder/400/400?text=コダック', probability: 10 },
    ]

    setGacha(dummyGacha)
    setCards(dummyCards)
    setLoading(false)
  }, [gachaId])

  // カードをレアリティ別にグループ化
  const cardsByRarity = cards.reduce((acc, card) => {
    const rarity = card.rarity.toUpperCase()
    if (!acc[rarity]) acc[rarity] = []
    acc[rarity].push(card)
    return acc
  }, {} as { [key: string]: Card[] })

  const handleGacha = (count: number) => {
    // ガチャ実行ページへ遷移
    router.push(`/gacha/${gachaId}/play?count=${count}`)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 border-8 border-[#FF0033] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl font-bold text-[#FF0033]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* ヘッダー（DOPAスタイル） */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-[#FF0033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="text-[#FF0033] hover:text-[#FF6B6B] transition">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="ml-4 text-3xl font-black text-[#FF0033]">
                {gacha?.name || 'ガチャ詳細'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">残り</span>
              <span className="text-2xl font-black text-[#FF0033]">
                {gacha?.remaining?.toLocaleString() || '???'}枚
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツエリア */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：ガチャ画像と購入ボタン（固定） */}
          <div className="lg:sticky lg:top-28 lg:h-fit">
            {/* ガチャ画像 */}
            <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden shadow-2xl mb-6">
              <Image
                src={gacha?.imageUrl || '/api/placeholder/800/800'}
                alt={gacha?.name || 'ガチャ'}
                fill
                className="object-cover"
                unoptimized
              />
              {/* プログレスバー */}
              {gacha && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
                  <div className="relative w-full h-8 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] transition-all duration-500"
                      style={{ width: `${((gacha.remaining || 0) / (gacha.total || 1)) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {Math.round(((gacha.remaining || 0) / (gacha.total || 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 価格表示 */}
            <div className="text-center mb-6">
              <p className="text-gray-400 text-lg">1回</p>
              <p className="text-5xl font-black text-[#FF0033]">¥{gacha?.price || '???'}</p>
            </div>

            {/* 購入ボタン（DOPAスタイル） */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleGacha(1)}
                  className="bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white font-black py-4 rounded-xl hover:scale-105 transform transition shadow-lg text-xl"
                >
                  1回
                </button>
                <button
                  onClick={() => handleGacha(5)}
                  className="bg-gradient-to-r from-[#00C853] to-[#00E676] text-white font-black py-4 rounded-xl hover:scale-105 transform transition shadow-lg text-xl"
                >
                  5回
                </button>
                <button
                  onClick={() => handleGacha(10)}
                  className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white font-black py-4 rounded-xl hover:scale-105 transform transition shadow-lg text-xl relative overflow-hidden"
                >
                  <span className="relative z-10">10連</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </button>
              </div>
              
              {/* カスタム回数入力 */}
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  max="999"
                  placeholder="回数を入力"
                  value={customCount}
                  onChange={(e) => setCustomCount(e.target.value)}
                  className="flex-1 px-4 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-center text-xl font-bold focus:border-[#FF0033] focus:outline-none"
                />
                <button
                  onClick={() => {
                    const count = parseInt(customCount)
                    if (count && count > 0) {
                      handleGacha(count)
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black py-4 rounded-xl hover:scale-105 transform transition shadow-lg text-xl"
                >
                  指定数ガチャ
                </button>
              </div>
            </div>

            {/* ガチャ説明 */}
            <div className="mt-6 bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">ガチャ詳細</h3>
              <p className="text-gray-300 whitespace-pre-line">
                {gacha?.description || 'このガチャの説明文です。'}
              </p>
            </div>
          </div>

          {/* 右側：カード一覧（スクロール可能） */}
          <div className="space-y-8">
            <h2 className="text-3xl font-black text-white text-center mb-8">
              排出カードラインナップ
            </h2>
            
            {RARITY_ORDER.map((rarity) => {
              const rarityCards = cardsByRarity[rarity]
              if (!rarityCards || rarityCards.length === 0) return null
              
              // 確率計算
              const totalProbability = rarityCards.reduce((sum, card) => sum + (card.probability || 0), 0)

              return (
                <div key={rarity} className="space-y-4">
                  {/* レアリティヘッダー */}
                  <div className={`${RARITY_COLORS[rarity]} p-4 rounded-xl shadow-lg`}>
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-black text-white drop-shadow-lg">
                        {RARITY_LABELS[rarity]}
                      </h3>
                      <span className="text-xl font-bold text-white bg-black/30 px-4 py-2 rounded-full">
                        {totalProbability}%
                      </span>
                    </div>
                  </div>
                  
                  {/* カードグリッド */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {rarityCards.map((card) => (
                      <div
                        key={card.id}
                        className="group relative bg-gray-900 rounded-lg overflow-hidden hover:ring-4 hover:ring-white/50 transition-all duration-200 hover:scale-105"
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={card.imageUrl}
                            alt={card.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {/* ホバー時のオーバーレイ */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                              <p className="text-xs font-bold text-white text-center">
                                {card.probability}%
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-2 bg-gray-800">
                          <p className="text-xs font-semibold text-white text-center truncate">
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
        </div>
      </div>
    </div>
  )
}