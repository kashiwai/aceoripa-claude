'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getVideoForRarity, getRandomVideoForRarity, VideoMapping } from './SampleVideoMapping';

interface EnhancedGachaEffectsProps {
  pokemonName: string;
  pokemonType: string;
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  cardImageUrl?: string;
  onComplete?: () => void;
  playMultipleEffects?: boolean;
}

export const EnhancedGachaEffects = ({
  pokemonName,
  pokemonType,
  rarity,
  cardImageUrl,
  onComplete,
  playMultipleEffects = false
}: EnhancedGachaEffectsProps) => {
  const [currentStage, setCurrentStage] = useState<'opening' | 'reveal' | 'celebration'>('opening');
  const [currentVideo, setCurrentVideo] = useState<VideoMapping | null>(null);
  const [showCardReveal, setShowCardReveal] = useState(false);
  const [showRarityText, setShowRarityText] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [effectsSequence, setEffectsSequence] = useState<VideoMapping[]>([]);
  const [currentEffectIndex, setCurrentEffectIndex] = useState(0);

  useEffect(() => {
    startGachaSequence();
  }, [rarity, playMultipleEffects]);

  const startGachaSequence = () => {
    const sequence: VideoMapping[] = [];

    if (playMultipleEffects && rarity === 'SSR') {
      // SSRの場合は豪華な3段階演出
      const opening = getVideoForRarity('SSR', 'opening');
      const effect = getVideoForRarity('SSR', 'effect');
      const celebration = getVideoForRarity('SSR', 'celebration');
      
      if (opening) sequence.push(opening);
      if (effect) sequence.push(effect);
      if (celebration) sequence.push(celebration);
    } else if (playMultipleEffects && rarity === 'SR') {
      // SRの場合は2段階演出
      const effect = getVideoForRarity('SR', 'effect');
      const reveal = getVideoForRarity('SR', 'reveal');
      
      if (effect) sequence.push(effect);
      if (reveal) sequence.push(reveal);
    } else {
      // 通常は1つの動画
      const video = getRandomVideoForRarity(rarity);
      if (video) sequence.push(video);
    }

    setEffectsSequence(sequence);
    setCurrentEffectIndex(0);
    
    if (sequence.length > 0) {
      setCurrentVideo(sequence[0]);
    }
  };

  const handleVideoEnd = () => {
    const nextIndex = currentEffectIndex + 1;
    
    if (nextIndex < effectsSequence.length) {
      // 次の動画に進む
      setCurrentEffectIndex(nextIndex);
      setCurrentVideo(effectsSequence[nextIndex]);
    } else {
      // 全ての動画が終了
      setShowCardReveal(true);
      setShowRarityText(true);
      
      // 最終的な完了処理
      setTimeout(() => {
        onComplete?.();
      }, 3000);
    }
  };

  // 音声エフェクト
  const playAudioEffect = (stage: string) => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // レアリティ別の音階
      const frequencies = {
        SSR: [523, 659, 784, 988, 1175], // ドミソシレ
        SR: [440, 554, 659, 831], // ラドミソ
        R: [349, 440, 523], // ファラド
        N: [262, 330] // ドミ
      };
      
      const notes = frequencies[rarity];
      let noteIndex = 0;
      
      const playNote = () => {
        if (noteIndex >= notes.length) return;
        
        oscillator.frequency.setValueAtTime(notes[noteIndex], audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        noteIndex++;
        if (noteIndex < notes.length) {
          setTimeout(playNote, 200);
        }
      };
      
      playNote();
    }
  };

  // バイブレーション
  const triggerVibration = () => {
    if ('vibrate' in navigator) {
      const patterns = {
        SSR: [200, 100, 200, 100, 400, 100, 200],
        SR: [150, 50, 150, 50, 300],
        R: [100, 50, 100],
        N: [50]
      };
      navigator.vibrate(patterns[rarity]);
    }
  };

  useEffect(() => {
    if (currentVideo) {
      playAudioEffect(currentVideo.type);
      triggerVibration();
    }
  }, [currentVideo]);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* メイン動画 */}
      {currentVideo && (
        <video
          ref={videoRef}
          key={`${currentVideo.filename}-${currentEffectIndex}`}
          src={`/samplemovie/${currentVideo.filename}`}
          className="w-full h-full object-cover"
          autoPlay
          muted={false}
          onEnded={handleVideoEnd}
          onError={(e) => {
            console.error('Video playback error:', e);
            handleVideoEnd(); // エラー時は次に進む
          }}
        />
      )}

      {/* オーバーレイエフェクト */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 画面エフェクト */}
        <ScreenEffects rarity={rarity} isActive={!!currentVideo} />
        
        {/* カード表示 */}
        <AnimatePresence>
          {showCardReveal && (
            <motion.div
              initial={{ scale: 0, rotateY: 180, opacity: 0 }}
              animate={{ 
                scale: 1, 
                rotateY: 0, 
                opacity: 1 
              }}
              transition={{ 
                duration: 1.5, 
                ease: "backOut",
                delay: 0.5 
              }}
              style={{ transformStyle: 'preserve-3d' }}
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <EnhancedCardDisplay
                pokemonName={pokemonName}
                pokemonType={pokemonType}
                rarity={rarity}
                imageUrl={cardImageUrl}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* レアリティテキスト */}
        <AnimatePresence>
          {showRarityText && (
            <motion.div
              initial={{ y: -100, opacity: 0, scale: 0 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ 
                duration: 1, 
                ease: "elasticOut",
                delay: 1 
              }}
              className="absolute top-20 left-1/2 transform -translate-x-1/2"
            >
              <RarityDisplay rarity={rarity} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 進行状況インジケーター */}
        {effectsSequence.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              {effectsSequence.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index <= currentEffectIndex ? 'bg-yellow-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* デバッグ情報（開発時のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded text-xs">
          <div>動画: {currentVideo?.filename}</div>
          <div>段階: {currentEffectIndex + 1}/{effectsSequence.length}</div>
          <div>レアリティ: {rarity}</div>
          <div>ポケモン: {pokemonName}</div>
        </div>
      )}
    </div>
  );
};

