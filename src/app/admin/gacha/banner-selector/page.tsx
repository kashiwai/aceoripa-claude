'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

// ローカルバナー画像のパス一覧
const LOCAL_BANNERS = [
  // 1024×1024 高品質バナー
  '/images/1024-ai-bg-1.png',
  '/images/1024-ai-bg-2.png', 
  '/images/1024-ai-bg-3.png',
  '/images/1024-ai-bg-4.png',
  '/images/1024-ai-bg-5.png',
  '/images/1024-banner-1.png',
  '/images/1024-banner-2.png',
  '/images/1024-banner-3.png',
  '/images/1024-black-luxury.png',
  '/images/1024-blue-ocean.png',
  '/images/1024-green-emerald.png',
  '/images/1024-purple-royal.png',
  '/images/1024-rainbow-hot.png',
  '/images/1024-red-100.png',
  '/images/1024-red-explosion.png',
  '/images/1024-white-premium.png',

  // 実際のガチャバナー
  '/images/pokemon-151-real.png',
  '/images/shiny-treasure-real.png',
  '/images/special-box-real.png',
  '/images/pokemon-151.png',
  '/images/onepiece-summit.png',
  '/images/yugioh-rare.png',

  // カスタムフォントバナー
  '/images/final-banana-slip.png',
  '/images/final-craft-mincho.png',
  '/images/final-dela-gothic.png',
  '/images/final-kinkaku.png',
  '/images/final-mobo-font.png',

  // プレミアムスタイル
  '/images/premium-black-luxury.png',
  '/images/premium-blue-ocean.png',
  '/images/premium-green-emerald.png',
  '/images/premium-purple-royal.png',
  '/images/premium-white-platinum.png',
  '/images/premium-white-silver.png',

  // 既存のJPGバナー
  '/images/ポケモンカード151オリパ.png',
  '/images/ワンピース頂上決戦オリパ.png',
  '/images/遊戯王レアコレオリパ.png',
  '/images/メインキャンペーンバナー.png',
  '/images/LINE友達登録バナー.png',
  '/images/SNS当選報告サンプル.png',

  // リアルガチャバナー
  '/images/banners/real-gacha/pokemon-151-ultra-rare.png',
  '/images/banners/real-gacha/premium-psa10-banner.png',
  '/images/banners/real-gacha/shiny-treasure-premium.png',
  '/images/banners/real-gacha/pikachu-collection-banner.png',
  '/images/banners/real-gacha/pikachu-festival-banner.png',
  '/images/banners/real-gacha/acerola-special-banner.png',
  '/images/banners/real-gacha/mega-campaign-special.png'
]

export default function BannerSelectorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/admin/gacha/new'
  const [selectedBanner, setSelectedBanner] = useState<string>('')
  const [filter, setFilter] = useState('')

  const filteredBanners = LOCAL_BANNERS.filter(banner => 
    banner.toLowerCase().includes(filter.toLowerCase())
  )

  const handleSelectBanner = () => {
    if (!selectedBanner) return
    
    // returnUrlにバナーURLをクエリパラメータとして追加して戻る
    const url = new URL(returnUrl, window.location.origin)
    url.searchParams.set('bannerUrl', selectedBanner)
    router.push(url.toString())
  }

  const getBannerCategory = (banner: string): string => {
    if (banner.includes('1024-')) return '1024×1024 高品質'
    if (banner.includes('real-gacha')) return 'リアルガチャ'
    if (banner.includes('premium-')) return 'プレミアム'
    if (banner.includes('final-')) return 'カスタムフォント'
    if (banner.includes('pokemon')) return 'ポケモン'
    if (banner.includes('onepiece')) return 'ワンピース'
    if (banner.includes('yugioh')) return '遊戯王'
    return 'その他'
  }

  const getBannerName = (banner: string): string => {
    const filename = banner.split('/').pop()?.replace(/\.(png|jpg|jpeg)$/i, '') || ''
    return filename.replace(/-/g, ' ').replace(/_/g, ' ')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">バナー画像選択</h1>
            <p className="text-gray-600 mt-1">ガチャで使用するバナー画像を選択してください</p>
          </div>
          <Link
            href={returnUrl}
            className="text-gray-500 hover:text-gray-700"
          >
            ← 戻る
          </Link>
        </div>
      </div>

      {/* フィルター */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="バナー名で検索..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full max-w-md border-gray-300 rounded-lg shadow-sm"
        />
      </div>

      {/* 選択済みバナー表示 */}
      {selectedBanner && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={selectedBanner}
                  alt="選択中のバナー"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-blue-900">選択中のバナー</p>
                <p className="text-sm text-blue-700">{getBannerName(selectedBanner)}</p>
                <p className="text-xs text-blue-600">{selectedBanner}</p>
              </div>
            </div>
            <button
              onClick={handleSelectBanner}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              このバナーを使用
            </button>
          </div>
        </div>
      )}

      {/* バナー一覧 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredBanners.map((banner, index) => (
          <div
            key={index}
            onClick={() => setSelectedBanner(banner)}
            className={`group cursor-pointer bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-all ${
              selectedBanner === banner ? 'ring-4 ring-blue-500 transform scale-105' : ''
            }`}
          >
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={banner}
                alt={getBannerName(banner)}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
              {selectedBanner === banner && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                  <div className="bg-blue-600 text-white rounded-full p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  getBannerCategory(banner) === '1024×1024 高品質' ? 'bg-purple-100 text-purple-800' :
                  getBannerCategory(banner) === 'リアルガチャ' ? 'bg-green-100 text-green-800' :
                  getBannerCategory(banner) === 'プレミアム' ? 'bg-yellow-100 text-yellow-800' :
                  getBannerCategory(banner) === 'カスタムフォント' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getBannerCategory(banner)}
                </span>
              </div>
              <h3 className="font-medium text-sm text-gray-800 mt-2 truncate">
                {getBannerName(banner)}
              </h3>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {banner}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredBanners.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">該当するバナーが見つかりませんでした</p>
        </div>
      )}

      {/* 統計情報 */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-2">利用可能なバナー統計</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="font-bold text-2xl text-purple-600">
              {LOCAL_BANNERS.filter(b => b.includes('1024-')).length}
            </p>
            <p className="text-gray-600">1024×1024</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-2xl text-green-600">
              {LOCAL_BANNERS.filter(b => b.includes('real-gacha')).length}
            </p>
            <p className="text-gray-600">リアルガチャ</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-2xl text-yellow-600">
              {LOCAL_BANNERS.filter(b => b.includes('premium-')).length}
            </p>
            <p className="text-gray-600">プレミアム</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-2xl text-blue-600">
              {LOCAL_BANNERS.length}
            </p>
            <p className="text-gray-600">総バナー数</p>
          </div>
        </div>
      </div>
    </div>
  )
}