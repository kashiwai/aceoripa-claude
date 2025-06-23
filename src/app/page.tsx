'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import CampaignBanner from '@/components/CampaignBanner'

export default function HomePage() {
  // フォールバックデータを初期値として設定
  const gachaProductsFallback = [
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

  const [loading, setLoading] = useState(false)
  const [gachaProducts, setGachaProducts] = useState<any[]>(gachaProductsFallback)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // APIからガチャ商品データを取得
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
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
        // フォールバックデータを使用
        setGachaProducts(gachaProductsFallback)
      } finally {
        setLoading(false)
      }
    }

    // 強制的にローディングを解除（1秒後）
    const timeoutId = setTimeout(() => {
      setLoading(false)
    }, 1000)

    fetchGachaProducts().then(() => {
      clearTimeout(timeoutId)
    })

    return () => clearTimeout(timeoutId)
  }, [])

  const banners = [
    { 
      id: 1, 
      gachaId: '1',
      title: 'ポケモンカード151', 
      subtitle: 'リザードンex確率UP!', 
      color: 'bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]',
      image: '/images/pokemon-151.jpg'
    },
    { 
      id: 2, 
      gachaId: '2',
      title: 'シャイニートレジャー', 
      subtitle: 'SSR確定オリパ', 
      color: 'bg-gradient-to-r from-[#FF0033] to-[#FFD700]',
      image: '/images/メインキャンペーンバナー.jpg'
    },
    { 
      id: 3, 
      gachaId: '3',
      title: '期間限定キャンペーン', 
      subtitle: '10連ガチャ20%OFF', 
      color: 'bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]',
      image: '/images/ポケモンカード151オリパ.jpg'
    },
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
              <Link href="/purchase" className="bg-dopa-gradient text-white font-bold px-6 py-3 rounded-full hover:scale-105 transition transform">
                ポイント購入
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* キャンペーンバナー */}
      <CampaignBanner />

      {/* メインバナースライダー（400x400） */}
      <section className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={20}
            slidesPerView={3}
            navigation
            autoplay={{ delay: 3000 }}
            className="h-[400px]"
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner.id}>
                <div 
                  onClick={() => router.push(`/gacha/${banner.gachaId}`)}
                  className="aspect-square w-full bg-white rounded-lg overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className={`h-2/3 ${banner.color} relative flex items-center justify-center`}>
                    <h3 className="text-2xl font-black text-white text-center px-4">{banner.title}</h3>
                  </div>
                  <div className="h-1/3 p-4 flex items-center justify-center">
                    <p className="text-base font-bold text-gray-700 text-center">{banner.subtitle}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* メインガチャ商品（1024x1024縦並び） */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-center text-dopa-red mb-12">
            オリパラインナップ
          </h2>
          <div className="space-y-8">
            {gachaProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* 1024x1024 ガチャ画像（クリック可能） */}
                <div 
                  onClick={() => router.push(`/gacha/${product.id}`)}
                  className="aspect-square relative bg-gray-100 cursor-pointer hover:scale-105 transition-transform duration-300"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={1024}
                    height={1024}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                  
                  {/* ステータスバッジ */}
                  {product.status === 'sold_out' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-6xl font-black text-white rotate-[-15deg]">SOLD OUT</span>
                    </div>
                  )}
                  {product.status === 'ending_soon' && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold animate-pulse">
                      残りわずか！
                    </div>
                  )}
                </div>
                
                {/* 商品情報 */}
                <div className="p-8">
                  <h3 className="text-3xl font-black text-dopa-dark mb-4">{product.name}</h3>
                    
                    {/* 残り枚数と進行状況バー */}
                    <div className="mt-4 mb-4">
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
                      <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${
                            product.status === 'sold_out' ? 'bg-gray-400' :
                            product.status === 'ending_soon' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            'bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]'
                          }`}
                          style={{ width: `${(product.remaining / product.total) * 100}%` }}
                        >
                          {/* キラキラアニメーション */}
                          {product.status !== 'sold_out' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                          )}
                        </div>
                        
                        {/* パーセンテージ表示 */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-700">
                            {Math.round((product.remaining / product.total) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      {/* 完売近い場合の警告 */}
                      {product.status === 'ending_soon' && (
                        <p className="text-xs text-red-600 font-bold mt-2 text-center animate-pulse">
                          ⚠️ まもなく完売！お早めに！
                        </p>
                      )}
                    </div>
                    
                  {/* 価格表示 */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-between mb-4">
                      <div className="flex items-baseline">
                        <span className="text-lg text-gray-600">1口</span>
                        <span className="text-4xl font-black text-dopa-red mx-2">{product.price.toLocaleString()}</span>
                        <span className="text-lg text-gray-600">PT</span>
                      </div>
                      <div className="text-lg text-gray-600 font-bold">
                        残 {product.remaining.toLocaleString()} / {product.total.toLocaleString()}
                      </div>
                    </div>
                    
                    {/* プログレスバー */}
                    <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
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
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-700">
                          {Math.round((product.remaining / product.total) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                    
                  {/* ガチャボタン */}
                  <Link href={`/gacha/${product.id}`}>
                    <button 
                      className={`w-full text-center font-black py-6 rounded-xl transition text-2xl ${
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