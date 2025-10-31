'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface SimpleCardRevealProps {
  card: {
    id: string
    name: string
    rarity: string
    imageUrl: string
  }
  onNext?: () => void
  hasMore?: boolean
  fanfareSound?: string
}

const RARITY_COLORS: { [key: string]: string } = {
  'SS': 'from-yellow-400 via-red-500 to-pink-500',
  'S': 'from-purple-400 to-pink-400',
  'A': 'from-blue-400 to-cyan-400',
  'B': 'from-green-400 to-emerald-400',
  'C': 'from-gray-400 to-gray-500',
}

const RARITY_GLOW: { [key: string]: string } = {
  'SS': 'rgba(255, 215, 0, 0.8)',
  'S': 'rgba(255, 107, 107, 0.8)',
  'A': 'rgba(52, 152, 219, 0.8)',
  'B': 'rgba(46, 204, 113, 0.8)',
  'C': 'rgba(149, 165, 166, 0.8)',
}

export const SimpleCardReveal = ({
  card,
  onNext,
  hasMore = false,
  fanfareSound = '/sounds/fanfare.mp3'
}: SimpleCardRevealProps) => {
  const router = useRouter()
  const [showCard, setShowCard] = useState(false)
  const [audioPlayed, setAudioPlayed] = useState(false)

  useEffect(() => {
    // 2つ目の動画終了後、5秒待ってからカード表示
    const timer = setTimeout(() => {
      setShowCard(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // ファンファーレ音楽を再生
    if (showCard && !audioPlayed) {
      const audio = new Audio(fanfareSound)
      audio.volume = 0.5
      audio.play().catch(err => {
        console.log('Audio play failed:', err)
      })
      setAudioPlayed(true)
    }
  }, [showCard, audioPlayed, fanfareSound])

  const handleCardClick = () => {
    if (hasMore && onNext) {
      // 次のカードがある場合
      onNext()
    } else {
      // 最後のカードの場合、マイページへ移動
      router.push('/mypage/cards')
    }
  }

  const glowColor = RARITY_GLOW[card.rarity] || RARITY_GLOW['C']
  const gradientColor = RARITY_COLORS[card.rarity] || RARITY_COLORS['C']

  return (
    <AnimatePresence>
      {showCard && (
        <motion.div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCardClick}
        >
          {/* 背景エフェクト */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)`
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* パーティクルエフェクト */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-yellow-400"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${100 + Math.random() * 20}%`,
                }}
                animate={{
                  y: [-window.innerHeight * 1.2, -window.innerHeight * 0.2],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>

          {/* カード表示 */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotateY: 180, y: 100 }}
              animate={{
                scale: [0, 1.2, 1],
                rotateY: [180, 360, 360],
                y: [100, -20, 0]
              }}
              transition={{
                duration: 1.5,
                ease: "easeOut"
              }}
              className="relative"
            >
              {/* カード画像 */}
              <motion.div
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                animate={{
                  y: [0, -10, 0],
                  boxShadow: [
                    `0 0 30px ${glowColor}`,
                    `0 0 60px ${glowColor}`,
                    `0 0 30px ${glowColor}`
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  width={350}
                  height={490}
                  className="rounded-2xl"
                  unoptimized
                />
              </motion.div>

              {/* レアリティバッジ */}
              <motion.div
                className={`absolute -top-6 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full bg-gradient-to-r ${gradientColor} shadow-lg`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <span className="text-white font-bold text-xl">{card.rarity}</span>
              </motion.div>
            </motion.div>

            {/* カード名 */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <h2
                className="text-4xl font-bold text-white mb-4 whitespace-nowrap px-8"
                style={{
                  textShadow: `0 0 20px ${glowColor}, 0 4px 10px rgba(0,0,0,0.5)`
                }}
              >
                {card.name}
              </h2>
              <p className="text-xl text-white/80">
                {card.rarity}賞獲得！
              </p>
            </motion.div>

            {/* ボタン */}
            <motion.div
              className="mt-12 flex flex-col gap-4 items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.5 }}
            >
              {hasMore && onNext ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onNext()
                    }}
                    className={`px-12 py-4 bg-gradient-to-r ${gradientColor} text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform text-xl`}
                  >
                    次のカードを見る →
                  </button>
                  <p className="text-white/60 text-sm">
                    または画面をクリックして続ける
                  </p>
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push('/mypage/cards')
                    }}
                    className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform text-xl"
                  >
                    マイページで確認 →
                  </button>
                  <p className="text-white/60 text-sm">
                    または画面をクリックしてマイページへ
                  </p>
                </>
              )}
            </motion.div>
          </div>

          {/* クリックヒント */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/40 text-sm"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            画面をクリック
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
