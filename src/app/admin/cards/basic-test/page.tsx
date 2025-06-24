'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function BasicTestPage() {
  const [result, setResult] = useState<string>('テストを実行してください')
  const [cards, setCards] = useState<any[]>([])

  const testDirectConnection = async () => {
    setResult('接続中...')
    
    try {
      // サービスロールキーで直接接続
      const supabase = createClient(
        'https://vshkekffhjbvszzpagjt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
      )

      const { data, error } = await supabase
        .from('pokemon_cards')
        .select('*')
        .limit(5)

      if (error) {
        setResult(`エラー: ${error.message}`)
        console.error('Supabase error:', error)
      } else {
        setResult(`成功！ ${data?.length || 0}件のカードを取得`)
        setCards(data || [])
        // console.log('Data:', data)
      }
    } catch (err: any) {
      setResult(`例外エラー: ${err.message}`)
      console.error('Exception:', err)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>基本テスト</h1>
      
      <button 
        onClick={testDirectConnection}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        データ取得テスト
      </button>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <strong>結果:</strong> {result}
      </div>

      {cards.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>取得したカード:</h2>
          {cards.map((card, index) => (
            <div key={card.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd' }}>
              <div>{index + 1}. {card.card_name}</div>
              <div>コード: {card.product_code}</div>
              <div>レアリティ: {card.rarity}</div>
              <div>価格: ¥{card.market_price}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}