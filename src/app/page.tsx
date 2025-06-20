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
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [currentNotification, setCurrentNotification] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    fetchGachaProducts()
    initializeNotifications()
    
    // 初回訪問チェック
    const isFirstVisit = !localStorage.getItem('hasVisited')
    if (isFirstVisit) {
      showWelcomeNotification()
      localStorage.setItem('hasVisited', 'true')
    }
  }, [])

  const fetchGachaProducts = async () => {
    try {
      const response = await fetch('/api/gacha/products')
      const data = await response.json()
      
      // APIからのデータが空の場合、ダミーデータを使用
      if (!data.products || data.products.length === 0) {
        setGachaProducts([
          { id: '1', name: 'ポケモンカード151ガチャ', description: 'レアカード確率アップ中！', imageUrl: '', price: 300 },
          { id: '2', name: 'ワンピースカード頂上決戦', description: '新弾登場！SSR確率2倍', imageUrl: '', price: 500 },
          { id: '3', name: '遊戯王プレミアムパック', description: '限定カード多数収録', imageUrl: '', price: 1000 },
          { id: '4', name: 'ヴァイスシュヴァルツSP', description: 'サイン入りカードチャンス！', imageUrl: '', price: 2000 },
          { id: '5', name: 'デュエルマスターズ神撃', description: '最強デッキ構築可能！', imageUrl: '', price: 3000 },
        ])
      } else {
        setGachaProducts(data.products)
      }
    } catch (error) {
      console.error('Failed to fetch gacha products:', error)
      // エラー時のダミーデータ
      setGachaProducts([
        { id: '1', name: 'ポケモンカード151ガチャ', description: 'レアカード確率アップ中！', imageUrl: '', price: 300 },
        { id: '2', name: 'ワンピースカード頂上決戦', description: '新弾登場！SSR確率2倍', imageUrl: '', price: 500 },
        { id: '3', name: '遊戯王プレミアムパック', description: '限定カード多数収録', imageUrl: '', price: 1000 },
        { id: '4', name: 'ヴァイスシュヴァルツSP', description: 'サイン入りカードチャンス！', imageUrl: '', price: 2000 },
        { id: '5', name: 'デュエルマスターズ神撃', description: '最強デッキ構築可能！', imageUrl: '', price: 3000 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const initializeNotifications = () => {
    // ダミー通知データ
    const dummyNotifications = [
      {
        id: '1',
        title: '🎉 新ガチャ登場！',
        content: '<p>ポケモンカード151ガチャが新登場！<br/>SSR確率2倍キャンペーン実施中です！</p>',
        type: 'campaign',
        priority: 'high',
        imageUrl: '/api/placeholder/400/300'
      },
      {
        id: '2',
        title: '📢 メンテナンス情報',
        content: '<p>6月21日 2:00〜6:00<br/>サーバーメンテナンスを実施します。</p>',
        type: 'info',
        priority: 'medium'
      }
    ]
    setNotifications(dummyNotifications)
    setUnreadNotifications(dummyNotifications.length)
  }

  const showWelcomeNotification = () => {
    const welcomeNotification = {
      id: 'welcome',
      title: 'ACEORIPA へようこそ！🎰',
      content: '<p>初回限定！<strong>1000円分のポイント</strong>をプレゼント！<br/>今すぐガチャを楽しもう！</p>',
      type: 'campaign',
      priority: 'high',
      imageUrl: '/api/placeholder/400/300'
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

  // PRバナーのダミーデータ
  const prBanners = [
    { id: 1, imageUrl: '/api/placeholder/400/400', title: 'PRバナー1' },
    { id: 2, imageUrl: '/api/placeholder/400/400', title: 'PRバナー2' },
    { id: 3, imageUrl: '/api/placeholder/400/400', title: 'PRバナー3' },
    { id: 4, imageUrl: '/api/placeholder/400/400', title: 'PRバナー4' },
    { id: 5, imageUrl: '/api/placeholder/400/400', title: 'PRバナー5' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">ACEORIPA GACHA</h1>
            <nav className="flex items-center space-x-4">
              {/* 通知ベル */}
              <div className="relative">
                <button
                  onClick={() => setUnreadNotifications(0)}
                  className="relative p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                
                {/* 通知ドロップダウン */}
                {unreadNotifications === 0 && notifications.length > 0 && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">お知らせ</h3>
                      <div className="space-y-3">
                        {notifications.slice(0, 3).map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => showNotification(notification)}
                            className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {notification.type === 'campaign' && <span className="text-xl">🎉</span>}
                                {notification.type === 'info' && <span className="text-xl">ℹ️</span>}
                                {notification.type === 'warning' && <span className="text-xl">⚠️</span>}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 text-sm">{notification.title}</p>
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

      {/* PRバナースライダー (400×400) */}
      <section className="bg-gray-100 py-6">
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

      {/* お知らせ文章 */}
      <section className="bg-yellow-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-gray-800 mx-4 font-semibold">
                🎉 新ガチャ「レジェンドコレクション」登場！
              </span>
              <span className="text-gray-800 mx-4 font-semibold">
                📢 期間限定！SSR確率2倍キャンペーン実施中
              </span>
              <span className="text-gray-800 mx-4 font-semibold">
                🎁 毎日ログインで無料ガチャチケットプレゼント
              </span>
              <span className="text-gray-800 mx-4 font-semibold">
                🎉 新ガチャ「レジェンドコレクション」登場！
              </span>
              <span className="text-gray-800 mx-4 font-semibold">
                📢 期間限定！SSR確率2倍キャンペーン実施中
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ガチャ一覧 (1024×1024) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {gachaProducts.map((gacha, index) => (
              <div key={gacha.id} className="bg-white rounded-lg shadow-xl overflow-hidden">
                {/* ガチャ画像 (1024×1024) - 水色の仮組み */}
                <div className="relative aspect-square max-w-4xl mx-auto bg-sky-200 flex items-center justify-center">
                  <div className="text-center p-8">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">{gacha.name}</h2>
                    <p className="text-2xl text-gray-600 mb-8">{gacha.description}</p>
                    <div className="text-6xl font-bold text-sky-600">
                      ガチャ {index + 1}
                    </div>
                    <div className="mt-8 text-3xl text-gray-700">
                      1024 × 1024
                    </div>
                  </div>
                </div>
                
                {/* ガチャボタン（常に表示） */}
                <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6">
                  <div className="flex justify-center flex-wrap gap-4">
                    <Link
                      href={`/gacha/${gacha.id}?count=1`}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-lg text-lg transform hover:scale-105 transition shadow-lg"
                    >
                      1回
                    </Link>
                    <Link
                      href={`/gacha/${gacha.id}?count=5`}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-12 rounded-lg text-lg transform hover:scale-105 transition shadow-lg"
                    >
                      5回
                    </Link>
                    <Link
                      href={`/gacha/${gacha.id}?count=10`}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-12 rounded-lg text-lg transform hover:scale-105 transition shadow-lg"
                    >
                      10回
                    </Link>
                    <Link
                      href={`/gacha/${gacha.id}?count=custom`}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-12 rounded-lg text-lg transform hover:scale-105 transition shadow-lg"
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
      <footer className="bg-gray-100 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">© 2024 ACEORIPA GACHA</p>
          </div>
        </div>
      </footer>

      {/* 通知モーダル */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={handleNotificationClose}
        notification={currentNotification}
      />
    </div>
  )
}