'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

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
      // ダミーデータ
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
          amount: 3000,
          results: [
            { id: '1', name: 'リザードンex', rarity: 'SSR', imageUrl: '/api/placeholder/200/200' },
            { id: '2', name: 'ピカチュウ', rarity: 'SR', imageUrl: '/api/placeholder/200/200' },
          ]
        },
        {
          id: '2',
          gachaName: 'ワンピースカード頂上決戦',
          date: '2024-06-19',
          count: 5,
          amount: 2500,
          results: [
            { id: '3', name: 'ルフィ リーダーパラレル', rarity: 'SSR', imageUrl: '/api/placeholder/200/200' },
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
      case 'SSR': return 'text-red-500 bg-red-100'
      case 'SR': return 'text-purple-500 bg-purple-100'
      case 'R': return 'text-blue-500 bg-blue-100'
      default: return 'text-gray-500 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-blue-600 hover:text-blue-800 mr-4">
                ← トップに戻る
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* ユーザー情報 */}
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Image
                    src={user?.avatar || '/api/placeholder/200/200'}
                    alt="Avatar"
                    fill
                    className="rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    Lv.{user?.level}
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>

              {/* ポイント情報 */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 mb-6 text-white">
                <div className="text-center">
                  <p className="text-sm opacity-90">所持ポイント</p>
                  <p className="text-2xl font-bold">{user?.points?.toLocaleString()}pt</p>
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
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
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
            <div className="bg-white rounded-lg shadow-md">
              {/* 概要タブ */}
              {activeTab === 'overview' && (
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">アカウント概要</h3>
                  
                  {/* 統計情報 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white">
                      <div className="text-center">
                        <div className="text-3xl font-bold">¥{user?.totalSpent?.toLocaleString()}</div>
                        <div className="text-sm opacity-90">総利用額</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-6 text-white">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{gachaHistory.length}</div>
                        <div className="text-sm opacity-90">ガチャ実行回数</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg p-6 text-white">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{gachaHistory.reduce((sum, h) => sum + h.results.length, 0)}</div>
                        <div className="text-sm opacity-90">獲得カード数</div>
                      </div>
                    </div>
                  </div>

                  {/* 最近の活動 */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">最近の活動</h4>
                    <div className="space-y-4">
                      {gachaHistory.slice(0, 3).map((history) => (
                        <div key={history.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="font-semibold text-gray-900">{history.gachaName}</h5>
                              <p className="text-gray-600">{history.count}回 - ¥{history.amount.toLocaleString()}</p>
                            </div>
                            <div className="text-sm text-gray-500">{history.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ガチャ履歴タブ */}
              {activeTab === 'history' && (
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">ガチャ履歴</h3>
                  
                  <div className="space-y-6">
                    {gachaHistory.map((history) => (
                      <motion.div
                        key={history.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-6"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{history.gachaName}</h4>
                            <p className="text-gray-600">{history.count}回実行 - ¥{history.amount.toLocaleString()}</p>
                          </div>
                          <div className="text-sm text-gray-500">{history.date}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {history.results.map((card) => (
                            <div key={card.id} className="relative">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <Image
                                  src={card.imageUrl}
                                  alt={card.name}
                                  width={200}
                                  height={200}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className={`absolute top-1 right-1 px-2 py-1 rounded text-xs font-bold ${getRarityColor(card.rarity)}`}>
                                {card.rarity}
                              </div>
                              <p className="text-sm text-gray-700 mt-1 truncate">{card.name}</p>
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">コレクション</h3>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎴</div>
                    <p className="text-gray-600">獲得したカードのコレクション機能は準備中です</p>
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