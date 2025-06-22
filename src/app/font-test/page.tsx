'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function FontTestPage() {
  const [banners, setBanners] = useState<Array<{
    type: string
    text: string
    fontInfo: string
    imageUrl: string
  }>>([])
  const [loading, setLoading] = useState(false)

  const testBanners = [
    { 
      type: 'line-campaign', 
      text: 'LINE友達登録で最大70%OFF',
      fontInfo: 'Mplus1p-Black, Dela_Gothic_One'
    },
    { 
      type: 'gacha-main', 
      text: '超絶レアガチャ',
      fontInfo: 'MOBO_Font11, YDW_bananaslip'
    },
    { 
      type: 'campaign', 
      text: '期間限定キャンペーン',
      fontInfo: 'RoundedMplus1c-Black'
    },
    { 
      type: 'sns-winner', 
      text: '当選おめでとう！',
      fontInfo: 'YDW_bananaslip, Mplus1p-Black'
    },
    { 
      type: 'card-pack', 
      text: 'ポケモンカード151',
      fontInfo: 'craftmincho, kinkaku'
    },
    { 
      type: 'default', 
      text: 'ACEORIPA オリパ',
      fontInfo: 'SourceHanSans-Heavy'
    }
  ]

  const generateBanners = async () => {
    setLoading(true)
    const results = []

    for (const banner of testBanners) {
      try {
        const response = await fetch('http://localhost:9015/generate-banner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: banner.type,
            text: banner.text,
            width: 400,
            height: 200
          }),
        })

        const data = await response.json()
        if (data.success) {
          results.push({
            ...banner,
            imageUrl: data.imageUrl
          })
        }
      } catch (error) {
        console.error(`Error generating ${banner.type}:`, error)
      }
    }

    setBanners(results)
    setLoading(false)
  }

  useEffect(() => {
    generateBanners()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Canvas フォントテスト</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">登録済みフォント</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="font-semibold">システムフォント:</span>
              <span>HiraginoBold, HelveticaBold, ArialBlack</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold">カスタムフォント:</span>
              <span>Dela_Gothic_One, MOBO_Font11, YDW_bananaslip, craftmincho, kinkaku, Mplus1p-Black, RoundedMplus1c-Black, SourceHanSans-Heavy</span>
            </li>
          </ul>
        </div>

        <button
          onClick={generateBanners}
          className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? '生成中...' : 'バナーを再生成'}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{banner.type}</h3>
              <p className="text-sm text-gray-600 mb-2">使用フォント: {banner.fontInfo}</p>
              <p className="text-sm text-gray-600 mb-4">テキスト: {banner.text}</p>
              <div className="border rounded-lg overflow-hidden">
                {banner.imageUrl && (
                  <img
                    src={banner.imageUrl}
                    alt={banner.type}
                    className="w-full h-auto"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">フォントが反映されない場合のチェックポイント</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ registerFont が canvas を使用する前に呼ばれているか</li>
            <li>✅ フォントファイルのパスが正しいか（絶対パス推奨）</li>
            <li>✅ フォントファイル形式が対応しているか（.ttf, .otf）</li>
            <li>✅ font プロパティでフォントファミリー名を正しく指定しているか</li>
            <li>✅ 日本語フォントの場合、フォントが日本語文字を含んでいるか</li>
            <li>✅ フォールバックフォントを指定しているか</li>
          </ul>
        </div>
      </div>
    </div>
  )
}