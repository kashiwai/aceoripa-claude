'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function MigrateSampleDataPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const sampleGachas = [
    {
      name: 'ピカチュウ大祭り',
      description: 'マリオピカチュウPSA10確定！激アツのピカチュウ祭り開催中！',
      single_price: 150,
      multi_price: 1350,
      is_active: true,
      banner_image_url: '/images/banners/real-gacha/S__44392515_0.jpg',
      featured_card_id: null,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {}
    },
    {
      name: 'ナンジャモ大量発生オリパ',
      description: 'ナンジャモSRが狙い目！大量発生中の今がチャンス！',
      single_price: 200,
      multi_price: 1800,
      is_active: true,
      banner_image_url: '/images/banners/real-gacha/S__44392516_0.jpg',
      featured_card_id: null,
      start_date: new Date().toISOString(),
      end_date: null,
      metadata: {}
    },
    {
      name: 'リザードン祭盤 炎のプレミアオリパ',
      description: 'リザードンex、リザードンVSTAR、歴代リザードンが大集結！',
      single_price: 300,
      multi_price: 2700,
      is_active: true,
      banner_image_url: '/images/banners/real-gacha/S__44392517_0.jpg',
      featured_card_id: null,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {}
    },
    {
      name: 'ブラッキー超感謝祭',
      description: 'ブラッキーex PSA10確率3倍！月光ポケモンの魅力満載！',
      single_price: 250,
      multi_price: 2250,
      is_active: true,
      banner_image_url: '/images/banners/real-gacha/S__44392521_0.jpg',
      featured_card_id: null,
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {}
    },
    {
      name: 'リーリエ×マリオピカチュウ 超豪華オリパ',
      description: 'リーリエSR、マリオピカチュウPSA10など超豪華ラインナップ！',
      single_price: 400,
      multi_price: 3600,
      is_active: true,
      banner_image_url: '/images/banners/real-gacha/S__44392523_0.jpg',
      featured_card_id: null,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {}
    }
  ]

  const migrateSampleData = async () => {
    setLoading(true)
    
    try {
      // 既存のガチャをチェック
      const { data: existingGachas, error: checkError } = await supabase
        .from('gacha_products')
        .select('id, name')
      
      if (checkError) {
        console.error('Error checking existing gachas:', checkError)
        toast.error('データベースエラー: ' + checkError.message)
        return
      }

      if (existingGachas && existingGachas.length > 0) {
        toast.error('既にガチャデータが存在します。一度削除してから実行してください。')
        return
      }

      // サンプルガチャを挿入
      const { data, error } = await supabase
        .from('gacha_products')
        .insert(sampleGachas)
        .select()
      
      if (error) {
        console.error('Error inserting sample gachas:', error)
        toast.error('サンプルデータの挿入に失敗しました: ' + error.message)
        return
      }

      toast.success(`${data.length}個のガチャをデータベースに登録しました！`)
      
      // ガチャ管理ページにリダイレクト
      setTimeout(() => {
        router.push('/admin/gacha')
      }, 1000)
      
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">TOPページのガチャをデータベースに移行</h1>
      
      <div className="alert alert-info mb-4">
        <h5 className="alert-heading">📋 説明</h5>
        <p>現在TOPページに表示されている5つのガチャは、APIのハードコードされたデータから表示されています。</p>
        <p className="mb-0">このツールを使用して、これらのガチャを実際のデータベースに登録します。</p>
      </div>
      
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">以下のガチャをデータベースに登録します</h5>
          
          <div className="list-group mb-4">
            {sampleGachas.map((gacha, index) => (
              <div key={index} className="list-group-item">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">{gacha.name}</h6>
                  <div>
                    <span className="badge bg-info me-2">
                      {gacha.name.length}文字
                    </span>
                    <span className={`badge ${gacha.is_active ? 'bg-success' : 'bg-secondary'}`}>
                      {gacha.is_active ? '公開' : '非公開'}
                    </span>
                  </div>
                </div>
                <p className="mb-1 small text-muted">{gacha.description}</p>
                <small>単発: ¥{gacha.single_price} / 10連: ¥{gacha.multi_price}</small>
              </div>
            ))}
          </div>
          
          <button
            onClick={migrateSampleData}
            disabled={loading}
            className="btn btn-primary btn-lg"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                データベースに登録中...
              </>
            ) : (
              'データベースに登録'
            )}
          </button>
          
          <a href="/admin/gacha" className="btn btn-secondary btn-lg ms-2">
            キャンセル
          </a>
        </div>
      </div>
      
      <div className="alert alert-warning mt-4">
        <h5 className="alert-heading">⚠️ 注意事項</h5>
        <ul className="mb-0">
          <li>既にデータベースにガチャが存在する場合は、このツールは実行できません</li>
          <li>登録後は、管理画面からガチャの編集・削除が可能です</li>
          <li>画像パスは既存のものを使用します</li>
        </ul>
      </div>
    </div>
  )
}