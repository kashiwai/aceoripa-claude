'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GachaVideoEngine, GachaResult } from './VideoGenerationEngine';

interface GachaVideoPlayerProps {
  result: GachaResult;
  onComplete?: () => void;
  autoPlay?: boolean;
}

export const GachaVideoPlayer = ({ result, onComplete, autoPlay = true }: GachaVideoPlayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const engineRef = useRef<GachaVideoEngine | null>(null);
  
  const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'playing' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      engineRef.current = new GachaVideoEngine(canvasRef.current);
    }
    
    return () => {
      engineRef.current?.cleanup();
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (autoPlay && status === 'idle') {
      generateVideo();
    }
  }, [autoPlay, status]);

  const generateVideo = async () => {
    if (!engineRef.current) return;
    
    setStatus('generating');
    setError(null);
    setProgress(0);
    
    try {
      const videoBlob = await engineRef.current.generateGachaVideo(result, (p) => {
        setProgress(Math.round(p));
      });
      
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      setStatus('ready');
      
      // 自動再生
      if (autoPlay && videoRef.current) {
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Video generation failed:', err);
      setError('動画生成に失敗しました');
      setStatus('idle');
    }
  };

  const handleVideoEnd = () => {
    setStatus('completed');
    onComplete?.();
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setStatus('playing');
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* 生成用Canvas (非表示) */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width={1920}
        height={1080}
      />
      
      {/* ステータス表示 */}
      <AnimatePresence>
        {status === 'generating' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-white text-xl mb-4">演出動画を生成中...</div>
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="text-white/60 mt-2">{progress}%</div>
          </motion.div>
        )}
        
        {error && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-red-500 text-xl mb-4">{error}</div>
            <button
              onClick={generateVideo}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              再試行
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ビデオプレイヤー */}
      {videoUrl && (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onPlay={() => setStatus('playing')}
            onEnded={handleVideoEnd}
            controls={false}
            playsInline
            muted={false}
          />
          
          {/* コントロールボタン */}
          {status === 'completed' && (
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={handleReplay}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                もう一度見る
              </button>
            </motion.div>
          )}
        </div>
      )}
      
      {/* レアリティ表示 */}
      <motion.div
        className="absolute top-4 right-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className={`px-4 py-2 rounded-full font-bold text-white ${
          result.rarity === 'SSR' ? 'bg-gradient-to-r from-yellow-400 to-pink-500' :
          result.rarity === 'SR' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
          result.rarity === 'R' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
          'bg-gradient-to-r from-gray-500 to-gray-600'
        }`}>
          {result.rarity}
        </div>
      </motion.div>
    </div>
  );
};