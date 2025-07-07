'use client'

import { useState, useEffect } from 'react'

export default function CardStatsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/cards/count')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">読み込み中...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">カード統計情報</h1>
      
      {stats && (
        <>
          <div className="card mb-4">
            <div className="card-body text-center">
              <h2 className="display-3 text-primary mb-0">{stats.totalCount?.toLocaleString() || 0}</h2>
              <h4 className="text-muted">総合計カード数</h4>
            </div>
          </div>

          <div className="row">
            {Object.entries(stats.rarityCounts || {}).map(([rarity, count]) => (
              <div key={rarity} className="col-md-2 mb-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className={`card-title ${
                      rarity === 'SS' ? 'text-warning' :
                      rarity === 'S' ? 'text-info' :
                      rarity === 'A' ? 'text-primary' :
                      rarity === 'B' ? 'text-success' :
                      rarity === 'C' ? 'text-secondary' : 'text-dark'
                    }`}>{rarity}賞</h5>
                    <h3 className="mb-0">{(count as number).toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button onClick={fetchStats} className="btn btn-primary">
              再読み込み
            </button>
          </div>
          
          <div className="mt-3">
            <small className="text-muted">
              最終更新: {new Date(stats.timestamp).toLocaleString('ja-JP')}
            </small>
          </div>
        </>
      )}
    </div>
  )
}