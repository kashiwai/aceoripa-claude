'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

// 演出タイプ
const EFFECT_TYPES = [
  {
    id: 'normal_reveal',
    name: 'ノーマル開封',
    description: 'シンプルなカード表示',
    duration: '3秒',
    effects: ['フェードイン', 'カード回転', '基本BGM'],
    difficulty: 1
  },
  {
    id: 'rare_reveal',
    name: 'レア開封',
    description: 'キラエフェクト付き',
    duration: '5秒',
    effects: ['光の筋', 'キラキラ効果', 'レアBGM', 'カメラズーム'],
    difficulty: 2
  },
  {
    id: 'super_rare_reveal',
    name: 'スーパーレア開封',
    description: '豪華な演出効果',
    duration: '8秒',
    effects: ['虹色オーラ', 'パーティクル爆発', 'エピックBGM', '3D回転'],
    difficulty: 3
  },
  {
    id: 'ultra_rare_reveal',
    name: 'ウルトラレア開封',
    description: '最高級の演出',
    duration: '12秒',
    effects: ['全画面エフェクト', '稲妻効果', 'オーケストラBGM', 'スローモーション', 'カメラワーク'],
    difficulty: 5
  },
  {
    id: 'gacha_animation',
    name: 'ガチャ回転演出',
    description: 'ガチャマシン演出',
    duration: '10秒',
    effects: ['3Dガチャマシン', '回転アニメーション', 'コイン投入', 'カプセル排出'],
    difficulty: 4
  }
]

// シーン設定
const SCENE_SETTINGS = [
  { id: 'space', name: '宇宙空間', description: '星と銀河の背景' },
  { id: 'temple', name: '神殿', description: '荘厳な古代神殿' },
  { id: 'cyber', name: 'サイバー空間', description: 'デジタルネオン空間' },
  { id: 'nature', name: '自然', description: '森と光の演出' },
  { id: 'stadium', name: 'スタジアム', description: '観客とスポットライト' }
]

