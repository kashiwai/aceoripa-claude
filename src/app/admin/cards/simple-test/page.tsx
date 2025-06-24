'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// サービスロールキーで直接接続
const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

export default function SimpleTestPage() {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    // console.log('Loading cards...')
    try {
      const { data, error } = await supabaseAdmin
        .from('pokemon_cards')
        .select('*')
        .order('created_at', { ascending: false })

      // console.log('Supabase response:', { data, error })

      if (error) {
        throw error
      }

      setCards(data || [])
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">シンプルテスト - カード一覧</h1>
      
      <div className="mb-4">
        <p>カード数: {cards.length}</p>
      </div>

      <div className="space-y-2">
        {cards.map((card) => (
          <div key={card.id} className="border p-2 rounded">
            <div className="flex items-center gap-4">
              <img 
                src={card.image_url || '/images/ngcard.jpg'} 
                alt={card.card_name}
                className="w-20 h-30 object-cover"
                onError={(e: any) => {
                  e.target.src = '/images/ngcard.jpg'
                }}
              />
              <div>
                <h3 className="font-bold">{card.card_name}</h3>
                <p>コード: {card.product_code}</p>
                <p>レアリティ: {card.rarity}</p>
                <p>価格: ¥{card.market_price?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-gray-500">カードがありません</div>
      )}
    </div>
  )
}