'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Prize {
  id?: string
  rarity: string
  card_name: string
  description: string
  market_price: number
  image_url: string
  weight: number
}

export default function GachaPoolsPage() {
  const params = useParams()
  const gachaId = params.id as string
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [gacha, setGacha] = useState<any>(null)
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [availableCards, setAvailableCards] = useState<any[]>([])
  const [selectedCardId, setSelectedCardId] = useState('')
  const [filterRarity, setFilterRarity] = useState('SS')
  const [searchTerm, setSearchTerm] = useState('')
  const [weight, setWeight] = useState(1)

  useEffect(() => {
    fetchGachaData()
    fetchPrizes()
  }, [gachaId])

  useEffect(() => {
    if (showAddForm) {
      fetchAvailableCards()
    }
  }, [showAddForm, filterRarity, searchTerm])

  const fetchGachaData = async () => {
    try {
      const { data, error } = await supabase
        .from('gacha_products')
        .select('*')
        .eq('id', gachaId)
        .single()
      
      if (error) throw error
      setGacha(data)
    } catch (error: any) {
      console.error('Error fetching gacha:', error)
      toast.error('ガチャ情報の取得に失敗しました')
    }
  }

  const fetchPrizes = async () => {
    try {
      // まずpokemon_cardsテーブルから既存のカードを取得
      const { data: cards, error: cardsError } = await supabase
        .from('pokemon_cards')
        .select('*')
        .order('rarity', { ascending: true })
      
      if (!cardsError && cards) {
        // ガチャプールとの関連を取得
        const { data: pools, error: poolsError } = await supabase
          .from('gacha_pokemon_pools')
          .select('*')
          .eq('gacha_product_id', gachaId)
        
        if (!poolsError && pools) {
          // カードとプール情報を結合
          const prizesData = pools.map(pool => {
            const card = cards.find(c => c.id === pool.pokemon_card_id)
            return {
              id: pool.id,
              card_id: pool.pokemon_card_id,
              rarity: card?.rarity || 'C',
              card_name: card?.card_name || '',
              description: card?.product_code || '',
              market_price: card?.market_price || 0,
              image_url: card?.image_url || '',
              weight: pool.weight
            }
          })
          setPrizes(prizesData)
        }
      }
    } catch (error: any) {
      console.error('Error fetching prizes:', error)
      // エラーが発生してもページは表示する
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableCards = async () => {
    try {
      let query = supabase
        .from('pokemon_cards')
        .select('*')
        .eq('rarity', filterRarity)
        .order('market_price', { ascending: false })
      
      if (searchTerm) {
        query = query.or(`card_name.ilike.%${searchTerm}%,product_code.ilike.%${searchTerm}%`)
      }
      
      const { data, error } = await query
      
      if (!error && data) {
        // 既に追加されているカードを除外
        const addedCardIds = prizes.map(p => p.card_id)
        const filtered = data.filter(card => !addedCardIds.includes(card.id))
        setAvailableCards(filtered)
      }
    } catch (error: any) {
      console.error('Error fetching available cards:', error)
    }
  }

  const handleAddPrize = async () => {
    if (!selectedCardId) {
      toast.error('カードを選択してください')
      return
    }

    try {
      // ガチャプールに追加
      const { error: poolError } = await supabase
        .from('gacha_pokemon_pools')
        .insert({
          gacha_product_id: gachaId,
          pokemon_card_id: selectedCardId,
          weight: weight
        })
      
      if (poolError) throw poolError

      toast.success('賞品を追加しました')
      setShowAddForm(false)
      setSelectedCardId('')
      setWeight(1)
      fetchPrizes()
    } catch (error: any) {
      console.error('Error adding prize:', error)
      toast.error('賞品の追加に失敗しました: ' + error.message)
    }
  }

  const handleDeletePrize = async (poolId: string) => {
    if (!confirm('この賞品を削除しますか？')) return

    try {
      const { error } = await supabase
        .from('gacha_pokemon_pools')
        .delete()
        .eq('id', poolId)
      
      if (error) throw error
      
      toast.success('賞品を削除しました')
      fetchPrizes()
    } catch (error: any) {
      toast.error('削除に失敗しました: ' + error.message)
    }
  }

  const calculateDropRate = (weight: number) => {
    const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0)
    return totalWeight > 0 ? ((weight / totalWeight) * 100).toFixed(2) : '0.00'
  }

  const calculateTotalCost = () => {
    const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0)
    return prizes.reduce((sum, prize) => {
      const dropRate = totalWeight > 0 ? prize.weight / totalWeight : 0
      return sum + (prize.market_price * dropRate)
    }, 0)
  }

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">{gacha?.name} - 賞品設定</h1>
          <p className="text-muted">SS賞、S賞、A賞などの当たりカードを管理</p>
        </div>
        <Link href={`/admin/gacha/${gachaId}`} className="btn btn-secondary">
          ← ガチャ詳細に戻る
        </Link>
      </div>

      {/* 統計情報 */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">登録賞品数</h6>
              <h3 className="card-title mb-0">{prizes.length}個</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">期待原価</h6>
              <h3 className="card-title mb-0">¥{Math.round(calculateTotalCost()).toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">販売価格</h6>
              <h3 className="card-title mb-0">¥{gacha?.price || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">期待利益率</h6>
              <h3 className="card-title mb-0">
                {gacha?.price > 0 ? 
                  `${((1 - calculateTotalCost() / gacha.price) * 100).toFixed(1)}%` 
                  : '-'
                }
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* 賞品追加ボタン */}
      <div className="mb-4">
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          <i className="bi bi-plus-lg me-2"></i>
          賞品を追加
        </button>
      </div>

      {/* 賞品追加フォーム */}
      {showAddForm && (
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">カードマスターから賞品を選択</h5>
          </div>
          <div className="card-body">
            {/* フィルター */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <label className="form-label">レアリティ</label>
                <select 
                  className="form-select"
                  value={filterRarity}
                  onChange={(e) => setFilterRarity(e.target.value)}
                >
                  <option value="SS">SS賞</option>
                  <option value="S">S賞</option>
                  <option value="A">A賞</option>
                  <option value="B">B賞</option>
                  <option value="C">C賞</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">カード検索</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="カード名または型番で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">排出重み</label>
                <input 
                  type="number"
                  className="form-control"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  min="1"
                />
              </div>
            </div>
            
            {/* カード選択リスト */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {availableCards.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  該当するカードがありません
                </div>
              ) : (
                <div className="row g-3">
                  {availableCards.map((card) => (
                    <div key={card.id} className="col-md-6">
                      <div 
                        className={`card cursor-pointer ${selectedCardId === card.id ? 'border-primary shadow' : ''}`}
                        onClick={() => setSelectedCardId(card.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body p-2">
                          <div className="d-flex align-items-center">
                            {card.image_url && (
                              <img 
                                src={card.image_url} 
                                alt={card.card_name}
                                style={{ width: '60px', height: '80px', objectFit: 'cover' }}
                                className="me-3"
                              />
                            )}
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{card.card_name}</h6>
                              <small className="text-muted d-block">{card.product_code}</small>
                              <strong className="text-success">¥{card.market_price.toLocaleString()}</strong>
                            </div>
                            {selectedCardId === card.id && (
                              <div className="text-primary">
                                <i className="bi bi-check-circle-fill fs-4"></i>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* アクションボタン */}
            <div className="mt-4 d-flex gap-2">
              <button 
                onClick={handleAddPrize} 
                disabled={!selectedCardId}
                className="btn btn-success"
              >
                選択したカードを追加
              </button>
              <button 
                onClick={() => {
                  setShowAddForm(false)
                  setSelectedCardId('')
                }}
                className="btn btn-secondary"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 賞品一覧 */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">賞品一覧</h5>
        </div>
        <div className="card-body">
          {prizes.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>まだ賞品が登録されていません</p>
              <p>上の「賞品を追加」ボタンから登録してください</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>レアリティ</th>
                    <th>カード名</th>
                    <th>説明/型番</th>
                    <th>仕入れ原価</th>
                    <th>排出率</th>
                    <th>期待原価</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {prizes.sort((a, b) => {
                    const order = ['SS', 'S', 'A', 'B', 'C']
                    return order.indexOf(a.rarity) - order.indexOf(b.rarity)
                  }).map((prize) => (
                    <tr key={prize.id}>
                      <td>
                        <span className={`badge bg-${
                          prize.rarity === 'SS' ? 'danger' :
                          prize.rarity === 'S' ? 'warning' :
                          prize.rarity === 'A' ? 'success' :
                          prize.rarity === 'B' ? 'info' :
                          'secondary'
                        }`}>
                          {prize.rarity}賞
                        </span>
                      </td>
                      <td className="fw-bold">{prize.card_name}</td>
                      <td className="text-muted">{prize.description}</td>
                      <td>¥{prize.market_price.toLocaleString()}</td>
                      <td>{calculateDropRate(prize.weight)}%</td>
                      <td>
                        ¥{Math.round(prize.market_price * Number(calculateDropRate(prize.weight)) / 100).toLocaleString()}
                      </td>
                      <td>
                        <button 
                          onClick={() => handleDeletePrize(prize.id!)}
                          className="btn btn-sm btn-danger"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-light">
                    <th colSpan={5}>合計</th>
                    <th>¥{Math.round(calculateTotalCost()).toLocaleString()}</th>
                    <th></th>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}