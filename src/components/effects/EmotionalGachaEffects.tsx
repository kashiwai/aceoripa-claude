'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
// import { Sparkles, Stars, Ripples } from 'three-particles'; // Package not available, using alternatives

// 感情的なガチャ演出システム
interface EmotionalGachaEffectsProps {
  pokemonName: string;
  rarity: 'SS' | 'S' | 'A' | 'B' | 'C';
  cardImageUrl?: string;
  onComplete?: () => void;
  enableHaptics?: boolean;
}

type EmotionalStage = 
  | 'anticipation'    // 期待（ドキドキ）
  | 'tension'         // 緊張（ハラハラ）
  | 'climax'          // クライマックス（ワクワク）
  | 'revelation'      // 開示（驚き）
  | 'euphoria'        // 感動の余韻（うっとり）
  | 'complete';

const RARITY_EMOTIONS = {
  SS: {
    name: '運命の出会い',
    colors: ['#FFD700', '#FF6B6B', '#9B59B6', '#3498DB'],
    duration: 8000,
    storyText: '伝説が目覚める...',
    climaxText: '✨ 奇跡の降臨 ✨'
  },
  S: {
    name: '特別な絆',
    colors: ['#FF6B6B', '#FFD700', '#E74C3C'],
    duration: 6000,
    storyText: '強い絆を感じる...',
    climaxText: '🔥 炎の契約 🔥'
  },
  A: {
    name: '新たな仲間',
    colors: ['#3498DB', '#9B59B6', '#2ECC71'],
    duration: 4000,
    storyText: '新しい出会いが...',
    climaxText: '⭐ 星の導き ⭐'
  },
  B: {
    name: '心の響き',
    colors: ['#2ECC71', '#27AE60'],
    duration: 3000,
    storyText: '何かが呼んでいる...',
    climaxText: '🌟 希望の光 🌟'
  },
  C: {
    name: '小さな奇跡',
    colors: ['#95A5A6', '#BDC3C7'],
    duration: 2000,
    storyText: '小さな奇跡が...',
    climaxText: '✨ 純真な出会い ✨'
  }
};

