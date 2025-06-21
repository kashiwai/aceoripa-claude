'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface DynamicBannerProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  backgroundColor?: string;
  accentColor?: string;
  duration?: number;
  featured?: boolean;
  ctaText?: string;
  onClick?: () => void;
}

export const DynamicBanner = ({ 
  title = '',
  subtitle = '',
  imageUrl,
  backgroundColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  accentColor = '#FFD700',
  duration = 5000,
  featured = false,
  ctaText,
  onClick 
}: DynamicBannerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const bannerVariants = {
    initial: { 
      scale: 0.9, 
      opacity: 0,
      rotateY: -30 
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    },
    hover: {
      scale: 1.05,
      rotateY: 5,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const
      }
    },
    tap: {
      scale: 0.95,
      rotateY: -5
    }
  };

  const glowVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <motion.div
      className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden cursor-pointer shadow-2xl"
      variants={bannerVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        background: imageUrl 
          ? `url(${imageUrl})` 
          : backgroundColor,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* グロー効果 */}
      <motion.div
        className="absolute inset-0 bg-white mix-blend-overlay"
        variants={glowVariants}
        initial="initial"
        animate={featured ? "animate" : "initial"}
        style={{
          background: `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)`
        }}
      />

      {/* コンテンツ */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
        <motion.h3 
          className="text-3xl md:text-4xl font-bold text-white mb-2"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {title}
        </motion.h3>
        
        {subtitle && (
          <motion.p 
            className="text-lg md:text-xl text-gray-200 mb-4"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {subtitle}
          </motion.p>
        )}

        {ctaText && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <span className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold hover:bg-white/30 transition-colors">
              {ctaText}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </motion.div>
        )}
      </div>

      {/* フィーチャーバッジ */}
      {featured && (
        <motion.div
          className="absolute top-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-full font-bold text-sm"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
        >
          おすすめ
        </motion.div>
      )}

      {/* ホバーエフェクト */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* パーティクルエフェクト */}
      {mounted && isHovered && featured && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{ 
                x: 0,
                y: 0,
                scale: 0 
              }}
              animate={{ 
                x: (i % 2 === 0 ? 1 : -1) * (50 + i * 20),
                y: (i % 3 === 0 ? 1 : -1) * (50 + i * 15),
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 1
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default DynamicBanner;