'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { JapaneseGachaUI } from '../gacha/JapaneseGachaUI';

export const JapaneseBannerSection = () => {
  const [showGachaUI, setShowGachaUI] = useState(false);
  const [selectedGachaType, setSelectedGachaType] = useState('');

  const handleBannerClick = (gachaType: string) => {
    setSelectedGachaType(gachaType);
    setShowGachaUI(true);
  };

  return (
    <div className="w-full">
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

      {/* 固定メインバナー */}
      <div className="relative">
        <motion.div
          className="relative h-[400px] md:h-[500px] overflow-hidden cursor-pointer bg-gradient-to-br from-purple-900 via-pink-600 to-yellow-500"
          onClick={() => handleBannerClick('main-gacha')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* 背景パターン */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
            }} />
          </div>

          {/* キラキラエフェクト */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
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

          {/* メインコンテンツ */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
            {/* 超特大タイトル */}
            <motion.h1
              className="font-dela text-6xl md:text-8xl lg:text-9xl text-white mb-4"
              style={{ 
                textShadow: `
                  0 0 10px rgba(255,255,255,0.8),
                  0 0 20px rgba(255,255,255,0.6),
                  0 0 30px rgba(255,255,255,0.4),
                  2px 2px 0 #000,
                  4px 4px 0 #000,
                  6px 6px 0 #000,
                  8px 8px 10px rgba(0,0,0,0.8)
                `
              }}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="text-gradient-rainbow">超絶</span>
              <span className="text-yellow-300">ガチャ</span>
            </motion.h1>

            {/* サブタイトル各種フォント */}
            <motion.div
              className="space-y-2 mb-6"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p className="font-rock text-3xl md:text-4xl text-yellow-300 text-glow">
                爆誕！伝説の英雄
              </p>
              <p className="font-hachi text-2xl md:text-3xl text-white">
                SSR確率超絶アップ中
              </p>
              <p className="font-yusei text-xl md:text-2xl text-pink-300">
                今だけ限定！虹色の奇跡
              </p>
            </motion.div>

            {/* CTAボタン */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <div className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl">
                <span className="font-mplus-rounded font-black text-2xl md:text-3xl text-white text-stroke-black">
                  今すぐ引く！
                </span>
              </div>
            </motion.div>

            {/* 追加テキスト装飾 */}
            <motion.div
              className="mt-6 space-y-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="font-zen-maru text-lg text-white/80">
                ★ 10連でSR以上確定 ★
              </p>
              <p className="font-kiwi text-lg text-yellow-200">
                初回限定50%OFF
              </p>
            </motion.div>
          </div>

          {/* 角の装飾 */}
          <div className="absolute top-4 left-4 font-dot text-white text-xl">
            【期間限定】
          </div>
          <div className="absolute top-4 right-4 font-stick text-yellow-300 text-2xl animate-pulse">
            HOT
          </div>
          <div className="absolute bottom-4 left-4 font-kosugi text-white text-lg">
            ※ガチャには有効期限があります
          </div>
          <div className="absolute bottom-4 right-4 font-sawarabi text-white text-lg">
            詳細はこちら →
          </div>
        </motion.div>

        {/* 下部の小バナー群 */}
        <div className="grid grid-cols-3 gap-2 p-2 bg-gray-900">
          <motion.div
            className="relative h-24 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg cursor-pointer overflow-hidden"
            onClick={() => handleBannerClick('sakura-gacha')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="p-3 h-full flex items-center justify-center">
              <span className="font-hachi text-white text-lg md:text-xl text-center">
                桜花繚乱
              </span>
            </div>
          </motion.div>

          <motion.div
            className="relative h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg cursor-pointer overflow-hidden"
            onClick={() => handleBannerClick('ocean-gacha')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="p-3 h-full flex items-center justify-center">
              <span className="font-rock text-white text-lg md:text-xl text-center">
                海底秘宝
              </span>
            </div>
          </motion.div>

          <motion.div
            className="relative h-24 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg cursor-pointer overflow-hidden"
            onClick={() => handleBannerClick('gold-gacha')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="p-3 h-full flex items-center justify-center">
              <span className="font-dela text-white text-lg md:text-xl text-center">
                黄金祭
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};