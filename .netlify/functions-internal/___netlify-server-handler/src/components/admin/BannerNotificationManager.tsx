'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface NotificationCampaign {
  id: number
  title: string
  message: string
  image_url?: string
  target_url?: string
  notification_type: 'campaign' | 'maintenance' | 'gacha' | 'general'
  priority: 'low' | 'medium' | 'high'
  scheduled_at?: string
  sent_at?: string
  is_sent: boolean
}

export function BannerNotificationManager() {
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    message: '',
    image_url: '',
    target_url: '',
    notification_type: 'campaign' as const,
    priority: 'medium' as const,
    scheduled_at: ''
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/notifications/campaigns')
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    }
  }

  const createCampaign = async () => {
    if (!newCampaign.title || !newCampaign.message) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/notifications/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign)
      })

      if (response.ok) {
        setNewCampaign({
          title: '',
          message: '',
          image_url: '',
          target_url: '',
          notification_type: 'campaign',
          priority: 'medium',
          scheduled_at: ''
        })
        fetchCampaigns()
      }
    } catch (error) {
      console.error('Failed to create campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendCampaign = async (campaign: NotificationCampaign) => {
    setSending(true)
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: campaign.title,
          message: campaign.message,
          icon: campaign.image_url,
          url: campaign.target_url,
          sendToAll: true
        })
      })

      if (response.ok) {
        // Mark campaign as sent
        await fetch(`/api/admin/notifications/campaigns/${campaign.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_sent: true, sent_at: new Date().toISOString() })
        })
        fetchCampaigns()
      }
    } catch (error) {
      console.error('Failed to send campaign:', error)
    } finally {
      setSending(false)
    }
  }

  const sendTestNotification = async () => {
    setSending(true)
    try {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'テスト通知',
          message: 'プッシュ通知システムのテストです！',
          icon: '/icon-192x192.png',
          url: '/',
          sendToAll: true
        })
      })
    } catch (error) {
      console.error('Failed to send test notification:', error)
    } finally {
      setSending(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'campaign': return 'bg-yellow-100 text-yellow-800'
      case 'maintenance': return 'bg-red-100 text-red-800'
      case 'gacha': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🔔 バナー通知管理</h1>
        <button
          onClick={sendTestNotification}
          disabled={sending}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
        >
          {sending ? '送信中...' : 'テスト通知送信'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 新規キャンペーン作成 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">新規通知作成</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
              <input
                type="text"
                value={newCampaign.title}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="通知のタイトル"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">メッセージ</label>
              <textarea
                value={newCampaign.message}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="通知の本文"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">種類</label>
                <select
                  value={newCampaign.notification_type}
                  onChange={(e) => setNewCampaign(prev => ({ 
                    ...prev, 
                    notification_type: e.target.value as any 
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="campaign">キャンペーン</option>
                  <option value="gacha">ガチャ</option>
                  <option value="maintenance">メンテナンス</option>
                  <option value="general">一般</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">優先度</label>
                <select
                  value={newCampaign.priority}
                  onChange={(e) => setNewCampaign(prev => ({ 
                    ...prev, 
                    priority: e.target.value as any 
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">画像URL（任意）</label>
              <input
                type="url"
                value={newCampaign.image_url}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, image_url: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">リンクURL（任意）</label>
              <input
                type="url"
                value={newCampaign.target_url}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, target_url: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="/gacha/1"
              />
            </div>

            <button
              onClick={createCampaign}
              disabled={loading || !newCampaign.title || !newCampaign.message}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition"
            >
              {loading ? '作成中...' : '通知キャンペーンを作成'}
            </button>
          </div>
        </motion.div>

        {/* キャンペーン一覧 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">通知履歴</h2>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {campaigns.length === 0 ? (
              <p className="text-gray-500 text-center py-8">まだ通知キャンペーンがありません</p>
            ) : (
              campaigns.map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{campaign.title}</h3>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(campaign.notification_type)}`}>
                        {campaign.notification_type}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(campaign.priority)}`}>
                        {campaign.priority}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{campaign.message}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {campaign.is_sent ? (
                        <span className="text-green-600">✓ 送信済み</span>
                      ) : (
                        <span className="text-gray-500">未送信</span>
                      )}
                    </div>
                    
                    {!campaign.is_sent && (
                      <button
                        onClick={() => sendCampaign(campaign)}
                        disabled={sending}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm px-3 py-1 rounded transition"
                      >
                        {sending ? '送信中...' : '送信'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}