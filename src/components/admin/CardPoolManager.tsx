'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

interface Card {
  id: string
  card_name: string
  product_code: string
  rarity: string
  image_url: string
  market_price: number
}

interface Pool {
  id?: string
  card_id: string
  drop_rate: number
  cards?: Card
}

interface CardPoolManagerProps {
  gachaId: string
  currentPools: Pool[]
  availableCards: Card[]
}

const RARITY_COLORS = {
  SS: 'bg-gradient-to-r from-yellow-400 to-red-500 text-white',
  S: 'bg-gradient-to-r from-purple-400 to-pink-500 text-white',
  A: 'bg-blue-500 text-white',
  B: 'bg-green-500 text-white',
  C: 'bg-gray-500 text-white'
}

export default function CardPoolManager({ gachaId, currentPools, availableCards }: CardPoolManagerProps) {
  const router = useRouter()
  const [pools, setPools] = useState<Pool[]>(currentPools)
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRarity, setFilterRarity] = useState<string>('ALL')
  
  // 現在プールに含まれているカードのIDセット
  const poolCardIds = new Set(pools.map(p => p.card_id))
  
  // フィルタリングされたカード
  const filteredCards = useMemo(() => {
    return availableCards.filter(card => {
      const matchesSearch = card.card_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          card.product_code.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRarity = filterRarity === 'ALL' || card.rarity === filterRarity
      return matchesSearch && matchesRarity
    })
  }, [availableCards, searchTerm, filterRarity])
  
  // 確率の合計を計算
  const totalWeight = pools.reduce((sum, pool) => sum + pool.drop_rate, 0)
  
  // カードをプールに追加
  const addCardsToPools = () => {
    const newPools = [...pools]
    selectedCards.forEach(cardId => {
      if (!poolCardIds.has(cardId)) {
        const card = availableCards.find(c => c.id === cardId)
        if (card) {
          newPools.push({
            card_id: cardId,
            drop_rate: 10, // デフォルト値
            cards: card
          })
        }
      }
    })
    setPools(newPools)
    setSelectedCards([])
  }
  
  // プールからカードを削除
  const removeFromPool = (cardId: string) => {
    setPools(pools.filter(p => p.card_id !== cardId))
  }
  
  // ウェイトを更新
  const updateWeight = (cardId: string, weight: number) => {
    setPools(pools.map(p => 
      p.card_id === cardId ? { ...p, drop_rate: weight } : p
    ))
  }
  
  // 保存処理
  const handleSave = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/admin/gacha/${gachaId}/pools`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pools })
      })
      
      if (!response.ok) throw new Error('Failed to update pools')
      
      toast.success('カードプールを更新しました')
      router.refresh()
    } catch (error) {
      console.error('Pool update error:', error)
      toast.error('更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }
  
  // レアリティ別にプールをグループ化
  const poolsByRarity = pools.reduce((acc, pool) => {
    const rarity = pool.cards?.rarity || 'N'
    if (!acc[rarity]) acc[rarity] = []
    acc[rarity].push(pool)
    return acc
  }, {} as Record<string, Pool[]>)
  
  return (
    <div className="space-y-6">
      {/* 現在のプール */}
      <div>
        <h3 className="text-lg font-semibold mb-4">現在のカードプール（{pools.length}枚）</h3>
        
        {pools.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">カードがまだ設定されていません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {['SS', 'S', 'A', 'B', 'C'].map(rarity => {
              const rarityPools = poolsByRarity[rarity] || []
              if (rarityPools.length === 0) return null
              
              const rarityWeight = rarityPools.reduce((sum, p) => sum + p.drop_rate, 0)
              const rarityPercentage = totalWeight > 0 ? (rarityWeight / totalWeight * 100).toFixed(1) : '0'
              
              return (
                <div key={rarity} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className={`font-semibold px-3 py-1 rounded-full text-sm ${RARITY_COLORS[rarity as keyof typeof RARITY_COLORS]}`}>
                      {rarity} ({rarityPools.length}枚)
                    </h4>
                    <span className="text-sm font-medium">
                      合計確率: {rarityPercentage}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {rarityPools.map(pool => {
                      const percentage = totalWeight > 0 ? (pool.drop_rate / totalWeight * 100).toFixed(2) : '0'
                      
                      return (
                        <div key={pool.card_id} className="border rounded-lg p-3 bg-white">
                          <div className="flex items-start space-x-3">
                            <div className="relative w-16 h-16 flex-shrink-0">
                              <Image
                                src={pool.cards?.image_url || '/api/placeholder/64/64'}
                                alt={pool.cards?.card_name || ''}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {pool.cards?.card_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {pool.cards?.product_code}
                              </p>
                              <div className="flex items-center mt-1 space-x-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={pool.drop_rate}
                                  onChange={(e) => updateWeight(pool.card_id, parseInt(e.target.value) || 1)}
                                  className="w-16 px-2 py-1 text-xs border rounded"
                                />
                                <span className="text-xs text-gray-600">
                                  {percentage}%
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromPool(pool.card_id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* カード追加セクション */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">カードを追加</h3>
        
        {/* フィルター */}
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            placeholder="カード名または商品コードで検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="ALL">全レアリティ</option>
            <option value="SS">SS</option>
            <option value="S">S</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
        
        {/* カードリスト */}
        <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredCards.map(card => {
              const isInPool = poolCardIds.has(card.id)
              const isSelected = selectedCards.includes(card.id)
              
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    if (!isInPool) {
                      if (isSelected) {
                        setSelectedCards(selectedCards.filter(id => id !== card.id))
                      } else {
                        setSelectedCards([...selectedCards, card.id])
                      }
                    }
                  }}
                  className={`relative border rounded-lg p-2 cursor-pointer transition-all ${
                    isInPool ? 'opacity-50 cursor-not-allowed' :
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' :
                    'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative w-full aspect-square mb-2">
                    <Image
                      src={card.image_url || '/api/placeholder/100/100'}
                      alt={card.card_name}
                      fill
                      className="object-cover rounded"
                    />
                    {isInPool && (
                      <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-medium">登録済</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium truncate">{card.card_name}</p>
                  <p className="text-xs text-gray-500">{card.product_code}</p>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                    RARITY_COLORS[card.rarity as keyof typeof RARITY_COLORS]
                  }`}>
                    {card.rarity}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        
        {selectedCards.length > 0 && (
          <button
            onClick={addCardsToPools}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            選択したカード（{selectedCards.length}枚）を追加
          </button>
        )}
      </div>
      
      {/* 保存ボタン */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={isLoading}
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading || pools.length === 0}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? '保存中...' : '保存する'}
        </button>
      </div>
    </div>
  )
}