export default function EffectVideoGeneratorPage() {
  const [selectedEffect, setSelectedEffect] = useState(EFFECT_TYPES[0])
  const [selectedScene, setSelectedScene] = useState(SCENE_SETTINGS[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideos, setGeneratedVideos] = useState<any[]>([])
  const [videoSettings, setVideoSettings] = useState({
    cardName: '',
    cardRarity: 'normal',
    soundEnabled: true,
    resolution: '1080p',
    fps: '60',
    customText: ''
  })
  
  const supabase = createClientComponentClient()

  const generateEffectVideo = async () => {
    setIsGenerating(true)
    
    try {
      // 動画生成のリクエスト
      const response = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          effectType: selectedEffect.id,
          scene: selectedScene.id,
          settings: videoSettings,
          prompt: `
Create a ${selectedEffect.name} animation for a Pokemon card gacha game.
Scene: ${selectedScene.name} (${selectedScene.description})
Duration: ${selectedEffect.duration}
Effects: ${selectedEffect.effects.join(', ')}
Card: ${videoSettings.cardName || 'Mystery Card'} (${videoSettings.cardRarity} rarity)

The video should include:
1. Opening sequence with anticipation build-up
2. Main reveal moment with ${selectedEffect.name} effects
3. Card showcase with appropriate visual effects
4. Closing celebration sequence

Quality: ${videoSettings.resolution} at ${videoSettings.fps}fps
Style: Premium gacha game quality similar to Pokemon TCG Pocket
          `.trim()
        })
      })

      if (!response.ok) {
        throw new Error('動画生成に失敗しました')
      }

      const data = await response.json()
      
      if (data.videoUrl) {
        setGeneratedVideos(prev => [{
          url: data.videoUrl,
          thumbnail: data.thumbnail,
          duration: selectedEffect.duration,
          createdAt: new Date().toISOString()
        }, ...prev])
        toast.success('演出動画を生成しました！')
      }
    } catch (error) {
      console.error('Error generating video:', error)
      toast.error('動画生成中にエラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const saveVideo = async (video: any) => {
    try {
      // Supabaseストレージに保存
      const timestamp = new Date().getTime()
      const fileName = `effect-video-${selectedEffect.id}-${timestamp}.mp4`
      
      // 動画をダウンロードしてBlobに変換
      const response = await fetch(video.url)
      const blob = await response.blob()
      
      const { data, error } = await supabase.storage
        .from('effect-videos')
        .upload(fileName, blob, {
          contentType: 'video/mp4',
          cacheControl: '3600'
        })
      
      if (error) throw error
      
      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('effect-videos')
        .getPublicUrl(fileName)
      
      // データベースに登録
      const { error: dbError } = await supabase
        .from('effect_videos')
        .insert({
          name: `${selectedEffect.name} - ${videoSettings.cardName || '汎用'}`,
          type: selectedEffect.id,
          url: publicUrl,
          duration: selectedEffect.duration,
          scene: selectedScene.id,
          settings: videoSettings
        })
      
      if (dbError) throw dbError
      
      toast.success('動画を保存しました！')
    } catch (error) {
      console.error('Error saving video:', error)
      toast.error('動画の保存に失敗しました')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/admin" className="hover:text-gray-700">
            管理画面
          </Link>
          <span className="mx-2">/</span>
          <Link href="/admin/ai-generator" className="hover:text-gray-700">
            AI生成管理
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">演出動画生成</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">演出動画生成</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 設定パネル */}
        <div className="lg:col-span-1 space-y-6">
          {/* 演出タイプ選択 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">演出タイプ</h2>
            <div className="space-y-2">
              {EFFECT_TYPES.map((effect) => (
                <button
                  key={effect.id}
                  onClick={() => setSelectedEffect(effect)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedEffect.id === effect.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{effect.name}</p>
                      <p className="text-sm text-gray-600">{effect.description}</p>
                      <p className="text-xs text-gray-500 mt-1">長さ: {effect.duration}</p>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < effect.difficulty ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {effect.effects.map((fx, idx) => (
                      <span key={idx} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {fx}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* シーン設定 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">背景シーン</h2>
            <div className="space-y-2">
              {SCENE_SETTINGS.map((scene) => (
                <label
                  key={scene.id}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedScene.id === scene.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="scene"
                    value={scene.id}
                    checked={selectedScene.id === scene.id}
                    onChange={() => setSelectedScene(scene)}
                    className="sr-only"
                  />
                  <div>
                    <p className="font-medium">{scene.name}</p>
                    <p className="text-sm text-gray-600">{scene.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 詳細設定 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">詳細設定</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カード名（オプション）
                </label>
                <input
                  type="text"
                  value={videoSettings.cardName}
                  onChange={(e) => setVideoSettings({ ...videoSettings, cardName: e.target.value })}
                  placeholder="例: ピカチュウex"
                  className="w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  レアリティ
                </label>
                <select
                  value={videoSettings.cardRarity}
                  onChange={(e) => setVideoSettings({ ...videoSettings, cardRarity: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="normal">ノーマル</option>
                  <option value="rare">レア</option>
                  <option value="super_rare">スーパーレア</option>
                  <option value="hyper_rare">ハイパーレア</option>
                  <option value="ultra_rare">ウルトラレア</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    解像度
                  </label>
                  <select
                    value={videoSettings.resolution}
                    onChange={(e) => setVideoSettings({ ...videoSettings, resolution: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FPS
                  </label>
                  <select
                    value={videoSettings.fps}
                    onChange={(e) => setVideoSettings({ ...videoSettings, fps: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="30">30fps</option>
                    <option value="60">60fps</option>
                    <option value="120">120fps</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="soundEnabled"
                  checked={videoSettings.soundEnabled}
                  onChange={(e) => setVideoSettings({ ...videoSettings, soundEnabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="soundEnabled" className="ml-2 text-sm text-gray-700">
                  サウンドエフェクトを含める
                </label>
              </div>
            </div>
          </div>

          {/* 生成ボタン */}
          <button
            onClick={generateEffectVideo}
            disabled={isGenerating}
            className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
              isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:scale-105'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                生成中... (最大30秒)
              </span>
            ) : (
              '演出動画を生成'
            )}
          </button>
        </div>

        {/* プレビューエリア */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">生成結果</h2>
            
            {generatedVideos.length === 0 ? (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">生成された動画がここに表示されます</p>
                  <p className="text-sm text-gray-400 mt-2">{videoSettings.resolution} / {videoSettings.fps}fps</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {generatedVideos.map((video, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-black relative">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={`Video thumbnail ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <video
                          src={video.url}
                          controls
                          className="w-full h-full"
                        />
                      )}
                    </div>
                    <div className="p-4 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{selectedEffect.name}</p>
                          <p className="text-sm text-gray-600">
                            {video.duration} / {new Date(video.createdAt).toLocaleString('ja-JP')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveVideo(video)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                          >
                            保存
                          </button>
                          <a
                            href={video.url}
                            download={`effect-${selectedEffect.id}-${Date.now()}.mp4`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                          >
                            ダウンロード
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 使用ガイド */}
          <div className="mt-6 bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">使用ガイド</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• AI生成による高品質な演出動画</li>
              <li>• レアリティ別の豪華なエフェクト</li>
              <li>• カスタマイズ可能な背景とサウンド</li>
              <li>• ガチャ演出に直接使用可能</li>
              <li>• 生成後は動画演出管理から設定</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}