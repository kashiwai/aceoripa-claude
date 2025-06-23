'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmotionalGachaEffects } from './EmotionalGachaEffects';
import { EmotionalSoundSystem } from './EmotionalSoundSystem';

interface UltimateGachaExperienceProps {
  pokemonName: string;
  rarity: 'SS' | 'S' | 'A' | 'B' | 'C';
  cardImageUrl?: string;
  onComplete?: () => void;
  enableHaptics?: boolean;
  enableSound?: boolean;
  autoPlay?: boolean;
}

type ExperiencePhase = 
  | 'prelude'        // 前奏：雰囲気作り
  | 'anticipation'   // 期待：ドキドキ感
  | 'tension'        // 緊張：ハラハラ感
  | 'climax'         // クライマックス：最高潮
  | 'revelation'     // 開示：カードが現れる
  | 'euphoria'       // 余韻：感動と満足
  | 'complete';      // 完了

const RARITY_EXPERIENCES = {
  SS: {
    name: '伝説との遭遇',
    totalDuration: 12000,
    story: [
      "遥か彼方から響く神秘の調べ...",
      "古の力が目覚めようとしている...",
      "運命の糸が紡がれる瞬間...",
      "✨ 伝説の扉が開かれた ✨",
      "永遠に語り継がれる奇跡の瞬間",
      "あなたと伝説ポケモンの物語が始まる"
    ],
    colors: ['#FFD700', '#FF6B6B', '#9B59B6', '#3498DB', '#E74C3C'],
    specialEffects: true
  },
  S: {
    name: '特別な絆',
    totalDuration: 9000,
    story: [
      "心の奥で何かが呼んでいる...",
      "強い絆の予感がする...",
      "運命の出会いの瞬間...",
      "🔥 炎のような絆が結ばれた 🔥",
      "特別な仲間との出会い",
      "新たな冒険の始まり"
    ],
    colors: ['#FF6B6B', '#FFD700', '#E74C3C', '#F39C12'],
    specialEffects: true
  },
  A: {
    name: '新たな仲間',
    totalDuration: 7000,
    story: [
      "新しい出会いの予感...",
      "心が躍る瞬間...",
      "星の導きを感じる...",
      "⭐ 星空の下での出会い ⭐",
      "頼れる仲間の登場",
      "共に歩む道のり"
    ],
    colors: ['#3498DB', '#9B59B6', '#2ECC71', '#1ABC9C'],
    specialEffects: false
  },
  B: {
    name: '心の響き',
    totalDuration: 5000,
    story: [
      "小さな奇跡の始まり...",
      "心に響く何かが...",
      "希望の光が見える...",
      "🌟 希望の星が輝いた 🌟",
      "優しい仲間との出会い",
      "穏やかな日々の始まり"
    ],
    colors: ['#2ECC71', '#27AE60', '#16A085'],
    specialEffects: false
  },
  C: {
    name: '小さな奇跡',
    totalDuration: 4000,
    story: [
      "何か良いことが起こりそう...",
      "小さな幸せの予感...",
      "純粋な出会いの瞬間...",
      "✨ 純真な出会い ✨",
      "可愛い仲間の登場",
      "日常に彩りを添えて"
    ],
    colors: ['#95A5A6', '#BDC3C7', '#ECF0F1'],
    specialEffects: false
  }
};

