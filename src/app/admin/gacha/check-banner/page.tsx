'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

export default function CheckBannerPage() {
  const [loading, setLoading] = useState(true)
  const [gachaData, setGachaData] = useState<any[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchGachaData()
  }, [])

  const fetchGachaData = async () => {
    try {
      const { data, error } = await supabase
        .from('gacha_products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      console.log('Gacha data:', data)
      setGachaData(data || [])
      
      // banner_image_urlフィールドの存在を確認
      if (data && data.length > 0) {
        const hasBannerField = 'banner_image_url' in data[0]
        if (!hasBannerField) {
          toast('banner_image_urlフィールドが存在しません', { icon: '⚠️' })
        }
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('データ取得エラー: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addBannerUrls = async () => {
    setLoading(true)
    try {
      const images = [
        '/images/banners/real-gacha/S__44392515_0.jpg',
        '/images/banners/real-gacha/S__44392516_0.jpg',
        '/images/banners/real-gacha/S__44392517_0.jpg',
        '/images/banners/real-gacha/S__44392521_0.jpg',
        '/images/banners/real-gacha/S__44392523_0.jpg'
      ]
      
      // 各ガチャにバナー画像を設定
      for (let i = 0; i < gachaData.length && i < images.length; i++) {
        const { error } = await supabase
          .from('gacha_products')
          .update({ banner_image_url: images[i] })
          .eq('id', gachaData[i].id)
        
        if (error) {
          console.error('Update error:', error)
          toast.error(`更新エラー: ${error.message}`)
          return
        }
      }
      
      toast.success('バナー画像を設定しました')
      fetchGachaData() // 再読み込み
    } catch (error: any) {
      toast.error('エラー: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const createBannerColumn = () => {
    const sql = `
-- banner_image_urlカラムを追加
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS banner_image_url TEXT;

-- 既存データに画像を設定
UPDATE gacha_products 
SET banner_image_url = CASE 
  WHEN name LIKE '%ピカチュウ%' THEN '/images/banners/real-gacha/S__44392515_0.jpg'
  WHEN name LIKE '%ナンジャモ%' THEN '/images/banners/real-gacha/S__44392516_0.jpg'
  WHEN name LIKE '%リザードン%' THEN '/images/banners/real-gacha/S__44392517_0.jpg'
  WHEN name LIKE '%ブラッキー%' THEN '/images/banners/real-gacha/S__44392521_0.jpg'
  WHEN name LIKE '%リーリエ%' THEN '/images/banners/real-gacha/S__44392523_0.jpg'
  ELSE NULL
END
WHERE banner_image_url IS NULL;`
    
    navigator.clipboard.writeText(sql)
    toast.success('SQLをクリップボードにコピーしました')
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
      <h1 className="h2 mb-4">バナー画像診断</h1>
      
      <div className="mb-4">
        <button onClick={fetchGachaData} disabled={loading} className="btn btn-primary me-2">
          再読み込み
        </button>
        <button onClick={createBannerColumn} className="btn btn-warning me-2">
          カラム追加SQL生成
        </button>
        <button onClick={addBannerUrls} disabled={loading} className="btn btn-success">
          バナー画像を設定
        </button>
      </div>
      
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>名前</th>
              <th>現在のバナー画像</th>
              <th>画像プレビュー</th>
            </tr>
          </thead>
          <tbody>
            {gachaData.map((gacha) => (
              <tr key={gacha.id}>
                <td>{gacha.name}</td>
                <td>
                  {gacha.banner_image_url ? (
                    <code className="text-success">{gacha.banner_image_url}</code>
                  ) : (
                    <span className="text-danger">未設定</span>
                  )}
                </td>
                <td>
                  {gacha.banner_image_url && (
                    <img 
                      src={gacha.banner_image_url} 
                      alt={gacha.name}
                      style={{ height: '50px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.png'
                      }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="alert alert-info mt-4">
        <h5>説明</h5>
        <ul className="mb-0">
          <li>banner_image_urlフィールドが存在しない場合は、「カラム追加SQL生成」をクリックしてSQLを実行してください</li>
          <li>「バナー画像を設定」をクリックすると、各ガチャに適切な画像URLが設定されます</li>
        </ul>
      </div>
      
      <div className="mt-4">
        <a href="/admin/gacha" className="btn btn-secondary">ガチャ管理に戻る</a>
      </div>
    </div>
  )
}