'use client'

import { useState, useEffect } from 'react'

interface TopCard {
  id: string
  name: string
  set_name: string
  rarity: string
  current_price: number
  previous_price: number
  change_percentage: number
  last_updated: string
}

export default function TopCardsPricePage() {
  const [topCards, setTopCards] = useState<TopCard[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchTopCards()
  }, [])

  const fetchTopCards = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/top-cards-price')
      const data = await response.json()
      
      if (data.success) {
        setTopCards(data.cards)
      }
    } catch (error) {
      console.error('Error fetching top cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePrices = async () => {
    setUpdating(true)
    try {
      const response = await fetch('/api/admin/top-cards-price/update', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        await fetchTopCards()
      }
    } catch (error) {
      console.error('Error updating prices:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">トップカード価格管理</h1>
        <button
          onClick={handleUpdatePrices}
          disabled={updating}
          className="btn btn-primary"
        >
          {updating ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              更新中...
            </>
          ) : (
            '価格更新'
          )}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">高額カード価格一覧</h5>
        </div>
        <div className="card-body">
          {topCards.length === 0 ? (
            <div className="text-center p-4">
              <p>データがありません</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>カード名</th>
                    <th>セット名</th>
                    <th>レアリティ</th>
                    <th>現在価格</th>
                    <th>前回価格</th>
                    <th>変動率</th>
                    <th>最終更新</th>
                  </tr>
                </thead>
                <tbody>
                  {topCards.map((card) => (
                    <tr key={card.id}>
                      <td>{card.name}</td>
                      <td>{card.set_name}</td>
                      <td>
                        <span className={`badge ${card.rarity === 'SR' ? 'bg-warning' : card.rarity === 'SSR' ? 'bg-danger' : 'bg-secondary'}`}>
                          {card.rarity}
                        </span>
                      </td>
                      <td>¥{card.current_price.toLocaleString()}</td>
                      <td>¥{card.previous_price.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${card.change_percentage > 0 ? 'bg-success' : card.change_percentage < 0 ? 'bg-danger' : 'bg-secondary'}`}>
                          {card.change_percentage > 0 ? '+' : ''}{card.change_percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td>{new Date(card.last_updated).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}