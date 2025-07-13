'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function SeedSampleGachaPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const sampleGachas = [
    {
      name: 'ピカチュウ大祭り',
      description: 'ピカチュウの特別なカードが大量出現！\nSSR確率アップ中！',
      price: 150,
      single_price: 150,
      multi_price: 1350,
      card_count: 1,
      bonus_cards: 0,
      is_active: true,
      banner_image_url: '/images/banners/real-gacha/S__44392515_0.jpg',
      metadata: {
        theme: 'pikachu',
        rarityControl: {
          SS: { enabled: true, currentRate: 1, adjustedRate: 1 },
          S: { enabled: true, currentRate: 4, adjustedRate: 4 },
          A: { enabled: true, currentRate: 15, adjustedRate: 15 },
          B: { enabled: true, currentRate: 30, adjustedRate: 30 },
          C: { enabled: true, currentRate: 50, adjustedRate: 50 }
        }
      }
    },
    {
      name: 'ナンジャモ大量発生オリパ',
      description: 'ナンジャモの激レアカードが手に入るチャンス！',
      price: 200,
      single_price: 200,
      multi_price: 1800,
      card_count: 1,
      bonus_cards: 0,
      is_active: true,
      banner_image_url: '/images/banners/real-gacha/S__44392516_0.jpg',
      metadata: {
        theme: 'nanjamo',
        rarityControl: {
          SS: { enabled: true, currentRate: 0.5, adjustedRate: 0.5 },
          S: { enabled: true, currentRate: 2, adjustedRate: 2 },
          A: { enabled: true, currentRate: 10, adjustedRate: 10 },
          B: { enabled: true, currentRate: 37.5, adjustedRate: 37.5 },
          C: { enabled: true, currentRate: 50, adjustedRate: 50 }
        }
      }
    },
    {
      name: 'リザードン祭盤 炎のプレミアオリパ',
      description: '炎タイプの最強カードが集結！リザードンを狙え！',
      price: 300,
      single_price: 300,
      multi_price: 2700,
      card_count: 1,
      bonus_cards: 0,
      is_active: true,
      banner_image_url: '/images/banners/real-gacha/S__44392517_0.jpg',
      metadata: {
        theme: 'charizard',
        type_filter: 'fire',
        rarityControl: {
          SS: { enabled: true, currentRate: 2, adjustedRate: 2 },
          S: { enabled: true, currentRate: 8, adjustedRate: 8 },
          A: { enabled: true, currentRate: 20, adjustedRate: 20 },
          B: { enabled: true, currentRate: 30, adjustedRate: 30 },
          C: { enabled: true, currentRate: 40, adjustedRate: 40 }
        }
      }
    },
    {
      name: 'ブラッキー超感謝祭',
      description: 'ブラッキーの特別なカードが登場！ファン必見！',
      price: 250,
      single_price: 250,
      multi_price: 2250,
      card_count: 1,
      bonus_cards: 0,
      is_active: true,
      banner_image_url: '/images/banners/real-gacha/S__44392518_0.jpg',
      metadata: {
        theme: 'umbreon',
        rarityControl: {
          SS: { enabled: true, currentRate: 1.5, adjustedRate: 1.5 },
          S: { enabled: true, currentRate: 6, adjustedRate: 6 },
          A: { enabled: true, currentRate: 17.5, adjustedRate: 17.5 },
          B: { enabled: true, currentRate: 35, adjustedRate: 35 },
          C: { enabled: true, currentRate: 40, adjustedRate: 40 }
        }
      }
    },
    {
      name: 'リーリエ×マリオピカチュウ 超豪華オリパ',
      description: '最高級レアカードが勢揃い！プレミアム体験をあなたに！',
      price: 400,
      single_price: 400,
      multi_price: 3600,
      card_count: 1,
      bonus_cards: 0,
      is_active: true,
      banner_image_url: '/images/banners/real-gacha/S__44392519_0.jpg',
      metadata: {
        theme: 'premium',
        special: true,
        rarityControl: {
          SS: { enabled: true, currentRate: 3, adjustedRate: 3 },
          S: { enabled: true, currentRate: 12, adjustedRate: 12 },
          A: { enabled: true, currentRate: 25, adjustedRate: 25 },
          B: { enabled: true, currentRate: 30, adjustedRate: 30 },
          C: { enabled: true, currentRate: 30, adjustedRate: 30 }
        }
      }
    }
  ]

  const seedSampleData = async () => {
    setLoading(true)
    
    try {
      // 既存のガチャをチェック
      const { data: existingGachas, error: checkError } = await supabase
        .from('gacha_products')
        .select('id')
        .limit(1)
      
      if (checkError) {
        console.error('Error checking existing gachas:', checkError)
        toast.error('データベースエラー: ' + checkError.message)
        return
      }

      if (existingGachas && existingGachas.length > 0) {
        const confirmed = confirm('既存のガチャデータがあります。サンプルデータを追加しますか？')
        if (!confirmed) {
          return
        }
      }

      // サンプルガチャを挿入
      const { data, error } = await supabase
        .from('gacha_products')
        .insert(sampleGachas)
        .select()
      
      if (error) {
        console.error('Error inserting sample gachas:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        console.error('Sample data being inserted:', JSON.stringify(sampleGachas, null, 2))
        toast.error('サンプルデータの挿入に失敗しました: ' + error.message)
        return
      }

      toast.success(`${data.length}個のサンプルガチャを登録しました！`)
      
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
      <h1 className="h2 mb-4">サンプルガチャデータ登録</h1>
      
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">以下のサンプルガチャを登録します</h5>
          
          <div className="list-group mb-4">
            {sampleGachas.map((gacha, index) => (
              <div key={index} className="list-group-item">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">{gacha.name}</h6>
                  <small className={`badge ${gacha.is_active ? 'bg-success' : 'bg-secondary'}`}>
                    {gacha.is_active ? '公開' : '非公開'}
                  </small>
                </div>
                <p className="mb-1 small text-muted">{gacha.description}</p>
                <small>単発: ¥{gacha.single_price} / 10連: ¥{gacha.multi_price}</small>
              </div>
            ))}
          </div>
          
          <button
            onClick={seedSampleData}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                登録中...
              </>
            ) : (
              'サンプルデータを登録'
            )}
          </button>
          
          <a href="/admin/gacha" className="btn btn-secondary ms-2">
            キャンセル
          </a>
        </div>
      </div>
    </div>
  )
}