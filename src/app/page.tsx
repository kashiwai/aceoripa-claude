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
import BannerCarousel from '@/components/BannerCarousel'
import LoadingSpinner from '@/components/LoadingSpinner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function HomePage() {
  const supabase = createClientComponentClient()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
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
  const [showSquareBanners, setShowSquareBanners] = useState(true)
  const router = useRouter()

  // ログイン状態とバナー設定をチェック
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    
    const fetchBannerSettings = async () => {
      try {
        const response = await fetch('/api/admin/square-banners')
        if (response.ok) {
          const data = await response.json()
          // console.log('Square banner settings response:', data)
          if (data.success && data.data) {
            // console.log('showSquareBanners:', data.data.showSquareBanners)
            setShowSquareBanners(data.data.showSquareBanners ?? true)
            if (data.data.banners && Array.isArray(data.data.banners)) {
              setSquareBanners(data.data.banners)
            }
          }
        }
      } catch (error) {
        // console.error('Banner settings fetch error:', error)
        // エラーの場合はデフォルト設定を使用
      }
    }
    
    checkUser()
    fetchBannerSettings()
  }, [])

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
        // console.error('Error fetching gacha products:', err)
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
        // フォールバックデータを使用
        setGachaProducts(gachaProductsFallback)
      } finally {
        setLoading(false)
      }
    }

    const fetchSquareBanners = async () => {
      try {
        const response = await fetch('/api/banners/square')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.banners && data.banners.length > 0) {
            setSquareBanners(data.banners)
          }
        }
      } catch (error) {
        // console.error('Error fetching square banners:', error)
        // フォールバックデータを使用
      }
    }

    // 強制的にローディングを解除（1秒後）
    const timeoutId = setTimeout(() => {
      setLoading(false)
    }, 1000)

    Promise.all([fetchGachaProducts(), fetchSquareBanners()]).then(() => {
      clearTimeout(timeoutId)
    })

    return () => clearTimeout(timeoutId)
  }, [])

  const [squareBanners, setSquareBanners] = useState([
    { 
      id: 1, 
      gachaId: '1',
      title: '激アツ！ピカチュウ祭り', 
      subtitle: 'マリオピカチュウPSA10確定！', 
      color: 'bg-gradient-to-r from-[#FFD700] to-[#FF6600]',
      image: '/images/basebg/A_luxurious_gold-framed_Pokmon_trading_card_is_t-1750539990520.png'
    },
    { 
      id: 2, 
      gachaId: '2',
      title: 'プレミアムBOX', 
      subtitle: 'SSレア確率50%UP！', 
      color: 'bg-gradient-to-r from-[#9333EA] to-[#EC4899]',
      image: '/images/basebg/A_dazzling_spectacle_featuring_a_dazzling_Pokmon_-1750539986706.png'
    },
    { 
      id: 3, 
      gachaId: '3',
      title: '限定100パック！', 
      subtitle: 'ナンジャモ&リーリエ狙い撃ち', 
      color: 'bg-gradient-to-r from-[#0EA5E9] to-[#6366F1]',
      image: '/images/basebg/A_vibrant_and_colorful_backdrop_featuring_a_rainbo-1750539998852.png'
    },
    { 
      id: 4, 
      gachaId: '4',
      title: '新春超豪華オリパ', 
      subtitle: 'アセロラPSA10大量封入！', 
      color: 'bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]',
      image: '/images/basebg/A_festive_scene_with_a_large_shimmering_drum_at_t-1750539994085.png'
    },
    { 
      id: 5, 
      gachaId: '5',
      title: 'ブラッキー感謝祭', 
      subtitle: 'ブラッキーex PSA10確率3倍！', 
      color: 'bg-gradient-to-r from-[#1F2937] to-[#7C3AED]',
      image: '/images/basebg/A_cosmic_scene_featuring_a_dazzling_trading_card_-1750539978161.png'
    },
  ])

  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        .banner-swiper {
          padding: 0 !important;
        }
        .banner-swiper .swiper-wrapper {
          padding: 8px 0;
        }
        .banner-swiper .swiper-slide {
          width: 300px !important;
        }
        /* スマホ用のスタイル */
        @media (max-width: 640px) {
          .banner-swiper .swiper-slide {
            width: 150px !important;
          }
        }
      `}</style>
      {/* ヘッダー */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-[#FF0033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <h1 className="text-4xl font-black text-[#FF0033]">ACEORIPA</h1>
              <span className="ml-3 bg-[#FF0033] text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                ONLINE
              </span>
            </div>
            <nav className="flex items-center space-x-2 md:space-x-8">
              <Link href="/gacha" className="text-gray-700 hover:text-[#FF0033] font-bold text-sm md:text-lg transition">
                ガチャ
              </Link>
              {isLoggedIn ? (
                <>
                  <Link href="/mypage" className="text-gray-700 hover:text-[#FF0033] font-bold text-sm md:text-lg transition">
                    マイページ
                  </Link>
                  <Link href="/purchase" className="bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white font-bold px-3 py-2 md:px-6 md:py-3 rounded-full hover:scale-105 transition transform text-sm md:text-base">
                    ポイント購入
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-700 hover:text-[#FF0033] font-bold text-sm md:text-lg transition">
                    ログイン
                  </Link>
                  <Link href="/auth/register" className="bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white font-bold px-3 py-2 md:px-6 md:py-3 rounded-full hover:scale-105 transition transform text-sm md:text-base">
                    新規登録
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* メインバナーカルーセル */}
      <BannerCarousel />

      {/* キャンペーンバナー */}
      <div className="-mb-4">
        <CampaignBanner />
      </div>
      {/* メインバナースライダー（300x300） */}
      {showSquareBanners && squareBanners.filter(banner => banner.isActive !== false).length > 0 && (
        <section className="bg-gray-100 -mb-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
            <Swiper
              modules={[Autoplay, Navigation]}
              spaceBetween={8}
              slidesPerView="auto"
              navigation
              autoplay={{ delay: 3000 }}
              className="banner-swiper"
            >
              {squareBanners.filter(banner => banner.isActive !== false).map((banner) => (
              <SwiperSlide key={banner.id} className="!w-[150px] sm:!w-[300px]">
                <div 
                  onClick={() => router.push(`/gacha/${banner.gachaId}`)}
                  className="w-[150px] h-[150px] sm:w-[300px] sm:h-[300px] bg-white rounded-lg overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform relative"
                >
                  {/* 画像バナー */}
                  {banner.image ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        sizes="(max-width: 640px) 150px, 300px"
                        className="object-cover"
                        unoptimized
                        priority
                      />
                      {/* テキストオーバーレイ */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-2 sm:p-4">
                        <h3 className="text-sm sm:text-xl font-black text-white mb-0.5 sm:mb-1 drop-shadow-lg">
                          {banner.title}
                        </h3>
                        <p className="text-xs sm:text-sm font-bold text-white/90 drop-shadow-md">
                          {banner.subtitle}
                        </p>
                      </div>
                      {/* 装飾的な要素 */}
                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-[#FF0033] text-white px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold animate-pulse">
                        NEW
                      </div>
                    </div>
                  ) : (
                    /* 画像がない場合のフォールバック */
                    <>
                      <div className={`h-2/3 ${banner.color} relative flex items-center justify-center`}>
                        <h3 className="text-2xl font-black text-white text-center px-4">{banner.title}</h3>
                      </div>
                      <div className="h-1/3 p-4 flex items-center justify-center">
                        <p className="text-base font-bold text-gray-700 text-center">{banner.subtitle}</p>
                      </div>
                    </>
                  )}
                </div>
              </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}
      {/* メインガチャ商品（1024x1024縦並び） */}
      <section className="-mt-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-center text-[#FF0033] mb-8">
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
                <div className="p-4">
                  <h3 className="text-3xl font-black text-gray-800 mb-2">{product.name}</h3>
                    
                    {/* 残り枚数と進行状況バー */}
                    <div className="mb-2">
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
                  <div className="mb-3">
                    <div className="flex items-baseline justify-center">
                      <span className="text-lg text-gray-600">1口</span>
                      <span className="text-4xl font-black text-[#FF0033] mx-2">{product.price.toLocaleString()}</span>
                      <span className="text-lg text-gray-600">PT</span>
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xl font-bold mb-4">ACEORIPA - オンラインオリパ</p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/terms" className="hover:text-[#FF0033] transition">利用規約</Link>
            <Link href="/privacy" className="hover:text-[#FF0033] transition">プライバシーポリシー</Link>
            <Link href="/contact" className="hover:text-[#FF0033] transition">お問い合わせ</Link>
          </div>
        </div>
      </footer>

      {loading && <LoadingSpinner fullScreen size="large" />}
    </div>
  )
}