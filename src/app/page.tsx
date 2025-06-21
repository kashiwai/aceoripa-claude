'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function HomePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const banners = [
    { 
      id: 1, 
      title: 'ポケモンカード151', 
      subtitle: 'リザードンex確率UP!', 
      color: 'bg-gradient-to-r from-red-500 to-orange-500',
      image: 'https://placehold.co/1200x500/FF6B6B/FFFFFF?text=Pokemon+151+Campaign'
    },
    { 
      id: 2, 
      title: 'シャイニートレジャー', 
      subtitle: 'SSR確定オリパ', 
      color: 'bg-gradient-to-r from-yellow-400 to-red-500',
      image: 'https://placehold.co/1200x500/FFD700/333333?text=Shiny+Treasure+SSR'
    },
    { 
      id: 3, 
      title: '期間限定', 
      subtitle: '10連ガチャ20%OFF', 
      color: 'bg-gradient-to-r from-red-600 to-pink-500',
      image: 'https://placehold.co/1200x500/FF1493/FFFFFF?text=Limited+Time+20%25+OFF'
    },
  ]

  const gachaProducts = [
    { id: 1, name: 'ポケモン151オリパ', price: 800, image: 'https://placehold.co/300x400/FF6B6B/FFFFFF?text=Pokemon+151' },
    { id: 2, name: 'シャイニートレジャー', price: 1200, image: 'https://placehold.co/300x400/FFD700/333333?text=Shiny+Treasure' },
    { id: 3, name: 'クラシックオリパ', price: 500, image: 'https://placehold.co/300x400/4169E1/FFFFFF?text=Classic+Pack' },
    { id: 4, name: 'プレミアムオリパ', price: 2000, image: 'https://placehold.co/300x400/9400D3/FFFFFF?text=Premium+Pack' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-dopa-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <h1 className="text-4xl font-black text-dopa-red">ACEORIPA</h1>
              <span className="ml-3 bg-dopa-red text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                ONLINE
              </span>
            </div>
            <nav className="flex items-center space-x-8">
              <Link href="/gacha" className="text-dopa-dark hover:text-dopa-red font-bold text-lg transition">
                ガチャ
              </Link>
              <Link href="/mypage" className="text-dopa-dark hover:text-dopa-red font-bold text-lg transition">
                マイページ
              </Link>
              <button className="bg-dopa-gradient text-white font-bold px-6 py-3 rounded-full hover:scale-105 transition transform">
                ポイント購入
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* メインバナー */}
      <section className="relative">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="h-[500px]"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className={`h-full ${banner.color} flex items-center justify-center relative overflow-hidden`}>
                {/* 背景画像 */}
                <div className="absolute inset-0">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                  />
                </div>
                
                {/* オーバーレイ */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
                
                {/* コンテンツ */}
                <div className="text-center text-white relative z-10">
                  <h2 className="text-6xl font-black mb-4 drop-shadow-lg dopa-gaming-title">{banner.title}</h2>
                  <p className="text-3xl font-bold drop-shadow-md">{banner.subtitle}</p>
                  <button className="mt-8 dopa-gacha-button">
                    今すぐ引く！
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ガチャ商品一覧 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-center text-dopa-red mb-12">
            オリパラインナップ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {gachaProducts.map((product) => (
              <Link key={product.id} href={`/gacha/${product.id}`}>
                <div className="dopa-card cursor-pointer group">
                  <div className="relative h-64 bg-gray-100">
                    <div className="absolute inset-0 bg-dopa-gradient opacity-0 group-hover:opacity-20 transition"></div>
                    <div className="flex items-center justify-center h-full text-4xl font-bold text-gray-400">
                      {product.name}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-dopa-dark mb-2">{product.name}</h3>
                    <p className="text-3xl font-black text-dopa-red">¥{product.price}</p>
                    <button className="mt-4 w-full dopa-gacha-button text-lg">
                      ガチャを引く
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-dopa-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xl font-bold mb-4">ACEORIPA - オンラインオリパ</p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/terms" className="hover:text-dopa-red transition">利用規約</Link>
            <Link href="/privacy" className="hover:text-dopa-red transition">プライバシーポリシー</Link>
            <Link href="/contact" className="hover:text-dopa-red transition">お問い合わせ</Link>
          </div>
        </div>
      </footer>

      {loading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 border-8 border-dopa-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-2xl font-bold text-dopa-red">Loading...</p>
          </div>
        </div>
      )}
    </div>
  )
}