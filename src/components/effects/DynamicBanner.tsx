'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BannerConfig {
  id: string;
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  accentColor?: string;
  duration?: number;
  featured?: boolean;
}

interface DynamicBannerProps {
  config: BannerConfig;
  onClick?: () => void;
}

export const DynamicBanner = ({ config, onClick }: DynamicBannerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
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
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      rotateY: 5,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
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
      opacity: [0, 0.5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  const featuredBadgeVariants = {
    initial: { x: -100, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: {
        delay: 0.3,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      className="relative w-full aspect-square rounded-2xl overflow-hidden cursor-pointer perspective-1000"
      variants={bannerVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        background: config.backgroundImage 
          ? `url(${config.backgroundImage})` 
          : config.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* グロー効果 */}
      <motion.div
        className="absolute inset-0 bg-white mix-blend-overlay"
        variants={glowVariants}
        initial="initial"
        animate={isHovered ? "animate" : "initial"}
      />

      {/* 内部コンテンツ */}
      <div className="relative z-10 p-8 h-full flex flex-col justify-between">
        {/* 特選バッジ */}
        {config.featured && (
          <motion.div
            className="absolute top-4 left-4 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-sm"
            variants={featuredBadgeVariants}
            initial="initial"
            animate="animate"
          >
            ✨ FEATURED
          </motion.div>
        )}

        {/* タイトルセクション */}
        <div className="mt-auto">
          <motion.h2
            className="text-4xl font-bold text-white mb-2 drop-shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {config.title}
          </motion.h2>
          
          {config.subtitle && (
            <motion.p
              className="text-xl text-white/80 drop-shadow-md"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {config.subtitle}
            </motion.p>
          )}
        </div>

        {/* CTA ボタン */}
        <motion.div
          className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-white font-semibold">ガチャを引く →</span>
        </motion.div>
      </div>

      {/* パーティクル効果 */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              initial={{
                x: Math.random() * 100 + "%",
                y: "100%",
                opacity: 0
              }}
              animate={{
                y: "-20%",
                opacity: [0, 1, 0],
                transition: {
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1
                }
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};