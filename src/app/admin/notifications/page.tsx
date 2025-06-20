'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'react-hot-toast'
import { BellIcon, PaperAirplaneIcon, UserGroupIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface PushNotification {
  id: string
  title: string
  body: string
  target_type: 'all' | 'specific' | 'segment'
  target_users?: string[]
  target_segment?: string
  scheduled_at?: string
  sent_at?: string
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  click_count: number
  delivery_count: number
  created_at: string
  updated_at: string
}

interface NotificationSettings {
  id: string
  vapid_public_key: string
  vapid_private_key: string
  default_icon: string
  default_badge: string
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export default function NotificationsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [notifications, setNotifications] = useState<PushNotification[]>([])
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications')
  const [showModal, setShowModal] = useState(false)
  const [editingNotification, setEditingNotification] = useState<PushNotification | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    target_type: 'all' as const,
    target_users: [] as string[],
    target_segment: '',
    scheduled_at: ''
  })
  const [settingsForm, setSettingsForm] = useState({
    vapid_public_key: '',
    vapid_private_key: '',
    default_icon: '/icon-192x192.png',
    default_badge: '/badge-72x72.png',
    is_enabled: true
  })
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    fetchNotifications()
    fetchSettings()
    fetchUsers()
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('push_notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('通知の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setSettings(data)
        setSettingsForm({
          vapid_public_key: data.vapid_public_key || '',
          vapid_private_key: data.vapid_private_key || '',
          default_icon: data.default_icon || '/icon-192x192.png',
          default_badge: data.default_badge || '/badge-72x72.png',
          is_enabled: data.is_enabled ?? true
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username')
        .limit(100)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const notificationData = {
        ...formData,
        status: formData.scheduled_at ? 'scheduled' : 'draft',
        click_count: 0,
        delivery_count: 0,
        updated_at: new Date().toISOString()
      }

      if (editingNotification) {
        const { error } = await supabase
          .from('push_notifications')
          .update(notificationData)
          .eq('id', editingNotification.id)

        if (error) throw error
        toast.success('通知を更新しました')
      } else {
        const { error } = await supabase
          .from('push_notifications')
          .insert([{
            ...notificationData,
            created_at: new Date().toISOString()
          }])

        if (error) throw error
        toast.success('通知を作成しました')
      }

      setShowModal(false)
      setEditingNotification(null)
      resetForm()
      fetchNotifications()
    } catch (error) {
      console.error('Error saving notification:', error)
      toast.error('保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const settingsData = {
        ...settingsForm,
        updated_at: new Date().toISOString()
      }

      if (settings) {
        const { error } = await supabase
          .from('notification_settings')
          .update(settingsData)
          .eq('id', settings.id)

        if (error) throw error
        toast.success('設定を更新しました')
      } else {
        const { error } = await supabase
          .from('notification_settings')
          .insert([{
            ...settingsData,
            created_at: new Date().toISOString()
          }])

        if (error) throw error
        toast.success('設定を作成しました')
      }

      fetchSettings()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('設定の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const sendNotification = async (notification: PushNotification) => {
    if (!confirm('この通知を送信しますか？')) return

    try {
      setLoading(true)

      // Call API to send push notification
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: notification.id,
          title: notification.title,
          body: notification.body,
          target_type: notification.target_type,
          target_users: notification.target_users,
          target_segment: notification.target_segment
        }),
      })

      if (!response.ok) throw new Error('送信に失敗しました')

      const result = await response.json()

      // Update notification status
      const { error } = await supabase
        .from('push_notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          delivery_count: result.delivery_count || 0
        })
        .eq('id', notification.id)

      if (error) throw error

      toast.success(`通知を送信しました (${result.delivery_count || 0}件配信)`)
      fetchNotifications()
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const testNotification = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast.error('このブラウザはプッシュ通知をサポートしていません')
        return
      }

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('通知の許可が必要です')
        return
      }

      // Send test notification
      new Notification('ACEorIPA テスト通知', {
        body: 'プッシュ通知の設定が正常です',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
      })

      toast.success('テスト通知を送信しました')
    } catch (error) {
      console.error('Error testing notification:', error)
      toast.error('テスト通知の送信に失敗しました')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      target_type: 'all',
      target_users: [],
      target_segment: '',
      scheduled_at: ''
    })
  }

  const openEditModal = (notification: PushNotification) => {
    setEditingNotification(notification)
    setFormData({
      title: notification.title,
      body: notification.body,
      target_type: notification.target_type,
      target_users: notification.target_users || [],
      target_segment: notification.target_segment || '',
      scheduled_at: notification.scheduled_at ? notification.scheduled_at.split('T')[0] : ''
    })
    setShowModal(true)
  }

  const getStatusLabel = (status: string) => {
    const statuses = {
      draft: '下書き',
      scheduled: '予約中',
      sent: '送信済み',
      failed: '失敗'
    }
    return statuses[status as keyof typeof statuses] || status
  }

  const getTargetTypeLabel = (type: string) => {
    const types = {
      all: '全ユーザー',
      specific: '指定ユーザー',
      segment: 'セグメント'
    }
    return types[type as keyof typeof types] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">プッシュ通知管理</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'notifications' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            通知管理
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'settings' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            設定
          </button>
        </div>
      </div>

      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <BellIcon className="h-5 w-5" />
                新規作成
              </button>
              <button
                onClick={testNotification}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircleIcon className="h-5 w-5" />
                テスト通知
              </button>
            </div>
          </div>

          {/* 通知一覧 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {loading ? (
                <div className="text-center py-4">読み込み中...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  通知がまだありません
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          タイトル
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          対象
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ステータス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          配信数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          クリック数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          作成日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {notifications.map((notification) => (
                        <tr key={notification.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {notification.body.substring(0, 50)}...
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getTargetTypeLabel(notification.target_type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              notification.status === 'sent' ? 'bg-green-100 text-green-800' :
                              notification.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              notification.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {getStatusLabel(notification.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {notification.delivery_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {notification.click_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(notification.created_at).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditModal(notification)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                編集
                              </button>
                              {notification.status === 'draft' && (
                                <button
                                  onClick={() => sendNotification(notification)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  送信
                                </button>
                              )}
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
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">プッシュ通知設定</h2>
            
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VAPID公開キー
                </label>
                <input
                  type="text"
                  value={settingsForm.vapid_public_key}
                  onChange={(e) => setSettingsForm({ ...settingsForm, vapid_public_key: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VAPID公開キーを入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VAPID秘密キー
                </label>
                <input
                  type="password"
                  value={settingsForm.vapid_private_key}
                  onChange={(e) => setSettingsForm({ ...settingsForm, vapid_private_key: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VAPID秘密キーを入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  デフォルトアイコン
                </label>
                <input
                  type="text"
                  value={settingsForm.default_icon}
                  onChange={(e) => setSettingsForm({ ...settingsForm, default_icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/icon-192x192.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  デフォルトバッジ
                </label>
                <input
                  type="text"
                  value={settingsForm.default_badge}
                  onChange={(e) => setSettingsForm({ ...settingsForm, default_badge: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/badge-72x72.png"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_enabled"
                  checked={settingsForm.is_enabled}
                  onChange={(e) => setSettingsForm({ ...settingsForm, is_enabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_enabled" className="ml-2 block text-sm text-gray-900">
                  プッシュ通知を有効にする
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '保存中...' : '設定を保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 通知作成モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingNotification ? '通知編集' : '通知作成'}
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
                  メッセージ
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  送信対象
                </label>
                <select
                  value={formData.target_type}
                  onChange={(e) => setFormData({ ...formData, target_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全ユーザー</option>
                  <option value="specific">指定ユーザー</option>
                  <option value="segment">セグメント</option>
                </select>
              </div>

              {formData.target_type === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    対象ユーザー
                  </label>
                  <select
                    multiple
                    value={formData.target_users}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      target_users: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    size={5}
                  >
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username || user.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  送信予約日時（任意）
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingNotification(null)
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