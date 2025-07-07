'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// サービスロールキーで直接接続
const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

export default function CardCountCheckPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCount: 0,
    totalCountExact: 0,
    byRarity: {} as Record<string, number>,
    uniqueProducts: 0,
    duplicates: 0,
    samples: [] as any[]
  })

  useEffect(() => {
    checkCardCount()
  }, [])

  const checkCardCount = async () => {
    try {
      console.log('カード数を確認中...')
      
      // 1. 通常のselect countで確認
      const { data: allCards, error: selectError } = await supabaseAdmin
        .from('pokemon_cards')
        .select('*')
      
      if (selectError) throw selectError
      
      // 2. count: exactで確認
      const { count: exactCount, error: countError } = await supabaseAdmin
        .from('pokemon_cards')
        .select('*', { count: 'exact', head: true })
      
      if (countError) throw countError
      
      // 3. レアリティ別の集計
      const rarityCount: Record<string, number> = {}
      const productCodes = new Set<string>()
      const duplicateProducts: Record<string, number> = {}
      
      allCards?.forEach(card => {
        // レアリティ別カウント
        rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1
        
        // 商品コードの重複チェック
        if (productCodes.has(card.product_code)) {
          duplicateProducts[card.product_code] = (duplicateProducts[card.product_code] || 1) + 1
        } else {
          productCodes.add(card.product_code)
        }
      })
      
      // 4. サンプルデータ（最初の10件）
      const samples = allCards?.slice(0, 10) || []
      
      setStats({
        totalCount: allCards?.length || 0,
        totalCountExact: exactCount || 0,
        byRarity: rarityCount,
        uniqueProducts: productCodes.size,
        duplicates: Object.keys(duplicateProducts).length,
        samples: samples
      })
      
    } catch (error) {
      console.error('カード数確認エラー:', error)
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
      <h1 className="mb-4">カード数確認ツール</h1>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">総カード数</h5>
              <div className="row">
                <div className="col-6">
                  <p className="mb-1">通常カウント:</p>
                  <h2 className="text-primary">{stats.totalCount.toLocaleString()}</h2>
                </div>
                <div className="col-6">
                  <p className="mb-1">正確なカウント:</p>
                  <h2 className="text-success">{stats.totalCountExact.toLocaleString()}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">商品コード統計</h5>
              <p>ユニーク商品数: <strong>{stats.uniqueProducts.toLocaleString()}</strong></p>
              <p>重複商品コード数: <strong className="text-warning">{stats.duplicates}</strong></p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">レアリティ別内訳</h5>
          <div className="row">
            {Object.entries(stats.byRarity).sort().map(([rarity, count]) => (
              <div key={rarity} className="col-md-2 mb-3">
                <div className="text-center">
                  <h6>{rarity}賞</h6>
                  <h3 className={
                    rarity === 'SS' ? 'text-warning' :
                    rarity === 'S' ? 'text-info' :
                    rarity === 'A' ? 'text-primary' :
                    rarity === 'B' ? 'text-success' : 'text-secondary'
                  }>
                    {count.toLocaleString()}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">サンプルデータ（最初の10件）</h5>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>カード名</th>
                  <th>商品コード</th>
                  <th>レアリティ</th>
                  <th>価格</th>
                </tr>
              </thead>
              <tbody>
                {stats.samples.map((card) => (
                  <tr key={card.id}>
                    <td>{card.id.substring(0, 8)}...</td>
                    <td>{card.card_name}</td>
                    <td>{card.product_code}</td>
                    <td>
                      <span className={`badge ${
                        card.rarity === 'SS' ? 'bg-warning' :
                        card.rarity === 'S' ? 'bg-info' :
                        card.rarity === 'A' ? 'bg-primary' :
                        card.rarity === 'B' ? 'bg-success' : 'bg-secondary'
                      }`}>
                        {card.rarity}
                      </span>
                    </td>
                    <td>¥{card.market_price?.toLocaleString() || '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button 
          onClick={checkCardCount} 
          className="btn btn-primary"
        >
          再確認
        </button>
      </div>
    </div>
  )
}