export const EmotionalGachaEffects = ({
  pokemonName,
  rarity,
  cardImageUrl,
  onComplete,
  enableHaptics = true
}: EmotionalGachaEffectsProps) => {
  const [currentStage, setCurrentStage] = useState<EmotionalStage>('anticipation');
  const [intensity, setIntensity] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [storyText, setStoryText] = useState('');
  const [heartbeat, setHeartbeat] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const emotionConfig = RARITY_EMOTIONS[rarity];

  // バイブレーション（モバイル）
  const triggerHaptic = useCallback((pattern: number[]) => {
    if (enableHaptics && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, [enableHaptics]);

  // 心拍音の生成
  const createHeartbeatSound = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(60, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  }, []);

  // 演出の段階的実行
  useEffect(() => {
    const stageTimings = {
      anticipation: 1500,
      tension: 1000,
      climax: 2000,
      revelation: 1500,
      euphoria: 2000
    };

    const executeStage = async () => {
      switch (currentStage) {
        case 'anticipation':
          setStoryText('何かが起こる予感...');
          setIntensity(0.2);
          triggerHaptic([100, 50, 100]);
          
          // 心拍音開始
          const heartbeatInterval = setInterval(() => {
            createHeartbeatSound();
            setHeartbeat(prev => prev + 1);
          }, 800);

          setTimeout(() => {
            clearInterval(heartbeatInterval);
            setCurrentStage('tension');
          }, stageTimings.anticipation);
          break;

        case 'tension':
          setStoryText(emotionConfig.storyText);
          setIntensity(0.5);
          triggerHaptic([150, 100, 150, 100]);
          
          setTimeout(() => setCurrentStage('climax'), stageTimings.tension);
          break;

        case 'climax':
          setStoryText('運命の瞬間...!');
          setIntensity(0.8);
          triggerHaptic([200, 150, 200, 150, 300]);
          
          setTimeout(() => setCurrentStage('revelation'), stageTimings.climax);
          break;

        case 'revelation':
          setStoryText(emotionConfig.climaxText);
          setIntensity(1.0);
          setShowCard(true);
          triggerHaptic([300, 200, 300, 200, 500]);
          
          setTimeout(() => setCurrentStage('euphoria'), stageTimings.revelation);
          break;

        case 'euphoria':
          setStoryText(`${pokemonName}との出会い`);
          setIntensity(0.7);
          
          setTimeout(() => {
            setCurrentStage('complete');
            onComplete?.();
          }, stageTimings.euphoria);
          break;
      }
    };

    executeStage();
  }, [currentStage, emotionConfig, pokemonName, onComplete, triggerHaptic, createHeartbeatSound]);

  // パーティクルアニメーション
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const particles: any[] = [];

    const createParticle = () => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.005,
        color: emotionConfig.colors[Math.floor(Math.random() * emotionConfig.colors.length)],
        size: Math.random() * 3 + 1
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // パーティクル生成数を強度に応じて調整
      const particleCount = Math.floor(intensity * 10);
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }

      // パーティクルの更新と描画
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life * intensity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 輝き効果
        if (rarity === 'SS' && Math.random() < 0.1) {
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [intensity, emotionConfig, rarity]);

  // 背景グラデーション
  const backgroundVariants = {
    anticipation: {
      background: `radial-gradient(circle, ${emotionConfig.colors[0]}20, #000000)`,
      scale: 1
    },
    tension: {
      background: `radial-gradient(circle, ${emotionConfig.colors[0]}40, ${emotionConfig.colors[1]}20, #000000)`,
      scale: 1.02
    },
    climax: {
      background: `radial-gradient(circle, ${emotionConfig.colors[0]}60, ${emotionConfig.colors[1]}40, ${emotionConfig.colors[2] || emotionConfig.colors[0]}20, #000000)`,
      scale: 1.05
    },
    revelation: {
      background: `radial-gradient(circle, ${emotionConfig.colors[0]}80, ${emotionConfig.colors[1]}60, ${emotionConfig.colors[2] || emotionConfig.colors[0]}40, #000000)`,
      scale: 1.08
    },
    euphoria: {
      background: `radial-gradient(circle, ${emotionConfig.colors[0]}60, ${emotionConfig.colors[1]}40, ${emotionConfig.colors[2] || emotionConfig.colors[0]}20, #000000)`,
      scale: 1.0
    },
    complete: {
      background: `radial-gradient(circle, ${emotionConfig.colors[0]}30, #000000)`,
      scale: 1.0
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      variants={backgroundVariants}
      animate={currentStage}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* パーティクルキャンバス */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        width={window.innerWidth}
        height={window.innerHeight}
      />

      {/* 心拍エフェクト */}
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 0.8,
          repeat: currentStage === 'anticipation' || currentStage === 'tension' ? Infinity : 0,
          ease: "easeInOut"
        }}
        style={{
          background: `radial-gradient(circle, transparent 70%, ${emotionConfig.colors[0]}20 100%)`
        }}
      />

      {/* ストーリーテキスト */}
      <AnimatePresence mode="wait">
        {storyText && (
          <motion.div
            key={currentStage}
            className="absolute top-1/4 w-full text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h2
              className="text-4xl font-bold text-white drop-shadow-lg"
              animate={{
                textShadow: [
                  `0 0 10px ${emotionConfig.colors[0]}`,
                  `0 0 20px ${emotionConfig.colors[1] || emotionConfig.colors[0]}`,
                  `0 0 10px ${emotionConfig.colors[0]}`
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {storyText}
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* カード演出 */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            className="absolute flex flex-col items-center"
            initial={{ scale: 0, rotate: 180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{
              duration: 1.5,
              ease: "backOut",
              type: "spring",
              damping: 10
            }}
          >
            {/* カード画像 */}
            <motion.div
              className="relative w-64 h-96 rounded-xl overflow-hidden shadow-2xl"
              animate={{
                rotateY: [0, 360],
                boxShadow: [
                  `0 0 30px ${emotionConfig.colors[0]}`,
                  `0 0 50px ${emotionConfig.colors[1] || emotionConfig.colors[0]}`,
                  `0 0 30px ${emotionConfig.colors[0]}`
                ]
              }}
              transition={{
                rotateY: { duration: 3, ease: "easeInOut" },
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <img
                src={cardImageUrl || '/images/ngcard.jpg'}
                alt={pokemonName}
                className="w-full h-full object-cover"
              />
              
              {/* ホログラム効果 */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(45deg, transparent 40%, ${emotionConfig.colors[0]}40 50%, transparent 60%)`
                }}
                animate={{
                  x: [-300, 300]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.div>

            {/* ポケモン名 */}
            <motion.h3
              className="mt-4 text-2xl font-bold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              {pokemonName}
            </motion.h3>

            {/* レアリティ表示 */}
            <motion.div
              className={`mt-2 px-4 py-2 rounded-full font-bold text-lg ${
                rarity === 'SS' ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-white' :
                rarity === 'S' ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white' :
                rarity === 'A' ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white' :
                rarity === 'B' ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white' :
                'bg-gray-500 text-white'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
            >
              {rarity}賞 - {emotionConfig.name}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 集中線エフェクト（SSR専用） */}
      {rarity === 'SS' && currentStage === 'climax' && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${emotionConfig.colors[0]}20, transparent, ${emotionConfig.colors[1]}20, transparent)`
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      )}
    </motion.div>
  );
};