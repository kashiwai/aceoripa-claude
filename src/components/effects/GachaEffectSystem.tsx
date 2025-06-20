'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface EffectConfig {
  duration: number;
  files: string[];
  animation: string;
  sound?: string;
  vibration?: number[];
}

interface GachaEffectSystemProps {
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  onComplete: () => void;
}

const effectAnimations = {
  'rainbow-spiral': {
    initial: { scale: 0, rotate: 0, opacity: 0 },
    animate: { 
      scale: [0, 1.5, 1],
      rotate: [0, 360, 720],
      opacity: [0, 1, 0.8, 1]
    },
    exit: { scale: 2, opacity: 0 }
  },
  'fire-burst': {
    initial: { scale: 0, y: 100, opacity: 0 },
    animate: { 
      scale: [0, 1.2, 1],
      y: [100, -20, 0],
      opacity: [0, 1, 0.9]
    },
    exit: { y: -100, opacity: 0 }
  },
  'water-splash': {
    initial: { scale: 0.5, opacity: 0 },
    animate: { 
      scale: [0.5, 1.1, 1],
      opacity: [0, 0.8, 1]
    },
    exit: { scale: 0.8, opacity: 0 }
  },
  'light-glow': {
    initial: { opacity: 0 },
    animate: { 
      opacity: [0, 0.6, 1]
    },
    exit: { opacity: 0 }
  }
};

export const GachaEffectSystem = ({ rarity, onComplete }: GachaEffectSystemProps) => {
  const [effectConfig, setEffectConfig] = useState<EffectConfig | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    // エフェクト設定の読み込み
    fetch('/assets/effects/effects-config.json')
      .then(res => res.json())
      .then(data => {
        setEffectConfig(data[rarity]);
      });
  }, [rarity]);

  useEffect(() => {
    if (!effectConfig) return;

    // バイブレーション
    if (effectConfig.vibration && 'vibrate' in navigator) {
      navigator.vibrate(effectConfig.vibration);
    }

    // 紙吹雪エフェクト（SSRの場合）
    if (rarity === 'SSR') {
      const duration = 8 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']
        });
      }, 250);
    }

    // アニメーション完了タイマー
    const timer = setTimeout(() => {
      setIsPlaying(false);
      onComplete();
    }, effectConfig.duration);

    return () => clearTimeout(timer);
  }, [effectConfig, rarity, onComplete]);

  useEffect(() => {
    if (!effectConfig || !isPlaying) return;

    // フレームアニメーション
    const frameInterval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % effectConfig.files.length);
    }, effectConfig.duration / effectConfig.files.length);

    return () => clearInterval(frameInterval);
  }, [effectConfig, isPlaying]);

  if (!effectConfig) return null;

  const animationKey = effectConfig.animation as keyof typeof effectAnimations;
  const animation = effectAnimations[animationKey];

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative"
            variants={animation}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: effectConfig.duration / 1000 }}
          >
            <img
              src={`/assets/effects/${rarity.toLowerCase()}-${effectConfig.animation}/${effectConfig.files[currentFrame]}`}
              alt={`${rarity} effect`}
              className="w-96 h-96 object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};