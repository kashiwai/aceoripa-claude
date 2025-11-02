'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { AIVideoGachaAnimation } from '@/components/gacha/AIVideoGachaAnimation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { usePoints } from '@/hooks/usePoints'
import { toast } from 'react-hot-toast'

interface Card {
  id: string
  name: string
  rarity: string
  imageUrl: string
  image_url?: string  // Database field compatibility
  description?: string
}

const RARITY_COLORS: { [key: string]: string } = {
  'SS': 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500',
  'S': 'bg-gradient-to-r from-purple-400 to-pink-400',
  'A': 'bg-gradient-to-r from-blue-400 to-cyan-400',
  'B': 'bg-gradient-to-r from-green-400 to-emerald-400',
  'C': 'bg-gradient-to-r from-gray-400 to-gray-500',
  'OTHER': 'bg-gradient-to-r from-green-400 via-blue-400 to-purple-400'
}

interface GachaProduct {
  id: string
  name: string
  price: number
  imageUrl?: string
}

export default function GachaPlayPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const gachaId = params.id as string
  const count = parseInt(searchParams.get('count') || '1')

  const [isPlaying, setIsPlaying] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<Card[]>([])
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'spinning' | 'revealing' | 'celebration'>('idle')
  const [revealedCards, setRevealedCards] = useState<Card[]>([])
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0)
  const [sparkles, setSparkles] = useState<Array<{id: number, x: number, y: number}>>([])
  const [effectQueue, setEffectQueue] = useState<Card[]>([])
  const [gachaInfo, setGachaInfo] = useState<GachaProduct | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [cardPool, setCardPool] = useState<Card[]>([])
  const [showVideoAnimation, setShowVideoAnimation] = useState(false)
  const [videoAnimationCard, setVideoAnimationCard] = useState<Card | null>(null)
  const [animationVideos, setAnimationVideos] = useState<{[key: string]: {intro?: string, reveal?: string}}>({})
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const cardQueueIndexRef = useRef(0) // カードキューのインデックスを管理

  // 認証とポイント管理
  const { user, loading: authLoading } = useAuth()
  const { points, fetchPoints, hasEnoughPoints } = usePoints()
  const supabase = createClient()

  // 認証チェック
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // 未ログインの場合、ログインページへリダイレクト
        const currentUrl = window.location.pathname + window.location.search
        router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`)
        return
      }
      
      setAuthChecking(false)
    }
    
    checkAuth()
  }, [router, supabase])

  // ガチャ情報の取得
  useEffect(() => {
    const fetchGachaInfo = async () => {
      try {
        const response = await fetch(`/api/gacha/products/${gachaId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.product) {
            setGachaInfo(data.product)
          }
        }
      } catch (error) {
        console.error('Error fetching gacha info:', error)
        setGachaInfo(null)
      }
    }
    
    if (!authChecking) {
      fetchGachaInfo()
    }
  }, [gachaId, authChecking])

  // カードプール情報の取得
  useEffect(() => {
    const fetchCardPool = async () => {
      try {
        const response = await fetch(`/api/gacha/products/${gachaId}/pool`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.cards) {
            setCardPool(data.cards)
          }
        }
      } catch (error) {
        console.error('Error fetching card pool:', error)
        setCardPool([])
      }
    }

    if (!authChecking) {
      fetchCardPool()
    }
  }, [gachaId, authChecking])

  // 動画URLの取得
  useEffect(() => {
    const fetchAnimationVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('gacha_animation_library')
          .select('rarity, phase, video_url')
          .eq('is_active', true)

        if (error) {
          console.error('Error fetching animation videos:', error)
          return
        }

        if (data) {
          const videos: {[key: string]: {intro?: string, reveal?: string}} = {}
          data.forEach((item: any) => {
            if (!videos[item.rarity]) {
              videos[item.rarity] = {}
            }
            if (item.phase === 'intro') {
              videos[item.rarity].intro = item.video_url
            } else if (item.phase === 'reveal') {
              videos[item.rarity].reveal = item.video_url
            }
          })
          setAnimationVideos(videos)
          console.log('[Gacha Play] Loaded animation videos:', videos)
        }
      } catch (error) {
        console.error('Error fetching animation videos:', error)
      }
    }

    if (!authChecking) {
      fetchAnimationVideos()
    }
  }, [authChecking, supabase])

  // サンプルカードプール
  const sampleCards: Card[] = [
    { id: '1', name: 'マリオピカチュウ PSA10', rarity: 'SS', imageUrl: '/images/pokemon/008_マリオピカチュウ PSA10_PK-0008.jpg' },
    { id: '2', name: 'ポンチョを着たピカチュウ(黒リザ) PSA10', rarity: 'SS', imageUrl: '/images/pokemon/010_ポンチョを着たピカチュウ(黒リザ) PSA10_PK-0010.jpg' },
    { id: '3', name: 'アセロラ(エクバ) PSA10', rarity: 'S', imageUrl: '/images/pokemon/003_アセロラ(エクバ) PSA10_PK-0003.jpg' },
    { id: '4', name: 'ブルーの探索 PSA10', rarity: 'S', imageUrl: '/images/pokemon/185_ブルーの探索 PSA10_PK-0187.jpg' },
    { id: '5', name: 'ブラッキーex PSA10', rarity: 'S', imageUrl: '/images/pokemon/197_ブラッキーex PSA10_PK-0199.jpg' },
    { id: '6', name: 'ポンチョを着たピカチュウ(リザ) PSA10', rarity: 'A', imageUrl: '/images/pokemon/016_ポンチョを着たピカチュウ(リザ) PSA10_PK-0016.jpg' },
    { id: '7', name: 'アローラの仲間たち PSA10', rarity: 'A', imageUrl: '/images/pokemon/032_アローラの仲間たち PSA10_PK-0032.jpg' },
    { id: '8', name: 'おじょうさま PSA10', rarity: 'A', imageUrl: '/images/pokemon/204_おじょうさま PSA10_PK-0206.jpg' },
    { id: '9', name: 'アセロラ（エクバ）', rarity: 'B', imageUrl: '/images/pokemon/009_アセロラ（エクバ）_PK-0009.jpg' },
    { id: '10', name: 'アセロラ', rarity: 'B', imageUrl: '/images/pokemon/028_アセロラ_PK-0028.jpg' },
  ]

  // ガチャロジック（本番仕様）
  const executeGacha = async () => {
    // ポイントチェック
    const requiredPoints = (gachaInfo?.price || 150) * count

    if (!hasEnoughPoints(requiredPoints)) {
      toast.error(`ポイントが不足しています。必要ポイント: ${requiredPoints}`)
      // ポイント不足の場合、支払いページへリダイレクト
      router.push('/payment')
      return
    }

    setIsPlaying(true)
    setCurrentPhase('spinning')
    setRevealedCards([])
    setCurrentRevealIndex(0)

    try {
      // サーバーでガチャ実行（ポイント消費、カード抽選、DB登録）
      const response = await fetch('/api/gacha/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: gachaId,
          pullCount: count
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'ガチャ実行エラー')
      }

      const data = await response.json()
      console.log('[Gacha] Server response:', data)

      // サーバーから受け取った結果を変換
      const gachaResults: Card[] = data.results.map((result: any) => ({
        id: result.cardId,
        name: result.cardName,
        rarity: result.rarity,
        imageUrl: result.imageUrl || '/images/ngcard.jpg',
        description: result.cardName
      }))

      // フェーズ1: スピニング演出（3秒）
      setTimeout(() => {
        setCurrentPhase('revealing')
        setResults(gachaResults)

        // ポイント再取得
        fetchPoints()

        // フェーズ2: カード順次公開演出
        revealCardsSequentially(gachaResults)
      }, 3000)

    } catch (error: any) {
      console.error('[Gacha] Execute error:', error)
      toast.error(error.message || 'ガチャ実行に失敗しました')
      setIsPlaying(false)
      setCurrentPhase('idle')
    }
  }
  
  // 簡単な演出エフェクト（テスト用）
  const testEffect = () => {
    console.log('✨ テスト演出発動！')
    // 画面に少し震動エフェクト
    document.body.style.animation = 'shake 0.5s'
    setTimeout(() => {
      document.body.style.animation = ''
    }, 500)
  }
  
  // カード順次公開演出（新演出システム統合版）
  const revealCardsSequentially = (cards: Card[]) => {
    console.log('[Gacha] Starting card reveal sequence:', cards)
    console.log('[Gacha] Pull count:', count)

    // 全てのカードで動画演出を表示（5連でも1枚ずつ表示）
    console.log('[Gacha] Using video animation system for all cards')
    console.log('[Gacha] Animation videos loaded:', animationVideos)

    // カウンターをリセット
    cardQueueIndexRef.current = 0

    setEffectQueue(cards)
    processEffectQueue(cards)
  }

  // 新演出システムでのカード公開処理
  const processEffectQueue = (cards: Card[]) => {
    setCurrentCardIndex(0) // カウンター初期化

    const showNextCard = () => {
      const currentIndex = cardQueueIndexRef.current

      if (currentIndex < cards.length) {
        const currentCard = cards[currentIndex]
        setCurrentCardIndex(currentIndex + 1) // カウンター更新（表示用）
        console.log(`[Gacha] Showing card ${currentIndex + 1}/${cards.length}:`, currentCard.name)

        // 全レアリティで動画演出を表示
        setVideoAnimationCard(currentCard)
        setShowVideoAnimation(true)
      } else {
        // 全カード公開完了
        console.log('[Gacha] All cards revealed, moving to celebration')
        setTimeout(() => {
          setCurrentPhase('celebration')
          setIsPlaying(false)
          setShowResults(true)
        }, 500)
      }
    }

    showNextCard()
  }

  // 標準的なカード公開演出（低レアリティ用）
  const standardRevealSequence = (cards: Card[]) => {
    let index = 0
    const revealInterval = setInterval(() => {
      if (index < cards.length) {
        setRevealedCards(prev => [...prev, cards[index]])
        setCurrentRevealIndex(index)
        
        // 軽量な演出
        generateSparkles()
        playSound(cards[index].rarity)
        
        index++
      } else {
        clearInterval(revealInterval)
        setTimeout(() => {
          setCurrentPhase('celebration')
          setIsPlaying(false)
          setShowResults(true)
        }, 1000)
      }
    }, 800)
  }

  // 動画演出完了後の処理（カード表示完了）
  const handleVideoAnimationComplete = () => {
    if (videoAnimationCard) {
      setShowVideoAnimation(false)
      setRevealedCards(prev => [...prev, videoAnimationCard])

      // refカウンターをインクリメント
      cardQueueIndexRef.current += 1
      const nextIndex = cardQueueIndexRef.current

      console.log(`[Gacha] Card ${nextIndex}/${effectQueue.length} completed. Moving to next...`)

      // 次のカードの処理
      if (nextIndex < effectQueue.length) {
        // 次のカードを表示
        setCurrentCardIndex(nextIndex + 1)
        setTimeout(() => {
          const nextCard = effectQueue[nextIndex]
          console.log(`[Gacha] Showing next card: ${nextCard.name} (${nextIndex + 1}/${effectQueue.length})`)
          setVideoAnimationCard(nextCard)
          setShowVideoAnimation(true)
        }, 100)
      } else {
        // 最後のカード - 演出完了
        console.log('[Gacha] All cards revealed, moving to celebration')
        setTimeout(() => {
          setCurrentPhase('celebration')
          setIsPlaying(false)
          setShowResults(true)
        }, 500)
      }
    }
  }

  // スキップボタンが押された時の処理
  const handleSkipAll = () => {
    console.log('[Gacha] Skip button pressed - jumping to final results')
    // 全ての演出をスキップして最終結果画面へ移動
    setShowVideoAnimation(false)
    setShowUltimateEffect(false)
    setCurrentEffectCard(null)
    setVideoAnimationCard(null)
    setRevealedCards(results.length > 0 ? results : effectQueue)
    setCurrentPhase('celebration')
    setIsPlaying(false)
    setShowResults(true)
  }

  
  // 星エフェクト生成 (モバイル最適化)
  const generateSparkles = () => {
    const isMobile = window.innerWidth <= 768
    const sparkleCount = isMobile ? 15 : 20
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    const newSparkles = Array.from({ length: sparkleCount }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * viewportWidth * 0.9 + viewportWidth * 0.05, // 画面端を避ける
      y: isMobile ? -50 : Math.random() * viewportHeight
    }))
    setSparkles(newSparkles)
    
    // モバイルは早めに消去
    setTimeout(() => setSparkles([]), isMobile ? 2000 : 3000)
  }
  
  // 音効果再生
  const playSound = (rarity: string) => {
    try {
      // Web Audio APIを使用した簡単な音生成
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      if (rarity === 'SS') {
        // SS賞: 豪華な和音
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
      } else if (rarity === 'S') {
        // S賞: 明るい音
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // A4
        oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1) // C#5
      }
      
      oscillator.type = 'triangle'
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      // console.log('Audio not supported:', error)
    }
  }

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'SS': return { text: 'SS賞', color: 'text-yellow-400' }
      case 'S': return { text: 'S賞', color: 'text-purple-400' }
      case 'A': return { text: 'A賞', color: 'text-blue-400' }
      case 'B': case 'C': case 'D': return { text: '🎉 ワクワクカード', color: 'text-green-400' }
      default: return { text: '🎉 ワクワクカード', color: 'text-green-400' }
    }
  }

  // 認証チェック中またはローディング中の表示
  if (authChecking || authLoading) {
    return (
      <div className="fixed inset-0 bg-[#1a1a1a] z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 border-8 border-[#FF0033] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl font-bold text-[#FF0033]">認証確認中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] relative overflow-hidden">
      {/* スマホ縦向き(9:16)用のビューポート設定 */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .gacha-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .gacha-play-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 1rem;
          }
          .card-grid-mobile {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            max-width: 100%;
          }
          .card-reveal-mobile {
            aspect-ratio: 3/4;
          }
        }
        
        /* 演出アニメーション最適化 */
        @keyframes mobileShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .mobile-shake {
          animation: mobileShake 0.3s ease-in-out;
        }
        
        /* 9:16縦長画面用の星エフェクト */
        .sparkle-star-mobile {
          position: fixed;
          animation: mobileFall 2s linear forwards;
          font-size: 1.5rem;
        }
        
        @keyframes mobileFall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
      {/* ヘッダー */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-[#FF0033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href={`/gacha/${gachaId}`} className="text-[#FF0033] hover:text-[#FF6B6B] transition">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="ml-4 text-3xl font-black text-[#FF0033]">
                ガチャ実行
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-xs text-gray-600">保有ポイント</p>
                <p className="text-xl font-black text-[#FF0033]">
                  {points.total_points.toLocaleString()}P
                </p>
              </div>
              <div className="text-lg font-bold text-gray-700">
                {count}回ガチャ
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="gacha-container max-w-4xl mx-auto px-4 py-8 md:px-4 md:py-8">
        {/* ガチャ実行前 */}
        {!isPlaying && !showResults && (
          <div className="gacha-play-area text-center">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                🎰 ガチャを回す準備OK！
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mb-2">
                {count}回のガチャを実行します
              </p>
              <p className="text-base md:text-lg text-yellow-400">
                ✨ 激レアカードが出現するかも！？
              </p>
              
              {/* ポイント情報表示 */}
              <div className="mt-6 bg-gray-800 rounded-xl p-4 inline-block">
                <p className="text-gray-400 mb-2">必要ポイント</p>
                <p className="text-3xl font-black text-yellow-400">
                  {((gachaInfo?.price || 150) * count).toLocaleString()}P
                </p>
                <div className="mt-2 text-sm">
                  {hasEnoughPoints((gachaInfo?.price || 150) * count) ? (
                    <p className="text-green-400">✓ ポイント残高OK</p>
                  ) : (
                    <p className="text-red-400">✗ ポイントが不足しています</p>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={executeGacha}
              className="bg-gradient-to-r from-[#FF6600] to-[#FF0033] text-white font-black text-2xl px-12 py-6 rounded-2xl hover:scale-105 transition transform shadow-2xl"
            >
              🎲 ガチャを回す！
            </button>
          </div>
        )}

        {/* ガチャ実行中演出 */}
        {isPlaying && (
          <div className="text-center">
            {currentPhase === 'spinning' && (
              <div className="mb-8">
                <div className="relative mb-8">
                  {/* メインスピナー (モバイル最適化) */}
                  <div className="w-32 h-32 md:w-40 md:h-40 border-6 md:border-8 border-[#FF0033] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  {/* 内側のスピナー */}
                  <div className="absolute top-3 md:top-4 left-1/2 transform -translate-x-1/2 w-24 h-24 md:w-32 md:h-32 border-3 md:border-4 border-yellow-400 border-b-transparent rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>
                  {/* 中央のガチャマシン */}
                  <div className="absolute top-8 md:top-12 left-1/2 transform -translate-x-1/2 text-5xl md:text-6xl animate-bounce">
                    🎰
                  </div>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 animate-pulse">
                  ガチャ抽選中...
                </h2>
                <div className="flex justify-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-[#FF0033] rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="w-3 h-3 bg-[#FF0033] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-3 h-3 bg-[#FF0033] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
                <p className="text-lg md:text-2xl text-yellow-400 animate-pulse font-bold">
                  ✨ 激レアカードを抽選中！ ✨
                </p>
              </div>
            )}
            
            {currentPhase === 'revealing' && (
              <div className="mb-8">
                <h2 className="text-2xl md:text-4xl font-black text-white mb-6 md:mb-8 animate-pulse">
                  🎊 カード公開中... {currentRevealIndex + 1}/{count}
                </h2>
                
                {/* 公開済みカードを表示 (モバイル2列、デスクトップ4列) */}
                <div className="card-grid-mobile md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4">
                  {revealedCards.filter(card => card != null).map((card, index) => {
                    const badge = getRarityBadge(card?.rarity || 'B')
                    const isLatest = index === revealedCards.length - 1
                    
                    return (
                      <motion.div
                        key={card?.id || `card-${index}`}
                        initial={{ opacity: 0, scale: 0, rotateY: 180 }}
                        animate={{ 
                          opacity: 1, 
                          scale: isLatest ? [1, 1.2, 1] : 1, 
                          rotateY: 0 
                        }}
                        transition={{ 
                          duration: 0.8,
                          scale: { duration: 0.6, times: [0, 0.5, 1] }
                        }}
                        className={`card-reveal-mobile bg-gray-900 rounded-xl overflow-hidden shadow-xl card-reveal-animation ${
                          card?.rarity === 'SS' ? 'ring-4 ring-yellow-400 ss-explosion' :
                          card?.rarity === 'S' ? 'ring-4 ring-purple-400 animate-pulse' :
                          ''
                        }`}
                      >
                        <div className="relative aspect-[3/4] md:aspect-square">
                          <Image
                            src={card?.imageUrl || card?.image_url || '/images/cards/default.png'}
                            alt={card?.name || 'Unknown Card'}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {/* 特別演出オーバーレイ */}
                          {(card?.rarity === 'SS' || card?.rarity === 'S') && isLatest && (
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-transparent to-yellow-400/30 animate-pulse"></div>
                          )}
                          <div className="absolute top-2 right-2">
                            <span className={`${RARITY_COLORS[card?.rarity || 'B']} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                              {badge.text}
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="text-white font-bold text-sm text-center truncate">
                            {card?.name || 'Unknown Card'}
                          </h3>
                        </div>
                      </motion.div>
                    )
                  })}
                  
                  {/* 未公開カードスロット */}
                  {Array.from({ length: count - revealedCards.length }).map((_, index) => (
                    <div key={`placeholder-${index}`} className="card-reveal-mobile bg-gray-800 rounded-xl aspect-[3/4] md:aspect-square flex items-center justify-center">
                      <div className="text-6xl animate-spin">❓</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 最終結果表示 */}
        {showResults && currentPhase === 'celebration' && (
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="mb-6">
                {/* お祝い花火エフェクト */}
                <div className="text-8xl mb-4 animate-bounce">
                  🎊🎉🎊
                </div>
                <h2 className="text-6xl font-black rainbow-text mb-4">
                  ガチャ結果発表！
                </h2>
                <p className="text-2xl text-gray-300 mb-4">
                  {count}回のガチャ結果
                </p>
                
                {/* SS賞獲得時の特別メッセージ */}
                {results.some(r => r.rarity === 'SS') && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-yellow-400 to-red-500 text-white p-4 rounded-xl mb-4 font-black text-xl"
                  >
                    🏆 超激レアSS賞獲得おめでとうございます！ 🏆
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* カード結果グリッド (モバイル最適化) */}
            <div className="card-grid-mobile md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4 mb-8">
              {results.map((card, index) => {
                const badge = getRarityBadge(card.rarity)
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, rotateY: 5 }}
                    className={`bg-gray-900 rounded-xl overflow-hidden shadow-xl transition-transform ${
                      card?.rarity === 'SS' ? 'ring-4 ring-yellow-400 shadow-yellow-400/50' :
                      card?.rarity === 'S' ? 'ring-2 ring-purple-400 shadow-purple-400/30' :
                      ''
                    }`}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={card?.imageUrl || '/images/ngcard.jpg'}
                        alt={card?.name || 'Card'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {/* レアリティバッジ */}
                      <div className="absolute top-2 right-2">
                        <span className={`${RARITY_COLORS[card?.rarity || 'B']} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                          {badge.text}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-white font-bold text-sm text-center truncate">
                        {card?.name || 'Unknown Card'}
                      </h3>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* 結果サマリー */}
            <div className="bg-gray-900 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-white mb-4 text-center">📊 獲得結果</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['SS', 'S', 'A', 'OTHER'].map(rarity => {
                  // OTHERの場合はB, C, Dをまとめてカウント
                  const count = rarity === 'OTHER' 
                    ? results.filter(r => ['B', 'C', 'D'].includes(r?.rarity || '')).length
                    : results.filter(r => r?.rarity === rarity).length
                  const badge = rarity === 'OTHER' 
                    ? { text: '🎉 ワクワクカード', color: 'text-green-400' }
                    : getRarityBadge(rarity)
                  return (
                    <div key={rarity} className="text-center p-3 bg-gray-800 rounded-lg">
                      <div className={`text-2xl font-black ${badge.color}`}>
                        {count}
                      </div>
                      <div className="text-sm text-gray-400">{badge.text}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col gap-4 justify-center items-center">
              <Link href="/mypage">
                <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-12 py-5 rounded-xl hover:scale-105 transition transform shadow-lg text-xl">
                  📦 マイページで確認
                </button>
              </Link>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowResults(false)
                    setResults([])
                    setRevealedCards([])
                    setCurrentRevealIndex(0)
                    setCurrentPhase('idle')
                  }}
                  className="bg-gradient-to-r from-[#FF6600] to-[#FF0033] text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transition transform shadow-lg"
                >
                  🎲 もう一度回す
                </button>
                <Link href={`/gacha/${gachaId}`}>
                  <button className="bg-gray-700 text-white font-bold px-8 py-4 rounded-xl hover:bg-gray-600 transition">
                    ← ガチャ詳細に戻る
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* 星エフェクト (モバイル最適化) */}
        {sparkles.map(sparkle => (
          <div
            key={sparkle.id}
            className="sparkle-star-mobile md:sparkle-star fixed pointer-events-none text-xl md:text-2xl z-50"
            style={{
              left: `${sparkle.x}px`,
              top: `${sparkle.y}px`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
          >
            ⭐
          </div>
        ))}
      </div>

      {/* カウンター表示（連続ガチャ時） */}
      {count > 1 && showVideoAnimation && currentCardIndex > 0 && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full shadow-2xl"
          >
            <div className="text-center">
              <div className="text-4xl font-black">
                {currentCardIndex} / {count}
              </div>
              <div className="text-sm font-medium opacity-90 mt-1">
                カード公開中
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI動画演出システム (Veo 3 / Sora 2) */}
      {showVideoAnimation && videoAnimationCard && (
        <AIVideoGachaAnimation
          rarity={videoAnimationCard.rarity as 'SS' | 'S' | 'A' | 'B' | 'C'}
          cardData={{
            id: videoAnimationCard.id,
            name: videoAnimationCard.name,
            imageUrl: videoAnimationCard.imageUrl
          }}
          onComplete={handleVideoAnimationComplete}
          onSkip={handleSkipAll}
          videoUrls={animationVideos[videoAnimationCard.rarity]}
        />
      )}

    </div>
  )
}