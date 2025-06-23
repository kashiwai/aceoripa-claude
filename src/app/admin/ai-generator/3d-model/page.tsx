'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

// 3Dモデルタイプ
const MODEL_TYPES = [
  {
    id: 'card_basic',
    name: '基本カードモデル',
    description: 'シンプルな3Dカード表示',
    features: ['360度回転', '光沢効果', '影付き'],
    complexity: 'low',
    polyCount: '~1000'
  },
  {
    id: 'card_holographic',
    name: 'ホログラムカード',
    description: 'ホログラム効果付き3Dカード',
    features: ['ホログラムシェーダー', '虹色反射', 'パーティクル'],
    complexity: 'medium',
    polyCount: '~2000'
  },
  {
    id: 'card_premium',
    name: 'プレミアムカード',
    description: '最高品質の3Dカード表現',
    features: ['リアルタイム反射', '動的テクスチャ', 'PBRマテリアル', '物理演算'],
    complexity: 'high',
    polyCount: '~5000'
  },
  {
    id: 'gacha_machine',
    name: 'ガチャマシン',
    description: '3Dガチャマシンモデル',
    features: ['可動パーツ', 'アニメーション対応', 'インタラクティブ'],
    complexity: 'high',
    polyCount: '~10000'
  },
  {
    id: 'pack_opening',
    name: 'パック開封モデル',
    description: 'カードパック3Dモデル',
    features: ['開封アニメーション', 'パッケージデザイン', 'カード飛び出し'],
    complexity: 'medium',
    polyCount: '~3000'
  }
]

// マテリアル設定
const MATERIAL_PRESETS = [
  { id: 'standard', name: 'スタンダード', description: '通常のカード質感' },
  { id: 'metallic', name: 'メタリック', description: '金属的な光沢' },
  { id: 'iridescent', name: 'イリデセント', description: '玉虫色の変化' },
  { id: 'glass', name: 'ガラス', description: '透明感のある質感' },
  { id: 'energy', name: 'エネルギー', description: '発光する質感' }
]

// アニメーション設定
const ANIMATION_PRESETS = [
  { id: 'rotate_y', name: 'Y軸回転', description: '水平回転' },
  { id: 'float', name: 'フロート', description: '浮遊アニメーション' },
  { id: 'flip', name: 'フリップ', description: 'カード反転' },
  { id: 'pulse', name: 'パルス', description: '拡大縮小の脈動' },
  { id: 'sparkle', name: 'スパークル', description: 'きらめき効果' }
]

