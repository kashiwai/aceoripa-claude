'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  
  // フォールバックデータを初期値として設定
  const fallbackGacha: GachaProduct = {
    id: gachaId,
    name: 'ピカチュウ大祭り',
    description: 'ピカチュウの特別なカードが大量出現！\nSSR確率アップ中！',
    imageUrl: '/images/banners/real-gacha/S__44392515_0.jpg',
    price: 150,
    remaining: 850,
    total: 1000,
    status: 'active'
  }

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

  const [gacha, setGacha] = useState<GachaProduct | null>(fallbackGacha)
  const [cards, setCards] = useState<Card[]>(fallbackCards)
  const [loading, setLoading] = useState(false)
  const [customCount, setCustomCount] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedCount, setSelectedCount] = useState(1)
  
  // const { user } = useAuth()
  const user = null // 一時的にnullに設定

  // APIからガチャ情報とカード情報を取得
  useEffect(() => {
    const fetchGachaData = async () => {
      try {
        // ガチャ商品情報を取得
        const productResponse = await fetch(`/api/gacha/products/${gachaId}`)
        if (productResponse.ok) {
          const productData = await productResponse.json()
          if (productData.success && productData.product) {
            setGacha(productData.product)
          }
        }
        
        // カードプール情報を取得
        const poolResponse = await fetch(`/api/gacha/products/${gachaId}/pool`)
        if (poolResponse.ok) {
          const poolData = await poolResponse.json()
          if (poolData.success && poolData.cards) {
            setCards(poolData.cards)
          }
        }
      } catch (error) {
        console.error('Error fetching gacha data:', error)
        // 既に初期値でfallbackデータが設定されているので何もしない
      }
      setLoading(false)
    }
    
    // 強制的にローディングを解除（1秒後）
    const timeoutId = setTimeout(() => {
      setLoading(false)
    }, 1000)

    fetchGachaData().then(() => {
      clearTimeout(timeoutId)
    })

    return () => clearTimeout(timeoutId)
  }, [gachaId])

  // カードをレアリティ別にグループ化（B, C, Dを"その他"にまとめる）
  const cardsByRarity = cards.reduce((acc, card) => {
    const rarity = card.rarity.toUpperCase()
    const groupedRarity = ['B', 'C', 'D'].includes(rarity) ? 'OTHER' : rarity
    if (!acc[groupedRarity]) acc[groupedRarity] = []
    acc[groupedRarity].push(card)
    return acc
  }, {} as { [key: string]: Card[] })

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
                  className="bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white font-black py-4 rounded-xl hover:scale-105 transform transition shadow-lg text-xl relative group"
                >
                  <span className="block">1回</span>
                  <span className="text-xs opacity-80">¥{gacha?.price || 800}</span>
                </button>
                <button
                  onClick={() => handleGacha(5)}
                  className="bg-gradient-to-r from-[#00C853] to-[#00E676] text-white font-black py-4 rounded-xl hover:scale-105 transform transition shadow-lg text-xl relative group"
                >
                  <span className="block">5回</span>
                  <span className="text-xs opacity-80">¥{(gacha?.price || 800) * 5}</span>
                </button>
                <button
                  onClick={() => handleGacha(10)}
                  className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white font-black py-4 rounded-xl hover:scale-105 transform transition shadow-lg text-xl relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    <span className="block">10連</span>
                    <span className="text-xs opacity-80">¥{(gacha?.price || 800) * 10}</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  <div className="absolute top-0 right-0 bg-red-500 text-xs px-2 py-1 rounded-bl-lg font-bold">SR確定</div>
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
            
            {/* 期待値計算 */}
            <div className="mt-4 bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                🔥 激アツ期待値計算 🔥
              </h3>
              
              {/* 10回引きの期待値 */}
              <div className="bg-black/40 rounded-lg p-4 mb-4">
                <div className="text-center mb-3">
                  <h4 className="text-lg font-black text-yellow-400 mb-1">🎯 10回ガチャの期待値</h4>
                  <p className="text-sm text-gray-300">数学的に計算された確率</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gradient-to-r from-yellow-400/20 to-red-500/20 rounded">
                    <span className="font-bold text-yellow-400">SS賞獲得確率</span>
                    <span className="text-white font-black text-lg">約87%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded">
                    <span className="font-bold text-purple-400">S賞以上確率</span>
                    <span className="text-white font-black text-lg">99.7%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded">
                    <span className="font-bold text-blue-400">A賞以上確率</span>
                    <span className="text-white font-black text-lg">100%</span>
                  </div>
                </div>
              </div>

              {/* 50回引きの期待値 */}
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg p-4 border border-red-400/30">
                <div className="text-center mb-3">
                  <h4 className="text-lg font-black text-red-400 mb-1">💎 50回で激レア確定級！</h4>
                  <p className="text-sm text-gray-300">統計学的に99%以上の確率</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-black/30 rounded-lg">
                    <p className="text-2xl font-black text-yellow-400">4-6枚</p>
                    <p className="text-xs text-yellow-300">SS賞期待獲得数</p>
                  </div>
                  <div className="text-center p-3 bg-black/30 rounded-lg">
                    <p className="text-2xl font-black text-purple-400">15-20枚</p>
                    <p className="text-xs text-purple-300">S賞期待獲得数</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 右側：カード一覧（スクロール可能） */}
          <div className="space-y-8">
            <h2 className="text-3xl font-black text-white text-center mb-8">
              ゲットできるカード一覧
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
                        {rarityCards.length}種類
                      </span>
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
  )
}