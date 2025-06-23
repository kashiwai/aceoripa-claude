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
  SS: 'bg-warning',
  S: 'bg-info',
  A: 'bg-primary',
  B: 'bg-success',
  C: 'bg-secondary'
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
    <div>
      {/* 現在のプール */}
      <div className="mb-4">
        <h3 className="h4 mb-4">現在のカードプール（{pools.length}枚）</h3>
        
        {pools.length === 0 ? (
          <div className="text-center py-5 bg-light rounded">
            <p className="text-muted">カードがまだ設定されていません</p>
          </div>
        ) : (
          <div>
            {['SS', 'S', 'A', 'B', 'C'].map(rarity => {
              const rarityPools = poolsByRarity[rarity] || []
              if (rarityPools.length === 0) return null
              
              const rarityWeight = rarityPools.reduce((sum, p) => sum + p.drop_rate, 0)
              const rarityPercentage = totalWeight > 0 ? (rarityWeight / totalWeight * 100).toFixed(1) : '0'
              
              return (
                <div key={rarity} className="card mb-3">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <span className={`badge ${RARITY_COLORS[rarity as keyof typeof RARITY_COLORS]}`}>
                        {rarity}賞 ({rarityPools.length}枚)
                      </span>
                    </h5>
                    <span className="small fw-medium">
                      合計確率: {rarityPercentage}%
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <div className="row g-3">
                      {rarityPools.map(pool => {
                        const percentage = totalWeight > 0 ? (pool.drop_rate / totalWeight * 100).toFixed(2) : '0'
                        
                        return (
                          <div key={pool.card_id} className="col-12 col-md-6 col-lg-4">
                            <div className="card h-100">
                              <div className="card-body p-2">
                                <div className="d-flex">
                                  <div className="position-relative me-3" style={{width: '64px', height: '64px', flexShrink: 0}}>
                                    <Image
                                      src={pool.cards?.image_url || '/images/ngcard.jpg'}
                                      alt={pool.cards?.card_name || ''}
                                      fill
                                      className="rounded"
                                      style={{objectFit: 'cover'}}
                                    />
                                  </div>
                                  <div className="flex-fill min-w-0">
                                    <p className="fw-medium small mb-0 text-truncate">
                                      {pool.cards?.card_name}
                                    </p>
                                    <p className="text-muted small mb-1">
                                      {pool.cards?.product_code}
                                    </p>
                                    <div className="d-flex align-items-center gap-2">
                                      <input
                                        type="number"
                                        min="1"
                                        value={pool.drop_rate}
                                        onChange={(e) => updateWeight(pool.card_id, parseInt(e.target.value) || 1)}
                                        className="form-control form-control-sm"
                                        style={{width: '70px'}}
                                      />
                                      <span className="small text-muted">
                                        {percentage}%
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => removeFromPool(pool.card_id)}
                                    className="btn btn-sm btn-link text-danger p-0 ms-2"
                                  >
                                    <i className="bi bi-x-lg"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* カード追加セクション */}
      <div className="border-top pt-4">
        <h3 className="h4 mb-4">カードを追加</h3>
        
        {/* フィルター */}
        <div className="row g-3 mb-4">
          <div className="col">
            <input
              type="text"
              placeholder="カード名または商品コードで検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="col-auto">
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="form-select"
            >
              <option value="ALL">全レアリティ</option>
              <option value="SS">SS賞</option>
              <option value="S">S賞</option>
              <option value="A">A賞</option>
              <option value="B">B賞</option>
              <option value="C">C賞</option>
            </select>
          </div>
        </div>
        
        {/* カードリスト */}
        <div className="border rounded p-3" style={{maxHeight: '400px', overflowY: 'auto'}}>
          <div className="row g-3">
            {filteredCards.map(card => {
              const isInPool = poolCardIds.has(card.id)
              const isSelected = selectedCards.includes(card.id)
              
              return (
                <div key={card.id} className="col-6 col-md-4 col-lg-3">
                  <div
                    onClick={() => {
                      if (!isInPool) {
                        if (isSelected) {
                          setSelectedCards(selectedCards.filter(id => id !== card.id))
                        } else {
                          setSelectedCards([...selectedCards, card.id])
                        }
                      }
                    }}
                    className={`card h-100 ${
                      isInPool ? 'opacity-50' :
                      isSelected ? 'border-primary border-2 bg-light' :
                      ''
                    }`}
                    style={{cursor: isInPool ? 'not-allowed' : 'pointer'}}
                  >
                    <div className="card-body p-2">
                      <div className="position-relative mb-2" style={{aspectRatio: '1/1'}}>
                        <Image
                          src={card.image_url || '/images/ngcard.jpg'}
                          alt={card.card_name}
                          fill
                          className="rounded"
                          style={{objectFit: 'cover'}}
                        />
                        {isInPool && (
                          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 rounded d-flex align-items-center justify-content-center">
                            <span className="text-white small fw-medium">登録済</span>
                          </div>
                        )}
                      </div>
                      <p className="small fw-medium mb-0 text-truncate">{card.card_name}</p>
                      <p className="small text-muted mb-1">{card.product_code}</p>
                      <span className={`badge ${RARITY_COLORS[card.rarity as keyof typeof RARITY_COLORS]}`}>
                        {card.rarity}賞
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {selectedCards.length > 0 && (
          <button
            onClick={addCardsToPools}
            className="btn btn-primary mt-3"
          >
            選択したカード（{selectedCards.length}枚）を追加
          </button>
        )}
      </div>
      
      {/* 保存ボタン */}
      <div className="d-flex justify-content-end gap-3 pt-4 border-top mt-4">
        <button
          onClick={() => router.back()}
          className="btn btn-secondary"
          disabled={isLoading}
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading || pools.length === 0}
          className="btn btn-success"
        >
          {isLoading ? '保存中...' : '保存する'}
        </button>
      </div>
    </div>
  )
}