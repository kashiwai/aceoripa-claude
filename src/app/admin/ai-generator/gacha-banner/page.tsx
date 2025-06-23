'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

// プリセットテンプレート
const BANNER_TEMPLATES = [
  {
    id: 'pokemon_151',
    name: 'ポケモンカード151',
    theme: '151番限定カード',
    colors: ['#FF0033', '#FFD700'],
    style: 'premium_retro'
  },
  {
    id: 'stellar_miracle',
    name: 'ステラミラクル',
    theme: '宇宙と星の奇跡',
    colors: ['#4B0082', '#FFD700', '#00CED1'],
    style: 'cosmic_premium'
  },
  {
    id: 'shiny_treasure',
    name: 'シャイニートレジャー',
    theme: '色違いポケモン',
    colors: ['#FFD700', '#FF69B4', '#00FF00'],
    style: 'holographic'
  },
  {
    id: 'legend_collection',
    name: 'レジェンドコレクション',
    theme: '伝説のポケモン',
    colors: ['#8B0000', '#FFD700', '#000000'],
    style: 'legendary'
  },
  {
    id: 'special_anniversary',
    name: '特別記念パック',
    theme: 'アニバーサリー限定',
    colors: ['#FF1493', '#FFD700', '#FF69B4'],
    style: 'anniversary'
  }
]

export default function GachaBannerGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(BANNER_TEMPLATES[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [customText, setCustomText] = useState({
    title: '',
    subtitle: '',
    price: '800',
    stock: '1000'
  })
  
  const supabase = createClientComponentClient()

  const generateBanner = async () => {
    setIsGenerating(true)
    
    try {
      // プロンプトの生成
      const prompt = `
Create a premium gacha banner image for an online Pokemon card gacha game. 
Style: ${selectedTemplate.style}
Theme: ${selectedTemplate.theme}
Main colors: ${selectedTemplate.colors.join(', ')}
Size: 1024x1024px

Key elements to include:
1. Title: "${customText.title || selectedTemplate.name}" in bold gaming font
2. Subtitle: "${customText.subtitle || selectedTemplate.theme}"
3. Price display: "¥${customText.price}" prominently
4. Stock indicator: "${customText.stock}枚限定" 
5. Premium Pokemon card artwork in the background
6. Holographic/metallic effects
7. "LIMITED EDITION" badge
8. Particle effects and glow
9. Professional gacha game aesthetic similar to DOPA style

The banner should look luxurious, exciting, and make users want to purchase immediately.
Include visual elements that suggest rare cards and big wins.
      `.trim()

      // OpenAI DALL-E 3 APIを呼び出し
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid'
        })
      })

      if (!response.ok) {
        throw new Error('画像生成に失敗しました')
      }

      const data = await response.json()
      
      if (data.imageUrl) {
        setGeneratedImages(prev => [data.imageUrl, ...prev])
        toast.success('バナー画像を生成しました！')
      }
    } catch (error) {
      console.error('Error generating banner:', error)
      toast.error('バナー生成中にエラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const saveBanner = async (imageUrl: string) => {
    try {
      // Supabaseストレージに保存
      const timestamp = new Date().getTime()
      const fileName = `gacha-banner-${selectedTemplate.id}-${timestamp}.png`
      
      // 画像をダウンロードしてBlobに変換
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      
      const { data, error } = await supabase.storage
        .from('gacha-banners')
        .upload(fileName, blob, {
          contentType: 'image/png',
          cacheControl: '3600'
        })
      
      if (error) throw error
      
      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('gacha-banners')
        .getPublicUrl(fileName)
      
      toast.success('バナーを保存しました！')
      
      // クリップボードにURLをコピー
      navigator.clipboard.writeText(publicUrl)
      toast.success('URLをクリップボードにコピーしました')
    } catch (error) {
      console.error('Error saving banner:', error)
      toast.error('バナーの保存に失敗しました')
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
          <span className="text-gray-900">ガチャバナー生成</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">ガチャバナー生成 (1024×1024)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 設定パネル */}
        <div className="lg:col-span-1 space-y-6">
          {/* テンプレート選択 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">テンプレート選択</h2>
            <div className="space-y-2">
              {BANNER_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedTemplate.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold">{template.name}</p>
                  <p className="text-sm text-gray-600">{template.theme}</p>
                  <div className="flex gap-1 mt-2">
                    {template.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* カスタムテキスト */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">カスタムテキスト</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル
                </label>
                <input
                  type="text"
                  value={customText.title}
                  onChange={(e) => setCustomText({ ...customText, title: e.target.value })}
                  placeholder={selectedTemplate.name}
                  className="w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  サブタイトル
                </label>
                <input
                  type="text"
                  value={customText.subtitle}
                  onChange={(e) => setCustomText({ ...customText, subtitle: e.target.value })}
                  placeholder={selectedTemplate.theme}
                  className="w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    価格
                  </label>
                  <input
                    type="number"
                    value={customText.price}
                    onChange={(e) => setCustomText({ ...customText, price: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    在庫数
                  </label>
                  <input
                    type="number"
                    value={customText.stock}
                    onChange={(e) => setCustomText({ ...customText, stock: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 生成ボタン */}
          <button
            onClick={generateBanner}
            disabled={isGenerating}
            className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
              isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                生成中...
              </span>
            ) : (
              'バナーを生成'
            )}
          </button>
        </div>

        {/* プレビューエリア */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">生成結果</h2>
            
            {generatedImages.length === 0 ? (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">生成されたバナーがここに表示されます</p>
                  <p className="text-sm text-gray-400 mt-2">1024×1024px</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {generatedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={`Generated banner ${index + 1}`}
                        width={1024}
                        height={1024}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="absolute top-4 right-4 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => saveBanner(imageUrl)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        保存
                      </button>
                      <a
                        href={imageUrl}
                        download={`gacha-banner-${selectedTemplate.id}.png`}
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        ダウンロード
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 使用ガイド */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">使用ガイド</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 生成されたバナーは1024×1024pxの高解像度です</li>
              <li>• DOPAスタイルに準拠したプレミアムデザイン</li>
              <li>• 保存ボタンでSupabaseストレージに自動保存</li>
              <li>• URLは自動的にクリップボードにコピーされます</li>
              <li>• ガチャ作成時にバナーURLを貼り付けて使用してください</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}