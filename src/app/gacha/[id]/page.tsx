'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import FreeGachaButton from '@/components/gacha/FreeGachaButton'
// import PointConfirmDialog from '@/components/ui/PointConfirmDialog'
// import { useAuth } from '@/hooks/useAuth'

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

const RARITY_ORDER = ['SS', 'S', 'A', 'OTHER']
const RARITY_LABELS: { [key: string]: string } = {
  'SS': 'SS賞',
  'S': 'S賞', 
  'A': 'A賞',
  'B': 'B賞',
  'C': 'C賞',
  'OTHER': '🎉 その他のワクワクカード'
}

const RARITY_COLORS: { [key: string]: string } = {
  'SS': 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500',
  'S': 'bg-gradient-to-r from-purple-400 to-pink-400',
  'A': 'bg-gradient-to-r from-blue-400 to-cyan-400',
  'B': 'bg-gradient-to-r from-green-400 to-emerald-400',
  'C': 'bg-gradient-to-r from-gray-400 to-gray-500',
  'OTHER': 'bg-gradient-to-r from-green-400 via-blue-400 to-purple-400'
}

export default function GachaDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const gachaId = params.id as string
  const countParam = searchParams.get('count')
  
  // 初期状態はnullにして、データ読み込み後に表示
  const [gacha, setGacha] = useState<GachaProduct | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  const fallbackCards: Card[] = [
    // SS賞
    { id: '1', name: 'マリオピカチュウ PSA10', rarity: 'SS', imageUrl: '/images/pokemon/008_マリオピカチュウ PSA10_PK-0008.jpg', probability: 1 },
    { id: '2', name: 'ポンチョを着たピカチュウ(黒リザ) PSA10', rarity: 'SS', imageUrl: '/images/pokemon/010_ポンチョを着たピカチュウ(黒リザ) PSA10_PK-0010.jpg', probability: 1 },
    // S賞
    { id: '3', name: 'アセロラ(エクバ) PSA10', rarity: 'S', imageUrl: '/images/pokemon/003_アセロラ(エクバ) PSA10_PK-0003.jpg', probability: 4 },
    { id: '4', name: 'ブルーの探索 PSA10', rarity: 'S', imageUrl: '/images/pokemon/185_ブルーの探索 PSA10_PK-0187.jpg', probability: 4 },
    { id: '5', name: 'ブラッキーex PSA10', rarity: 'S', imageUrl: '/images/pokemon/197_ブラッキーex PSA10_PK-0199.jpg', probability: 4 },
    // A賞
    { id: '6', name: 'ポンチョを着たピカチュウ(リザ) PSA10', rarity: 'A', imageUrl: '/images/pokemon/016_ポンチョを着たピカチュウ(リザ) PSA10_PK-0016.jpg', probability: 5 },
    { id: '7', name: 'アローラの仲間たち PSA10', rarity: 'A', imageUrl: '/images/pokemon/032_アローラの仲間たち PSA10_PK-0032.jpg', probability: 5 },
    { id: '8', name: 'おじょうさま PSA10', rarity: 'A', imageUrl: '/images/pokemon/204_おじょうさま PSA10_PK-0206.jpg', probability: 5 },
    // B賞
    { id: '9', name: 'アセロラ（エクバ）', rarity: 'B', imageUrl: '/images/pokemon/009_アセロラ（エクバ）_PK-0009.jpg', probability: 10 },
    { id: '10', name: 'アセロラ', rarity: 'B', imageUrl: '/images/pokemon/028_アセロラ_PK-0028.jpg', probability: 10 },
    { id: '11', name: 'アローラの仲間たち', rarity: 'B', imageUrl: '/images/pokemon/061_アローラの仲間たち_PK-0061.jpg', probability: 10 },
    // C賞
    { id: '12', name: 'ポンチョを着たピカチュウ(ロコン)', rarity: 'C', imageUrl: '/images/pokemon/151_ポンチョを着たピカチュウ(ロコン)_PK-0153.jpg', probability: 15 },
    { id: '13', name: 'ブルーの探索', rarity: 'C', imageUrl: '/images/pokemon/248_ブルーの探索_PK-0251.jpg', probability: 15 },
    { id: '14', name: 'THE BEST OF XY 1BOX', rarity: 'C', imageUrl: '/images/pokemon/034_THE BEST OF XY 1BOX_PK-0034.jpg', probability: 15 },
  ]

  const [customCount, setCustomCount] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedCount, setSelectedCount] = useState(1)
  
  // const { user } = useAuth()
  const user = null // 一時的にnullに設定

  // APIからガチャ情報とカード情報を取得
  useEffect(() => {
    const fetchGachaData = async () => {
      setLoading(true)
      try {
        // ガチャ商品情報を取得
        const productResponse = await fetch(`/api/gacha/products/${gachaId}`)
        if (productResponse.ok) {
          const productData = await productResponse.json()
          if (productData.success && productData.product) {
            setGacha(productData.product)
          } else {
            console.error('Failed to fetch gacha product:', productData.error)
            setGacha(null)
          }
        }
        
        // カードプール情報を取得
        const poolResponse = await fetch(`/api/gacha/products/${gachaId}/pool`)
        if (poolResponse.ok) {
          const poolData = await poolResponse.json()
          if (poolData.success && poolData.cards) {
            setCards(poolData.cards)
          } else {
            console.error('Failed to fetch card pool:', poolData.error)
            setCards([])
          }
        } else {
          console.error('Pool fetch failed with status:', poolResponse.status)
          setCards([])
        }
      } catch (error) {
        console.error('Error fetching gacha data:', error)
        setGacha(null)
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    fetchGachaData()
  }, [gachaId])

  // カードをレアリティ別にグループ化（B, C, Dを"その他"にまとめる）
  const cardsByRarity = cards.reduce((acc, card) => {
    const rarity = card.rarity.toUpperCase()
    const groupedRarity = ['B', 'C', 'D'].includes(rarity) ? 'OTHER' : rarity
    if (!acc[groupedRarity]) acc[groupedRarity] = []
    acc[groupedRarity].push(card)
    return acc
  }, {} as { [key: string]: Card[] })
  
  // レアリティごとの確率を計算
  const rarityProbabilities = Object.entries(cardsByRarity).reduce((acc, [rarity, cards]) => {
    const totalProbability = cards.reduce((sum, card) => sum + (card.probability || 1), 0)
    acc[rarity] = totalProbability
    return acc
  }, {} as { [key: string]: number })

  const handleGacha = (count: number) => {
    // 一時的に認証チェックを無効化
    // if (!user) {
    //   // ログインしていない場合はログインページへ
    //   router.push('/login')
    //   return
    // }
    
    // 直接ガチャ実行ページへ遷移（デモ用）
    router.push(`/gacha/${gachaId}/play?count=${count}`)
  }
  
  const handleConfirmGacha = () => {
    // ガチャ実行ページへ遷移
    router.push(`/gacha/${gachaId}/play?count=${selectedCount}`)
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
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes progressPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-progress-pulse {
          animation: progressPulse 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="min-h-screen bg-[#1a1a1a]">
      {/* ヘッダー（DOPAスタイル） */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-[#FF0033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-28 sm:h-24">
            <div className="flex items-center">
              <Link href="/" className="text-[#FF0033] hover:text-[#FF6B6B] transition">
                <svg className="w-9 h-9 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
            </div>
            <div className="flex-1 text-center px-4">
              <h1 className="text-2xl sm:text-4xl font-black text-[#FF0033] truncate">
                {gacha?.name || 'ガチャ詳細'}
              </h1>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <span className="text-sm sm:text-base text-gray-600">残り</span>
              <span className="text-xl sm:text-2xl font-black text-[#FF0033]">
                {gacha?.remaining_packs?.toLocaleString() || '???'}枚
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツエリア */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* 左側：ガチャ画像と購入ボタン（固定） */}
          <div className="lg:sticky lg:top-28 lg:h-fit">
            {/* ガチャ画像 */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl mb-4 sm:mb-6">
              <div className="relative aspect-square">
                {gacha?.imageUrl ? (
                  <Image
                    src={gacha.imageUrl}
                    alt={gacha.name}
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 border-4 border-gray-600 border-t-[#FF0033] rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {/* プログレスバーを画像の下に配置 */}
              {gacha && (
                <div className="bg-black/90 p-3 sm:p-4">
                  <div className="relative w-full h-10 sm:h-12 bg-gray-800 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF0033] via-[#FF4444] to-[#FF6B6B] transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, ((gacha.remaining_packs || 0) / Math.max(1, gacha.total_packs || 1)) * 100))}%`,
                        animation: 'pulse 2s infinite'
                      }}
                    >
                      {/* 光る効果 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                    </div>
                    
                    {/* パーセンテージ表示 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-black text-base sm:text-lg drop-shadow-lg">
                        {Math.round(Math.max(0, Math.min(100, ((gacha.remaining_packs || 0) / Math.max(1, gacha.total_packs || 1)) * 100)))}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-center">
                    <span className="text-white text-sm sm:text-base font-bold">
                      残り <span className="text-[#FF0033] text-base sm:text-lg">{(gacha.remaining_packs || 0).toLocaleString()}</span> / {(gacha.total_packs || 0).toLocaleString()} パック
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 価格表示 */}
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-gray-400 text-lg sm:text-xl">1回</p>
              <p className="text-4xl sm:text-5xl font-black text-[#FF0033]">¥{gacha?.price || '???'}</p>
            </div>

            {/* 無料ガチャボタン */}
            <FreeGachaButton gachaId={gachaId} className="w-full mb-4" />

            {/* 購入ボタン（DOPAスタイル） */}
            <div className="space-y-4 sm:space-y-3">
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <button
                  onClick={() => handleGacha(1)}
                  className="bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white font-black py-4 sm:py-5 rounded-xl hover:scale-105 transform transition shadow-lg text-lg sm:text-xl relative group"
                >
                  <span className="block">1回</span>
                  <span className="text-xs sm:text-sm opacity-80">¥{gacha?.price || 800}</span>
                </button>
                <button
                  onClick={() => handleGacha(5)}
                  className="bg-gradient-to-r from-[#00C853] to-[#00E676] text-white font-black py-4 sm:py-5 rounded-xl hover:scale-105 transform transition shadow-lg text-lg sm:text-xl relative group"
                >
                  <span className="block">5回</span>
                  <span className="text-xs sm:text-sm opacity-80">¥{(gacha?.price || 800) * 5}</span>
                </button>
                <button
                  onClick={() => handleGacha(10)}
                  className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white font-black py-4 sm:py-5 rounded-xl hover:scale-105 transform transition shadow-lg text-lg sm:text-xl relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    <span className="block">10連</span>
                    <span className="text-xs sm:text-sm opacity-80">¥{(gacha?.price || 800) * 10}</span>
                  </span>
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
                  className="flex-1 px-3 sm:px-4 py-3 sm:py-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-center text-lg sm:text-xl font-bold focus:border-[#FF0033] focus:outline-none"
                />
                <button
                  onClick={() => {
                    const count = parseInt(customCount)
                    if (count && count > 0) {
                      handleGacha(count)
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black py-3 sm:py-4 rounded-xl hover:scale-105 transform transition shadow-lg text-lg sm:text-xl"
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
            
            {/* 期待値計算 - よりリアルな表示 */}
            <div className="mt-4 bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-4 sm:p-6 border border-purple-500/30">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                確率・期待値情報
              </h3>
              
              {/* レアリティ別出現確率 */}
              <div className="bg-black/40 rounded-lg p-3 sm:p-4 mb-4">
                <h4 className="text-base sm:text-lg font-bold text-yellow-400 mb-3">📊 レアリティ別出現確率</h4>
                <div className="space-y-2">
                  {Object.entries(rarityProbabilities).map(([rarity, probability]) => {
                    if (probability <= 0) return null
                    const label = RARITY_LABELS[rarity]
                    const color = rarity === 'SS' ? 'yellow' : rarity === 'S' ? 'purple' : rarity === 'A' ? 'blue' : 'green'
                    
                    return (
                      <div key={rarity} className="flex items-center justify-between">
                        <span className={`text-${color}-400 font-semibold text-sm sm:text-base`}>{label}</span>
                        <div className="flex items-center">
                          <div className="w-20 sm:w-24 bg-gray-700 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 bg-${color}-500 rounded-full`}
                              style={{ width: `${Math.min(100, probability)}%` }}
                            />
                          </div>
                          <span className="text-white font-bold text-sm sm:text-base min-w-[50px] text-right">
                            {probability.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* チャレンジ回数別の期待値 */}
              <div className="bg-black/40 rounded-lg p-3 sm:p-4">
                <h4 className="text-base sm:text-lg font-bold text-orange-400 mb-3">🎯 チャレンジ確率目安</h4>
                
                {/* SS・S賞の獲得確率 */}
                <div className="space-y-3">
                  {rarityProbabilities['SS'] > 0 && (
                    <div className="bg-yellow-500/10 p-3 rounded-lg">
                      <p className="text-yellow-400 font-bold text-sm sm:text-base mb-2">SS賞を引く確率</p>
                      <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                        <div className="text-center">
                          <p className="text-white font-bold">{((1 - Math.pow(1 - rarityProbabilities['SS'] / 100, 10)) * 100).toFixed(1)}%</p>
                          <p className="text-gray-400">10回で</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold">{((1 - Math.pow(1 - rarityProbabilities['SS'] / 100, 50)) * 100).toFixed(1)}%</p>
                          <p className="text-gray-400">50回で</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold">{((1 - Math.pow(1 - rarityProbabilities['SS'] / 100, 100)) * 100).toFixed(1)}%</p>
                          <p className="text-gray-400">100回で</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {((rarityProbabilities['SS'] || 0) + (rarityProbabilities['S'] || 0)) > 0 && (
                    <div className="bg-purple-500/10 p-3 rounded-lg">
                      <p className="text-purple-400 font-bold text-sm sm:text-base mb-2">S賞以上を引く確率</p>
                      <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                        <div className="text-center">
                          <p className="text-white font-bold">{((1 - Math.pow(1 - ((rarityProbabilities['SS'] || 0) + (rarityProbabilities['S'] || 0)) / 100, 10)) * 100).toFixed(1)}%</p>
                          <p className="text-gray-400">10回で</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold">{((1 - Math.pow(1 - ((rarityProbabilities['SS'] || 0) + (rarityProbabilities['S'] || 0)) / 100, 30)) * 100).toFixed(1)}%</p>
                          <p className="text-gray-400">30回で</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold">{((1 - Math.pow(1 - ((rarityProbabilities['SS'] || 0) + (rarityProbabilities['S'] || 0)) / 100, 50)) * 100).toFixed(1)}%</p>
                          <p className="text-gray-400">50回で</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 注意事項 */}
                <div className="mt-3 p-2 bg-gray-800 rounded text-xs sm:text-sm text-gray-300">
                  <p>※ 確率は理論値です。実際の結果とは異なる場合があります。</p>
                  <p>※ 各レアリティのカードは在庫がなくなり次第終了となります。</p>
                </div>
              </div>

            </div>
          </div>

          {/* 右側：カード一覧（スクロール可能） */}
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-6 sm:mb-8">
              ゲットできるカード一覧
            </h2>
            
            {RARITY_ORDER.map((rarity) => {
              const rarityCards = cardsByRarity[rarity]
              if (!rarityCards || rarityCards.length === 0) return null
              
              // 確率計算（0の場合は表示しない）
              const totalProbability = rarityCards.reduce((sum, card) => sum + (card.probability || 0), 0)
              
              // 確率が0の場合はこのレアリティを表示しない
              if (totalProbability <= 0) return null

              return (
                <div key={rarity} className="space-y-4">
                  {/* レアリティヘッダー */}
                  <div className={`${RARITY_COLORS[rarity]} p-4 rounded-xl shadow-lg`}>
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-black text-white drop-shadow-lg">
                        {RARITY_LABELS[rarity]}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-white bg-black/30 px-4 py-2 rounded-full">
                          {rarityCards.length}種類
                        </span>
                        {rarityProbabilities[rarity] && (
                          <span className="text-xl font-bold text-white bg-black/30 px-4 py-2 rounded-full">
                            {rarityProbabilities[rarity].toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* カードグリッド */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {(rarity === 'OTHER' ? rarityCards.slice(0, 6) : rarityCards).map((card) => (
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
                                {rarity === 'OTHER' ? '🎉 ワクワク' : '🎯 激レア'}
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
                  
                  {/* OTHERカテゴリの場合、追加説明を表示 */}
                  {rarity === 'OTHER' && rarityCards.length > 6 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-400/30 rounded-lg">
                      <p className="text-center text-white">
                        <span className="text-lg font-bold">✨ これ以外にも同じレベルのカードが多数あります ✨</span><br/>
                        <span className="text-sm mt-2 block">
                          上記は一部のカードを抜粋して表示しています。<br/>
                          実際のガチャでは、この他にも魅力的なカードの中から<br/>
                          ランダムに1枚を付与いたします。
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* ポイント確認ダイアログ */}
      {/* <PointConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmGacha}
        productName={gacha?.name || ''}
        count={selectedCount}
        price={gacha?.price || 800}
        totalCost={(gacha?.price || 800) * selectedCount}
      /> */}
      </div>
    </>
  )
}