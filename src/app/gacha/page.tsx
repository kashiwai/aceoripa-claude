'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface GachaProduct {
  id: string
  name: string
  price: number
  image: string
  remaining: number
  total: number
  status: string
}

export default function GachaPage() {
  const [gachaProducts, setGachaProducts] = useState<GachaProduct[]>([])
  const [loading, setLoading] = useState(false)

  // フォールバックデータを初期値として設定
  const gachaProductsFallback: GachaProduct[] = [
    { 
      id: '1', 
      name: 'ピカチュウ大祭り', 
      price: 150, 
      image: '/images/banners/real-gacha/S__44392515_0.jpg',
      remaining: 850,
      total: 1000,
      status: 'active'
    },
    { 
      id: '2', 
      name: 'ナンジャモ大量発生オリパ', 
      price: 200, 
      image: '/images/banners/real-gacha/S__44392516_0.jpg',
      remaining: 650,
      total: 1000,
      status: 'active'
    },
    { 
      id: '3', 
      name: 'リザードン祭盤 炎のプレミアオリパ', 
      price: 300, 
      image: '/images/banners/real-gacha/S__44392517_0.jpg',
      remaining: 420,
      total: 1000,
      status: 'ending_soon'
    },
    { 
      id: '4', 
      name: 'ブラッキー超感謝祭', 
      price: 250, 
      image: '/images/banners/real-gacha/S__44392521_0.jpg',
      remaining: 780,
      total: 1000,
      status: 'active'
    },
    { 
      id: '5', 
      name: 'リーリエ×マリオピカチュウ 超豪華オリパ', 
      price: 400, 
      image: '/images/banners/real-gacha/S__44392523_0.jpg',
      remaining: 120,
      total: 1000,
      status: 'ending_soon'
    },
  ]

  useEffect(() => {
    const fetchGachaProducts = async () => {
      try {
        const response = await fetch('/api/gacha/products')
        if (!response.ok) {
          throw new Error('ガチャ商品の取得に失敗しました')
        }
        const data = await response.json()
        setGachaProducts(data.products || [])
      } catch (err) {
        console.error('Error fetching gacha products:', err)
        setGachaProducts([])
      }
    }

    fetchGachaProducts()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-[#FF0033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="text-[#FF0033] hover:text-[#FF6B6B] transition">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="ml-4 text-3xl font-black text-[#FF0033]">ガチャ一覧</h1>
            </div>
            <nav className="flex items-center space-x-8">
              <Link href="/mypage" className="text-gray-700 hover:text-[#FF0033] font-bold text-lg transition">
                マイページ
              </Link>
              <Link href="/purchase" className="bg-gradient-to-r from-[#FF6600] to-[#FF0033] text-white font-bold px-6 py-3 rounded-full hover:scale-105 transition transform">
                ポイント購入
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black text-[#FF0033] mb-4">
            オリパラインナップ
          </h2>
          <p className="text-xl text-gray-600">
            お気に入りのガチャを選んでカードを手に入れよう！
          </p>
        </div>

        {/* ガチャ商品グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gachaProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-transform">
              {/* ガチャ画像 */}
              <div className="aspect-square relative bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                
                {/* ステータスバッジ */}
                {product.status === 'sold_out' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-4xl font-black text-white rotate-[-15deg]">SOLD OUT</span>
                  </div>
                )}
                {product.status === 'ending_soon' && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-full font-bold animate-pulse">
                    残りわずか！
                  </div>
                )}
              </div>
              
              {/* 商品情報 */}
              <div className="p-6">
                <h3 className="text-2xl font-black text-gray-800 mb-4">{product.name}</h3>
                  
                {/* 残り枚数と進行状況バー */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-700">
                      残り {product.remaining.toLocaleString()}枚 / {product.total.toLocaleString()}枚中
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      product.status === 'sold_out' ? 'bg-gray-200 text-gray-600' :
                      product.status === 'ending_soon' ? 'bg-red-100 text-red-600 animate-pulse' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {product.status === 'sold_out' ? '完売' :
                       product.status === 'ending_soon' ? '残りわずか！' :
                       '販売中'}
                    </span>
                  </div>
                  
                  {/* プログレスバー */}
                  <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${
                        product.status === 'sold_out' ? 'bg-gray-400' :
                        product.status === 'ending_soon' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        'bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]'
                      }`}
                      style={{ width: `${(product.remaining / product.total) * 100}%` }}
                    >
                      {product.status !== 'sold_out' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      )}
                    </div>
                  </div>
                </div>
                  
                {/* 価格表示 */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-lg text-gray-600">1口</span>
                    <span className="text-3xl font-black text-[#FF0033] mx-2">{product.price.toLocaleString()}</span>
                    <span className="text-lg text-gray-600">PT</span>
                  </div>
                </div>
                  
                {/* ガチャボタン */}
                <Link href={`/gacha/${product.id}`}>
                  <button 
                    className={`w-full text-center font-black py-4 rounded-xl transition text-xl ${
                      product.status === 'sold_out' 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-[#FF6600] to-[#FF0033] text-white hover:scale-105 shadow-lg transform'
                    }`}
                    disabled={product.status === 'sold_out'}
                  >
                    {product.status === 'sold_out' ? '完売' : 'ガチャを引く'}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xl font-bold mb-4">ACEORIPA - オンラインオリパ</p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/legal/terms" className="hover:text-[#FF0033] transition">利用規約</Link>
            <Link href="/legal/privacy" className="hover:text-[#FF0033] transition">プライバシーポリシー</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}