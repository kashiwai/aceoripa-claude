'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function FixBannerPage() {
  const [loading, setLoading] = useState(true)
  const [gachaData, setGachaData] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingUrl, setEditingUrl] = useState('')
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchGachaData()
  }, [])

  const fetchGachaData = async () => {
    try {
      const { data, error } = await supabase
        .from('gacha_products')
        .select('id, name, banner_image_url, is_active')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      console.log('Gacha data with banner URLs:', data)
      setGachaData(data || [])
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('データ取得エラー: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateBannerUrl = async (id: string, url: string) => {
    try {
      const { error } = await supabase
        .from('gacha_products')
        .update({ banner_image_url: url })
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('バナー画像URLを更新しました')
      setEditingId(null)
      fetchGachaData()
    } catch (error: any) {
      toast.error('更新エラー: ' + error.message)
    }
  }

  const autoFixBanners = async () => {
    setLoading(true)
    try {
      const updates = [
        { name: 'ピカチュウ', url: '/images/banners/real-gacha/S__44392515_0.jpg' },
        { name: 'ナンジャモ', url: '/images/banners/real-gacha/S__44392516_0.jpg' },
        { name: 'リザードン', url: '/images/banners/real-gacha/S__44392517_0.jpg' },
        { name: 'ブラッキー', url: '/images/banners/real-gacha/S__44392521_0.jpg' },
        { name: 'リーリエ', url: '/images/banners/real-gacha/S__44392523_0.jpg' },
        { name: 'マリオ', url: '/images/banners/real-gacha/S__44392523_0.jpg' }
      ]
      
      for (const gacha of gachaData) {
        if (!gacha.banner_image_url || gacha.banner_image_url === '') {
          const update = updates.find(u => gacha.name.includes(u.name))
          if (update) {
            await updateBannerUrl(gacha.id, update.url)
          }
        }
      }
      
      toast.success('バナー画像の自動修正が完了しました')
      fetchGachaData()
    } catch (error: any) {
      toast.error('自動修正エラー: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">バナー画像URL修正</h1>
      
      <div className="mb-4 d-flex gap-2">
        <button onClick={fetchGachaData} disabled={loading} className="btn btn-primary">
          再読み込み
        </button>
        <button onClick={autoFixBanners} disabled={loading} className="btn btn-success">
          自動修正（未設定のみ）
        </button>
        <Link href="/admin/gacha" className="btn btn-secondary">
          ガチャ管理に戻る
        </Link>
      </div>
      
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th width="30%">ガチャ名</th>
              <th width="40%">バナー画像URL</th>
              <th width="15%">プレビュー</th>
              <th width="15%">アクション</th>
            </tr>
          </thead>
          <tbody>
            {gachaData.map((gacha) => (
              <tr key={gacha.id} className={!gacha.banner_image_url ? 'table-warning' : ''}>
                <td>
                  <div>{gacha.name}</div>
                  <small className={`badge ${gacha.is_active ? 'bg-success' : 'bg-secondary'}`}>
                    {gacha.is_active ? '公開中' : '非公開'}
                  </small>
                </td>
                <td>
                  {editingId === gacha.id ? (
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={editingUrl}
                        onChange={(e) => setEditingUrl(e.target.value)}
                        placeholder="画像URLを入力"
                      />
                      <button
                        className="btn btn-success"
                        onClick={() => updateBannerUrl(gacha.id, editingUrl)}
                      >
                        保存
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setEditingId(null)}
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <code className={gacha.banner_image_url ? 'text-success' : 'text-danger'}>
                      {gacha.banner_image_url || '未設定'}
                    </code>
                  )}
                </td>
                <td>
                  {gacha.banner_image_url && (
                    <img 
                      src={gacha.banner_image_url} 
                      alt={gacha.name}
                      style={{ height: '60px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.png'
                        e.currentTarget.onerror = null
                      }}
                    />
                  )}
                </td>
                <td>
                  {editingId !== gacha.id && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setEditingId(gacha.id)
                        setEditingUrl(gacha.banner_image_url || '')
                      }}
                    >
                      編集
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="alert alert-info mt-4">
        <h5>使用可能な画像</h5>
        <ul className="mb-0">
          <li>/images/banners/real-gacha/S__44392515_0.jpg - ピカチュウ</li>
          <li>/images/banners/real-gacha/S__44392516_0.jpg - ナンジャモ</li>
          <li>/images/banners/real-gacha/S__44392517_0.jpg - リザードン</li>
          <li>/images/banners/real-gacha/S__44392521_0.jpg - ブラッキー</li>
          <li>/images/banners/real-gacha/S__44392523_0.jpg - リーリエ/マリオ</li>
        </ul>
      </div>
    </div>
  )
}