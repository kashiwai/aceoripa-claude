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
      name: '超激レア！伝説のポケモンガチャ',
      description: 'ミュウツー、レックウザなど伝説のポケモンが手に入るかも！？',
      single_price: 500,
      multi_price: 4500,
      is_active: true,
      banner_image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
      featured_card_id: null,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        theme: 'legendary',
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
      name: '初心者応援！スターターガチャ',
      description: '初心者の方におすすめ！人気ポケモンが手に入りやすい！',
      single_price: 150,
      multi_price: 1350,
      is_active: true,
      banner_image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      featured_card_id: null,
      start_date: new Date().toISOString(),
      end_date: null,
      metadata: {
        theme: 'starter',
        rarityControl: {
          SS: { enabled: false, currentRate: 0.5, adjustedRate: 0 },
          S: { enabled: false, currentRate: 2, adjustedRate: 0 },
          A: { enabled: true, currentRate: 10, adjustedRate: 15 },
          B: { enabled: true, currentRate: 37.5, adjustedRate: 40 },
          C: { enabled: true, currentRate: 50, adjustedRate: 45 }
        }
      }
    },
    {
      name: '水タイプ限定ガチャ',
      description: '水タイプのポケモンだけが登場！カメックス、ギャラドスを狙え！',
      single_price: 300,
      multi_price: 2700,
      is_active: true,
      banner_image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
      featured_card_id: null,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        theme: 'water',
        type_filter: 'water',
        rarityControl: {
          SS: { enabled: false, currentRate: 0.5, adjustedRate: 0 },
          S: { enabled: true, currentRate: 2, adjustedRate: 2.5 },
          A: { enabled: true, currentRate: 10, adjustedRate: 12.5 },
          B: { enabled: true, currentRate: 37.5, adjustedRate: 40 },
          C: { enabled: true, currentRate: 50, adjustedRate: 45 }
        }
      }
    },
    {
      name: 'ドラゴンフェスティバル',
      description: '強力なドラゴンタイプが大集合！レアドラゴンの出現率UP！',
      single_price: 1000,
      multi_price: 9000,
      is_active: true,
      banner_image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png',
      featured_card_id: null,
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        theme: 'dragon',
        type_filter: 'dragon',
        rarityControl: {
          SS: { enabled: true, currentRate: 0.5, adjustedRate: 1 },
          S: { enabled: true, currentRate: 2, adjustedRate: 5 },
          A: { enabled: true, currentRate: 10, adjustedRate: 20 },
          B: { enabled: true, currentRate: 37.5, adjustedRate: 35 },
          C: { enabled: true, currentRate: 50, adjustedRate: 39 }
        }
      }
    },
    {
      name: '限定！色違いポケモンガチャ',
      description: '激レア！色違いポケモンが手に入るかもしれない特別ガチャ！',
      single_price: 5000,
      multi_price: 45000,
      is_active: false,
      banner_image_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/6.png',
      featured_card_id: null,
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        theme: 'shiny',
        special: true,
        rarityControl: {
          SS: { enabled: true, currentRate: 0.5, adjustedRate: 3 },
          S: { enabled: true, currentRate: 2, adjustedRate: 10 },
          A: { enabled: true, currentRate: 10, adjustedRate: 25 },
          B: { enabled: true, currentRate: 37.5, adjustedRate: 32 },
          C: { enabled: true, currentRate: 50, adjustedRate: 30 }
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