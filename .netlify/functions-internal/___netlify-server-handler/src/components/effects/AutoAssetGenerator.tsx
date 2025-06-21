'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GenerationJob {
  id: string;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
  category: string;
  timestamp: Date;
}

const presetPrompts = {
  'ssr-rainbow-aura': {
    prompt: 'Explosive rainbow aura effect, iridescent prismatic light rays radiating outward, holographic shimmer, crystalline particles, transparent background PNG, game VFX style, ultra high quality, ethereal glow, 1024x1024, no background elements, pure effect only',
    category: 'SSR Effects'
  },
  'ssr-rainbow-spiral': {
    prompt: 'Spiraling rainbow energy vortex, prismatic light trails, cosmic aurora effect, crystalline sparkles, transparent PNG, mobile game effect, premium quality, magical rotation, 8K render quality, pure black transparent background',
    category: 'SSR Effects'
  },
  'ssr-divine-rays': {
    prompt: 'Divine rainbow light beams, celestial rays from above, prismatic god rays, holy light effect, transparent background, game UI effect, ethereal quality, lens flare elements, vertical light shafts, premium mobile game asset',
    category: 'SSR Effects'
  },
  'sr-fire-explosion': {
    prompt: 'Explosive fire burst effect, intense orange red flames, fire particles and embers flying outward, transparent background, anime game VFX style, dynamic motion blur, high energy impact, dramatic lighting',
    category: 'SR Effects'
  },
  'sr-fire-tornado': {
    prompt: 'Fire tornado effect, swirling flame vortex, red orange fire spiral ascending, ember particles, transparent PNG background, game effect asset, dramatic lighting, vertical fire column, intense heat distortion',
    category: 'SR Effects'
  },
  'treasure-chest-closed': {
    prompt: 'Ornate treasure chest closed, intricate golden decorations, ancient wooden texture with metal reinforcements, glowing gem locks, fantasy RPG style, isometric view 45 degree angle, transparent background PNG, game asset quality, detailed metalwork, mystical purple aura',
    category: 'Objects'
  },
  'treasure-chest-open': {
    prompt: 'Open treasure chest overflowing with golden light, magical energy bursting out, ornate design, ancient wooden and gold details, glowing interior, transparent background, game asset, dramatic 45 degree angle, treasure particles escaping, divine light rays',
    category: 'Objects'
  }
};

export const AutoAssetGenerator = () => {
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async (promptKey?: string) => {
    const promptData = promptKey ? presetPrompts[promptKey as keyof typeof presetPrompts] : null;
    const finalPrompt = promptData?.prompt || customPrompt;
    
    if (!finalPrompt) {
      alert('プロンプトを選択または入力してください');
      return;
    }

    const newJob: GenerationJob = {
      id: `job-${Date.now()}`,
      prompt: finalPrompt,
      status: 'generating',
      category: promptData?.category || 'Custom',
      timestamp: new Date()
    };

    setJobs(prev => [newJob, ...prev]);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          size: '1024x1024',
          quality: 'hd'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成に失敗しました');
      }

      setJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, status: 'completed', imageUrl: data.url }
          : job
      ));
    } catch (error) {
      setJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, status: 'failed', error: error instanceof Error ? error.message : '生成エラー' }
          : job
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBatch = async () => {
    const ssrPrompts = Object.entries(presetPrompts)
      .filter(([_, data]) => data.category === 'SSR Effects')
      .slice(0, 3);

    for (const [key] of ssrPrompts) {
      await generateImage(key);
      // レート制限対策で少し待機
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('ダウンロードエラー:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl">
        <h1 className="text-3xl font-bold mb-2">🤖 AI自動素材生成システム</h1>
        <p className="opacity-90">DALL-E 3 APIを使用した高品質素材の自動生成</p>
      </div>

      {/* 生成コントロール */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">🎨 素材生成</h2>
        
        <div className="grid grid-cols-2 gap-6">
          {/* プリセット選択 */}
          <div>
            <h3 className="font-semibold mb-3">プリセットプロンプト</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(presetPrompts).map(([key, data]) => (
                <motion.div
                  key={key}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPrompt === key
                      ? 'bg-purple-100 border-2 border-purple-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setSelectedPrompt(key);
                    setCustomPrompt(data.prompt);
                  }}
                  whileHover={{ x: 5 }}
                >
                  <div className="font-medium">{key.replace(/-/g, ' ').toUpperCase()}</div>
                  <div className="text-sm text-gray-600">{data.category}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* カスタムプロンプト */}
          <div>
            <h3 className="font-semibold mb-3">プロンプト詳細</h3>
            <textarea
              className="w-full h-64 p-3 border rounded-lg resize-none text-sm"
              placeholder="プロンプトを入力..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
            
            <div className="mt-4 flex gap-4">
              <motion.button
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                onClick={() => generateImage(selectedPrompt)}
                disabled={isGenerating || !customPrompt}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isGenerating ? '生成中...' : '単体生成'}
              </motion.button>
              
              <motion.button
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                onClick={generateBatch}
                disabled={isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                SSRバッチ生成
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* 生成履歴 */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">📋 生成履歴</h2>
        
        <div className="grid grid-cols-3 gap-4">
          <AnimatePresence>
            {jobs.map(job => (
              <motion.div
                key={job.id}
                className="border rounded-lg overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                {/* ステータスヘッダー */}
                <div className={`p-3 text-white ${
                  job.status === 'completed' ? 'bg-green-500' :
                  job.status === 'failed' ? 'bg-red-500' :
                  job.status === 'generating' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`}>
                  <div className="font-semibold">{job.category}</div>
                  <div className="text-sm opacity-90">
                    {job.status === 'generating' ? '生成中...' :
                     job.status === 'completed' ? '完了' :
                     job.status === 'failed' ? '失敗' : '待機中'}
                  </div>
                </div>

                {/* 画像表示 */}
                <div className="p-4">
                  {job.status === 'generating' && (
                    <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                  )}
                  
                  {job.status === 'completed' && job.imageUrl && (
                    <div>
                      <img 
                        src={job.imageUrl} 
                        alt="生成画像"
                        className="w-full h-48 object-contain bg-gray-100 rounded"
                      />
                      <button
                        onClick={() => downloadImage(job.imageUrl!, `${job.category}-${job.id}.png`)}
                        className="mt-2 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors"
                      >
                        ダウンロード
                      </button>
                    </div>
                  )}
                  
                  {job.status === 'failed' && (
                    <div className="h-48 bg-red-50 rounded flex items-center justify-center p-4">
                      <div className="text-red-600 text-center">
                        <div className="text-2xl mb-2">❌</div>
                        <div className="text-sm">{job.error}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500 truncate">
                    {job.prompt.substring(0, 100)}...
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 使用状況 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-3">📊 API使用状況</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <div className="text-gray-600">総生成数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {jobs.filter(j => j.status === 'completed').length}
            </div>
            <div className="text-gray-600">成功</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              ${(jobs.filter(j => j.status === 'completed').length * 0.04).toFixed(2)}
            </div>
            <div className="text-gray-600">推定コスト</div>
          </div>
        </div>
      </div>
    </div>
  );
};