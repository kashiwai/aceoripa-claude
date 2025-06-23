'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

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
  createdAt?: string
  updatedAt?: string
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [newBanner, setNewBanner] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    linkType: 'gacha',
    priority: 1,
    isActive: true,
    backgroundColor: 'from-blue-500 to-purple-600',
    textColor: 'text-white'
  })

  const backgroundOptions = [
    { value: 'from-blue-500 to-purple-600', label: 'ブルー→パープル' },
    { value: 'from-red-500 to-pink-600', label: 'レッド→ピンク' },
    { value: 'from-yellow-400 to-orange-500', label: 'イエロー→オレンジ' },
    { value: 'from-green-500 to-blue-500', label: 'グリーン→ブルー' },
    { value: 'from-purple-500 to-pink-500', label: 'パープル→ピンク' },
    { value: 'from-indigo-500 to-purple-600', label: 'インディゴ→パープル' }
  ]

  const textColorOptions = [
    { value: 'text-white', label: '白' },
    { value: 'text-black', label: '黒' },
    { value: 'text-yellow-300', label: 'イエロー' }
  ]

  const linkTypeOptions = [
    { value: 'gacha', label: 'ガチャページ' },
    { value: 'campaign', label: 'キャンペーンページ' },
    { value: 'external', label: '外部リンク' }
  ]

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners')
      if (response.ok) {
        const data = await response.json()
        setBanners(data.banners || [])
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBanner = async () => {
    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanner)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          await fetchBanners()
          setShowCreateModal(false)
          setNewBanner({
            title: '',
            subtitle: '',
            description: '',
            imageUrl: '',
            linkUrl: '',
            linkType: 'gacha',
            priority: 1,
            isActive: true,
            backgroundColor: 'from-blue-500 to-purple-600',
            textColor: 'text-white'
          })
        }
      }
    } catch (error) {
      console.error('Error creating banner:', error)
    }
  }

  const handleToggleActive = async (bannerId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/banners/${bannerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        await fetchBanners()
      }
    } catch (error) {
      console.error('Error updating banner:', error)
    }
  }

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('このバナーを削除しますか？')) return

    try {
      const response = await fetch(`/api/banners/${bannerId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchBanners()
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="row mb-4">
        <div className="col d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2 mb-1">バナー管理</h1>
            <p className="text-muted">TOPページのバナーカルーセルを管理できます</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <i className="bi bi-plus-circle me-2"></i>新しいバナーを作成
          </button>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">総バナー数</h5>
              <h2 className="text-primary">{banners.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">アクティブ</h5>
              <h2 className="text-success">{banners.filter(b => b.isActive).length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">非アクティブ</h5>
              <h2 className="text-warning">{banners.filter(b => !b.isActive).length}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* バナー一覧 */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">バナー一覧</h5>
        </div>
        <div className="card-body">
          {banners.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-image display-1 text-muted"></i>
              <h5 className="mt-3">バナーがありません</h5>
              <p className="text-muted">最初のバナーを作成してください</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>優先度</th>
                    <th>プレビュー</th>
                    <th>タイトル</th>
                    <th>リンク先</th>
                    <th>ステータス</th>
                    <th>作成日</th>
                    <th>アクション</th>
                  </tr>
                </thead>
                <tbody>
                  {banners
                    .sort((a, b) => a.priority - b.priority)
                    .map((banner) => (
                    <tr key={banner.id}>
                      <td>
                        <span className="badge bg-secondary">{banner.priority}</span>
                      </td>
                      <td>
                        <div className="position-relative" style={{ width: '80px', height: '45px' }}>
                          <Image
                            src={banner.imageUrl}
                            alt={banner.title}
                            fill
                            className="rounded object-cover"
                            unoptimized
                          />
                        </div>
                      </td>
                      <td>
                        <div>
                          <h6 className="mb-1">{banner.title}</h6>
                          <small className="text-muted">{banner.subtitle}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          banner.linkType === 'gacha' ? 'bg-primary' :
                          banner.linkType === 'campaign' ? 'bg-success' :
                          'bg-info'
                        }`}>
                          {banner.linkType}
                        </span>
                        <br />
                        <small className="text-muted">{banner.linkUrl}</small>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleActive(banner.id, banner.isActive)}
                          className={`btn btn-sm ${banner.isActive ? 'btn-success' : 'btn-outline-secondary'}`}
                        >
                          {banner.isActive ? 'アクティブ' : '非アクティブ'}
                        </button>
                      </td>
                      <td>
                        <small className="text-muted">
                          {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString('ja-JP') : '-'}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            onClick={() => setEditingBanner(banner)}
                            className="btn btn-outline-primary"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="btn btn-outline-danger"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 作成モーダル */}
      {showCreateModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">新しいバナーを作成</h5>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="btn-close"
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">タイトル *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newBanner.title}
                        onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                        placeholder="バナーのタイトル"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">サブタイトル *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newBanner.subtitle}
                        onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                        placeholder="サブタイトル"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">説明文</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={newBanner.description}
                      onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                      placeholder="バナーの説明文（省略可）"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">画像URL *</label>
                    <input
                      type="url"
                      className="form-control"
                      value={newBanner.imageUrl}
                      onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">リンク先URL *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newBanner.linkUrl}
                        onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                        placeholder="/gacha/1 または https://example.com"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">リンクタイプ</label>
                      <select
                        className="form-select"
                        value={newBanner.linkType}
                        onChange={(e) => setNewBanner({ ...newBanner, linkType: e.target.value as any })}
                      >
                        {linkTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label">優先度</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max="100"
                        value={newBanner.priority}
                        onChange={(e) => setNewBanner({ ...newBanner, priority: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">背景色</label>
                      <select
                        className="form-select"
                        value={newBanner.backgroundColor}
                        onChange={(e) => setNewBanner({ ...newBanner, backgroundColor: e.target.value })}
                      >
                        {backgroundOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">文字色</label>
                      <select
                        className="form-select"
                        value={newBanner.textColor}
                        onChange={(e) => setNewBanner({ ...newBanner, textColor: e.target.value })}
                      >
                        {textColorOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={newBanner.isActive}
                        onChange={(e) => setNewBanner({ ...newBanner, isActive: e.target.checked })}
                      />
                      <label className="form-check-label">
                        すぐにアクティブにする
                      </label>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  キャンセル
                </button>
                <button 
                  onClick={handleCreateBanner}
                  className="btn btn-primary"
                  disabled={!newBanner.title || !newBanner.subtitle || !newBanner.imageUrl || !newBanner.linkUrl}
                >
                  バナーを作成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}