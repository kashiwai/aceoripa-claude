'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

export default function NewCardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    card_name: '',
    product_code: '',
    rarity: 'C',
    image_url: '',
    market_price: 0,
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // APIルートを使用してカードを作成
      const response = await fetch('/api/admin/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'カードの追加に失敗しました')
      }

      toast.success('カードを追加しました')
      router.push('/admin/cards')
    } catch (error: any) {
      console.error('Error creating card:', error)
      toast.error(error.message || 'カードの追加に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/admin/cards" className="text-decoration-none">
              カード管理
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            新規カード追加
          </li>
        </ol>
      </nav>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">新規カード追加</h1>
      </div>

      <div className="row">
        {/* フォーム */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    カード名 *
                  </label>
                  <input
                    type="text"
                    value={formData.card_name}
                    onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
                    className="form-control"
                    placeholder="例: ピカチュウex"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    商品コード *
                  </label>
                  <input
                    type="text"
                    value={formData.product_code}
                    onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                    className="form-control"
                    placeholder="例: PKM-001"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    レアリティ *
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="SS">SS賞（超激レア）</option>
                    <option value="S">S賞（激レア）</option>
                    <option value="A">A賞（レア）</option>
                    <option value="B">B賞（アンコモン）</option>
                    <option value="C">C賞（コモン）</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    市場価格（円）*
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.market_price}
                    onChange={(e) => setFormData({ ...formData, market_price: Number(e.target.value) })}
                    className="form-control"
                    placeholder="例: 1000"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    画像URL（オプション）
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="form-control"
                    placeholder="https://example.com/card.jpg"
                  />
                  <div className="form-text">
                    空の場合はデフォルト画像（/images/ngcard.jpg）が使用されます
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    説明（オプション）
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-control"
                    rows={3}
                    placeholder="カードの詳細説明..."
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn btn-secondary flex-fill"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary flex-fill"
                  >
                    {isLoading ? '追加中...' : 'カード追加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* プレビュー */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">プレビュー</h5>
              
              <div className="d-flex justify-content-center">
                <div className="card" style={{maxWidth: '300px'}}>
                  {/* カード画像 */}
                  <div className="position-relative bg-light" style={{aspectRatio: '2/3'}}>
                    <Image
                      src={formData.image_url || '/images/ngcard.jpg'}
                      alt="プレビュー"
                      fill
                      className="card-img-top"
                      style={{objectFit: 'cover'}}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/ngcard.jpg'
                      }}
                    />
                    {/* レアリティバッジ */}
                    <span className={`position-absolute top-0 start-0 m-2 badge ${
                      formData.rarity === 'SS' ? 'bg-warning' :
                      formData.rarity === 'S' ? 'bg-info' :
                      formData.rarity === 'A' ? 'bg-primary' :
                      formData.rarity === 'B' ? 'bg-success' : 'bg-secondary'
                    }`}>
                      {formData.rarity === 'SS' ? 'SS賞' :
                       formData.rarity === 'S' ? 'S賞' :
                       formData.rarity === 'A' ? 'A賞' :
                       formData.rarity === 'B' ? 'B賞' : 'C賞'}
                    </span>
                  </div>

                  {/* カード情報 */}
                  <div className="card-body">
                    <h5 className="card-title text-truncate">
                      {formData.card_name || 'カード名'}
                    </h5>
                    <div className="mb-3">
                      <small className="text-muted">商品コード: {formData.product_code || 'コード'}</small><br/>
                      <span className="h5 text-success">
                        ¥{formData.market_price?.toLocaleString() || '0'}
                      </span>
                    </div>
                    {formData.description && (
                      <p className="card-text text-muted small">
                        {formData.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* レアリティ説明 */}
              <div className="mt-4">
                <h6>レアリティについて</h6>
                <div className="small text-muted">
                  <div><strong>SS賞:</strong> 超激レア（排出率 ~1%）</div>
                  <div><strong>S賞:</strong> 激レア（排出率 ~4%）</div>
                  <div><strong>A賞:</strong> レア（排出率 ~15%）</div>
                  <div><strong>B賞:</strong> アンコモン（排出率 ~30%）</div>
                  <div><strong>C賞:</strong> コモン（排出率 ~50%）</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}