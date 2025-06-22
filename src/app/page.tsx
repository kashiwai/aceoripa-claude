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

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [gachaProducts, setGachaProducts] = useState<any[]>([])
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

    fetchGachaProducts()
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

  // フォールバックデータ（APIエラー時）
  const gachaProductsFallback = [
    { 
      id: 1, 
      name: 'ポケモン151オリパ', 
      price: 800, 
      image: '/images/ポケモンカード151オリパ.png',
      remaining: 1100,
      total: 3000,
      status: 'active'
    },
    { 
      id: 2, 
      name: 'シャイニートレジャー', 
      price: 1200, 
      image: '/images/メインキャンペーンバナー.png',
      remaining: 450,
      total: 2000,
      status: 'active'
    },
    { 
      id: 3, 
      name: 'ワンピース頂上決戦', 
      price: 1500, 
      image: '/images/ワンピース頂上決戦オリパ.png',
      remaining: 50,
      total: 1500,
      status: 'ending_soon'
    },
    { 
      id: 4, 
      name: '遊戯王レアコレ', 
      price: 2000, 
      image: '/images/遊戯王レアコレオリパ.png',
      remaining: 0,
      total: 1000,
      status: 'sold_out'
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
                  <button 
                    onClick={() => router.push(`/gacha/${banner.gachaId}`)}
                    className="mt-8 dopa-gacha-button"
                  >
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
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    <div className="absolute inset-0 bg-dopa-gradient opacity-0 group-hover:opacity-20 transition"></div>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-dopa-dark mb-2">{product.name}</h3>
                    <p className="text-3xl font-black text-dopa-red">¥{product.price}</p>
                    
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
                    
                    {/* 価格表示（DOPAスタイル） */}
                    <div className="mb-3">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline">
                          <span className="text-sm text-gray-600">1口</span>
                          <span className="text-3xl font-black text-dopa-dark mx-2">{product.price.toLocaleString()}</span>
                          <span className="text-sm text-gray-600">PT</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          残 {product.remaining.toLocaleString()} / {product.total.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* ガチャボタン（DOPAスタイル - 大きな10連ボタン） */}
                    <button 
                      className={`w-full text-center font-black py-4 rounded-xl transition text-xl ${
                        product.status === 'sold_out' 
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-[#FF6600] to-[#FF0033] text-white hover:scale-105 shadow-lg'
                      }`}
                      disabled={product.status === 'sold_out'}
                      onClick={() => router.push(`/gacha/${product.id}`)}
                    >
                      {product.status === 'sold_out' ? '完売' : '10連ガチャ'}
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