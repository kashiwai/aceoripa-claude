'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'

const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

export default function UpdateToNgcardPage() {
  const [loading, setLoading] = useState(false)
  const [previewUrl] = useState('/images/ngcard.jpg')

  const updateAllCards = async () => {
    setLoading(true)
    try {
      // /api/test-imageを使用している全カードを/images/ngcard.jpgに更新
      const { data: cards, error: fetchError } = await supabaseAdmin
        .from('pokemon_cards')
        .select('id, image_url')
        .eq('image_url', '/api/test-image')

      if (fetchError) throw fetchError

      if (cards && cards.length > 0) {
        const { error: updateError } = await supabaseAdmin
          .from('pokemon_cards')
          .update({ image_url: '/images/ngcard.jpg' })
          .eq('image_url', '/api/test-image')

        if (updateError) throw updateError
        
        toast.success(`${cards.length}件のカード画像URLを更新しました`)
      } else {
        toast.info('更新対象のカードがありません')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-5">
      <h1>カード画像URLを更新</h1>
      
      <div className="alert alert-info">
        <p>新しいngcard.jpgファイルがアップロードされました。</p>
        <p>APIルート（/api/test-image）を使用しているカードを、直接パス（/images/ngcard.jpg）に更新します。</p>
      </div>

      <div className="mb-4">
        <h3>新しいngcard.jpgのプレビュー</h3>
        <div className="card" style={{ width: '300px' }}>
          <img 
            src={previewUrl}
            alt="New ngcard.jpg"
            className="card-img-top"
            style={{ height: '420px', objectFit: 'cover' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.border = '2px solid red'
            }}
            onLoad={() => {
              toast.success('新しいngcard.jpgが正常に読み込まれました！')
            }}
          />
          <div className="card-body">
            <p className="card-text">パス: {previewUrl}</p>
          </div>
        </div>
      </div>

      <button 
        className="btn btn-primary"
        onClick={updateAllCards}
        disabled={loading}
      >
        {loading ? '更新中...' : 'データベースを更新'}
      </button>

      <div className="mt-4">
        <a href="/admin/cards" className="btn btn-secondary">カード管理に戻る</a>
      </div>
    </div>
  )
}