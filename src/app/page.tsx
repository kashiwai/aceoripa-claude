'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { NotificationModal } from '@/components/common/NotificationModal'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface PokemonGachaProduct {
  id: string
  name: string
  description: string
  imageUrl: string
  price: number
  originalPrice?: number
  rarityGuarantee?: string
  featured?: boolean
  limitedTime?: boolean
}

export default function HomePage() {
  const [gachaProducts, setGachaProducts] = useState<PokemonGachaProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [currentNotification, setCurrentNotification] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    fetchPokemonGachaProducts()
    initializeNotifications()
    registerServiceWorker()
    
    // 初回訪問チェック
    const isFirstVisit = !localStorage.getItem('hasVisited')
    if (isFirstVisit) {
      showWelcomeNotification()
      localStorage.setItem('hasVisited', 'true')
    }
  }, [])

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', registration)
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  const fetchPokemonGachaProducts = async () => {
    try {
      // ポケモンガチャ商品のダミーデータ
      setGachaProducts([
        { 
          id: 'pokemon-151', 
          name: 'ポケモンカード151 オリパ', 
          description: 'リザードンex、フシギバナex確率UP！',
          imageUrl: '/images/pokemon-151.jpg',
          price: 800,
          originalPrice: 1000,
          rarityGuarantee: 'SR以上確定',
          featured: true,
          limitedTime: true
        },
        { 
          id: 'sv4a', 
          name: 'ハイクラスパック「シャイニートレジャーex」オリパ', 
          description: 'シャイニーポケモン大量収録！',
          imageUrl: '/api/placeholder/400/600',
          price: 1200,
          rarityGuarantee: 'SAR以上確定',
          featured: true
        },
        { 
          id: 'classic', 
          name: 'ポケモンカードクラシック オリパ', 
          description: '懐かしのポケモンカードが当たる！',
          imageUrl: '/api/placeholder/400/600',
          price: 500,
          rarityGuarantee: 'R以上確定'
        },
        { 
          id: 'promo', 
          name: 'プロモカード特別オリパ', 
          description: '激レアプロモカードチャンス！',
          imageUrl: '/api/placeholder/400/600',
          price: 2000,
          rarityGuarantee: 'プロモ確定',
          limitedTime: true
        },
        { 
          id: 'starter', 
          name: 'はじめてのポケモンカード オリパ', 
          description: '初心者におすすめ！',
          imageUrl: '/api/placeholder/400/600',
          price: 300,
          rarityGuarantee: 'UR確定'
        }
      ])
    } catch (error) {
      console.error('Failed to fetch Pokemon gacha products:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeNotifications = () => {
    const pokemonNotifications = [
      {
        id: '1',
        title: '🔥 ポケモンカード151 新登場！',
        content: '<p>リザードンexやフシギバナexが当たる特別オリパ！<br/>今なら<strong>SR以上確定</strong>で開催中！</p>',
        type: 'campaign',
        priority: 'high',
        imageUrl: '/images/pokemon-151.jpg'
      },
      {
        id: '2',
        title: '⚡ シャイニートレジャーex 確率UP！',
        content: '<p>シャイニーポケモンの出現確率が2倍に！<br/>期間限定キャンペーン実施中</p>',
        type: 'campaign',
        priority: 'high'
      }
    ]
    setNotifications(pokemonNotifications)
    setUnreadNotifications(pokemonNotifications.length)
  }

  const showWelcomeNotification = () => {
    const welcomeNotification = {
      id: 'welcome',
      title: 'ポケモンカードオリパへようこそ！🎰',
      content: '<p>初回限定！<strong>1500円分のポイント</strong>をプレゼント！<br/>憧れのポケモンカードをゲットしよう！</p>',
      type: 'campaign',
      priority: 'high',
      imageUrl: '/images/pokemon-151.jpg'
    }
    setCurrentNotification(welcomeNotification)
    setShowNotificationModal(true)
  }

  const showNotification = (notification: any) => {
    setCurrentNotification(notification)
    setShowNotificationModal(true)
  }

  const handleNotificationClose = () => {
    setShowNotificationModal(false)
    setCurrentNotification(null)
  }

  // PRバナーのポケモンデータ
  const pokemonBanners = [
    { id: 1, imageUrl: '/api/placeholder/400/400', title: 'リザードンex特集' },
    { id: 2, imageUrl: '/api/placeholder/400/400', title: 'ピカチュウプロモ' },
    { id: 3, imageUrl: '/api/placeholder/400/400', title: 'ミュウツーSAR' },
    { id: 4, imageUrl: '/api/placeholder/400/400', title: 'イーブイヒーローズ' },
    { id: 5, imageUrl: '/api/placeholder/400/400', title: '25th Anniversary' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      {/* ヘッダー - DOPAスタイル */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                ポケモンカード オリパ
              </h1>
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                24時間営業
              </span>
            </div>
            <nav className="flex items-center space-x-6">
              {/* 通知ベル */}
              <div className="relative">
                <button
                  onClick={() => setUnreadNotifications(0)}
                  className="relative p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                
                {/* 通知ドロップダウン */}
                {unreadNotifications === 0 && notifications.length > 0 && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border-2 border-yellow-400 z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">🔔</span>
                        お知らせ
                      </h3>
                      <div className="space-y-3">
                        {notifications.slice(0, 3).map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => showNotification(notification)}
                            className="p-3 hover:bg-yellow-50 rounded-lg cursor-pointer transition border border-gray-200"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {notification.type === 'campaign' && <span className="text-xl">🎉</span>}
                                {notification.type === 'info' && <span className="text-xl">ℹ️</span>}
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-gray-900 text-sm">{notification.title}</p>
                                <p className="text-gray-600 text-xs mt-1">クリックして詳細を見る</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Link href="/mypage" className="text-blue-600 hover:text-blue-800 font-semibold">
                マイページ
              </Link>
              <Link href="/collection" className="text-blue-600 hover:text-blue-800 font-semibold">
                コレクション
              </Link>
              <Link href="/ranking" className="text-blue-600 hover:text-blue-800 font-semibold">
                ランキング
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* PRバナースライダー */}
      <section className="bg-gradient-to-r from-blue-100 to-yellow-100 py-6">
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
            className="pokemon-banner-swiper"
          >
            {pokemonBanners.map((banner) => (
              <SwiperSlide key={banner.id}>
                <div className="relative aspect-square bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-2 border-yellow-300">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white font-bold text-sm">{banner.title}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* お知らせマーキー */}
      <section className="bg-yellow-400 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <div className="animate-marquee whitespace-nowrap text-blue-900 font-bold">
              <span className="mx-8">🔥 期間限定！ポケモンカード151 SR以上確定オリパ開催中！</span>
              <span className="mx-8">⚡ シャイニートレジャーex 確率2倍キャンペーン実施中！</span>
              <span className="mx-8">🎁 毎日ログインで無料オリパチケットプレゼント！</span>
              <span className="mx-8">🏆 週間ランキング1位でリザードンexプレゼント！</span>
            </div>
          </div>
        </div>
      </section>

      {/* ポケモンガチャ一覧 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {gachaProducts.map((pokemon, index) => (
              <div key={pokemon.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-yellow-300 hover:border-red-400 transition-colors">
                {/* 商品ヘッダー */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{pokemon.name}</h2>
                      <p className="text-blue-100 mt-1">{pokemon.description}</p>
                    </div>
                    <div className="text-right">
                      {pokemon.featured && (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 block">
                          注目！
                        </span>
                      )}
                      {pokemon.limitedTime && (
                        <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                          期間限定
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ガチャ画像 (1024×1024風) */}
                <div className="relative aspect-square max-w-4xl mx-auto bg-gradient-to-br from-blue-200 via-yellow-200 to-red-200 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-8xl mb-6">
                      {index === 0 ? '🔥' : index === 1 ? '⚡' : index === 2 ? '🌟' : index === 3 ? '💎' : '🎯'}
                    </div>
                    <h3 className="text-4xl font-bold text-gray-800 mb-4">{pokemon.name}</h3>
                    <p className="text-2xl text-gray-700 mb-6">{pokemon.description}</p>
                    <div className="bg-white rounded-lg p-4 mb-4 shadow-lg">
                      <p className="text-lg font-bold text-blue-600">{pokemon.rarityGuarantee}</p>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      {pokemon.originalPrice && (
                        <span className="text-xl text-gray-500 line-through">¥{pokemon.originalPrice}</span>
                      )}
                      <span className="text-4xl font-bold text-red-600">¥{pokemon.price}</span>
                    </div>
                  </div>
                </div>
                
                {/* ガチャボタン */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-t-4 border-yellow-400">
                  <div className="flex justify-center flex-wrap gap-4">
                    <Link
                      href={`/gacha/${pokemon.id}?count=1`}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full text-lg transform hover:scale-105 transition-all shadow-lg min-w-[120px]"
                    >
                      1回引く
                    </Link>
                    <Link
                      href={`/gacha/${pokemon.id}?count=5`}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-full text-lg transform hover:scale-105 transition-all shadow-lg min-w-[120px]"
                    >
                      5回引く
                    </Link>
                    <Link
                      href={`/gacha/${pokemon.id}?count=10`}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg transform hover:scale-105 transition-all shadow-lg min-w-[120px] relative"
                    >
                      10回引く
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        お得
                      </span>
                    </Link>
                    <Link
                      href={`/gacha/${pokemon.id}?count=custom`}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-full text-lg transform hover:scale-105 transition-all shadow-lg min-w-[120px]"
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

      {/* フッター */}
      <footer className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">ポケモンカード オリパ</h3>
            <p className="text-blue-200 mb-6">憧れのポケモンカードをゲットしよう！</p>
            <div className="flex justify-center space-x-6 text-sm">
              <Link href="/terms" className="hover:text-yellow-300">利用規約</Link>
              <Link href="/privacy" className="hover:text-yellow-300">プライバシーポリシー</Link>
              <Link href="/help" className="hover:text-yellow-300">ヘルプ</Link>
              <Link href="/contact" className="hover:text-yellow-300">お問い合わせ</Link>
            </div>
            <p className="text-gray-400 text-sm mt-6">© 2024 ポケモンカード オリパ</p>
          </div>
        </div>
      </footer>

      {/* 通知モーダル */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={handleNotificationClose}
        notification={currentNotification}
      />

      {/* カスタムスタイル */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  )
}