'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'

const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

export default function UpdateImagesPage() {
  const [loading, setLoading] = useState(false)

  const updateImages = async () => {
    setLoading(true)
    try {
      // 現在のngcard.jpgを使用している全てのカードを更新
      const { data, error } = await supabaseAdmin
        .from('pokemon_cards')
        .update({ image_url: '/images/pokemon-cards/pikachu-card.png' })
        .eq('image_url', '/images/ngcard.jpg')

      if (error) throw error

      const { count } = await supabaseAdmin
        .from('pokemon_cards')
        .select('*', { count: 'exact', head: true })
        .eq('image_url', '/images/pokemon-cards/pikachu-card.png')

      toast.success(`${count}件のカード画像を更新しました`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('画像の更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-5">
      <h1>カード画像一括更新</h1>
      
      <div className="alert alert-info">
        <p>このページでは、JPG画像の表示問題を解決するため、全てのカード画像をPNG形式に更新します。</p>
        <p>更新前: /images/ngcard.jpg</p>
        <p>更新後: /images/pokemon-cards/pikachu-card.png</p>
      </div>

      <button 
        className="btn btn-primary"
        onClick={updateImages}
        disabled={loading}
      >
        {loading ? '更新中...' : '画像を一括更新'}
      </button>

      <div className="mt-4">
        <a href="/admin/cards" className="btn btn-secondary">カード管理に戻る</a>
      </div>
    </div>
  )
}