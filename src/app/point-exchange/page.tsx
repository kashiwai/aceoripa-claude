'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AuthHeader } from '@/components/layout/AuthHeader'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

interface ExchangeItem {
  id: string
  name: string
  description: string
  point_cost: number
  stock_quantity: number
  category: string
  image_url: string
  rarity: string
  is_available: boolean
}

interface UserPoints {
  free_points: number
  paid_points: number
}

export default function PointExchangePage() {
  const supabase = createClientComponentClient()
  const [items, setItems] = useState<ExchangeItem[]>([])
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null)
  const [loading, setLoading] = useState(true)
  const [exchanging, setExchanging] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [user, setUser] = useState<any>(null)

  const categories = [
    { id: 'all', name: '全て' },
    { id: 'pokemon_card', name: 'ポケモンカード' },
    { id: 'special_item', name: 'スペシャルアイテム' },
    { id: 'digital_item', name: 'デジタルアイテム' }
  ]

  useEffect(() => {
    fetchUser()
    fetchItems()
  }, [selectedCategory])

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        fetchUserPoints()
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const fetchUserPoints = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_points')
        .select('free_points, paid_points')
        .eq('user_id', user.id)
        .single()

      if (!error && data) {
        setUserPoints(data)
      }
    } catch (error) {
      console.error('Error fetching user points:', error)
    }
  }

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/point-exchange?category=${selectedCategory}&perPage=50`)
      const data = await response.json()
      
      if (data.success) {
        setItems(data.items)
      } else {
        console.error('Failed to fetch items:', data.error)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExchange = async (itemId: string, itemName: string, pointCost: number) => {
    if (!user) {
      toast.error('ログインが必要です')
      return
    }

    if (!userPoints || (userPoints.free_points + userPoints.paid_points) < pointCost) {
      toast.error('ポイントが不足しています')
      return
    }

    if (confirm(`${itemName} を ${pointCost}pt で交換しますか？`)) {
      setExchanging(itemId)
      try {
        const response = await fetch('/api/point-exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId, quantity: 1 })
        })

        const data = await response.json()
        
        if (data.success) {
          toast.success('交換が完了しました！')
          fetchItems()
          fetchUserPoints()
        } else {
          toast.error(data.error || '交換に失敗しました')
        }
      } catch (error) {
        console.error('Exchange error:', error)
        toast.error('交換に失敗しました')
      } finally {
        setExchanging(null)
      }
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SS': return 'bg-red-500'
      case 'S': return 'bg-yellow-500'
      case 'A': return 'bg-blue-500'
      case 'B': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const totalPoints = userPoints ? userPoints.free_points + userPoints.paid_points : 0

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <AuthHeader />
      
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black mb-2">ポイント交換所</h1>
              <p className="text-lg opacity-90">ポイントでカードやアイテムと交換しよう！</p>
            </div>
            {user && (
              <div className="mt-4 sm:mt-0 bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-sm opacity-80">所持ポイント</p>
                  <p className="text-2xl font-black">{totalPoints.toLocaleString()}pt</p>
                  <div className="text-xs mt-1">
                    <span>無料: {userPoints?.free_points?.toLocaleString() || 0}pt</span>
                    <span className="mx-2">|</span>
                    <span>有料: {userPoints?.paid_points?.toLocaleString() || 0}pt</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  ログインが必要です
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>ポイント交換を利用するには、アカウントにログインしてください。</p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <Link
                      href="/auth/login"
                      className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                    >
                      ログイン
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="ml-3 bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                    >
                      新規登録
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* カテゴリーフィルター */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* アイテム一覧 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="relative aspect-square">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  
                  {/* レアリティバッジ */}
                  <div className={`absolute top-2 left-2 ${getRarityColor(item.rarity)} text-white px-2 py-1 rounded-full text-xs font-bold`}>
                    {item.rarity}
                  </div>
                  
                  {/* 在庫表示 */}
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                    残り{item.stock_quantity}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 truncate">{item.name}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-yellow-400 font-black text-xl">
                      {item.point_cost.toLocaleString()}pt
                    </div>
                    
                    <button
                      onClick={() => handleExchange(item.id, item.name, item.point_cost)}
                      disabled={!user || exchanging === item.id || item.stock_quantity === 0 || totalPoints < item.point_cost}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        !user || item.stock_quantity === 0 || totalPoints < item.point_cost
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : exchanging === item.id
                          ? 'bg-gray-600 text-gray-400 cursor-wait'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                      }`}
                    >
                      {exchanging === item.id ? '交換中...' :
                       item.stock_quantity === 0 ? '在庫切れ' :
                       !user ? 'ログイン必要' :
                       totalPoints < item.point_cost ? 'ポイント不足' :
                       '交換する'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">該当するアイテムがありません</p>
          </div>
        )}
      </div>
    </div>
  )
}