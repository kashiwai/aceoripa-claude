'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function SimpleEditTestPage() {
  const [gachaId, setGachaId] = useState('781a323f-8da1-490e-a709-df196120f248')
  const [name, setName] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const loadGacha = async () => {
    try {
      const { data, error } = await supabase
        .from('gacha_products')
        .select('*')
        .eq('id', gachaId)
        .single()
      
      if (error) throw error
      
      setName(data.name)
      setBannerUrl(data.banner_image_url || '')
      toast.success('データを読み込みました')
    } catch (error: any) {
      toast.error('読み込みエラー: ' + error.message)
    }
  }

  const saveGacha = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('gacha_products')
        .update({
          name: name,
          banner_image_url: bannerUrl
        })
        .eq('id', gachaId)
      
      if (error) throw error
      
      toast.success('保存しました！')
    } catch (error: any) {
      toast.error('保存エラー: ' + error.message)
      console.error('詳細:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">シンプル編集テスト</h1>
      
      <div className="card">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">ガチャID</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={gachaId}
                onChange={(e) => setGachaId(e.target.value)}
              />
              <button onClick={loadGacha} className="btn btn-primary">
                読み込み
              </button>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label">ガチャ名</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">バナー画像URL</label>
            <input
              type="text"
              className="form-control"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="/images/banner.jpg"
            />
          </div>
          
          <button 
            onClick={saveGacha} 
            disabled={loading}
            className="btn btn-success"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        <a href="/admin/gacha" className="btn btn-secondary">戻る</a>
      </div>
    </div>
  )
}