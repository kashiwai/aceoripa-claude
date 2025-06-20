'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import { JapaneseGachaUI } from '../gacha/JapaneseGachaUI';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  gradient: string;
  accentColor: string;
  image?: string;
  featured?: boolean;
}

const banners: Banner[] = [
  {
    id: 'rainbow-legend',
    title: '虹色レジェンドガチャ',
    subtitle: 'SSR確率大幅アップ中！',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 20%, #4ECDC4 40%, #556270 60%, #C44569 80%, #F8B500 100%)',
    accentColor: '#FFD700',
    featured: true,
    fontClass: 'font-dela',
    titleClass: 'text-7xl md:text-8xl text-gradient-rainbow text-3d'
  },
  {
    id: 'sakura-event',
    title: '桜祭りイベント',
    subtitle: '期間限定キャラ登場',
    gradient: 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 50%, #FFDAB9 100%)',
    accentColor: '#FF69B4'
  },
  {
    id: 'ocean-treasure',
    title: '海底の秘宝ガチャ',
    subtitle: '水属性SSR出現率UP',
    gradient: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 50%, #0ED2F7 100%)',
    accentColor: '#00CED1'
  },
  {
    id: 'golden-fortune',
    title: 'ゴールデンフォーチュン',
    subtitle: '金運上昇キャンペーン',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
    accentColor: '#FFD700'
  }
];

export const ColorfulBannerSection = () => {
  const [selectedBanner, setSelectedBanner] = useState(0);
  const [showGachaUI, setShowGachaUI] = useState(false);
  const [selectedGachaType, setSelectedGachaType] = useState('');

  const handleBannerClick = () => {
    setSelectedGachaType(banners[selectedBanner].id);
    setShowGachaUI(true);
  };

  return (
    <div className="w-full py-8">
      {/* ガチャUI表示 */}
      <AnimatePresence>
        {showGachaUI && (
          <JapaneseGachaUI
            gachaType={selectedGachaType}
            onClose={() => setShowGachaUI(false)}
            onPull={(count) => {
              console.log(`${count}回ガチャを実行`);
              // ここでガチャ実行処理
            }}
          />
        )}
      </AnimatePresence>

      {/* メインバナー表示 */}
      <motion.div
        key={selectedBanner}
        className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden mb-6 mx-4 cursor-pointer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        onClick={handleBannerClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div
          className="absolute inset-0"
          style={{ background: banners[selectedBanner].gradient }}
        />
        
        {/* キラキラエフェクト */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 3,
                repeat: Infinity,
              }}
            />
          ))}
        </div>

        {/* バナーコンテンツ */}
        <div className="relative z-10 h-full flex items-center justify-center text-center p-8">
          <div>
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-white mb-4"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {banners[selectedBanner].title}
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-white/90"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {banners[selectedBanner].subtitle}
            </motion.p>
            
            {banners[selectedBanner].featured && (
              <motion.div
                className="inline-block mt-6 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <span className="text-yellow-300 font-bold text-lg">
                  ⭐ 今がチャンス！ ⭐
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* 装飾的な泡 */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
      </motion.div>

      {/* サムネイル選択 */}
      <div className="flex gap-3 px-4 overflow-x-auto pb-4">
        {banners.map((banner, index) => (
          <motion.button
            key={banner.id}
            className={`flex-shrink-0 w-32 h-20 rounded-xl overflow-hidden relative ${
              selectedBanner === index ? 'ring-4 ring-white' : ''
            }`}
            style={{ background: banner.gradient }}
            onClick={() => setSelectedBanner(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 h-full flex items-center justify-center">
              <span className="text-white text-xs font-bold px-2 text-center">
                {banner.title}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};