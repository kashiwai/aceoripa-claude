'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface GachaProduct {
  id: string
  name: string
  description: string
  imageUrl: string
  price: number
}

export default function HomePage() {
  const [gachaProducts, setGachaProducts] = useState<GachaProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGachaProducts()
  }, [])

  const fetchGachaProducts = async () => {
    try {
      const response = await fetch('/api/gacha/products')
      const data = await response.json()
      setGachaProducts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch gacha products:', error)
    } finally {
      setLoading(false)
    }
  }

  // PRバナーのダミーデータ
  const prBanners = [
    { id: 1, imageUrl: '/api/placeholder/400/400', title: 'キャンペーン1' },
    { id: 2, imageUrl: '/api/placeholder/400/400', title: 'キャンペーン2' },
    { id: 3, imageUrl: '/api/placeholder/400/400', title: 'キャンペーン3' },
    { id: 4, imageUrl: '/api/placeholder/400/400', title: 'キャンペーン4' },
    { id: 5, imageUrl: '/api/placeholder/400/400', title: 'キャンペーン5' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">ACEORIPA GACHA</h1>
            <nav className="flex space-x-4">
              <Link href="/mypage" className="text-gray-700 hover:text-gray-900">
                マイページ
              </Link>
              <Link href="/collection" className="text-gray-700 hover:text-gray-900">
                コレクション
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* PRバナースライダー */}
      <section className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
            }}
            className="pr-banner-swiper"
          >
            {prBanners.map((banner) => (
              <SwiperSlide key={banner.id}>
                <div className="relative aspect-square">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* お知らせ */}
      <section className="bg-yellow-50 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-gray-800 mx-4">
                🎉 新ガチャ「レジェンドコレクション」登場！
              </span>
              <span className="text-gray-800 mx-4">
                📢 期間限定！SSR確率2倍キャンペーン実施中
              </span>
              <span className="text-gray-800 mx-4">
                🎁 毎日ログインで無料ガチャチケットプレゼント
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ガチャ一覧 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {gachaProducts.map((gacha, index) => (
              <div key={gacha.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* ガチャ画像 */}
                <div className="relative aspect-square max-w-4xl mx-auto">
                  <Image
                    src={gacha.imageUrl || `/api/placeholder/1024/1024?text=ガチャ${index + 1}`}
                    alt={gacha.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* ガチャボタン（固定表示） */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                  <div className="flex justify-center space-x-4">
                    <Link
                      href={`/gacha/${gacha.id}?count=1`}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition"
                    >
                      1回
                    </Link>
                    <Link
                      href={`/gacha/${gacha.id}?count=5`}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition"
                    >
                      5回
                    </Link>
                    <Link
                      href={`/gacha/${gacha.id}?count=10`}
                      className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition"
                    >
                      10回
                    </Link>
                    <Link
                      href={`/gacha/${gacha.id}?count=custom`}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition"
                    >
                      好きな数だけ
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}