'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

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
  'C': 'C賞'
}

const RARITY_COLORS = {
  'SS': 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500',
  'S': 'bg-gradient-to-r from-purple-400 to-pink-400',
  'A': 'bg-gradient-to-r from-blue-400 to-cyan-400',
  'B': 'bg-gradient-to-r from-green-400 to-emerald-400',
  'C': 'bg-gradient-to-r from-gray-400 to-gray-500'
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('')
  
  const supabase = createClientComponentClient()

  const fetchCards = async () => {
    try {
      let query = supabase
        .from('pokemon_cards')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter) {
        query = query.ilike('card_name', `%${filter}%`)
      }
      
      if (rarityFilter) {
        query = query.eq('rarity', rarityFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setCards(data || [])
    } catch (error) {
      console.error('Error fetching cards:', error)
      toast.error('カード一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCards()
  }, [filter, rarityFilter])

  const deleteCard = async (id: string) => {
    if (!confirm('このカードを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('pokemon_cards')
        .delete()
        .eq('id', id)

      if (error) throw error

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

  return (
    <div>
      {/* ヘッダー */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">カード管理</h1>
        <div>
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
        <div className="col-lg-2 col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <small className="text-muted">総カード数</small>
              <h4 className="mb-0">{cards.length}</h4>
            </div>
          </div>
        </div>
        {Object.keys(RARITY_LABELS).map(rarity => {
          const count = cards.filter(card => card.rarity === rarity).length
          return (
            <div key={rarity} className="col-lg-2 col-md-4 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <small className="text-muted">{RARITY_LABELS[rarity as keyof typeof RARITY_LABELS]}</small>
                  <h4 className="mb-0">{count}</h4>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* カード一覧 */}
      <div className="row">
        {cards.map((card) => (
          <div key={card.id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
            <div className="card h-100">
              {/* カード画像 */}
              <div className="position-relative" style={{aspectRatio: '2/3', backgroundColor: '#f8f9fa'}}>
                <Image
                  src={card.image_url || '/images/ngcard.jpg'}
                  alt={card.card_name}
                  fill
                  className="card-img-top"
                  style={{objectFit: 'cover'}}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/images/ngcard.jpg'
                  }}
                />
                {/* レアリティバッジ */}
                <span className={`position-absolute top-0 start-0 m-2 badge ${
                  card.rarity === 'SS' ? 'bg-warning' :
                  card.rarity === 'S' ? 'bg-info' :
                  card.rarity === 'A' ? 'bg-primary' :
                  card.rarity === 'B' ? 'bg-success' : 'bg-secondary'
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