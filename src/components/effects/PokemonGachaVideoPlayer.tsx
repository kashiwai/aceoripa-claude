'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIVideoGenerationService, PokemonGachaVideoPrompts } from '@/lib/ai/video-generation-api';

interface PokemonGachaVideoPlayerProps {
  pokemonName: string;
  pokemonType: string;
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  onComplete?: () => void;
  useAIGeneration?: boolean;
}

export const PokemonGachaVideoPlayer = ({
  pokemonName,
  pokemonType,
  rarity,
  onComplete,
  useAIGeneration = false
}: PokemonGachaVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (useAIGeneration) {
      generateAIVideo();
    } else {
      // サンプル動画を使用
      loadSampleVideo();
    }
  }, [pokemonName, rarity, useAIGeneration]);

  // サンプル動画の読み込み
  const loadSampleVideo = () => {
    const sampleVideos = {
      SSR: '/samplemovie/ssr-gacha-effect.mp4',
      SR: '/samplemovie/sr-gacha-effect.mp4',
      R: '/samplemovie/r-gacha-effect.mp4',
      N: '/samplemovie/n-gacha-effect.mp4'
    };
    
    setVideoUrl(sampleVideos[rarity]);
  };

  // AI動画生成
  const generateAIVideo = async () => {
    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      const videoService = new AIVideoGenerationService();
      
      // プロンプト生成
      let prompt = '';
      switch (rarity) {
        case 'SSR':
          prompt = PokemonGachaVideoPrompts.generateSSRPrompt(pokemonName, pokemonType);
          break;
        case 'SR':
          prompt = PokemonGachaVideoPrompts.generateSRPrompt(pokemonName, pokemonType);
          break;
        case 'R':
          prompt = PokemonGachaVideoPrompts.generateRPrompt(pokemonName, pokemonType);
          break;
        default:
          prompt = `Pokemon ${pokemonName} simple reveal animation`;
      }

      setGenerationProgress(30);

      // 動画生成リクエスト
      const response = await videoService.generateVideo({
        prompt,
        duration: rarity === 'SSR' ? 8 : rarity === 'SR' ? 5 : 3,
        resolution: '1080p',
        style: 'anime',
        fps: 30
      });

      setGenerationProgress(50);

      // ジョブのステータスをポーリング
      if (response.status === 'pending' || response.status === 'processing') {
        const checkStatus = async () => {
          const status = await videoService.checkJobStatus(response.jobId, 'runway');
          
          if (status.status === 'completed') {
            setVideoUrl(status.videoUrl);
            setIsGenerating(false);
            setGenerationProgress(100);
          } else if (status.status === 'failed') {
            throw new Error('Video generation failed');
          } else {
            setGenerationProgress(prev => Math.min(prev + 10, 90));
            setTimeout(checkStatus, 2000);
          }
        };
        
        await checkStatus();
      } else {
        setVideoUrl(response.videoUrl);
        setIsGenerating(false);
        setGenerationProgress(100);
      }
    } catch (err) {
      console.error('AI video generation failed:', err);
      setError('AI動画生成に失敗しました。サンプル動画を使用します。');
      loadSampleVideo();
      setIsGenerating(false);
    }
  };

  // 動画再生終了時の処理
  const handleVideoEnd = () => {
    onComplete?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 z-60"
          >
            <div className="text-center">
              <div className="mb-8">
                <div className="text-6xl mb-4">⚡</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  AI動画生成中...
                </h2>
                <p className="text-gray-400">
                  {pokemonName}の{rarity}演出を作成しています
                </p>
              </div>
              
              {/* プログレスバー */}
              <div className="w-64 mx-auto">
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${generationProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {generationProgress}%
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="absolute top-4 right-4 bg-red-500/20 border border-red-500 rounded-lg p-4 max-w-sm">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          autoPlay
          onEnded={handleVideoEnd}
          controls={false}
        />
      )}

      {/* オーバーレイUI */}
      <div className="absolute top-0 left-0 right-0 p-8 pointer-events-none">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h1 className={`text-6xl font-bold ${getRarityTextStyle(rarity)}`}>
            {rarity}
          </h1>
          <p className="text-2xl text-white mt-2">
            {pokemonName}
          </p>
        </motion.div>
      </div>

      {/* スキップボタン */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={handleVideoEnd}
        className="absolute bottom-8 right-8 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-colors"
      >
        スキップ →
      </motion.button>
    </div>
  );
};

// レアリティ別テキストスタイル
function getRarityTextStyle(rarity: string): string {
  const styles = {
    SSR: 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 animate-pulse drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]',
    SR: 'text-orange-500 drop-shadow-[0_0_20px_rgba(255,69,0,0.8)]',
    R: 'text-blue-500 drop-shadow-[0_0_15px_rgba(0,191,255,0.8)]',
    N: 'text-gray-400 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]'
  };
  return styles[rarity as keyof typeof styles] || '';
}