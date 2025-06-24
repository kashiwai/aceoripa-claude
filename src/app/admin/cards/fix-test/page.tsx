'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

export default function FixTestPage() {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('pokemon_cards')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      
      setCards(data || [])
      // console.log('Cards loaded:', data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container mt-5">読み込み中...</div>
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">カード表示修正テスト</h1>
      
      <div className="mb-4">
        <p>総カード数: {cards.length}</p>
      </div>

      {/* Bootstrap形式のカードグリッド（管理画面と同じ） */}
      <div className="row">
        {cards.map((card) => (
          <div key={card.id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
            <div className="card h-100">
              {/* カード画像 - 3つの方法で試す */}
              <div className="card-header">
                <small>{card.product_code}</small>
              </div>
              
              {/* 方法1: 通常のimg */}
              <div style={{ height: '200px', backgroundColor: '#f0f0f0', position: 'relative' }}>
                <img 
                  src={card.image_url || '/images/ngcard.jpg'}
                  alt={card.card_name}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                  onError={(e: any) => {
                    // console.log('Image error for:', card.card_name)
                    e.target.src = '/images/ngcard.jpg'
                  }}
                />
              </div>

              <div className="card-body">
                <h5 className="card-title">{card.card_name}</h5>
                <p className="card-text">
                  <span className={`badge ${
                    card.rarity === 'SS' ? 'bg-warning' :
                    card.rarity === 'S' ? 'bg-info' :
                    card.rarity === 'A' ? 'bg-primary' :
                    card.rarity === 'B' ? 'bg-success' : 'bg-secondary'
                  }`}>
                    {card.rarity}賞
                  </span>
                  <br />
                  <span className="text-success fw-bold">
                    ¥{card.market_price?.toLocaleString() || '0'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next.js Image版も試す */}
      <h2 className="mt-5 mb-3">Next.js Image版</h2>
      <div className="row">
        {cards.slice(0, 3).map((card) => (
          <div key={card.id + '-next'} className="col-md-4 mb-4">
            <div className="card">
              <div className="position-relative" style={{ height: '300px' }}>
                <Image
                  src={card.image_url || '/images/ngcard.jpg'}
                  alt={card.card_name}
                  fill
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    // console.log('Next Image error for:', card.card_name)
                  }}
                />
              </div>
              <div className="card-body">
                <h6>{card.card_name}</h6>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <a href="/admin/cards" className="btn btn-primary">管理画面に戻る</a>
      </div>
    </div>
  )
}