'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CardData {
  name: string
  points: number
  price_range: string
  rarity: string
  image_url?: string
}

interface GachaData {
  name: string
  description: string
  price: number
  total_packs: number
  banner_image_url: string
}

export default function BulkCreateGachaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // プリセットデータ（リーリエ×マリオピカチュウ）
  const presetGachaData: GachaData = {
    name: 'リーリエ×マリオピカチュウ',
    description: 'リーリエとマリオピカチュウの豪華コラボガチャ！\n激レアカードが大量出現中！',
    price: 150,
    total_packs: 1000,
    banner_image_url: '/images/banners/lillie-mario-pikachu.jpg'
  }

  // プリセットカードデータ
  const presetCardData: CardData[] = [
    // 一等（SS）
    { name: 'リーリエ PSA10', points: 80000, price_range: '70000-90000', rarity: 'SS' },
    { name: 'マリオピカチュウ PSA10', points: 75000, price_range: '65000-85000', rarity: 'SS' },
    { name: 'ポンチョを着たピカチュウ(黒リザ) PSA10', points: 70000, price_range: '60000-80000', rarity: 'SS' },
    
    // 二等（S）
    { name: 'アセロラ(エクバ) PSA10', points: 35000, price_range: '30000-40000', rarity: 'S' },
    { name: 'ブルーの探索 PSA10', points: 30000, price_range: '25000-35000', rarity: 'S' },
    { name: 'おじょうさま PSA10', points: 25000, price_range: '20000-30000', rarity: 'S' },
    { name: 'ヒガナ PSA10', points: 22000, price_range: '18000-26000', rarity: 'S' },
    
    // 三等（A）
    { name: 'アローラの仲間たち PSA10', points: 15000, price_range: '12000-18000', rarity: 'A' },
    { name: 'ポンチョを着たピカチュウ(リザ) PSA10', points: 12000, price_range: '10000-14000', rarity: 'A' },
    { name: 'ニンフィアEX PSA10（エラー版）', points: 10000, price_range: '8000-12000', rarity: 'A' },
    { name: 'ブラッキーex PSA10', points: 8000, price_range: '6000-10000', rarity: 'A' },
    
    // 四等（B）
    { name: 'アセロラ（エクバ）', points: 5000, price_range: '4000-6000', rarity: 'B' },
    { name: 'ポンチョを着たピカチュウ(黒レックウザ) PSA10', points: 4500, price_range: '3500-5500', rarity: 'B' },
    { name: 'ポンチョを着たピカチュウ(レックウザ) PSA10', points: 4000, price_range: '3000-5000', rarity: 'B' },
    { name: 'マリオピカチュウ', points: 3500, price_range: '2500-4500', rarity: 'B' },
    { name: 'THE BEST OF XY 1BOX', points: 3000, price_range: '2000-4000', rarity: 'B' },
    
    // 五等（C）
    { name: 'アセロラ', points: 2000, price_range: '1500-2500', rarity: 'C' },
    { name: 'アローラの仲間たち', points: 1800, price_range: '1200-2400', rarity: 'C' },
    { name: 'ブルーの探索', points: 1500, price_range: '1000-2000', rarity: 'C' },
    { name: 'ポンチョを着たピカチュウ(ロコン)', points: 1200, price_range: '800-1600', rarity: 'C' },
    { name: 'リーリエ', points: 1000, price_range: '600-1400', rarity: 'C' }
  ]

  const [gachaData, setGachaData] = useState<GachaData>(presetGachaData)
  const [cardData, setCardData] = useState<CardData[]>(presetCardData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/gacha/bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gachaData,
          cardData
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage(`✅ ガチャを作成しました！ID: ${result.gacha_id}, カード数: ${result.created_cards}`)
        setTimeout(() => {
          router.push(`/gacha/${result.gacha_id}`)
        }, 2000)
      } else {
        setMessage(`❌ エラー: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating gacha:', error)
      setMessage('❌ ガチャの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-white mb-6">ガチャ一括作成</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ガチャ情報 */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-bold text-white mb-4">ガチャ情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">ガチャ名</label>
                  <input
                    type="text"
                    value={gachaData.name}
                    onChange={(e) => setGachaData({...gachaData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-600 text-white rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">価格</label>
                  <input
                    type="number"
                    value={gachaData.price}
                    onChange={(e) => setGachaData({...gachaData, price: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-600 text-white rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">総パック数</label>
                  <input
                    type="number"
                    value={gachaData.total_packs}
                    onChange={(e) => setGachaData({...gachaData, total_packs: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-600 text-white rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">バナー画像URL</label>
                  <input
                    type="text"
                    value={gachaData.banner_image_url}
                    onChange={(e) => setGachaData({...gachaData, banner_image_url: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-600 text-white rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-white mb-2">説明文</label>
                  <textarea
                    value={gachaData.description}
                    onChange={(e) => setGachaData({...gachaData, description: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-600 text-white rounded h-24"
                    required
                  />
                </div>
              </div>
            </div>

            {/* カード情報プレビュー */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-bold text-white mb-4">
                カード情報 ({cardData.length}枚)
              </h2>
              
              {/* レアリティ別統計 */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {['SS', 'S', 'A', 'B', 'C'].map(rarity => {
                  const count = cardData.filter(card => card.rarity === rarity).length
                  return (
                    <div key={rarity} className="bg-gray-600 rounded p-2 text-center">
                      <div className="text-white font-bold">{rarity}賞</div>
                      <div className="text-yellow-400">{count}枚</div>
                    </div>
                  )
                })}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {cardData.map((card, index) => (
                  <div key={index} className="bg-gray-600 rounded p-2 flex justify-between items-center">
                    <div>
                      <span className="text-white font-semibold">{card.name}</span>
                      <span className="text-yellow-400 ml-2">({card.rarity}賞)</span>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400">{card.points.toLocaleString()}pt</div>
                      <div className="text-gray-300 text-sm">¥{card.price_range}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50"
            >
              {loading ? '作成中...' : 'ガチャを作成'}
            </button>

            {/* メッセージ表示 */}
            {message && (
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-white">{message}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}