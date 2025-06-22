'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { OpenAIVideoAPI, generateOpenAIGachaVideo } from '@/lib/ai/openai-video-api';
import { LeonardoVideoAPI, generateGachaVideo } from '@/lib/ai/leonardo-video-api';
import { generatePokemonGachaVideo } from '@/lib/video/canvas-to-video';

interface AIVideoGeneratorProps {
  pokemonName: string;
  pokemonType: string;
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  onComplete?: (videoUrl: string) => void;
  onError?: (error: string) => void;
  preferredService?: 'openai' | 'leonardo' | 'auto';
}

export const AIVideoGenerator = ({
  pokemonName,
  pokemonType,
  rarity,
  onComplete,
  onError,
  preferredService = 'auto'
}: AIVideoGeneratorProps) => {
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string>('');
  const [serviceUsed, setServiceUsed] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (status === 'idle') {
      generateVideo();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pokemonName, rarity]);

  const generateVideo = async () => {
    setStatus('generating');
    setProgress(10);
    setCurrentStep('AI動画生成サービスを選択中...');

    try {
      let result;
      let service = '';

      // サービス選択ロジック
      if (preferredService === 'openai' || preferredService === 'auto') {
        try {
          setCurrentStep('OpenAI Soraで動画生成中...');
          setServiceUsed('OpenAI Sora');
          result = await generateOpenAIGachaVideo(pokemonName, pokemonType, rarity);
          service = 'openai';
          setProgress(30);
        } catch (error) {
          console.log('OpenAI failed, trying Leonardo...');
          if (preferredService === 'openai') {
            throw error;
          }
        }
      }

      if (!result && (preferredService === 'leonardo' || preferredService === 'auto')) {
        try {
          setCurrentStep('Leonardo.aiで動画生成中...');
          setServiceUsed('Leonardo.ai');
          result = await generateGachaVideo(pokemonName, pokemonType, rarity);
          service = 'leonardo';
          setProgress(30);
        } catch (error) {
          console.log('Leonardo failed');
          if (preferredService === 'leonardo') {
            throw error;
          }
        }
      }

      if (!result) {
        throw new Error('すべての動画生成サービスが利用できません');
      }

      // 生成完了まで待機
      if (result.status === 'pending' || result.status === 'processing') {
        await waitForCompletion(result.id, service);
      } else if (result.status === 'completed' && result.video_url) {
        // DALL-E 3の場合は実際の動画を生成
        let finalVideoUrl: string;
        if (result.video_url.startsWith('data:animation,')) {
          setCurrentStep('動画レンダリング中...');
          const animationData = JSON.parse(result.video_url.replace('data:animation,', ''));
          finalVideoUrl = await generateRealVideo(animationData);
        } else {
          finalVideoUrl = result.video_url;
        }
        setGeneratedVideoUrl(finalVideoUrl);
        setProgress(100);
        setStatus('completed');
        onComplete?.(finalVideoUrl);
      }

    } catch (error) {
      console.error('Video generation failed:', error);
      setStatus('error');
      setCurrentStep(`エラー: ${error}`);
      onError?.(`動画生成に失敗しました: ${error}`);
    }
  };

  const waitForCompletion = async (jobId: string, service: string) => {
    setProgress(50);
    setCurrentStep('動画レンダリング中...');

    intervalRef.current = setInterval(async () => {
      try {
        let result;
        
        if (service === 'openai') {
          const api = new OpenAIVideoAPI();
          result = await api.checkStatus(jobId);
        } else if (service === 'leonardo') {
          const api = new LeonardoVideoAPI();
          result = await api.checkStatus(jobId);
        }

        if (result) {
          if (result.progress) {
            setProgress(50 + (result.progress * 0.5));
          }

          if (result.status === 'completed' && result.video_url) {
            setGeneratedVideoUrl(result.video_url);
            setProgress(100);
            setStatus('completed');
            setCurrentStep('動画生成完了！');
            
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            
            onComplete?.(result.video_url);
          } else if (result.status === 'failed') {
            throw new Error(result.error || '動画生成に失敗しました');
          }
        }
      } catch (error) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setStatus('error');
        setCurrentStep(`エラー: ${error}`);
        onError?.(`動画生成に失敗しました: ${error}`);
      }
    }, 5000); // 5秒ごとにチェック
  };

  // 実際の動画ファイルを生成
  const generateRealVideo = async (animationData: any): Promise<string> => {
    try {
      setProgress(70);
      const videoUrl = await generatePokemonGachaVideo(
        animationData.imageUrl,
        animationData.effects,
        animationData.duration,
        `pokemon-${pokemonName}-${rarity}-${Date.now()}.webm`,
        rarity // レアリティ情報を追加
      );
      return videoUrl;
    } catch (error) {
      console.error('Real video generation failed:', error);
      throw error;
    }
  };

  const retryGeneration = () => {
    setStatus('idle');
    setProgress(0);
    setCurrentStep('');
    setGeneratedVideoUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-6xl mb-4"
          >
            🎬
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800">
            AI動画生成中
          </h2>
          <p className="text-gray-600 mt-2">
            {pokemonName}の{rarity}演出を作成しています
          </p>
        </div>

        {/* サービス表示 */}
        {serviceUsed && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              <span className="mr-2">🤖</span>
              {serviceUsed}
            </div>
          </div>
        )}

        {/* プログレスバー */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>進捗</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* 現在のステップ */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">{currentStep}</p>
        </div>

        {/* ステータス別UI */}
        {status === 'generating' && (
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-sm text-gray-500">
              高品質な動画を生成中です...<br />
              数分かかる場合があります
            </p>
          </div>
        )}

        {status === 'completed' && generatedVideoUrl && (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-green-500 text-4xl mb-4"
            >
              ✅
            </motion.div>
            <p className="text-green-600 font-semibold mb-4">
              動画生成完了！
            </p>
            <video
              src={generatedVideoUrl}
              controls
              className="w-full max-w-xs mx-auto rounded-lg"
              style={{ aspectRatio: '9/16' }}
            />
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-red-500 text-4xl mb-4"
            >
              ❌
            </motion.div>
            <p className="text-red-600 font-semibold mb-4">
              生成に失敗しました
            </p>
            <button
              onClick={retryGeneration}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              再試行
            </button>
          </div>
        )}

        {/* 推定時間表示 */}
        {status === 'generating' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">推定生成時間:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• SSR: 3-5分（高品質エフェクト）</li>
              <li>• SR: 2-3分（中品質エフェクト）</li>
              <li>• R/N: 1-2分（標準品質）</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// 使用例コンポーネント
export const AIVideoGeneratorDemo = () => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState({
    name: 'リザードン',
    type: 'fire',
    rarity: 'SSR' as const
  });

  const handleVideoComplete = (videoUrl: string) => {
    console.log('Generated video URL:', videoUrl);
    setShowGenerator(false);
    // ここで生成された動画を保存や表示
  };

  const handleError = (error: string) => {
    console.error('Video generation error:', error);
    alert(error);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">AI動画生成テスト</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">ポケモン名</label>
          <input
            type="text"
            value={selectedPokemon.name}
            onChange={(e) => setSelectedPokemon({...selectedPokemon, name: e.target.value})}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">タイプ</label>
          <select
            value={selectedPokemon.type}
            onChange={(e) => setSelectedPokemon({...selectedPokemon, type: e.target.value})}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="fire">ほのお</option>
            <option value="water">みず</option>
            <option value="electric">でんき</option>
            <option value="grass">くさ</option>
            <option value="psychic">エスパー</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">レアリティ</label>
          <select
            value={selectedPokemon.rarity}
            onChange={(e) => setSelectedPokemon({...selectedPokemon, rarity: e.target.value as 'SSR'|'SR'|'R'|'N'})}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="SSR">SSR (最高品質)</option>
            <option value="SR">SR (高品質)</option>
            <option value="R">R (標準)</option>
            <option value="N">N (シンプル)</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => setShowGenerator(true)}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
      >
        🎬 AI動画生成開始
      </button>

      {showGenerator && (
        <AIVideoGenerator
          pokemonName={selectedPokemon.name}
          pokemonType={selectedPokemon.type}
          rarity={selectedPokemon.rarity}
          onComplete={handleVideoComplete}
          onError={handleError}
          preferredService="auto"
        />
      )}
    </div>
  );
};