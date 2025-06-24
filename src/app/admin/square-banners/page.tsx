'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function SquareBannersPage() {
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<any>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [banners, setBanners] = useState<any[]>([
    { 
      id: 1, 
      gachaId: '1',
      title: '激アツ！ピカチュウ祭り', 
      subtitle: 'マリオピカチュウPSA10確定！', 
      image: '/images/basebg/A_luxurious_gold-framed_Pokmon_trading_card_is_t-1750539990520.png',
      isActive: true,
      priority: 1,
    },
    { 
      id: 2, 
      gachaId: '2',
      title: 'プレミアムBOX', 
      subtitle: 'SSレア確率50%UP！', 
      image: '/images/basebg/A_dazzling_spectacle_featuring_a_dazzling_Pokmon_-1750539986706.png',
      isActive: true,
      priority: 2,
    },
    { 
      id: 3, 
      gachaId: '3',
      title: '限定100パック！', 
      subtitle: 'ナンジャモ&リーリエ狙い撃ち', 
      image: '/images/basebg/A_vibrant_and_colorful_backdrop_featuring_a_rainbo-1750539998852.png',
      isActive: true,
      priority: 3,
    },
    { 
      id: 4, 
      gachaId: '4',
      title: '新春超豪華オリパ', 
      subtitle: 'アセロラPSA10大量封入！', 
      image: '/images/basebg/A_festive_scene_with_a_large_shimmering_drum_at_t-1750539994085.png',
      isActive: false,
      priority: 4,
    },
    { 
      id: 5, 
      gachaId: '5',
      title: 'ブラッキー感謝祭', 
      subtitle: 'ブラッキーex PSA10確率3倍！', 
      image: '/images/basebg/A_cosmic_scene_featuring_a_dazzling_trading_card_-1750539978161.png',
      isActive: false,
      priority: 5,
    },
  ])

  const [showSquareBanners, setShowSquareBanners] = useState(true)

  useEffect(() => {
    fetchBannerSettings()
  }, [])

  const fetchBannerSettings = async () => {
    try {
      const response = await fetch('/api/admin/square-banners')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setShowSquareBanners(data.data.showSquareBanners ?? true)
          if (data.data.banners && Array.isArray(data.data.banners) && data.data.banners.length > 0) {
            setBanners(data.data.banners)
          }
          // DBが空の場合は初期データを保持
        }
      }
    } catch (error) {
      console.error('Failed to fetch banner settings:', error)
    }
  }

  const toggleBannerStatus = (id: number | string) => {
    setBanners(banners.map(banner => 
      banner.id === id ? { ...banner, isActive: !banner.isActive } : banner
    ))
    setHasChanges(true)
  }

  const deleteBanner = (id: number | string) => {
    if (confirm('このバナーを削除してもよろしいですか？')) {
      setBanners(banners.filter(banner => banner.id !== id))
      setHasChanges(true)
    }
  }

  const saveChanges = async () => {
    try {
      // console.log('Saving changes:', { showSquareBanners, banners })
      const response = await fetch('/api/admin/square-banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          showSquareBanners,
          banners
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        // console.log('Save response:', data)
        if (data.success) {
          alert('変更を保存しました')
          setHasChanges(false)
        } else {
          alert('保存に失敗しました')
        }
      } else {
        alert('保存に失敗しました')
      }
    } catch (error) {
      console.error('Error saving changes:', error)
      alert('保存に失敗しました')
    }
  }

  const moveBanner = (id: number | string, direction: 'up' | 'down') => {
    const index = banners.findIndex(b => b.id === id)
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === banners.length - 1)) {
      return
    }
    
    const newBanners = [...banners]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]]
    ;[newBanners[index].priority, newBanners[targetIndex].priority] = [newBanners[targetIndex].priority, newBanners[index].priority]
    
    setBanners(newBanners)
    setHasChanges(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Squareバナー管理</h1>
              <p className="text-sm text-gray-600 mt-1">バナーサイズ: 300px × 300px</p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showSquareBanners}
                  onChange={(e) => {
                    setShowSquareBanners(e.target.checked)
                    setHasChanges(true)
                  }}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Squareバナー表示</span>
              </label>
              <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                管理画面に戻る
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">登録済みSquareバナー</h2>
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <button 
                  onClick={saveChanges}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  変更を保存
                </button>
              )}
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                + 新規バナー追加
              </button>
            </div>
          </div>

          {!showSquareBanners && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                ⚠️ Squareバナー非表示モードが有効です。トップページにSquareバナーは表示されません。
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`border rounded-lg overflow-hidden ${
                  !showSquareBanners || !banner.isActive ? 'opacity-50' : ''
                }`}
              >
                {/* バナープレビュー */}
                <div className="relative w-full h-48 bg-gray-100">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-lg">{banner.title}</h3>
                    <p className="text-white/90 text-sm">{banner.subtitle}</p>
                  </div>
                </div>

                {/* バナー情報 */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">ガチャID: {banner.gachaId}</span>
                    <span className="text-sm text-gray-500">優先度: {banner.priority}</span>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleBannerStatus(banner.id)}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                          banner.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        disabled={!showSquareBanners}
                      >
                        {banner.isActive ? '公開中' : '非公開'}
                      </button>
                      <button 
                        onClick={() => {
                          setEditingBanner(banner)
                          setShowEditModal(true)
                        }}
                        className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200">
                        編集
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => moveBanner(banner.id, 'up')}
                        disabled={index === 0}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveBanner(banner.id, 'down')}
                        disabled={index === banners.length - 1}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => deleteBanner(banner.id)}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 編集モーダル */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">バナー編集</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              setBanners(banners.map(b => 
                b.id === editingBanner.id ? editingBanner : b
              ))
              setShowEditModal(false)
              setHasChanges(true)
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
                <input
                  type="text"
                  value={editingBanner?.title || ''}
                  onChange={(e) => setEditingBanner({...editingBanner, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">サブタイトル</label>
                <input
                  type="text"
                  value={editingBanner?.subtitle || ''}
                  onChange={(e) => setEditingBanner({...editingBanner, subtitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">ガチャID</label>
                <input
                  type="text"
                  value={editingBanner?.gachaId || ''}
                  onChange={(e) => setEditingBanner({...editingBanner, gachaId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">画像URL</label>
                <input
                  type="text"
                  value={editingBanner?.image || ''}
                  onChange={(e) => setEditingBanner({...editingBanner, image: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/images/..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}