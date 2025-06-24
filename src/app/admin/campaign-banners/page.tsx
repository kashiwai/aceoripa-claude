'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CampaignBannersPage() {
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<any>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [banners, setBanners] = useState([
    {
      id: '1',
      title: '🎉 新規登録キャンペーン',
      subtitle: '今なら5000ポイントプレゼント！',
      bgColor: 'from-purple-600 to-pink-600',
      isActive: true,
      priority: 1,
    },
    {
      id: '2',
      title: '🎁 友達紹介キャンペーン',
      subtitle: '友達を紹介して3000ポイントGET！',
      bgColor: 'from-blue-600 to-cyan-600',
      isActive: true,
      priority: 2,
    },
    {
      id: '3',
      title: '⚡ 期間限定！SSR確率2倍',
      subtitle: '12/25まで全ガチャでSSR確率アップ中',
      bgColor: 'from-yellow-500 to-orange-600',
      isActive: false,
      priority: 3,
    },
  ])

  const [showAllBanners, setShowAllBanners] = useState(true)

  useEffect(() => {
    fetchBannerSettings()
  }, [])

  const fetchBannerSettings = async () => {
    try {
      const response = await fetch('/api/admin/campaign-banners')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setShowAllBanners(data.data.showAllBanners ?? true)
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

  const toggleBannerStatus = (id: string) => {
    setBanners(banners.map(banner => 
      banner.id === id ? { ...banner, isActive: !banner.isActive } : banner
    ))
    setHasChanges(true)
  }

  const deleteBanner = (id: string) => {
    if (confirm('このバナーを削除してもよろしいですか？')) {
      setBanners(banners.filter(banner => banner.id !== id))
      setHasChanges(true)
    }
  }

  const saveChanges = async () => {
    try {
      const response = await fetch('/api/admin/campaign-banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          showAllBanners,
          banners
        })
      })
      
      if (response.ok) {
        const data = await response.json()
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">キャンペーンバナー管理</h1>
              <p className="text-sm text-gray-600 mt-1">バナーサイズ: 全幅 × 自動調整（推奨: 1200px × 300px）</p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showAllBanners}
                  onChange={(e) => {
                    setShowAllBanners(e.target.checked)
                    setHasChanges(true)
                  }}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">全バナー表示</span>
              </label>
              <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                管理画面に戻る
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">登録済みバナー</h2>
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

          {!showAllBanners && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                ⚠️ 全バナー非表示モードが有効です。トップページにバナーは表示されません。
              </p>
            </div>
          )}

          <div className="space-y-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`border rounded-lg p-4 ${
                  !showAllBanners || !banner.isActive ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{banner.title}</h3>
                    <p className="text-gray-600">{banner.subtitle}</p>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-sm text-gray-500">優先度: {banner.priority}</span>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${banner.bgColor} text-white`}>
                        プレビュー
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleBannerStatus(banner.id)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        banner.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      disabled={!showAllBanners}
                    >
                      {banner.isActive ? '公開中' : '非公開'}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingBanner(banner)
                        setShowEditModal(true)
                      }}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200">
                      編集
                    </button>
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                    >
                      削除
                    </button>
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
            <h2 className="text-xl font-bold mb-4">キャンペーンバナー編集</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">背景カラー</label>
                <select
                  value={editingBanner?.bgColor || ''}
                  onChange={(e) => setEditingBanner({...editingBanner, bgColor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="from-purple-600 to-pink-600">パープル→ピンク</option>
                  <option value="from-blue-600 to-cyan-600">ブルー→シアン</option>
                  <option value="from-yellow-500 to-orange-600">イエロー→オレンジ</option>
                  <option value="from-green-600 to-teal-600">グリーン→ティール</option>
                  <option value="from-red-600 to-pink-600">レッド→ピンク</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">優先度</label>
                <input
                  type="number"
                  value={editingBanner?.priority || 1}
                  onChange={(e) => setEditingBanner({...editingBanner, priority: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                  required
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