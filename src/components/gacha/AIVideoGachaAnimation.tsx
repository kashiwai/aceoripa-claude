'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface AIVideoGachaAnimationProps {
  rarity: 'SS' | 'S' | 'A' | 'B' | 'C'
  cardData: {
    id: string
    name: string
    imageUrl: string
  }
  onComplete: () => void
  onSkip?: () => void
  videoUrls?: {
    intro?: string
    reveal?: string
  }
}

export const AIVideoGachaAnimation = ({
  rarity,
  cardData,
  onComplete,
  onSkip,
  videoUrls
}: AIVideoGachaAnimationProps) => {
  const [phase, setPhase] = useState<'intro' | 'reveal' | 'complete'>('intro')
  const [isLoading, setIsLoading] = useState(true)
  const [showSkipButton, setShowSkipButton] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const introVideoRef = useRef<HTMLVideoElement>(null)
  const revealVideoRef = useRef<HTMLVideoElement>(null)

  // 動画パス（データベースのURLを優先、フォールバックとして固定パスを使用）
  const videoPaths = {
    intro: videoUrls?.intro || `/videos/gacha/${rarity.toLowerCase()}_intro.mp4`,
    reveal: videoUrls?.reveal || `/videos/gacha/${rarity.toLowerCase()}_reveal.mp4`
  }
  
  // フォールバック用のカラースキーム
  const rarityColors = {
    SS: {
      primary: '#FFD700',
      secondary: '#FF6B6B',
      glow: 'rgba(255, 215, 0, 0.6)'
    },
    S: {
      primary: '#FF6B6B',
      secondary: '#E74C3C',
      glow: 'rgba(255, 107, 107, 0.6)'
    },
    A: {
      primary: '#3498DB',
      secondary: '#2980B9',
      glow: 'rgba(52, 152, 219, 0.6)'
    },
    B: {
      primary: '#2ECC71',
      secondary: '#27AE60',
      glow: 'rgba(46, 204, 113, 0.6)'
    },
    C: {
      primary: '#95A5A6',
      secondary: '#7F8C8D',
      glow: 'rgba(149, 165, 166, 0.6)'
    }
  }
  
  const colors = rarityColors[rarity]
  
  // 動画の事前読み込み
  useEffect(() => {
    const preloadVideos = async () => {
      try {
        // イントロ動画のプリロード
        const introVideo = document.createElement('video')
        introVideo.src = videoPaths.intro
        introVideo.load()

        // リビール動画のプリロード
        const revealVideo = document.createElement('video')
        revealVideo.src = videoPaths.reveal
        revealVideo.load()

        setIsLoading(false)
      } catch (error) {
        console.error('Video preload error:', error)
        setVideoError(true)
        setIsLoading(false)
      }
    }

    preloadVideos()

    // 3秒後にスキップボタンを表示
    const skipTimer = setTimeout(() => {
      setShowSkipButton(true)
    }, 3000)

    return () => clearTimeout(skipTimer)
  }, [videoPaths.intro, videoPaths.reveal])
  
  // イントロ動画終了時の処理（または早期カット）
  const handleIntroEnd = () => {
    console.log('[Animation] Intro ended, moving to reveal phase')
    setPhase('reveal')
  }

  // イントロ動画開始から2.5秒後にリビールフェーズへ
  useEffect(() => {
    if (phase === 'intro') {
      const quickCutTimer = setTimeout(() => {
        console.log('[Animation] Quick cut: skipping to reveal')
        if (introVideoRef.current) {
          introVideoRef.current.pause()
        }
        setPhase('reveal')
      }, 2500) // 2.5秒でリビールへ

      return () => clearTimeout(quickCutTimer)
    }
  }, [phase])

  // リビール動画終了時の処理
  const handleRevealEnd = () => {
    console.log('[Animation] Reveal ended, completing')
    setPhase('complete')
    setTimeout(onComplete, 100) // 500ms → 100msに短縮
  }

  // リビール動画開始から2.5秒後に完了（カード表示）
  useEffect(() => {
    if (phase === 'reveal') {
      const quickCompleteTimer = setTimeout(() => {
        console.log('[Animation] Quick complete: showing card immediately')
        if (revealVideoRef.current) {
          revealVideoRef.current.pause()
        }
        setPhase('complete')
        onComplete()
      }, 2500) // 2.5秒でカード表示

      return () => clearTimeout(quickCompleteTimer)
    }
  }, [phase, onComplete])
  
  // スキップ処理
  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    } else {
      setPhase('complete')
      onComplete()
    }
  }
  
  // エラー時のフォールバック演出
  const FallbackAnimation = () => {
    // 3秒後に自動的に完了
    useEffect(() => {
      const timer = setTimeout(() => {
        onComplete()
      }, 3000)
      return () => clearTimeout(timer)
    }, [])

    return (
      <motion.div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
      {/* 背景エフェクト */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, ${colors.glow}, transparent 70%)`
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
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: colors.primary,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
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
      <motion.div
        initial={{ scale: 0, rotateY: 180 }}
        animate={{ 
          scale: [0, 1.2, 1], 
          rotateY: [180, 360, 360]
        }}
        transition={{
          duration: 2,
          ease: "easeOut"
        }}
        className="relative z-10"
      >
        <motion.div
          className="relative"
          animate={{
            filter: [
              'drop-shadow(0 0 20px ' + colors.glow + ')',
              'drop-shadow(0 0 40px ' + colors.glow + ')',
              'drop-shadow(0 0 20px ' + colors.glow + ')'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        >
          <Image
            src={cardData.imageUrl}
            alt={cardData.name}
            width={300}
            height={400}
            className="rounded-lg"
            unoptimized
          />
        </motion.div>
        
        {/* カード名表示 */}
        <motion.div
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-3xl font-bold text-white mb-2 whitespace-nowrap"
              style={{ textShadow: `0 0 20px ${colors.glow}` }}>
            {cardData.name}
          </h2>
          <p className="text-xl text-white/80">
            {rarity}賞獲得！
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <motion.div
          className="text-white text-2xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          演出準備中...
        </motion.div>
      </div>
    )
  }
  
  // 動画エラー時はフォールバック演出を使用
  if (videoError) {
    return <FallbackAnimation />
  }
  
  return (
    <AnimatePresence mode="wait">
      {phase === 'intro' && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-50 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <video
            ref={introVideoRef}
            src={videoPaths.intro}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            onEnded={handleIntroEnd}
            onError={() => setVideoError(true)}
            onLoadedMetadata={(e) => {
              const video = e.currentTarget
              video.playbackRate = 1.0 // 通常速度
            }}
          />
          
          {/* オーバーレイテキスト */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.h1
              className="text-6xl font-bold text-white text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2, duration: 1 }}
              style={{ textShadow: `0 0 40px ${colors.glow}` }}
            >
              {rarity === 'SS' && '伝説降臨...'}
              {rarity === 'S' && '特別な出会い...'}
              {rarity === 'A' && '新たな仲間...'}
              {rarity === 'B' && '素敵な出会い...'}
              {rarity === 'C' && '小さな奇跡...'}
            </motion.h1>
          </div>
        </motion.div>
      )}
      
      {phase === 'reveal' && (
        <motion.div
          key="reveal"
          className="fixed inset-0 z-50 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <video
            ref={revealVideoRef}
            src={videoPaths.reveal}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            onEnded={handleRevealEnd}
            onError={() => setVideoError(true)}
            onLoadedMetadata={(e) => {
              const video = e.currentTarget
              video.playbackRate = 1.0 // 通常速度
            }}
          />
          
          {/* カードオーバーレイ */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotateY: 180, opacity: 0 }}
              animate={{ 
                scale: 1, 
                rotateY: 360, 
                opacity: 1 
              }}
              transition={{
                delay: 1,
                duration: 1.5,
                ease: "easeOut"
              }}
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  filter: [
                    'drop-shadow(0 0 30px ' + colors.glow + ')',
                    'drop-shadow(0 0 50px ' + colors.glow + ')',
                    'drop-shadow(0 0 30px ' + colors.glow + ')'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Image
                  src={cardData.imageUrl}
                  alt={cardData.name}
                  width={350}
                  height={490}
                  className="rounded-lg"
                  unoptimized
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* スキップボタン */}
      <AnimatePresence>
        {showSkipButton && phase !== 'complete' && (
          <motion.button
            className="fixed top-8 right-8 z-[60] px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            onClick={handleSkip}
          >
            スキップ ▶
          </motion.button>
        )}
      </AnimatePresence>
    </AnimatePresence>
  )
}