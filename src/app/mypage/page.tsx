'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'

interface UserInfo {
  id: string
  name: string
  email: string
  avatar?: string
  points: number
  level: number
  totalSpent: number
  joinDate: string
}

interface GachaHistory {
  id: string
  gachaName: string
  date: string
  count: number
  amount: number
  results: {
    id: string
    name: string
    rarity: string
    imageUrl: string
  }[]
}

function SettingsTab() {
  const {
    permission,
    subscription,
    isSupported,
    isLoading,
    requestPermission,
    unsubscribe,
    sendTestNotification
  } = useNotificationPermission()

  const [settings, setSettings] = useState({
    notifications: true,
    gachaAlerts: true,
    campaignAlerts: true,
    maintenanceAlerts: true,
    soundEnabled: true,
    vibrationEnabled: true
  })

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted': return { text: '許可済み', color: 'text-green-600', bg: 'bg-green-100' }
      case 'denied': return { text: '拒否済み', color: 'text-red-600', bg: 'bg-red-100' }
      default: return { text: '未設定', color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  const status = getPermissionStatus()

  return (
    <div className="p-6">
      <h3 className="text-3xl font-black text-white mb-6">設定</h3>
      
      {/* プッシュ通知設定 */}
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h4 className="text-xl font-bold text-white mb-4">🔔 プッシュ通知</h4>
          
          {!isSupported ? (
            <div className="text-center py-4">
              <p className="text-gray-400">お使いのブラウザはプッシュ通知に対応していません</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">通知の許可状況</p>
                  <p className="text-sm text-gray-400">ブラウザの通知許可設定</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                  {status.text}
                </span>
              </div>

              {permission !== 'granted' && (
                <button
                  onClick={requestPermission}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] hover:scale-105 disabled:scale-100 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition transform"
                >
                  {isLoading ? '設定中...' : '通知を許可する'}
                </button>
              )}

              {permission === 'granted' && subscription && (
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <button
                      onClick={sendTestNotification}
                      className="flex-1 bg-gradient-to-r from-[#00C853] to-[#00E676] hover:scale-105 text-white font-bold py-2 px-4 rounded-lg transition transform"
                    >
                      テスト通知
                    </button>
                    <button
                      onClick={unsubscribe}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:scale-105 text-white font-bold py-2 px-4 rounded-lg transition transform"
                    >
                      通知を停止
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 通知の種類設定 */}
        {permission === 'granted' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h4 className="text-xl font-bold text-white mb-4">📢 通知の種類</h4>
            <div className="space-y-4">
              {[
                { key: 'gachaAlerts', label: '新ガチャ情報', desc: '新しいガチャの登場をお知らせ' },
                { key: 'campaignAlerts', label: 'キャンペーン情報', desc: 'お得なキャンペーンをお知らせ' },
                { key: 'maintenanceAlerts', label: 'メンテナンス情報', desc: 'サーバーメンテナンスをお知らせ' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleSetting(item.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      settings[item.key as keyof typeof settings] ? 'bg-[#FF0033]' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* その他の設定 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h4 className="text-xl font-bold text-white mb-4">⚙️ その他</h4>
          <div className="space-y-4">
            {[
              { key: 'soundEnabled', label: 'サウンド効果', desc: 'ガチャやボタンのサウンド' },
              { key: 'vibrationEnabled', label: 'バイブレーション', desc: '通知時の振動（モバイル）' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggleSetting(item.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    settings[item.key as keyof typeof settings] ? 'bg-[#FF0033]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* アカウント管理 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h4 className="text-xl font-bold text-white mb-4">👤 アカウント</h4>
          <div className="space-y-3">
            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg p-4 transition">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">プロフィール編集</span>
                <span className="text-gray-400">→</span>
              </div>
            </button>
            <button className="w-full text-left bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg p-4 transition">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">パスワード変更</span>
                <span className="text-gray-400">→</span>
              </div>
            </button>
            <button className="w-full text-left bg-red-900/50 hover:bg-red-900/70 border border-red-800 rounded-lg p-4 transition text-red-400">
              <div className="flex items-center justify-between">
                <span className="font-medium">ログアウト</span>
                <span className="text-red-400">→</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MyPage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [gachaHistory, setGachaHistory] = useState<GachaHistory[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'collection' | 'settings'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // ダミーデータ（より充実したデータ）
      setUser({
        id: '1',
        name: 'ガチャマスター',
        email: 'user@example.com',
        avatar: '/api/placeholder/200/200',
        points: 15000,
        level: 25,
        totalSpent: 50000,
        joinDate: '2024-01-15'
      })

      setGachaHistory([
        {
          id: '1',
          gachaName: 'ポケモンカード151ガチャ',
          date: '2024-06-20',
          count: 10,
          amount: 8000,
          results: [
            { id: '1', name: 'リザードンex', rarity: 'SSR', imageUrl: '/api/placeholder/200/200?text=リザードンex' },
            { id: '2', name: 'ピカチュウ', rarity: 'SR', imageUrl: '/api/placeholder/200/200?text=ピカチュウ' },
            { id: '3', name: 'フシギバナ', rarity: 'R', imageUrl: '/api/placeholder/200/200?text=フシギバナ' },
            { id: '4', name: 'カメックス', rarity: 'R', imageUrl: '/api/placeholder/200/200?text=カメックス' },
            { id: '5', name: 'フシギダネ', rarity: 'N', imageUrl: '/api/placeholder/200/200?text=フシギダネ' },
          ]
        },
        {
          id: '2',
          gachaName: 'シャイニートレジャー',
          date: '2024-06-19',
          count: 5,
          amount: 6000,
          results: [
            { id: '6', name: 'ミュウex', rarity: 'SSR', imageUrl: '/api/placeholder/200/200?text=ミュウex' },
            { id: '7', name: 'イーブイ', rarity: 'SR', imageUrl: '/api/placeholder/200/200?text=イーブイ' },
          ]
        },
        {
          id: '3',
          gachaName: 'ポケモンカード151ガチャ',
          date: '2024-06-18',
          count: 1,
          amount: 800,
          results: [
            { id: '8', name: 'コイキング', rarity: 'N', imageUrl: '/api/placeholder/200/200?text=コイキング' },
          ]
        }
      ])
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white'
      case 'SR': return 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
      case 'R': return 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#1a1a1a] z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 border-8 border-[#FF0033] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl font-bold text-[#FF0033]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* ヘッダー（DOPAスタイル） */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-[#FF0033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="text-[#FF0033] hover:text-[#FF6B6B] transition">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="ml-4 text-3xl font-black text-[#FF0033]">マイページ</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">総ポイント</span>
              <span className="text-2xl font-black text-[#FF0033]">
                {user?.points?.toLocaleString() || '0'}P
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-800">
              {/* ユーザー情報 */}
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Image
                    src={user?.avatar || '/api/placeholder/200/200'}
                    alt="Avatar"
                    fill
                    className="rounded-full object-cover border-4 border-[#FF0033]"
                    unoptimized
                  />
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white text-xs px-2 py-1 rounded-full font-bold">
                    Lv.{user?.level}
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-gray-400">{user?.email}</p>
              </div>

              {/* ポイント情報 */}
              <div className="bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] rounded-xl p-4 mb-6 text-white shadow-lg">
                <div className="text-center">
                  <p className="text-sm opacity-90">所持ポイント</p>
                  <p className="text-3xl font-black">{user?.points?.toLocaleString()}P</p>
                  <button className="mt-3 bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-lg transition w-full">
                    ポイント購入
                  </button>
                </div>
              </div>

              {/* ランク情報 */}
              <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">ランク</span>
                    <span className="text-sm font-bold text-[#FFD700]">ゴールド</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] h-2 rounded-full" style={{width: '65%'}}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">次のランクまで: 3,500P</p>
                </div>
              </div>

              {/* ナビゲーション */}
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: '概要', icon: '📊' },
                  { id: 'history', label: 'ガチャ履歴', icon: '📜' },
                  { id: 'collection', label: 'コレクション', icon: '🎴' },
                  { id: 'settings', label: '設定', icon: '⚙️' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition font-bold ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800">
              {/* 概要タブ */}
              {activeTab === 'overview' && (
                <div className="p-6">
                  <h3 className="text-3xl font-black text-white mb-6">アカウント概要</h3>
                  
                  {/* 統計情報 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-[#00C853] to-[#00E676] rounded-xl p-6 text-white shadow-lg hover:scale-105 transform transition"
                    >
                      <div className="text-center">
                        <div className="text-4xl font-black">¥{user?.totalSpent?.toLocaleString()}</div>
                        <div className="text-sm opacity-90 font-bold">総利用額</div>
                      </div>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg hover:scale-105 transform transition"
                    >
                      <div className="text-center">
                        <div className="text-4xl font-black">{gachaHistory.length}</div>
                        <div className="text-sm opacity-90 font-bold">ガチャ実行回数</div>
                      </div>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl p-6 text-white shadow-lg hover:scale-105 transform transition"
                    >
                      <div className="text-center">
                        <div className="text-4xl font-black">{gachaHistory.reduce((sum, h) => sum + h.results.length, 0)}</div>
                        <div className="text-sm opacity-90 font-bold">獲得カード数</div>
                      </div>
                    </motion.div>
                  </div>

                  {/* 最近の活動 */}
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4">最近の活動</h4>
                    <div className="space-y-4">
                      {gachaHistory.slice(0, 3).map((history, index) => {
                        const ssrCount = history.results.filter(r => r.rarity === 'SSR').length
                        const srCount = history.results.filter(r => r.rarity === 'SR').length
                        
                        return (
                          <motion.div 
                            key={history.id} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-[#FF0033] transition"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <h5 className="font-bold text-white">{history.gachaName}</h5>
                                <p className="text-gray-400">{history.count}回 - ¥{history.amount.toLocaleString()}</p>
                              </div>
                              <div className="text-sm text-gray-500">{history.date}</div>
                            </div>
                            {/* 獲得レアリティ表示 */}
                            <div className="flex gap-2 mt-2">
                              {ssrCount > 0 && (
                                <span className="text-xs px-2 py-1 bg-gradient-to-r from-yellow-400 to-red-500 text-white rounded-full font-bold">
                                  SSR×{ssrCount}
                                </span>
                              )}
                              {srCount > 0 && (
                                <span className="text-xs px-2 py-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full font-bold">
                                  SR×{srCount}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* おすすめガチャ */}
                  <div className="mt-8">
                    <h4 className="text-xl font-bold text-white mb-4">おすすめガチャ</h4>
                    <div className="bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] rounded-xl p-6 text-white">
                      <h5 className="text-2xl font-black mb-2">ポケモンカード151</h5>
                      <p className="text-sm mb-4 opacity-90">リザードンex確率UPキャンペーン中！</p>
                      <Link href="/gacha/1" className="inline-block bg-white text-[#FF0033] font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition">
                        今すぐ引く！
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* ガチャ履歴タブ */}
              {activeTab === 'history' && (
                <div className="p-6">
                  <h3 className="text-3xl font-black text-white mb-6">ガチャ履歴</h3>
                  
                  <div className="space-y-6">
                    {gachaHistory.map((history, index) => (
                      <motion.div
                        key={history.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-800 border border-gray-700 rounded-xl p-6"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-white">{history.gachaName}</h4>
                            <p className="text-gray-400">{history.count}回実行 - ¥{history.amount.toLocaleString()}</p>
                          </div>
                          <div className="text-sm text-gray-500">{history.date}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {history.results.map((card) => (
                            <div key={card.id} className="relative group">
                              <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden hover:ring-2 hover:ring-[#FF0033] transition">
                                <Image
                                  src={card.imageUrl}
                                  alt={card.name}
                                  width={200}
                                  height={200}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  unoptimized
                                />
                              </div>
                              <div className={`absolute top-1 right-1 px-2 py-1 rounded text-xs font-bold ${getRarityColor(card.rarity)}`}>
                                {card.rarity}
                              </div>
                              <p className="text-sm text-gray-300 mt-1 truncate">{card.name}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* コレクションタブ */}
              {activeTab === 'collection' && (
                <div className="p-6">
                  <h3 className="text-3xl font-black text-white mb-6">コレクション</h3>
                  
                  {/* コレクション統計 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
                      <p className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">5</p>
                      <p className="text-sm text-gray-400">SSR</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
                      <p className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">12</p>
                      <p className="text-sm text-gray-400">SR</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
                      <p className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">28</p>
                      <p className="text-sm text-gray-400">R</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
                      <p className="text-3xl font-black text-gray-400">45</p>
                      <p className="text-sm text-gray-400">N</p>
                    </div>
                  </div>

                  <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
                    <div className="text-6xl mb-4 animate-bounce">🎴</div>
                    <p className="text-gray-400 text-xl font-bold">カード一覧表示機能は準備中です</p>
                    <p className="text-gray-500 mt-2">まもなく公開予定！</p>
                  </div>
                </div>
              )}

              {/* 設定タブ */}
              {activeTab === 'settings' && (
                <SettingsTab />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}