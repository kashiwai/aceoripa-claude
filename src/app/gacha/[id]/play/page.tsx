'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface Card {
  id: string
  name: string
  rarity: string
  imageUrl: string
  description?: string
}

const RARITY_COLORS: { [key: string]: string } = {
  'SSR': 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500',
  'SR': 'bg-gradient-to-r from-purple-400 to-pink-400',
  'R': 'bg-gradient-to-r from-blue-400 to-cyan-400',
  'N': 'bg-gradient-to-r from-gray-400 to-gray-500'
}

const RARITY_EFFECTS: { [key: string]: string } = {
  'SSR': 'animate-pulse shadow-2xl shadow-yellow-500/50',
  'SR': 'animate-pulse shadow-xl shadow-purple-500/30',
  'R': 'shadow-lg shadow-blue-500/20',
  'N': ''
}

// スタイル定義を追加
const shimmerStyle = `
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`

export default function GachaPlayPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const gachaId = params.id as string
  const count = parseInt(searchParams.get('count') || '1')
  
  const [isAnimating, setIsAnimating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<Card[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [skipAnimation, setSkipAnimation] = useState(false)
  const [revealStage, setRevealStage] = useState<'animation' | 'rarity' | 'card'>('animation')

  // ダミーのガチャ結果生成
  const generateResults = () => {
    const dummyCards: Card[] = []
    const rarityProbabilities = [
      { rarity: 'SSR', probability: 3, cards: [
        { id: '1', name: 'リザードンex', imageUrl: '/api/placeholder/400/400?text=リザードンex' },
        { id: '2', name: 'ミュウex', imageUrl: '/api/placeholder/400/400?text=ミュウex' },
        { id: '3', name: 'ピカチュウex', imageUrl: '/api/placeholder/400/400?text=ピカチュウex' }
      ]},
      { rarity: 'SR', probability: 12, cards: [
        { id: '4', name: 'フシギバナex', imageUrl: '/api/placeholder/400/400?text=フシギバナex' },
        { id: '5', name: 'カメックスex', imageUrl: '/api/placeholder/400/400?text=カメックスex' },
        { id: '6', name: 'フリーザーex', imageUrl: '/api/placeholder/400/400?text=フリーザーex' }
      ]},
      { rarity: 'R', probability: 25, cards: [
        { id: '8', name: 'ニドクイン', imageUrl: '/api/placeholder/400/400?text=ニドクイン' },
        { id: '9', name: 'ニドキング', imageUrl: '/api/placeholder/400/400?text=ニドキング' },
        { id: '10', name: 'ゴルダック', imageUrl: '/api/placeholder/400/400?text=ゴルダック' }
      ]},
      { rarity: 'N', probability: 60, cards: [
        { id: '13', name: 'フシギダネ', imageUrl: '/api/placeholder/400/400?text=フシギダネ' },
        { id: '14', name: 'ヒトカゲ', imageUrl: '/api/placeholder/400/400?text=ヒトカゲ' },
        { id: '15', name: 'ゼニガメ', imageUrl: '/api/placeholder/400/400?text=ゼニガメ' }
      ]}
    ]

    for (let i = 0; i < count; i++) {
      const random = Math.random() * 100
      let accumulated = 0
      
      for (const tier of rarityProbabilities) {
        accumulated += tier.probability
        if (random <= accumulated) {
          const card = tier.cards[Math.floor(Math.random() * tier.cards.length)]
          dummyCards.push({ ...card, rarity: tier.rarity })
          break
        }
      }
    }

    return dummyCards
  }

  const startGacha = () => {
    setIsAnimating(true)
    setShowResults(false)
    setCurrentIndex(0)
    setSkipAnimation(false)
    setRevealStage('animation')
    
    const gachaResults = generateResults()
    setResults(gachaResults)

    // アニメーション時間
    const animationDuration = 2000
    
    setTimeout(() => {
      setIsAnimating(false)
      if (count === 1) {
        // 単発の場合は演出あり
        setRevealStage('rarity')
        setTimeout(() => {
          setRevealStage('card')
          setShowResults(true)
          
          // SSRが出たらconfetti
          if (gachaResults[0].rarity === 'SSR') {
            confetti({
              particleCount: 200,
              spread: 100,
              origin: { y: 0.5 }
            })
          }
        }, 1500)
      } else {
        // 複数の場合は直接結果表示
        setShowResults(true)
        setSkipAnimation(true)
      }
    }, animationDuration)
  }

  const showNextResult = () => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const showAllResults = () => {
    setSkipAnimation(true)
  }

  useEffect(() => {
    startGacha()
  }, [])

  return (
    <>
      <style jsx global>{shimmerStyle}</style>
      <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* ヘッダー */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-[#FF0033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href={`/gacha/${gachaId}`} className="text-[#FF0033] hover:text-[#FF6B6B] transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-3xl font-black text-[#FF0033]">
              ガチャ結果
            </h1>
            <div className="w-8" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-[600px]"
            >
              <div className="text-center">
                {/* ガチャボックスアニメーション */}
                <motion.div
                  animate={{
                    rotateY: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-64 h-64 mx-auto mb-8 relative"
                >
                  <div className="w-full h-full bg-gradient-to-br from-[#FF0033] to-[#FF6B6B] rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden">
                    <span className="text-6xl font-black text-white z-10">?</span>
                    {/* キラキラエフェクト */}
                    <div className="absolute inset-0">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer"></div>
                    </div>
                  </div>
                  {/* 光の粒子エフェクト */}
                  <div className="absolute -inset-10">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                        style={{
                          top: '50%',
                          left: '50%',
                        }}
                        animate={{
                          x: [0, (i % 2 === 0 ? 100 : -100) * Math.cos(i * 60 * Math.PI / 180)],
                          y: [0, (i % 2 === 0 ? 100 : -100) * Math.sin(i * 60 * Math.PI / 180)],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
                <motion.p 
                  className="text-3xl font-bold text-white"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ガチャを回しています...
                </motion.p>
              </div>
              
              {/* スキップボタン */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => {
                  setIsAnimating(false)
                  setShowResults(true)
                  setSkipAnimation(true)
                }}
                className="absolute bottom-10 right-10 bg-gray-800/80 hover:bg-gray-700/80 text-white font-bold px-6 py-3 rounded-lg transition"
              >
                スキップ ▶
              </motion.button>
            </motion.div>
          )}

          {/* レアリティ演出（単発のみ） */}
          {!isAnimating && revealStage === 'rarity' && count === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-[600px] relative overflow-hidden"
            >
              {/* 背景エフェクト */}
              <div className="absolute inset-0">
                {results[0].rarity === 'SSR' && (
                  <>
                    {/* 放射状の光 */}
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-1/2 left-1/2 w-[200%] h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                          style={{
                            transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                          }}
                        />
                      ))}
                    </motion.div>
                  </>
                )}
              </div>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                className="text-center relative z-10"
              >
                <motion.div 
                  className={`${RARITY_COLORS[results[0].rarity]} rounded-full p-16 shadow-2xl relative overflow-hidden`}
                  animate={{
                    boxShadow: results[0].rarity === 'SSR' 
                      ? ['0 0 0px rgba(255,215,0,0)', '0 0 100px rgba(255,215,0,0.8)', '0 0 0px rgba(255,215,0,0)']
                      : undefined
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.h1
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-8xl font-black text-white drop-shadow-2xl relative z-10"
                  >
                    {results[0].rarity}賞！
                  </motion.h1>
                  {/* 内部のキラキラ */}
                  {results[0].rarity === 'SSR' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
                  )}
                </motion.div>
                {results[0].rarity === 'SSR' && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-4xl font-bold text-yellow-400 mt-8 drop-shadow-lg"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      超激レア！！！
                    </motion.span>
                  </motion.p>
                )}
                {results[0].rarity === 'SR' && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-3xl font-bold text-purple-400 mt-8"
                  >
                    激レア！
                  </motion.p>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* カード表示（単発） */}
          {showResults && !skipAnimation && count === 1 && revealStage === 'card' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center min-h-[600px]"
            >
              <div className="text-center">
                {/* カード出現演出 */}
                <motion.div
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    type: "spring",
                    stiffness: 80
                  }}
                  className="relative mb-8"
                >
                  <div className={`p-8 rounded-3xl ${RARITY_COLORS[results[0].rarity]} ${RARITY_EFFECTS[results[0].rarity]}`}>
                    <motion.div 
                      className="relative w-80 h-80 mx-auto mb-6 bg-white rounded-2xl overflow-hidden shadow-2xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Image
                        src={results[0].imageUrl}
                        alt={results[0].name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {results[0].rarity === 'SSR' && (
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/20 animate-shimmer"></div>
                      )}
                    </motion.div>
                    <motion.h2 
                      className="text-4xl font-black text-white mb-2 drop-shadow-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      {results[0].name}
                    </motion.h2>
                    <motion.p 
                      className="text-2xl font-bold text-white/90"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {results[0].rarity}
                    </motion.p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex gap-4 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <button
                    onClick={() => router.push(`/gacha/${gachaId}`)}
                    className="bg-gray-700 text-white font-bold px-8 py-4 rounded-xl hover:bg-gray-600 transition"
                  >
                    戻る
                  </button>
                  <button
                    onClick={() => {
                      startGacha()
                    }}
                    className="bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transform transition shadow-lg"
                  >
                    もう一度引く
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {showResults && (skipAnimation || count > 1) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <motion.h2 
                className="text-4xl font-black text-center text-white mb-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                ガチャ結果 ({count}回)
              </motion.h2>

              {/* 結果グリッド */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {results.map((card, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ 
                      delay: skipAnimation ? 0 : index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    className="relative"
                  >
                    <motion.div 
                      className={`p-4 rounded-2xl ${RARITY_COLORS[card.rarity]} relative overflow-hidden`}
                      whileHover={{ scale: 1.05 }}
                      animate={card.rarity === 'SSR' ? {
                        boxShadow: ['0 0 20px rgba(255,215,0,0.5)', '0 0 40px rgba(255,215,0,0.8)', '0 0 20px rgba(255,215,0,0.5)']
                      } : {}}
                      transition={{ duration: 2, repeat: card.rarity === 'SSR' ? Infinity : 0 }}
                    >
                      <div className="relative aspect-square bg-white rounded-lg overflow-hidden mb-3 shadow-lg">
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {card.rarity === 'SSR' && (
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/20 animate-shimmer"></div>
                        )}
                      </div>
                      <p className="text-sm font-bold text-white text-center truncate drop-shadow">
                        {card.name}
                      </p>
                      <p className="text-xs font-semibold text-white/90 text-center">
                        {card.rarity}
                      </p>
                      {card.rarity === 'SSR' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
                      )}
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* レアリティ別集計 */}
              <div className="bg-gray-900 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4">獲得カード内訳</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['SSR', 'SR', 'R', 'N'].map(rarity => {
                    const count = results.filter(card => card.rarity === rarity).length
                    if (count === 0) return null
                    return (
                      <div key={rarity} className={`p-4 rounded-xl ${RARITY_COLORS[rarity]}`}>
                        <p className="text-3xl font-black text-white text-center">{count}</p>
                        <p className="text-lg font-bold text-white/90 text-center">{rarity}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push(`/gacha/${gachaId}`)}
                  className="bg-gray-700 text-white font-bold px-8 py-4 rounded-xl hover:bg-gray-600 transition"
                >
                  ガチャ詳細に戻る
                </button>
                <button
                  onClick={() => {
                    startGacha()
                  }}
                  className="bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transform transition"
                >
                  もう{count}回引く
                </button>
                <button
                  onClick={() => router.push('/mypage')}
                  className="bg-gradient-to-r from-[#00C853] to-[#00E676] text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transform transition"
                >
                  マイページで確認
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </>
  )
}