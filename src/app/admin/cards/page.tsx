'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface Card {
  id: string
  card_name: string
  product_code: string
  rarity: string
  image_url: string
  market_price: number
  description?: string
  created_at: string
}

const RARITY_LABELS = {
  'SS': 'SS賞',
  'S': 'S賞', 
  'A': 'A賞',
  'B': 'B賞',
  'C': 'C賞',
  'D': 'D賞'
}

const RARITY_COLORS = {
  'SS': 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500',
  'S': 'bg-gradient-to-r from-purple-400 to-pink-400',
  'A': 'bg-gradient-to-r from-blue-400 to-cyan-400',
  'B': 'bg-gradient-to-r from-green-400 to-emerald-400',
  'C': 'bg-gradient-to-r from-gray-400 to-gray-500',
  'D': 'bg-gradient-to-r from-gray-300 to-gray-400'
}

// サービスロールキーで直接接続
const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [rarityCounts, setRarityCounts] = useState<Record<string, number>>({})

  const fetchCards = async () => {
    try {
      console.log('Fetching cards directly from Supabase...')
      
      // まず全体のカード数を取得（フィルター条件なし）
      const { count: total, error: countError } = await supabaseAdmin
        .from('pokemon_cards')
        .select('*', { count: 'exact', head: true })
      
      if (countError) throw countError
      setTotalCount(total || 0)
      
      // レアリティ別の集計（フィルター条件なし）
      const rarities = ['SS', 'S', 'A', 'B', 'C', 'D']
      const counts: Record<string, number> = {}
      
      for (const rarity of rarities) {
        const { count, error } = await supabaseAdmin
          .from('pokemon_cards')
          .select('*', { count: 'exact', head: true })
          .eq('rarity', rarity)
        
        if (!error) {
          counts[rarity] = count || 0
        }
      }
      setRarityCounts(counts)
      
      // カード一覧を取得（フィルター条件あり）
      let query = supabaseAdmin
        .from('pokemon_cards')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10000) // 最大10000件まで取得

      // 検索条件追加
      if (filter) {
        query = query.or(`card_name.ilike.%${filter}%,product_code.ilike.%${filter}%`)
      }
      if (rarityFilter) {
        query = query.eq('rarity', rarityFilter)
      }

      const { data, error } = await query
      
      if (error) {
        throw new Error(error.message)
      }
      
      setCards(data || [])
    } catch (error) {
      console.error('Error fetching cards:', error)
      toast.error('カード一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // console.log('CardsPage mounted, fetching cards...')
    fetchCards()
  }, [filter, rarityFilter])

  const deleteCard = async (id: string) => {
    if (!confirm('このカードを削除しますか？')) return

    try {
      console.log('Deleting card:', id)
      
      const { error } = await supabaseAdmin
        .from('pokemon_cards')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw new Error(error.message)
      }

      toast.success('カードを削除しました')
      fetchCards()
    } catch (error) {
      console.error('Error deleting card:', error)
      toast.error('カードの削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // console.log('Rendering CardsPage, cards:', cards.length, cards)
  
  return (
    <div>
      {/* ヘッダー */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">カード管理</h1>
        <div>
          <Link
            href="/admin/price-monitoring"
            className="btn btn-warning me-2"
          >
            📊 価格監視
          </Link>
          <Link
            href="/admin/cards/import"
            className="btn btn-success me-2"
          >
            📁 CSVインポート
          </Link>
          <Link
            href="/admin/cards/new"
            className="btn btn-primary"
          >
            ➕ 新規カード追加
          </Link>
        </div>
      </div>

      {/* フィルター */}
      <div className="row mb-4">
        <div className="col-md-8">
          <input
            type="text"
            placeholder="カード名で検索..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="col-md-4">
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="form-select"
          >
            <option value="">全てのレアリティ</option>
            <option value="SS">SS賞</option>
            <option value="S">S賞</option>
            <option value="A">A賞</option>
            <option value="B">B賞</option>
            <option value="C">C賞</option>
          </select>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card text-center bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title mb-3">総合計カード数</h5>
              <h2 className="mb-0 display-4">{totalCount.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>
      
      {/* レアリティ別カード数 */}
      <div className="row mb-4">
        {Object.keys(RARITY_LABELS).map(rarity => {
          const count = rarityCounts[rarity] || 0
          return (
            <div key={rarity} className="col-lg-2 col-md-4 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h6 className={`mb-2 ${
                    rarity === 'SS' ? 'text-warning' :
                    rarity === 'S' ? 'text-info' :
                    rarity === 'A' ? 'text-primary' :
                    rarity === 'B' ? 'text-success' :
                    rarity === 'C' ? 'text-secondary' : 'text-dark'
                  }`}>{RARITY_LABELS[rarity as keyof typeof RARITY_LABELS]}</h6>
                  <h3 className="mb-0">{count.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* 現在の表示数 */}
      {(filter || rarityFilter) && (
        <div className="alert alert-info mb-4">
          フィルター適用中: {cards.length.toLocaleString()} 件を表示中
        </div>
      )}

      {/* カード一覧 */}
      <div className="row">
        {cards.map((card) => (
          <div key={card.id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
            <div className="card h-100">
              {/* カード画像 */}
              <div className="position-relative" style={{aspectRatio: '2/3', backgroundColor: '#f8f9fa'}}>
                <img
                  src={card.image_url || '/images/ngcard.jpg'}
                  alt={card.card_name}
                  className="card-img-top w-100 h-100"
                  style={{objectFit: 'cover'}}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    // エラー時はAPIルートを試す
                    if (target.src.includes('/images/ngcard.jpg')) {
                      target.src = '/api/test-image'
                    }
                  }}
                />
                {/* レアリティバッジ */}
                <span className={`position-absolute top-0 start-0 m-2 badge ${
                  card.rarity === 'SS' ? 'bg-warning' :
                  card.rarity === 'S' ? 'bg-info' :
                  card.rarity === 'A' ? 'bg-primary' :
                  card.rarity === 'B' ? 'bg-success' : 
                  card.rarity === 'C' ? 'bg-secondary' : 'bg-dark'
                }`}>
                  {RARITY_LABELS[card.rarity as keyof typeof RARITY_LABELS]}
                </span>
              </div>

              {/* カード情報 */}
              <div className="card-body">
                <h5 className="card-title">{card.card_name}</h5>
                <p className="card-text">
                  <small className="text-muted">商品コード: {card.product_code}</small><br/>
                  <span className="text-success fw-bold">¥{card.market_price?.toLocaleString() || '0'}</span>
                </p>
                
                {/* アクション */}
                <div className="d-grid gap-2">
                  <Link
                    href={`/admin/cards/${card.id}/price-history`}
                    className="btn btn-outline-info btn-sm"
                  >
                    📊 価格履歴
                  </Link>
                  <div className="btn-group">
                    <Link
                      href={`/admin/cards/${card.id}/edit`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      ✏️ 編集
                    </Link>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="btn btn-outline-danger btn-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-4">
            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
              <span style={{fontSize: '2rem'}}>🎴</span>
            </div>
          </div>
          <h4>カードがありません</h4>
          <p className="text-muted mb-4">新しいカードを追加してください</p>
          <Link
            href="/admin/cards/new"
            className="btn btn-primary"
          >
            ➕ 新規カード追加
          </Link>
        </div>
      )}
    </div>
  )
}