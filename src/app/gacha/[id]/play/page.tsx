'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface Card {
  id: string
  name: string
  rarity: string
  imageUrl: string
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

export default function GachaPlayPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const gachaId = params.id as string
  const count = parseInt(searchParams.get('count') || '1')

  const [isPlaying, setIsPlaying] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<Card[]>([])

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

  // ガチャロジック
  const executeGacha = () => {
    setIsPlaying(true)
    
    // 2秒後に結果を表示
    setTimeout(() => {
      const gachaResults: Card[] = []
      
      for (let i = 0; i < count; i++) {
        const random = Math.random()
        let selectedCard: Card
        
        if (random < 0.01) { // 1% SS
          selectedCard = sampleCards.filter(c => c.rarity === 'SS')[Math.floor(Math.random() * 2)]
        } else if (random < 0.05) { // 4% S
          selectedCard = sampleCards.filter(c => c.rarity === 'S')[Math.floor(Math.random() * 3)]
        } else if (random < 0.20) { // 15% A
          selectedCard = sampleCards.filter(c => c.rarity === 'A')[Math.floor(Math.random() * 3)]
        } else { // その他（B, C賞など）
          const otherCards = sampleCards.filter(c => ['B', 'C'].includes(c.rarity))
          selectedCard = otherCards[Math.floor(Math.random() * otherCards.length)]
        }
        
        gachaResults.push({
          ...selectedCard,
          id: `result_${i}_${selectedCard.id}`
        })
      }
      
      setResults(gachaResults)
      setIsPlaying(false)
      setShowResults(true)
    }, 2000)
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

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
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
            <div className="text-lg font-bold text-gray-700">
              {count}回ガチャ
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ガチャ実行前 */}
        {!isPlaying && !showResults && (
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-black text-white mb-4">
                🎰 ガチャを回す準備OK！
              </h2>
              <p className="text-xl text-gray-300 mb-2">
                {count}回のガチャを実行します
              </p>
              <p className="text-lg text-yellow-400">
                ✨ 激レアカードが出現するかも！？
              </p>
            </div>
            
            <button
              onClick={executeGacha}
              className="bg-gradient-to-r from-[#FF6600] to-[#FF0033] text-white font-black text-2xl px-12 py-6 rounded-2xl hover:scale-105 transition transform shadow-2xl"
            >
              🎲 ガチャを回す！
            </button>
          </div>
        )}

        {/* ガチャ実行中 */}
        {isPlaying && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-32 h-32 border-8 border-[#FF0033] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-4xl font-black text-white mb-4">
                🎰 ガチャ実行中...
              </h2>
              <p className="text-xl text-yellow-400 animate-pulse">
                激レアカードを抽選中！
              </p>
            </div>
          </div>
        )}

        {/* 結果表示 */}
        {showResults && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-white mb-4">
                🎉 ガチャ結果発表！
              </h2>
              <p className="text-xl text-gray-300">
                {count}回のガチャ結果
              </p>
            </div>

            {/* カード結果グリッド */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {results.map((card, index) => {
                const badge = getRarityBadge(card.rarity)
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900 rounded-xl overflow-hidden shadow-xl hover:scale-105 transition-transform"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={card.imageUrl}
                        alt={card.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {/* レアリティバッジ */}
                      <div className="absolute top-2 right-2">
                        <span className={`${RARITY_COLORS[card.rarity]} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                          {badge.text}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-white font-bold text-sm text-center truncate">
                        {card.name}
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
                    ? results.filter(r => ['B', 'C', 'D'].includes(r.rarity)).length
                    : results.filter(r => r.rarity === rarity).length
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
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setShowResults(false)
                  setResults([])
                }}
                className="bg-gradient-to-r from-[#FF6600] to-[#FF0033] text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transition transform"
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
        )}
      </div>
    </div>
  )
}