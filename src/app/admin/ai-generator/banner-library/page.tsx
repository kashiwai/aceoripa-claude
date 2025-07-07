'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'

interface SavedBanner {
  id: string
  url: string
  originalUrl?: string
  type: 'square' | 'top-mobile' | 'top-desktop' | 'gacha'
  name: string
  prompt?: string
  hasText: boolean
  currentUsage?: string
  createdAt: string
}

const USAGE_OPTIONS = [
  { value: 'top-slider', label: 'トップページスライダー' },
  { value: 'gacha-list', label: 'ガチャ一覧' },
  { value: 'gacha-detail', label: 'ガチャ詳細' },
  { value: 'campaign', label: 'キャンペーンバナー' },
  { value: 'square-banner', label: 'スクエアバナー' },
  { value: 'social-share', label: 'SNSシェア用' },
  { value: 'email-header', label: 'メールヘッダー' },
  { value: 'notification', label: 'プッシュ通知' },
  { value: 'none', label: '未使用' }
]

const BANNER_TYPES = [
  { value: 'all', label: 'すべて' },
  { value: 'square', label: '300×300' },
  { value: 'top-mobile', label: 'モバイル横長' },
  { value: 'top-desktop', label: 'デスクトップ横長' },
  { value: 'gacha', label: 'ガチャバナー' }
]

export default function BannerLibraryPage() {
  const [banners, setBanners] = useState<SavedBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterUsage, setFilterUsage] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBanner, setSelectedBanner] = useState<SavedBanner | null>(null)
  const [newUsage, setNewUsage] = useState('')
  const [newName, setNewName] = useState('')

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/ai-generator/banners')
      const data = await response.json()
      setBanners(data.banners || [])
    } catch (error) {
      console.error('Error fetching banners:', error)
      toast.error('バナーの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const updateBannerUsage = async (bannerId: string, usage: string) => {
    try {
      const response = await fetch(`/api/admin/ai-generator/banners/${bannerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usage })
      })

      if (!response.ok) throw new Error('更新に失敗しました')

      toast.success('使用場所を更新しました')
      fetchBanners()
      setSelectedBanner(null)
    } catch (error) {
      console.error('Error updating banner:', error)
      toast.error('更新に失敗しました')
    }
  }

  const updateBannerName = async (bannerId: string, name: string) => {
    try {
      const response = await fetch(`/api/admin/ai-generator/banners/${bannerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      if (!response.ok) throw new Error('更新に失敗しました')

      toast.success('名前を更新しました')
      fetchBanners()
    } catch (error) {
      console.error('Error updating banner name:', error)
      toast.error('名前の更新に失敗しました')
    }
  }

  const deleteBanner = async (bannerId: string) => {
    if (!confirm('このバナーを削除しますか？')) return

    try {
      const response = await fetch(`/api/admin/ai-generator/banners/${bannerId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('削除に失敗しました')

      toast.success('バナーを削除しました')
      fetchBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
      toast.error('削除に失敗しました')
    }
  }

  const filteredBanners = banners.filter(banner => {
    const matchesType = filterType === 'all' || banner.type === filterType
    const matchesUsage = filterUsage === 'all' || banner.currentUsage === filterUsage
    const matchesSearch = !searchTerm || 
      banner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (banner.prompt && banner.prompt.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesType && matchesUsage && matchesSearch
  })

  const getBannerDimensions = (type: string) => {
    switch (type) {
      case 'square': return '300×300'
      case 'top-mobile': return '375×200'
      case 'top-desktop': return '1920×400'
      case 'gacha': return '1024×1024'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">読み込み中...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">バナー管理</h1>
          <p className="text-muted">生成したすべてのバナーを管理</p>
        </div>
        <Link href="/admin/ai-generator" className="btn btn-secondary">
          AI生成管理へ戻る
        </Link>
      </div>

      {/* フィルター */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">タイプ</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {BANNER_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">使用場所</label>
              <select
                className="form-select"
                value={filterUsage}
                onChange={(e) => setFilterUsage(e.target.value)}
              >
                <option value="all">すべて</option>
                {USAGE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">検索</label>
              <input
                type="text"
                className="form-control"
                placeholder="名前やプロンプトで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">総バナー数</h5>
              <h3 className="text-primary">{banners.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">使用中</h5>
              <h3 className="text-success">
                {banners.filter(b => b.currentUsage && b.currentUsage !== 'none').length}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">未使用</h5>
              <h3 className="text-muted">
                {banners.filter(b => !b.currentUsage || b.currentUsage === 'none').length}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">今月生成</h5>
              <h3 className="text-info">
                {banners.filter(b => {
                  const date = new Date(b.createdAt)
                  const now = new Date()
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                }).length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* バナー一覧 */}
      <div className="card">
        <div className="card-header">
          <h3 className="h5 mb-0">バナー一覧 ({filteredBanners.length}件)</h3>
        </div>
        <div className="card-body">
          {filteredBanners.length === 0 ? (
            <p className="text-center text-muted py-4">
              条件に一致するバナーがありません
            </p>
          ) : (
            <div className="row">
              {filteredBanners.map(banner => (
                <div key={banner.id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="position-relative">
                      <Image
                        src={banner.url}
                        alt={banner.name}
                        width={300}
                        height={banner.type === 'square' ? 300 : 200}
                        className="card-img-top"
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-dark">
                          {getBannerDimensions(banner.type)}
                        </span>
                      </div>
                      {banner.hasText && (
                        <div className="position-absolute top-0 start-0 m-2">
                          <span className="badge bg-primary">テキスト付き</span>
                        </div>
                      )}
                    </div>
                    <div className="card-body">
                      <div className="mb-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={banner.name}
                          onChange={(e) => {
                            setBanners(prevBanners =>
                              prevBanners.map(b =>
                                b.id === banner.id ? { ...b, name: e.target.value } : b
                              )
                            )
                          }}
                          onBlur={() => updateBannerName(banner.id, banner.name)}
                          placeholder="バナー名を入力"
                        />
                      </div>
                      <p className="card-text small text-muted">
                        作成日: {new Date(banner.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                      <div className="mb-2">
                        <label className="form-label small">使用場所:</label>
                        <select
                          className="form-select form-select-sm"
                          value={banner.currentUsage || 'none'}
                          onChange={(e) => updateBannerUsage(banner.id, e.target.value)}
                        >
                          {USAGE_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="d-grid gap-1 mt-3">
                        <a
                          href={banner.url}
                          download={`${banner.name || 'banner'}-${banner.id}.png`}
                          className="btn btn-sm btn-primary"
                        >
                          ダウンロード
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(banner.url)
                            toast.success('URLをコピーしました')
                          }}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          URLコピー
                        </button>
                        <button
                          onClick={() => deleteBanner(banner.id)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}