// 画面エフェクト
const ScreenEffects = ({ rarity, isActive }: { rarity: string; isActive: boolean }) => {
  if (!isActive) return null;

  return (
    <>
      {/* レアリティ別画面エフェクト */}
      {rarity === 'SSR' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
      
      {rarity === 'SR' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/20 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}

      {/* エッジ光効果 */}
      <div className={`absolute inset-0 pointer-events-none ${getEdgeGlow(rarity)}`} />
    </>
  );
};

// カード表示
const EnhancedCardDisplay = ({ 
  pokemonName, 
  pokemonType, 
  rarity, 
  imageUrl 
}: { 
  pokemonName: string; 
  pokemonType: string; 
  rarity: string; 
  imageUrl?: string; 
}) => (
  <div className={`relative ${getCardSize(rarity)}`}>
    {/* カード本体 */}
    <div className={`absolute inset-0 rounded-2xl ${getCardBackground(rarity)} ${getCardGlow(rarity)}`}>
      <div className="p-6 h-full flex flex-col">
        {/* カード画像 */}
        <div className="flex-1 bg-black/20 rounded-xl mb-4 overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={pokemonName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              <span className="text-6xl">✨</span>
            </div>
          )}
        </div>
        
        {/* カード情報 */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-1">{pokemonName}</h3>
          <p className="text-lg text-white/80 capitalize">{pokemonType} Type</p>
        </div>
      </div>
    </div>
    
    {/* ホログラム効果 */}
    {(rarity === 'SSR' || rarity === 'SR') && (
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-2xl"
        animate={{
          rotate: [0, 5, -5, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    )}
  </div>
);

// レアリティ表示
const RarityDisplay = ({ rarity }: { rarity: string }) => (
  <div className="text-center">
    <motion.div
      className={`text-8xl font-black ${getRarityTextStyle(rarity)}`}
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 1, -1, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {rarity}
    </motion.div>
    <motion.div
      className="text-2xl text-white mt-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {getRarityDescription(rarity)}
    </motion.div>
  </div>
);

// ヘルパー関数
function getCardSize(rarity: string): string {
  const sizes = {
    SSR: 'w-80 h-96',
    SR: 'w-72 h-88',
    R: 'w-64 h-80',
    N: 'w-56 h-72'
  };
  return sizes[rarity as keyof typeof sizes] || sizes.N;
}

function getCardBackground(rarity: string): string {
  const backgrounds = {
    SSR: 'bg-gradient-to-br from-yellow-400 via-yellow-600 to-yellow-800',
    SR: 'bg-gradient-to-br from-orange-400 via-orange-600 to-red-600',
    R: 'bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800',
    N: 'bg-gradient-to-br from-gray-400 via-gray-600 to-gray-800'
  };
  return backgrounds[rarity as keyof typeof backgrounds] || backgrounds.N;
}

function getCardGlow(rarity: string): string {
  const glows = {
    SSR: 'shadow-[0_0_80px_20px_rgba(255,215,0,0.8)]',
    SR: 'shadow-[0_0_60px_15px_rgba(255,69,0,0.8)]',
    R: 'shadow-[0_0_40px_10px_rgba(0,191,255,0.8)]',
    N: 'shadow-[0_0_20px_5px_rgba(255,255,255,0.5)]'
  };
  return glows[rarity as keyof typeof glows] || '';
}

function getEdgeGlow(rarity: string): string {
  const glows = {
    SSR: 'shadow-[inset_0_0_100px_rgba(255,215,0,0.3)]',
    SR: 'shadow-[inset_0_0_80px_rgba(255,69,0,0.3)]',
    R: 'shadow-[inset_0_0_60px_rgba(0,191,255,0.3)]',
    N: 'shadow-[inset_0_0_40px_rgba(255,255,255,0.2)]'
  };
  return glows[rarity as keyof typeof glows] || '';
}

function getRarityTextStyle(rarity: string): string {
  const styles = {
    SSR: 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]',
    SR: 'text-orange-500 drop-shadow-[0_0_20px_rgba(255,69,0,0.8)]',
    R: 'text-blue-500 drop-shadow-[0_0_15px_rgba(0,191,255,0.8)]',
    N: 'text-gray-400 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]'
  };
  return styles[rarity as keyof typeof styles] || '';
}

function getRarityDescription(rarity: string): string {
  const descriptions = {
    SSR: 'SUPER SUPER RARE',
    SR: 'SUPER RARE',
    R: 'RARE',
    N: 'NORMAL'
  };
  return descriptions[rarity as keyof typeof descriptions] || '';
}