'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function MigrateBannersPage() {
  const [migrating, setMigrating] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  
  const allBanners = [
    // ガチャバナー（300x300）
    {
      url: '/images/banners/real-gacha/S__44392515_0.jpg',
      type: 'square',
      name: 'ピカチュウ大祭り',
      prompt: 'Pikachu festival banner',
      hasText: true,
      currentUsage: 'gacha-list'
    },
    {
      url: '/images/banners/real-gacha/S__44392516_0.jpg',
      type: 'square',
      name: 'ナンジャモ大量発生オリパ',
      prompt: 'Nanjamo gacha banner',
      hasText: true,
      currentUsage: 'gacha-list'
    },
    {
      url: '/images/banners/real-gacha/S__44392517_0.jpg',
      type: 'square',
      name: 'リザードン祭盤',
      prompt: 'Charizard festival banner',
      hasText: true,
      currentUsage: 'gacha-list'
    },
    {
      url: '/images/banners/real-gacha/S__44392521_0.jpg',
      type: 'square',
      name: 'ブラッキー超感謝祭',
      prompt: 'Umbreon special banner',
      hasText: true,
      currentUsage: 'gacha-list'
    },
    {
      url: '/images/banners/real-gacha/S__44392523_0.jpg',
      type: 'square',
      name: 'リーリエ×マリオピカチュウ',
      prompt: 'Lillie Mario Pikachu banner',
      hasText: true,
      currentUsage: 'gacha-list'
    },
    // キャンペーンバナー（トップページ用）
    {
      url: '/images/banners/new-user-campaign.jpg',
      type: 'top-mobile',
      name: '新規登録キャンペーン',
      prompt: 'New user campaign banner',
      hasText: true,
      currentUsage: 'top-slider'
    },
    {
      url: '/images/banners/referral-campaign.jpg',
      type: 'top-mobile',
      name: '友達紹介キャンペーン',
      prompt: 'Referral campaign banner',
      hasText: true,
      currentUsage: 'top-slider'
    },
    // 1024x1024バナー
    {
      url: '/images/banners/1024x1024/main-gacha-banner.png',
      type: 'gacha',
      name: 'メインガチャバナー',
      prompt: 'Main gacha banner',
      hasText: true,
      currentUsage: 'none'
    },
    {
      url: '/images/banners/1024x1024/ssr-banner.png',
      type: 'gacha',
      name: 'SSRバナー',
      prompt: 'SSR banner',
      hasText: true,
      currentUsage: 'none'
    },
    {
      url: '/images/banners/1024x1024/sr-banner.png',
      type: 'gacha',
      name: 'SRバナー',
      prompt: 'SR banner',
      hasText: true,
      currentUsage: 'none'
    },
    {
      url: '/images/banners/1024x1024/ur-banner.png',
      type: 'gacha',
      name: 'URバナー',
      prompt: 'UR banner',
      hasText: true,
      currentUsage: 'none'
    },
    {
      url: '/images/banners/1024x1024/psa10-banner.png',
      type: 'gacha',
      name: 'PSA10バナー',
      prompt: 'PSA10 banner',
      hasText: true,
      currentUsage: 'none'
    },
    // リニューアルバナー
    {
      url: '/images/banners/renewal/renewal-game-banner.png',
      type: 'top-desktop',
      name: 'リニューアルゲームバナー',
      prompt: 'Renewal game banner',
      hasText: true,
      currentUsage: 'none'
    },
    {
      url: '/images/banners/renewal/renewal-pop-banner.png',
      type: 'top-desktop',
      name: 'リニューアルポップバナー',
      prompt: 'Renewal pop banner',
      hasText: true,
      currentUsage: 'none'
    },
    {
      url: '/images/banners/renewal/renewal-modern-banner.png',
      type: 'top-desktop',
      name: 'リニューアルモダンバナー',
      prompt: 'Renewal modern banner',
      hasText: true,
      currentUsage: 'none'
    },
    // その他のガチャバナー
    {
      url: '/images/banners/real-gacha/premium-psa10-banner.png',
      type: 'square',
      name: 'プレミアムPSA10バナー',
      prompt: 'Premium PSA10 banner',
      hasText: true,
      currentUsage: 'none'
    },
    {
      url: '/images/banners/real-gacha/pokemon-151-ultra-rare.png',
      type: 'square',
      name: 'ポケモン151ウルトラレア',
      prompt: 'Pokemon 151 ultra rare',
      hasText: true,
      currentUsage: 'none'
    },
    {
      url: '/images/banners/real-gacha/pikachu-festival-banner.png',
      type: 'square',
      name: 'ピカチュウフェスティバル',
      prompt: 'Pikachu festival',
      hasText: true,
      currentUsage: 'none'
    },
    {
      url: '/images/banners/real-gacha/acerola-special-banner.png',
      type: 'square',
      name: 'アセロラスペシャル',
      prompt: 'Acerola special',
      hasText: true,
      currentUsage: 'none'
    },
    {
      url: '/images/banners/real-gacha/mega-campaign-special.png',
      type: 'top-mobile',
      name: 'メガキャンペーンスペシャル',
      prompt: 'Mega campaign special',
      hasText: true,
      currentUsage: 'none'
    }
  ]
  
  const bannerTypes = [
    { value: 'all', label: 'すべて' },
    { value: 'square', label: 'スクエアバナー (300×300)' },
    { value: 'gacha', label: 'ガチャバナー (1024×1024)' },
    { value: 'top-mobile', label: 'モバイルトップ (375×200)' },
    { value: 'top-desktop', label: 'デスクトップトップ (1920×400)' }
  ]
  
  const filteredBanners = selectedType === 'all' 
    ? allBanners 
    : allBanners.filter(banner => banner.type === selectedType)

  const migrateBanners = async () => {
    setMigrating(true)
    let successCount = 0

    try {
      for (const banner of filteredBanners) {
        const response = await fetch('/api/admin/ai-generator/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: banner.url,
            originalUrl: banner.url,
            type: banner.type,
            name: banner.name,
            prompt: banner.prompt,
            hasText: banner.hasText,
            metadata: {
              migrated: true,
              migratedAt: new Date().toISOString()
            }
          })
        })

        if (response.ok) {
          successCount++
        }
      }

      toast.success(`${successCount}個のバナーを移行しました`)
    } catch (error) {
      console.error('Migration error:', error)
      toast.error('移行中にエラーが発生しました')
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">既存バナーの移行</h1>
        <Link href="/admin/ai-generator/banner-library" className="btn btn-secondary">
          バナー管理へ
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <p className="mb-4">
            プロジェクトに既に存在するバナー画像をバナー管理システムに登録します。
          </p>

          <div className="mb-4">
            <label className="form-label">バナータイプを選択</label>
            <select 
              className="form-select mb-3"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {bannerTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <h3 className="h5 mb-3">移行対象のバナー ({filteredBanners.length}件)</h3>
          <div className="row mb-4">
            {filteredBanners.map((banner, index) => (
              <div key={index} className="col-md-2 mb-3">
                <div className="card h-100">
                  <div className="position-relative" style={{ paddingTop: banner.type === 'gacha' ? '100%' : banner.type === 'square' ? '100%' : '56.25%' }}>
                    <img
                      src={banner.url}
                      alt={banner.name}
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="card-body p-2">
                    <small className="d-block text-truncate">{banner.name}</small>
                    <small className="text-muted">{banner.type}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={migrateBanners}
            disabled={migrating}
            className="btn btn-primary"
          >
            {migrating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                移行中...
              </>
            ) : (
              'バナーを移行'
            )}
          </button>

          <div className="alert alert-info mt-4">
            <strong>注意:</strong> この操作は既存のバナー画像をバナー管理システムに登録します。
            同じバナーを複数回移行しないようご注意ください。
          </div>
        </div>
      </div>
    </div>
  )
}