'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CampaignBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  bgColor: string;
  textColor: string;
  ctaText: string;
  priority: number;
}

export default function CampaignBanner() {
  const [banners, setBanners] = useState<CampaignBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaignBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000); // 5秒ごとに切り替え

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const fetchCampaignBanners = async () => {
    try {
      // 一旦ダミーデータを使用
      const dummyBanners: CampaignBanner[] = [
        {
          id: '1',
          title: '🎉 新規登録キャンペーン',
          subtitle: '今なら5000ポイントプレゼント！',
          imageUrl: '/images/campaign-banner-1.png',
          linkUrl: '/mypage?tab=campaigns',
          bgColor: 'from-purple-600 to-pink-600',
          textColor: 'text-white',
          ctaText: '詳細を見る',
          priority: 1
        },
        {
          id: '2',
          title: '🎁 友達紹介キャンペーン',
          subtitle: '友達を紹介して3000ポイントGET！',
          imageUrl: '/images/campaign-banner-2.png',
          linkUrl: '/mypage?tab=campaigns',
          bgColor: 'from-blue-600 to-cyan-600',
          textColor: 'text-white',
          ctaText: '今すぐ紹介',
          priority: 2
        },
        {
          id: '3',
          title: '⚡ 期間限定！SSR確率2倍',
          subtitle: '12/25まで全ガチャでSSR確率アップ中',
          imageUrl: '/images/campaign-banner-3.png',
          linkUrl: '/gacha',
          bgColor: 'from-yellow-500 to-orange-600',
          textColor: 'text-white',
          ctaText: 'ガチャを回す',
          priority: 3
        }
      ];

      setBanners(dummyBanners);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch campaign banners:', error);
      setLoading(false);
    }
  };

  if (loading || banners.length === 0 || !isVisible) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className={`relative bg-gradient-to-r ${currentBanner.bgColor} ${currentBanner.textColor}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative py-8 md:py-12">
              <div className="flex flex-col md:flex-row items-center justify-between">
                {/* テキストコンテンツ */}
                <div className="text-center md:text-left mb-4 md:mb-0 md:mr-8">
                  <h2 className="text-2xl md:text-3xl font-black mb-2">
                    {currentBanner.title}
                  </h2>
                  <p className="text-lg md:text-xl opacity-90 mb-4">
                    {currentBanner.subtitle}
                  </p>
                  <Link
                    href={currentBanner.linkUrl}
                    className="inline-block bg-white text-gray-900 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
                  >
                    {currentBanner.ctaText} →
                  </Link>
                </div>

                {/* 画像（オプション） */}
                {currentBanner.imageUrl && (
                  <div className="hidden md:block">
                    <Image
                      src={currentBanner.imageUrl}
                      alt={currentBanner.title}
                      width={300}
                      height={200}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              {/* 閉じるボタン */}
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              {/* インジケーター */}
              {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? 'w-8 bg-white'
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 背景装飾 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}