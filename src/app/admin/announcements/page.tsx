'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'

interface Announcement {
  id: string
  title: string
  content: string
  type: 'news' | 'maintenance' | 'campaign' | 'important'
  status: 'draft' | 'published' | 'archived'
  publish_date: string
  end_date?: string
  priority: number
  push_notification: boolean
  show_popup: boolean
  popup_delay_seconds: number
  cta_text?: string
  cta_url?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export default function AnnouncementsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'news' as const,
    status: 'draft' as const,
    publish_date: '',
    end_date: '',
    priority: 1,
    push_notification: false,
    show_popup: true,
    popup_delay_seconds: 0,
    cta_text: '',
    cta_url: '',
    image_url: ''
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast.error('お知らせの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update({
            ...formData,
            is_active: (formData.status as string) === 'published',
            start_date: formData.publish_date,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAnnouncement.id)

        if (error) throw error
        toast.success('お知らせを更新しました')
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([{
            ...formData,
            is_active: (formData.status as string) === 'published',
            start_date: formData.publish_date,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (error) throw error
        toast.success('お知らせを作成しました')
      }

      setShowModal(false)
      setEditingAnnouncement(null)
      resetForm()
      fetchAnnouncements()
    } catch (error) {
      console.error('Error saving announcement:', error)
      toast.error('保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このお知らせを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('お知らせを削除しました')
      fetchAnnouncements()
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('削除に失敗しました')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'news',
      status: 'draft',
      publish_date: '',
      end_date: '',
      priority: 1,
      push_notification: false,
      show_popup: true,
      popup_delay_seconds: 0,
      cta_text: '',
      cta_url: '',
      image_url: ''
    })
  }

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type as 'news',
      status: announcement.status as 'draft',
      publish_date: announcement.publish_date.split('T')[0],
      end_date: announcement.end_date ? announcement.end_date.split('T')[0] : '',
      priority: announcement.priority,
      push_notification: announcement.push_notification,
      show_popup: announcement.show_popup ?? true,
      popup_delay_seconds: announcement.popup_delay_seconds ?? 0,
      cta_text: announcement.cta_text || '',
      cta_url: announcement.cta_url || '',
      image_url: announcement.image_url || ''
    })
    setShowModal(true)
  }

  const getTypeLabel = (type: string) => {
    const types = {
      news: 'ニュース',
      maintenance: 'メンテナンス',
      campaign: 'キャンペーン',
      important: '重要'
    }
    return types[type as keyof typeof types] || type
  }

  const getStatusLabel = (status: string) => {
    const statuses = {
      draft: '下書き',
      published: '公開中',
      archived: 'アーカイブ'
    }
    return statuses[status as keyof typeof statuses] || status
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">お知らせ管理</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          ➕ 新規作成
        </button>
      </div>

      {/* お知らせ一覧 */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2">読み込み中...</div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-5">
              <span style={{fontSize: '3rem'}}>📢</span>
              <h4 className="mt-3">お知らせがまだありません</h4>
              <p className="text-muted">新しいお知らせを作成してください</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>タイトル</th>
                    <th>種類</th>
                    <th>ステータス</th>
                    <th>公開日</th>
                    <th>優先度</th>
                    <th>プッシュ通知</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((announcement) => (
                    <tr key={announcement.id}>
                      <td>
                        <div className="fw-medium">
                          {announcement.title}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          announcement.type === 'important' ? 'bg-danger' :
                          announcement.type === 'campaign' ? 'bg-success' :
                          announcement.type === 'maintenance' ? 'bg-warning' :
                          'bg-primary'
                        }`}>
                          {getTypeLabel(announcement.type)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          announcement.status === 'published' ? 'bg-success' :
                          announcement.status === 'archived' ? 'bg-secondary' :
                          'bg-warning'
                        }`}>
                          {getStatusLabel(announcement.status)}
                        </span>
                      </td>
                      <td>
                        {new Date(announcement.publish_date).toLocaleDateString('ja-JP')}
                      </td>
                      <td>
                        <span className="badge bg-info">{announcement.priority}</span>
                      </td>
                      <td>
                        {announcement.push_notification ? '✅' : '❌'}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => openEditModal(announcement)}
                            className="btn btn-outline-primary"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(announcement.id)}
                            className="btn btn-outline-danger"
                          >
                            🗑️
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

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingAnnouncement ? 'お知らせ編集' : 'お知らせ作成'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  内容
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  種類
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="news">ニュース</option>
                  <option value="maintenance">メンテナンス</option>
                  <option value="campaign">キャンペーン</option>
                  <option value="important">重要</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">下書き</option>
                  <option value="published">公開</option>
                  <option value="archived">アーカイブ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  公開日
                </label>
                <input
                  type="date"
                  value={formData.publish_date}
                  onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  終了日（任意）
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  優先度（1-10）
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="push_notification"
                  checked={formData.push_notification}
                  onChange={(e) => setFormData({ ...formData, push_notification: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="push_notification" className="ml-2 block text-sm text-gray-900">
                  プッシュ通知を送信
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show_popup"
                  checked={formData.show_popup}
                  onChange={(e) => setFormData({ ...formData, show_popup: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="show_popup" className="ml-2 block text-sm text-gray-900">
                  ポップアップで表示
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ポップアップ表示遅延（秒）
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.popup_delay_seconds}
                  onChange={(e) => setFormData({ ...formData, popup_delay_seconds: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  画像URL（任意）
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTAボタンテキスト（任意）
                </label>
                <input
                  type="text"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="詳細を見る"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTAリンク先URL（任意）
                </label>
                <input
                  type="text"
                  value={formData.cta_url}
                  onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/gacha/1"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingAnnouncement(null)
                    resetForm()
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}