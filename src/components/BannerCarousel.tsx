'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-coverflow'

interface Banner {
  id: string
  title: string
  subtitle: string
  description?: string
  imageUrl: string
  linkUrl: string
  linkType: 'gacha' | 'campaign' | 'external'
  priority: number
  isActive: boolean
  startDate?: string
  endDate?: string
  backgroundColor?: string
  textColor?: string
}

// フォールバックバナーは空にして、APIからのデータのみを表示
const fallbackBanners: Banner[] = []

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.banners && data.banners.length > 0) {
            // APIからのデータがある場合のみ設定し、ダイレクトリンクを確保
            const processedBanners = data.banners.map((banner: Banner) => ({
              ...banner,
              // ガチャバナーの場合、ダイレクトリンクを確保
              linkUrl: banner.linkType === 'gacha' ? banner.linkUrl : banner.linkUrl
            }));
            setBanners(processedBanners)
          }
        }
      } catch (error) {
        console.error('Error fetching banners:', error)
        // エラー時はバナーを表示しない
        setBanners([])
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  const activeBanners = banners
    .filter(banner => banner.isActive)
    .sort((a, b) => a.priority - b.priority)

  if (loading) {
    return null // ローディング中は何も表示しない
  }

  // バナーがない場合は何も表示しない
  if (activeBanners.length === 0) {
    return null
  }

  // スマホでは最初のバナーのみ表示
  const mobileBanners = activeBanners.slice(0, 1)
  const desktopBanners = activeBanners

  return (
    <section className="relative w-full">
      {/* スマホ表示 - 最初のバナーのみ */}
      <div className="block sm:hidden">
        {mobileBanners.length > 0 && (
          <div className="w-full h-[60px] relative">
            <Link href={mobileBanners[0].linkUrl} className="block w-full h-full relative group">
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={mobileBanners[0].imageUrl}
                  alt={mobileBanners[0].title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  priority
                  unoptimized
                />
                {/* オーバーレイ */}
                <div className={`absolute inset-0 bg-gradient-to-r ${mobileBanners[0].backgroundColor || 'from-black/40 to-black/20'} opacity-60`}></div>
              </div>
              
              {/* コンテンツ */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-1 max-w-4xl">
                  <h2 className={`text-xs font-black ${mobileBanners[0].textColor || 'text-white'} drop-shadow-2xl`}>
                    {mobileBanners[0].title}
                  </h2>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* デスクトップ表示 - 全バナーをSwiperで表示 */}
      <div className="hidden sm:block">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, EffectCoverflow]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          effect="coverflow"
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          loop={desktopBanners.length > 1}
          className="w-full h-[200px] md:h-[250px] lg:h-[300px]"
        >
          {desktopBanners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <Link href={banner.linkUrl} className="block w-full h-full relative group">
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    priority
                    unoptimized
                  />
                  {/* オーバーレイ */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${banner.backgroundColor || 'from-black/40 to-black/20'} opacity-60`}></div>
                </div>
                
                {/* コンテンツ */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-4 max-w-4xl">
                    <h2 className={`text-2xl md:text-3xl lg:text-4xl font-black mb-2 ${banner.textColor || 'text-white'} drop-shadow-2xl`}>
                      {banner.title}
                    </h2>
                    <p className={`text-base md:text-lg lg:text-xl font-bold mb-3 ${banner.textColor || 'text-white'} opacity-90 drop-shadow-lg`}>
                      {banner.subtitle}
                    </p>
                    {banner.description && (
                      <p className={`text-sm md:text-lg lg:text-xl ${banner.textColor || 'text-white'} opacity-80 max-w-2xl mx-auto drop-shadow-lg`}>
                        {banner.description}
                      </p>
                    )}
                    
                    {/* CTAボタン */}
                    <div className="mt-4">
                      <span className="inline-block bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 hover:border-white/50 text-white font-black px-6 py-2 rounded-full text-sm md:text-base transition-all duration-300 hover:scale-105 transform">
                        {banner.linkType === 'gacha' ? 'ガチャを引く' : 
                         banner.linkType === 'campaign' ? 'キャンペーン詳細' : 
                         '詳細を見る'}
                        <span className="ml-2">→</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* キラキラエフェクト */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-10 left-10 w-4 h-4 bg-white rounded-full opacity-80 animate-ping"></div>
                  <div className="absolute top-20 right-20 w-2 h-2 bg-yellow-300 rounded-full opacity-70 animate-pulse"></div>
                  <div className="absolute bottom-20 left-20 w-3 h-3 bg-pink-300 rounded-full opacity-60 animate-bounce"></div>
                  <div className="absolute bottom-10 right-10 w-5 h-5 bg-blue-300 rounded-full opacity-50 animate-ping" style={{animationDelay: '1s'}}></div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* カスタムナビゲーションボタン（デスクトップのみ） */}
      <div className="hidden sm:block">
        {desktopBanners.length > 1 && (
          <>
            <div className="swiper-button-prev-custom absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all group">
              <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="swiper-button-next-custom absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all group">
              <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </>
        )}

        {/* バナー数インジケーター（デスクトップのみ） */}
        <div className="absolute bottom-4 left-4 bg-black/30 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full z-10">
          {desktopBanners.length}個のキャンペーン
        </div>
      </div>
    </section>
  )
}