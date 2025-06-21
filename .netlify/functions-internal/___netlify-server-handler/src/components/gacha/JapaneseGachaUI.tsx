'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface GachaUIProps {
  gachaType: string;
  onClose?: () => void;
  onPull?: (count: number) => void;
}

export const JapaneseGachaUI = ({ gachaType, onClose, onPull }: GachaUIProps) => {
  const [selectedPull, setSelectedPull] = useState<1 | 10>(1);

  const gachaInfo = {
    'rainbow-legend': {
      title: '虹色伝説ガチャ',
      subtitle: '～運命の出会い～',
      description: 'SSR確率大幅アップ中！',
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #F8B500 100%)',
      buttonColor: 'from-yellow-400 to-pink-500'
    },
    'sakura-event': {
      title: '桜花繚乱ガチャ',
      subtitle: '～春の訪れ～',
      description: '期間限定キャラ登場',
      gradient: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)',
      buttonColor: 'from-pink-400 to-pink-600'
    }
  };

  const info = gachaInfo[gachaType as keyof typeof gachaInfo] || gachaInfo['rainbow-legend'];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-4xl bg-gray-900 rounded-3xl overflow-hidden"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        {/* 背景グラデーション */}
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: info.gradient }}
        />

        {/* ヘッダー */}
        <div className="relative z-10 p-8 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-black text-white mb-2"
            style={{ 
              textShadow: '0 0 30px rgba(255,255,255,0.5)',
              fontFamily: 'sans-serif',
              letterSpacing: '0.05em'
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {info.title}
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-white/80 mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {info.subtitle}
          </motion.p>

          <motion.div
            className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <span className="text-yellow-300 font-bold">
              ⭐ {info.description} ⭐
            </span>
          </motion.div>
        </div>

        {/* ガチャボタンエリア */}
        <div className="relative z-10 p-8 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* 1回引く */}
            <motion.button
              className={`relative overflow-hidden rounded-2xl p-8 ${
                selectedPull === 1 ? 'ring-4 ring-white' : ''
              }`}
              onClick={() => setSelectedPull(1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${info.buttonColor} opacity-80`} />
              <div className="relative z-10">
                <div className="text-6xl font-black text-white mb-2">1回</div>
                <div className="text-2xl font-bold text-white/90">引く</div>
                <div className="mt-4 text-3xl font-bold text-yellow-300">
                  300 pt
                </div>
              </div>
            </motion.button>

            {/* 10回引く */}
            <motion.button
              className={`relative overflow-hidden rounded-2xl p-8 ${
                selectedPull === 10 ? 'ring-4 ring-white' : ''
              }`}
              onClick={() => setSelectedPull(10)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${info.buttonColor} opacity-80`} />
              <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                お得！
              </div>
              <div className="relative z-10">
                <div className="text-6xl font-black text-white mb-2">10回</div>
                <div className="text-2xl font-bold text-white/90">引く</div>
                <div className="mt-4 text-3xl font-bold text-yellow-300">
                  3000 pt
                </div>
                <div className="text-sm text-white/80 mt-1">
                  SR以上1枚確定
                </div>
              </div>
            </motion.button>
          </div>

          {/* 決定ボタン */}
          <motion.button
            className={`w-full max-w-md mx-auto mt-8 py-6 rounded-full bg-gradient-to-r ${info.buttonColor} text-white text-2xl font-black shadow-2xl`}
            onClick={() => onPull?.(selectedPull)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="drop-shadow-lg">
              ガチャを{selectedPull}回引く！
            </span>
          </motion.button>

          {/* 所持ポイント */}
          <div className="text-center mt-6 text-white/60">
            <span className="text-lg">所持ポイント: </span>
            <span className="text-2xl font-bold text-white">12,450 pt</span>
          </div>
        </div>

        {/* 閉じるボタン */}
        <button
          className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          onClick={onClose}
        >
          ✕
        </button>

        {/* 装飾 */}
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </motion.div>
    </motion.div>
  );
};