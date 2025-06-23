'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

// カードレアリティ設定
const CARD_RARITIES = [
  {
    id: 'normal',
    name: 'ノーマル',
    description: '基本的なカードデザイン',
    effects: ['通常背景', 'シンプルフレーム'],
    colors: ['#808080', '#A9A9A9']
  },
  {
    id: 'rare',
    name: 'レア',
    description: 'キラカード仕様',
    effects: ['キラ背景', 'シルバーフレーム', 'ホログラム'],
    colors: ['#C0C0C0', '#E5E5E5']
  },
  {
    id: 'super_rare',
    name: 'スーパーレア',
    description: 'プレミアムキラカード',
    effects: ['虹色背景', 'ゴールドフレーム', 'パーティクル'],
    colors: ['#FFD700', '#FFA500']
  },
  {
    id: 'hyper_rare',
    name: 'ハイパーレア',
    description: '特殊イラストカード',
    effects: ['3D背景', 'プラチナフレーム', 'オーラ効果'],
    colors: ['#E5E4E2', '#B8860B']
  },
  {
    id: 'ultra_rare',
    name: 'ウルトラレア',
    description: '最高レアリティ',
    effects: ['動的背景', 'レインボーフレーム', '全画面効果'],
    colors: ['#FF1493', '#FF69B4', '#FFD700']
  }
]

// ポケモンタイプ
const POKEMON_TYPES = [
  { id: 'fire', name: '炎', color: '#FF6B6B' },
  { id: 'water', name: '水', color: '#4ECDC4' },
  { id: 'grass', name: '草', color: '#95E1D3' },
  { id: 'electric', name: '電気', color: '#FFE66D' },
  { id: 'psychic', name: 'エスパー', color: '#C37B89' },
  { id: 'fighting', name: '格闘', color: '#D4A574' },
  { id: 'dark', name: '悪', color: '#3D3D3D' },
  { id: 'steel', name: '鋼', color: '#B8B8B8' },
  { id: 'dragon', name: 'ドラゴン', color: '#7B68EE' },
  { id: 'fairy', name: 'フェアリー', color: '#FFB6C1' }
]

export default function CardImageGeneratorPage() {
  const [selectedRarity, setSelectedRarity] = useState(CARD_RARITIES[0])
  const [selectedType, setSelectedType] = useState(POKEMON_TYPES[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [cardDetails, setCardDetails] = useState({
    name: '',
    hp: '100',
    attack1: '',
    attack1Damage: '30',
    attack2: '',
    attack2Damage: '80',
    weakness: '',
    resistance: '',
    retreatCost: '2'
  })
  
  const supabase = createClientComponentClient()

  const generateCardImage = async () => {
    setIsGenerating(true)
    
    try {
      // プロンプトの生成
      const prompt = `
Create a Pokemon trading card image with the following specifications:
Rarity: ${selectedRarity.name} (${selectedRarity.description})
Type: ${selectedType.name}
Card Name: ${cardDetails.name || `${selectedType.name}タイプポケモン`}
HP: ${cardDetails.hp}

Visual Style Requirements:
- Pokemon TCG authentic style
- ${selectedRarity.effects.join(', ')}
- Type color: ${selectedType.color}
- Rarity colors: ${selectedRarity.colors.join(', ')}

Card Layout:
1. Top: Card name and HP with type symbol
2. Center: Pokemon artwork in ${selectedRarity.name} style
3. Bottom section: Attack moves and stats
4. Border and frame matching ${selectedRarity.name} rarity
5. Authentic Pokemon card textures and patterns

The card should look like an official Pokemon TCG card with premium quality.
Include holographic effects for ${selectedRarity.name} rarity level.
      `.trim()

      // OpenAI DALL-E 3 APIを呼び出し
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          size: '512x712', // ポケモンカードの標準比率
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
        toast.success('カード画像を生成しました！')
      }
    } catch (error) {
      console.error('Error generating card:', error)
      toast.error('カード生成中にエラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const saveCard = async (imageUrl: string) => {
    try {
      // Supabaseストレージに保存
      const timestamp = new Date().getTime()
      const fileName = `card-${selectedRarity.id}-${selectedType.id}-${timestamp}.png`
      
      // 画像をダウンロードしてBlobに変換
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      
      const { data, error } = await supabase.storage
        .from('card-images')
        .upload(fileName, blob, {
          contentType: 'image/png',
          cacheControl: '3600'
        })
      
      if (error) throw error
      
      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('card-images')
        .getPublicUrl(fileName)
      
      toast.success('カードを保存しました！')
      
      // クリップボードにURLをコピー
      navigator.clipboard.writeText(publicUrl)
      toast.success('URLをクリップボードにコピーしました')
    } catch (error) {
      console.error('Error saving card:', error)
      toast.error('カードの保存に失敗しました')
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
          <span className="text-gray-900">カード画像生成</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">カード画像生成</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 設定パネル */}
        <div className="lg:col-span-1 space-y-6">
          {/* レアリティ選択 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">レアリティ選択</h2>
            <div className="space-y-2">
              {CARD_RARITIES.map((rarity) => (
                <button
                  key={rarity.id}
                  onClick={() => setSelectedRarity(rarity)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedRarity.id === rarity.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold">{rarity.name}</p>
                  <p className="text-sm text-gray-600">{rarity.description}</p>
                  <div className="flex gap-1 mt-2">
                    {rarity.colors.map((color, idx) => (
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

          {/* タイプ選択 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">タイプ選択</h2>
            <div className="grid grid-cols-2 gap-2">
              {POKEMON_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    selectedType.id === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-full h-8 rounded mb-1"
                    style={{ backgroundColor: type.color }}
                  />
                  <p className="text-sm font-medium">{type.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* カード詳細 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">カード詳細</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カード名
                </label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  placeholder="ポケモン名"
                  className="w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HP
                  </label>
                  <input
                    type="number"
                    value={cardDetails.hp}
                    onChange={(e) => setCardDetails({ ...cardDetails, hp: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    弱点
                  </label>
                  <select
                    value={cardDetails.weakness}
                    onChange={(e) => setCardDetails({ ...cardDetails, weakness: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">なし</option>
                    {POKEMON_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    逃げる
                  </label>
                  <input
                    type="number"
                    value={cardDetails.retreatCost}
                    onChange={(e) => setCardDetails({ ...cardDetails, retreatCost: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 生成ボタン */}
          <button
            onClick={generateCardImage}
            disabled={isGenerating}
            className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
              isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105'
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
              'カードを生成'
            )}
          </button>
        </div>

        {/* プレビューエリア */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">生成結果</h2>
            
            {generatedImages.length === 0 ? (
              <div className="aspect-[512/712] max-w-md mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">生成されたカードがここに表示されます</p>
                  <p className="text-sm text-gray-400 mt-2">512×712px (ポケモンカードサイズ)</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-[512/712] bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={`Generated card ${index + 1}`}
                        width={512}
                        height={712}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => saveCard(imageUrl)}
                        className="block w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        保存
                      </button>
                      <a
                        href={imageUrl}
                        download={`card-${selectedRarity.id}-${selectedType.id}.png`}
                        className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
          <div className="mt-6 bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">使用ガイド</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• ポケモンカード風のデザインを自動生成</li>
              <li>• レアリティに応じたホログラム効果付き</li>
              <li>• 生成画像は512×712px（カード標準サイズ）</li>
              <li>• 保存後はカード管理画面から使用可能</li>
              <li>• タイプとレアリティの組み合わせで多彩な表現</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}