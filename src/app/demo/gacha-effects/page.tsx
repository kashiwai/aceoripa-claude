'use client';

import { useState } from 'react';
import { GachaEffectSystem } from '@/components/effects/GachaEffectSystem';
import { GachaVideoPlayer } from '@/components/effects/GachaVideoPlayer';
import { SoundControl } from '@/components/effects/SoundEffectSystem';
import { motion } from 'framer-motion';

type Rarity = 'SSR' | 'SR' | 'R' | 'N';

export default function GachaEffectsDemo() {
  const [selectedRarity, setSelectedRarity] = useState<Rarity>('SSR');
  const [showEffect, setShowEffect] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [demoMode, setDemoMode] = useState<'effect' | 'video'>('effect');

  const rarityData = {
    SSR: {
      color: 'from-yellow-400 to-pink-500',
      title: 'SUPER SPECIAL RARE',
      description: '虹色の豪華演出（8秒）',
      sound: '複雑な和音',
      vibration: '長い振動パターン'
    },
    SR: {
      color: 'from-red-500 to-orange-500',
      title: 'SPECIAL RARE',
      description: '炎の演出（5秒）',
      sound: '力強い音',
      vibration: '中程度の振動'
    },
    R: {
      color: 'from-blue-500 to-cyan-500',
      title: 'RARE',
      description: '水の演出（3秒）',
      sound: '涼しげな音',
      vibration: '短い振動'
    },
    N: {
      color: 'from-gray-500 to-gray-600',
      title: 'NORMAL',
      description: '光の演出（2秒）',
      sound: 'シンプルな音',
      vibration: '軽い振動'
    }
  };

  const handlePlayEffect = () => {
    if (demoMode === 'effect') {
      setShowEffect(true);
    } else {
      setShowVideo(true);
    }
  };

  const handleEffectComplete = () => {
    setShowEffect(false);
    setShowVideo(false);
  };

  const mockGachaResult = {
    rarity: selectedRarity,
    item: {
      id: 'demo-1',
      name: `${selectedRarity}デモカード`,
      imageUrl: '/demo-card.png'
    },
    theme: 'fantasy'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900">
      {/* エフェクト表示 */}
      {showEffect && (
        <GachaEffectSystem 
          rarity={selectedRarity} 
          onComplete={handleEffectComplete}
        />
      )}

      {/* 動画表示 */}
      {showVideo && (
        <div className="fixed inset-0 z-50 bg-black">
          <GachaVideoPlayer
            result={mockGachaResult}
            onComplete={handleEffectComplete}
            autoPlay={true}
          />
        </div>
      )}

      {/* メインUI */}
      <div className="container mx-auto px-4 py-8">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold text-white text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎰 ガチャ演出デモ
        </motion.h1>

        {/* デモモード選択 */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              demoMode === 'effect' 
                ? 'bg-white text-purple-800' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => setDemoMode('effect')}
          >
            エフェクトモード
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              demoMode === 'video' 
                ? 'bg-white text-purple-800' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            onClick={() => setDemoMode('video')}
          >
            動画生成モード
          </button>
        </div>

        {/* レアリティ選択 */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            レアリティを選択
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {(Object.keys(rarityData) as Rarity[]).map(rarity => (
              <motion.button
                key={rarity}
                className={`relative p-6 rounded-xl transition-all ${
                  selectedRarity === rarity 
                    ? 'ring-4 ring-white ring-opacity-50 scale-105' 
                    : 'hover:scale-105'
                }`}
                onClick={() => setSelectedRarity(rarity)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${rarityData[rarity].color} rounded-xl opacity-90`} />
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-white mb-2">{rarity}</div>
                  <div className="text-xs text-white/80">{rarityData[rarity].title}</div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* 選択中のレアリティ詳細 */}
          <motion.div
            key={selectedRarity}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${rarityData[selectedRarity].color} bg-clip-text text-transparent`}>
              {rarityData[selectedRarity].title}
            </h3>
            
            <div className="space-y-3 text-white">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎬</span>
                <span>演出: {rarityData[selectedRarity].description}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔊</span>
                <span>音声: {rarityData[selectedRarity].sound}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📳</span>
                <span>振動: {rarityData[selectedRarity].vibration}</span>
              </div>
            </div>
          </motion.div>

          {/* 再生ボタン */}
          <div className="text-center">
            <motion.button
              className={`px-12 py-6 rounded-full text-2xl font-bold text-white shadow-2xl bg-gradient-to-r ${rarityData[selectedRarity].color}`}
              onClick={handlePlayEffect}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={showEffect || showVideo}
            >
              {showEffect || showVideo ? '再生中...' : '演出を再生'}
            </motion.button>
          </div>
        </div>

        {/* 説明 */}
        <div className="mt-16 text-center text-white/60 text-sm max-w-2xl mx-auto">
          <p className="mb-4">
            このデモでは、レアリティごとに異なる演出を体験できます。
          </p>
          <p className="mb-4">
            <strong>エフェクトモード:</strong> Framer Motionを使用した軽量な演出
          </p>
          <p>
            <strong>動画生成モード:</strong> Canvas APIで動的に生成される演出動画
          </p>
        </div>
      </div>

      {/* サウンドコントロール */}
      <SoundControl />
    </div>
  );
}