export default function ThreeDModelGeneratorPage() {
  const [selectedType, setSelectedType] = useState(MODEL_TYPES[0])
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIAL_PRESETS[0])
  const [selectedAnimations, setSelectedAnimations] = useState<string[]>(['rotate_y'])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedModels, setGeneratedModels] = useState<any[]>([])
  const [modelSettings, setModelSettings] = useState({
    cardImage: '',
    cardName: '',
    lightingIntensity: '1.0',
    shadowQuality: 'high',
    exportFormat: 'glb',
    textureResolution: '2048'
  })
  
  const supabase = createClientComponentClient()

  const generateModel = async () => {
    setIsGenerating(true)
    
    try {
      // 3Dモデル生成のリクエスト
      const response = await fetch('/api/ai/generate-3d-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType.id,
          material: selectedMaterial.id,
          animations: selectedAnimations,
          settings: modelSettings,
          prompt: `
Generate a 3D model for: ${selectedType.name}
Description: ${selectedType.description}
Material: ${selectedMaterial.name} (${selectedMaterial.description})
Features: ${selectedType.features.join(', ')}
Animations: ${selectedAnimations.map(id => ANIMATION_PRESETS.find(a => a.id === id)?.name).join(', ')}

Model specifications:
- Polygon count: ${selectedType.polyCount}
- Texture resolution: ${modelSettings.textureResolution}x${modelSettings.textureResolution}
- Export format: ${modelSettings.exportFormat}
- Optimized for web/WebGL rendering
- Include proper UV mapping and normals

Style: High-quality Pokemon TCG game asset
          `.trim()
        })
      })

      if (!response.ok) {
        throw new Error('3Dモデル生成に失敗しました')
      }

      const data = await response.json()
      
      if (data.modelUrl) {
        setGeneratedModels(prev => [{
          url: data.modelUrl,
          preview: data.previewUrl,
          format: modelSettings.exportFormat,
          size: data.fileSize,
          polyCount: data.polyCount,
          createdAt: new Date().toISOString()
        }, ...prev])
        toast.success('3Dモデルを生成しました！')
      }
    } catch (error) {
      console.error('Error generating 3D model:', error)
      toast.error('3Dモデル生成中にエラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const saveModel = async (model: any) => {
    try {
      const timestamp = new Date().getTime()
      const fileName = `3d-model-${selectedType.id}-${timestamp}.${model.format}`
      
      // モデルファイルをダウンロードしてBlobに変換
      const response = await fetch(model.url)
      const blob = await response.blob()
      
      const { data, error } = await supabase.storage
        .from('3d-models')
        .upload(fileName, blob, {
          contentType: `model/${model.format}`,
          cacheControl: '3600'
        })
      
      if (error) throw error
      
      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('3d-models')
        .getPublicUrl(fileName)
      
      // データベースに登録
      const { error: dbError } = await supabase
        .from('3d_models')
        .insert({
          name: `${selectedType.name} - ${modelSettings.cardName || '汎用'}`,
          type: selectedType.id,
          url: publicUrl,
          format: model.format,
          size: model.size,
          poly_count: model.polyCount,
          material: selectedMaterial.id,
          animations: selectedAnimations
        })
      
      if (dbError) throw dbError
      
      toast.success('3Dモデルを保存しました！')
    } catch (error) {
      console.error('Error saving model:', error)
      toast.error('モデルの保存に失敗しました')
    }
  }

  const toggleAnimation = (animationId: string) => {
    setSelectedAnimations(prev => 
      prev.includes(animationId)
        ? prev.filter(id => id !== animationId)
        : [...prev, animationId]
    )
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
          <span className="text-gray-900">3Dモデル生成</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">3Dモデル生成</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 設定パネル */}
        <div className="lg:col-span-1 space-y-6">
          {/* モデルタイプ選択 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">モデルタイプ</h2>
            <div className="space-y-2">
              {MODEL_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedType.id === type.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{type.name}</p>
                      <p className="text-sm text-gray-600">{type.description}</p>
                      <p className="text-xs text-gray-500 mt-1">ポリゴン数: {type.polyCount}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      type.complexity === 'low' ? 'bg-green-100 text-green-800' :
                      type.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {type.complexity === 'low' ? '低' : 
                       type.complexity === 'medium' ? '中' : '高'}負荷
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {type.features.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* マテリアル設定 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">マテリアル</h2>
            <div className="space-y-2">
              {MATERIAL_PRESETS.map((material) => (
                <label
                  key={material.id}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMaterial.id === material.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="material"
                    value={material.id}
                    checked={selectedMaterial.id === material.id}
                    onChange={() => setSelectedMaterial(material)}
                    className="sr-only"
                  />
                  <div>
                    <p className="font-medium">{material.name}</p>
                    <p className="text-sm text-gray-600">{material.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* アニメーション設定 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">アニメーション</h2>
            <div className="space-y-2">
              {ANIMATION_PRESETS.map((animation) => (
                <label
                  key={animation.id}
                  className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedAnimations.includes(animation.id)}
                    onChange={() => toggleAnimation(animation.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <p className="font-medium">{animation.name}</p>
                    <p className="text-sm text-gray-600">{animation.description}</p>
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
                  カード画像URL（オプション）
                </label>
                <input
                  type="text"
                  value={modelSettings.cardImage}
                  onChange={(e) => setModelSettings({ ...modelSettings, cardImage: e.target.value })}
                  placeholder="テクスチャ用画像URL"
                  className="w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    テクスチャ解像度
                  </label>
                  <select
                    value={modelSettings.textureResolution}
                    onChange={(e) => setModelSettings({ ...modelSettings, textureResolution: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="1024">1024×1024</option>
                    <option value="2048">2048×2048</option>
                    <option value="4096">4096×4096</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    出力形式
                  </label>
                  <select
                    value={modelSettings.exportFormat}
                    onChange={(e) => setModelSettings({ ...modelSettings, exportFormat: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="glb">GLB (推奨)</option>
                    <option value="gltf">GLTF</option>
                    <option value="obj">OBJ</option>
                    <option value="fbx">FBX</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  影の品質
                </label>
                <select
                  value={modelSettings.shadowQuality}
                  onChange={(e) => setModelSettings({ ...modelSettings, shadowQuality: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="ultra">最高</option>
                </select>
              </div>
            </div>
          </div>

          {/* 生成ボタン */}
          <button
            onClick={generateModel}
            disabled={isGenerating}
            className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
              isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:scale-105'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                生成中... (最大60秒)
              </span>
            ) : (
              '3Dモデルを生成'
            )}
          </button>
        </div>

        {/* プレビューエリア */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">生成結果</h2>
            
            {generatedModels.length === 0 ? (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-gray-500">生成された3Dモデルがここに表示されます</p>
                  <p className="text-sm text-gray-400 mt-2">WebGLプレビュー対応</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {generatedModels.map((model, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="aspect-square bg-gray-900 relative">
                      {model.preview ? (
                        <img
                          src={model.preview}
                          alt={`3D model preview ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <div className="text-center">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <p>3Dプレビュー</p>
                          </div>
                        </div>
                      )}
                      {/* 3Dビューアーボタン */}
                      <button className="absolute top-4 left-4 bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-lg text-sm hover:bg-opacity-100">
                        3Dビューアーで開く
                      </button>
                    </div>
                    <div className="p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{selectedType.name}</p>
                          <p className="text-sm text-gray-600">
                            {model.format.toUpperCase()} / {model.size} / {model.polyCount}ポリゴン
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(model.createdAt).toLocaleString('ja-JP')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveModel(model)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                          >
                            保存
                          </button>
                          <a
                            href={model.url}
                            download={`3d-model-${selectedType.id}-${Date.now()}.${model.format}`}
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
          <div className="mt-6 bg-orange-50 rounded-lg p-4">
            <h3 className="font-semibold text-orange-900 mb-2">使用ガイド</h3>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• WebGL対応の3Dモデルを自動生成</li>
              <li>• Three.jsやBabylon.jsで直接使用可能</li>
              <li>• 最適化された軽量モデル</li>
              <li>• アニメーション付きエクスポート対応</li>
              <li>• AR/VR展開にも対応</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}