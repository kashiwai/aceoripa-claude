'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicBanner } from './DynamicBanner';

interface BannerData {
  id: string;
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  featured?: boolean;
  gachaType?: string;
}

const defaultBanners: BannerData[] = [
  {
    id: 'banner-1',
    title: 'レジェンドガチャ',
    subtitle: 'SSR確率2倍アップ！',
    backgroundImage: '/api/placeholder/banners/gacha-banner-1',
    featured: true,
    gachaType: 'legend'
  },
  {
    id: 'banner-2',
    title: '期間限定イベント',
    subtitle: '新キャラ登場',
    backgroundImage: '/api/placeholder/banners/gacha-banner-2',
    gachaType: 'event'
  },
  {
    id: 'banner-3',
    title: 'デイリーガチャ',
    subtitle: '毎日1回無料',
    backgroundImage: '/api/placeholder/banners/gacha-banner-3',
    gachaType: 'daily'
  },
  {
    id: 'banner-4',
    title: 'スペシャルオファー',
    subtitle: '初回限定50%OFF',
    backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    featured: true,
    gachaType: 'special'
  }
];

interface BannerCarouselProps {
  onBannerClick?: (bannerId: string, gachaType?: string) => void;
  autoPlay?: boolean;
  interval?: number;
}

export const BannerCarousel = ({ 
  onBannerClick, 
  autoPlay = true, 
  interval = 5000 
}: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners] = useState<BannerData[]>(defaultBanners);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, banners.length]);

  const handleBannerClick = (banner: BannerData) => {
    if (onBannerClick) {
      onBannerClick(banner.id, banner.gachaType);
    }
  };

  const containerVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setCurrentIndex((prev) => {
      const newIndex = prev + newDirection;
      if (newIndex < 0) return banners.length - 1;
      if (newIndex >= banners.length) return 0;
      return newIndex;
    });
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-2xl">
        <AnimatePresence initial={false} custom={1}>
          <motion.div
            key={currentIndex}
            custom={1}
            variants={containerVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute inset-0"
          >
            <DynamicBanner
              title={banners[currentIndex].title}
              subtitle={banners[currentIndex].subtitle}
              imageUrl={banners[currentIndex].backgroundImage}
              backgroundColor={banners[currentIndex].backgroundColor}
              onClick={() => handleBannerClick(banners[currentIndex])}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* インジケーター */}
      <div className="flex justify-center mt-4 space-x-2">
        {banners.map((_, index) => (
          <motion.button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-purple-600' : 'bg-gray-300'
            }`}
            onClick={() => setCurrentIndex(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
          />
        ))}
      </div>

      {/* ナビゲーションボタン */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full"
        onClick={() => paginate(-1)}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full"
        onClick={() => paginate(1)}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default BannerCarousel;