export const UltimateGachaExperience = ({
  pokemonName,
  rarity,
  cardImageUrl,
  onComplete,
  enableHaptics = true,
  enableSound = true,
  autoPlay = true
}: UltimateGachaExperienceProps) => {
  const [currentPhase, setCurrentPhase] = useState<ExperiencePhase>('prelude');
  const [storyIndex, setStoryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [userInteraction, setUserInteraction] = useState(false);

  const experienceConfig = RARITY_EXPERIENCES[rarity];
  const phaseTimeoutRef = useRef<NodeJS.Timeout>();

  // フェーズの進行管理
  const phases: ExperiencePhase[] = [
    'prelude', 'anticipation', 'tension', 'climax', 'revelation', 'euphoria', 'complete'
  ];

  const currentPhaseIndex = phases.indexOf(currentPhase);
  const progress = ((currentPhaseIndex + 1) / phases.length) * 100;

  // 次のフェーズへの進行
  const advancePhase = useCallback(() => {
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex < phases.length - 1) {
      setCurrentPhase(phases[currentIndex + 1]);
      setStoryIndex(currentIndex + 1);
    } else {
      setIsPlaying(false);
      onComplete?.();
    }
  }, [currentPhase, phases, onComplete]);

  // フェーズタイミングの設定
  const phaseTimings = {
    prelude: 1500,
    anticipation: 2000,
    tension: 1500,
    climax: 2500,
    revelation: 2500,
    euphoria: 2000
  };

  // 自動進行の制御
  useEffect(() => {
    if (!isPlaying || currentPhase === 'complete') return;

    const timing = phaseTimings[currentPhase as keyof typeof phaseTimings];
    if (timing) {
      phaseTimeoutRef.current = setTimeout(advancePhase, timing);
    }

    return () => {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
      }
    };
  }, [currentPhase, isPlaying, advancePhase]);

  // 体験の開始
  const startExperience = useCallback(() => {
    setIsPlaying(true);
    setCurrentPhase('prelude');
    setStoryIndex(0);
    setUserInteraction(true);
    
    // 3秒後にスキップボタンを表示
    setTimeout(() => setShowSkipButton(true), 3000);
  }, []);

  // スキップ機能
  const skipToReveal = useCallback(() => {
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
    }
    setCurrentPhase('revelation');
    setStoryIndex(4);
  }, []);

  // 初期化
  useEffect(() => {
    if (autoPlay) {
      startExperience();
    }
  }, [autoPlay, startExperience]);

  // タップ・クリックでスキップ
  const handleInteraction = useCallback(() => {
    if (!userInteraction && !autoPlay) {
      startExperience();
    } else if (isPlaying && currentPhase !== 'revelation' && currentPhase !== 'euphoria') {
      skipToReveal();
    }
  }, [userInteraction, autoPlay, isPlaying, currentPhase, startExperience, skipToReveal]);

  if (!isPlaying && !autoPlay) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
        onClick={handleInteraction}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white flex items-center justify-center"
            animate={{
              boxShadow: [
                '0 0 20px rgba(255, 255, 255, 0.5)',
                '0 0 40px rgba(255, 255, 255, 0.8)',
                '0 0 20px rgba(255, 255, 255, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-4xl">🎮</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {experienceConfig.name}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            タップして特別な体験を始める
          </p>
          <motion.div
            className="text-sm text-gray-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            画面をタップ
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-50" onClick={handleInteraction}>
      {/* 音響システム */}
      {enableSound && (
        <EmotionalSoundSystem
          rarity={rarity}
          stage={currentPhase === 'prelude' ? 'anticipation' : currentPhase as any}
          enabled={enableSound}
        />
      )}

      {/* メイン演出 */}
      <EmotionalGachaEffects
        pokemonName={pokemonName}
        rarity={rarity}
        cardImageUrl={cardImageUrl}
        enableHaptics={enableHaptics}
      />

      {/* プログレスバー */}
      <motion.div
        className="absolute top-4 left-4 right-4 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: showSkipButton ? 1 : 0 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-blue-400 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>

      {/* ストーリーテキストオーバーレイ */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentPhase}-${storyIndex}`}
            className="text-center max-w-lg mx-4"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg"
              animate={{
                textShadow: [
                  `0 0 20px ${experienceConfig.colors[0]}`,
                  `0 0 40px ${experienceConfig.colors[1] || experienceConfig.colors[0]}`,
                  `0 0 20px ${experienceConfig.colors[0]}`
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {experienceConfig.story[storyIndex] || experienceConfig.story[0]}
            </motion.h1>

            {/* フェーズインジケータ */}
            <motion.div
              className="flex justify-center space-x-2 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 1 }}
            >
              {phases.slice(0, -1).map((phase, index) => (
                <motion.div
                  key={phase}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentPhaseIndex 
                      ? 'bg-white' 
                      : 'bg-white bg-opacity-30'
                  }`}
                  animate={index === currentPhaseIndex ? {
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7]
                  } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* スキップボタン */}
      <AnimatePresence>
        {showSkipButton && currentPhase !== 'revelation' && currentPhase !== 'euphoria' && (
          <motion.button
            className="absolute top-4 right-4 px-4 py-2 bg-white bg-opacity-20 text-white rounded-full text-sm backdrop-blur-sm hover:bg-opacity-30 transition-all pointer-events-auto"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            onClick={(e) => {
              e.stopPropagation();
              skipToReveal();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ⏭ スキップ
          </motion.button>
        )}
      </AnimatePresence>

      {/* レアリティ特別エフェクト */}
      {experienceConfig.specialEffects && (currentPhase === 'climax' || currentPhase === 'revelation') && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: `conic-gradient(from 0deg, transparent, ${experienceConfig.colors[0]}40, transparent, ${experienceConfig.colors[1]}40, transparent)`
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* インタラクションヒント */}
      {currentPhase === 'euphoria' && (
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            タップして続ける
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};