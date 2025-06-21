'use client'

import { useState } from 'react'
import { useImageGenerator } from '@/hooks/useImageGenerator'
import { toast } from 'react-hot-toast'

export default function ImageGeneratorAdminPage() {
  const { 
    generateGachaImage, 
    generateBannerImage, 
    generatePredefinedImages,
    isGenerating 
  } = useImageGenerator()

  const [gachaConfig, setGachaConfig] = useState({
    name: 'ポケモンカード151ガチャ',
    category: 'pokemon',
    style: 'premium'
  })

  const [bannerConfig, setBannerConfig] = useState({
    title: '新商品入荷',
    subtitle: '最新ガチャ登場',
    type: 'new'
  })

  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  const handleGachaGenerate = async () => {
    const imageUrl = await generateGachaImage(gachaConfig)
    if (imageUrl) {
      setGeneratedImages(prev => [...prev, imageUrl])
    }
  }

  const handleBannerGenerate = async () => {
    const imageUrl = await generateBannerImage(bannerConfig)
    if (imageUrl) {
      setGeneratedImages(prev => [...prev, imageUrl])
    }
  }

  const handlePredefinedGenerate = async () => {
    await generatePredefinedImages()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">画像生成管理</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ガチャ画像生成 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ガチャ画像生成 (1024×1024)</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ガチャ名
                </label>
                <input
                  type="text"
                  value={gachaConfig.name}
                  onChange={(e) => setGachaConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリー
                </label>
                <select
                  value={gachaConfig.category}
                  onChange={(e) => setGachaConfig(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pokemon">ポケモン</option>
                  <option value="onepiece">ワンピース</option>
                  <option value="yugioh">遊戯王</option>
                  <option value="weiss">ヴァイス</option>
                  <option value="duel-masters">デュエマ</option>
                  <option value="other">その他</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  スタイル
                </label>
                <select
                  value={gachaConfig.style}
                  onChange={(e) => setGachaConfig(prev => ({ ...prev, style: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">ノーマル</option>
                  <option value="premium">プレミアム</option>
                  <option value="limited">期間限定</option>
                  <option value="collaboration">コラボ</option>
                </select>
              </div>
              
              <button
                onClick={handleGachaGenerate}
                disabled={isGenerating}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? '生成中...' : 'ガチャ画像生成'}
              </button>
            </div>
          </div>

          {/* バナー画像生成 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">PRバナー生成 (400×400)</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル
                </label>
                <input
                  type="text"
                  value={bannerConfig.title}
                  onChange={(e) => setBannerConfig(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  サブタイトル
                </label>
                <input
                  type="text"
                  value={bannerConfig.subtitle}
                  onChange={(e) => setBannerConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイプ
                </label>
                <select
                  value={bannerConfig.type}
                  onChange={(e) => setBannerConfig(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="campaign">キャンペーン</option>
                  <option value="new">新商品</option>
                  <option value="sale">セール</option>
                  <option value="ranking">ランキング</option>
                  <option value="event">イベント</option>
                </select>
              </div>
              
              <button
                onClick={handleBannerGenerate}
                disabled={isGenerating}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? '生成中...' : 'バナー画像生成'}
              </button>
            </div>
          </div>
        </div>

        {/* 事前定義画像生成 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">事前定義画像一括生成</h2>
          <p className="text-gray-600 mb-4">
            サイトで使用する基本的なガチャ画像とバナー画像を一括生成します。
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={handlePredefinedGenerate}
              disabled={isGenerating}
              className="bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? '生成中...' : '事前定義画像を一括生成'}
            </button>
            
            <div className="text-sm text-gray-500 flex items-center">
              ガチャ画像×5枚 + PRバナー×5枚 = 計10枚を生成
            </div>
          </div>
        </div>

        {/* 生成された画像一覧 */}
        {generatedImages.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">生成された画像</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {generatedImages.map((imageUrl, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={imageUrl}
                    alt={`Generated ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg shadow"
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用方法 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">🎨 画像生成エンジンの使い方</h3>
          <div className="text-blue-800 space-y-2">
            <p>• <strong>ガチャ画像:</strong> 1024×1024の正方形画像。メインのガチャバナーとして使用</p>
            <p>• <strong>PRバナー:</strong> 400×400の正方形画像。スライダーやプロモーション用</p>
            <p>• <strong>事前定義生成:</strong> サイト運営に必要な基本画像セットを自動生成</p>
            <p>• <strong>AI生成:</strong> DALL-E 3を使用して高品質な画像を自動生成</p>
          </div>
        </div>
      </div>
    </div>
  )
}