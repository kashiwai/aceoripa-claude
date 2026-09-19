'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'

const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default function FixUrlsPage() {
  const [loading, setLoading] = useState(false)

  const fixUrls = async () => {
    setLoading(true)
    try {
      // 全てのカードの画像URLをAPIルートに変更
      const { error } = await supabaseAdmin
        .from('pokemon_cards')
        .update({ image_url: '/api/test-image' })
        .eq('image_url', '/images/ngcard.jpg')

      if (error) throw error

      toast.success('画像URLを更新しました')
    } catch (error) {
      console.error('Error:', error)
      toast.error('更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-5">
      <h1>画像URL修正</h1>
      
      <div className="alert alert-info">
        <p>画像URLをAPIルート経由に変更します。</p>
        <p>変更前: /images/ngcard.jpg</p>
        <p>変更後: /api/test-image</p>
      </div>

      <button 
        className="btn btn-primary"
        onClick={fixUrls}
        disabled={loading}
      >
        {loading ? '更新中...' : 'URLを修正'}
      </button>

      <div className="mt-4">
        <a href="/admin/cards" className="btn btn-secondary">カード管理に戻る</a>
      </div>
    </div>
  )
}