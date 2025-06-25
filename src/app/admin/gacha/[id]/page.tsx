'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

interface GachaProduct {
  id: string
  name: string
  description: string
  price?: number
  single_price?: number
  multi_price?: number
  currency: string
  card_count: number
  bonus_cards: number
  is_active: boolean
  start_date?: string | null
  end_date?: string | null
  banner_image_url: string
  featured_card_ids?: string[]
  guarantee_sr_on_multi?: boolean
  total_stock: number
  sold_count: number
}

export default function EditGachaPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [formData, setFormData] = useState<GachaProduct | null>(null)
  
  useEffect(() => {
    fetchGachaData()
  }, [params?.id])
  
  const fetchGachaData = async () => {
    setIsLoading(true)
    try {
      // データベースからガチャ製品を取得
      const { data, error } = await supabase
        .from('gacha_products')
        .select('*')
        .eq('id', params?.id)
        .single()
      
      if (error) {
        throw error
      }
      
      // データが見つからない場合はエラー
      if (!data) {
        toast.error('指定されたガチャが見つかりません')
        router.push('/admin/gacha')
        return
      }
      
      setFormData({
        ...data,
        featured_card_ids: data.featured_card_ids || [],
        total_stock: data.total_stock || 1000,
        sold_count: data.sold_count || 0,
        guarantee_sr_on_multi: data.guarantee_sr_on_multi || false,
        // 必須フィールドのデフォルト値を設定
        currency: data.currency || 'JPY',
        bonus_cards: data.bonus_cards || 0,
        card_count: data.card_count || 1,
        // 価格フィールドの互換性を保つ
        single_price: data.single_price || data.price || 0,
        multi_price: data.multi_price || (data.single_price || data.price || 0) * 10
      })
    } catch (error) {
      console.error('Error fetching gacha:', error)
      toast.error('ガチャ情報の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return
    
    setIsSaving(true)
    
    try {
      // 更新データを準備（存在するフィールドのみ）
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        price: formData.price || formData.single_price || 0,
        currency: 'JPY', // 通貨は固定
        card_count: formData.card_count || 1,
        bonus_cards: 0, // ボーナスカードは今のところ0固定
        is_active: formData.is_active,
        banner_image_url: formData.banner_image_url || '',
        total_stock: formData.total_stock || 1000,
        // updated_atは自動的に更新されるため、明示的に設定しない
      }
      
      // single_priceとmulti_priceも更新
      if (formData.single_price !== undefined) {
        updateData.single_price = formData.single_price
      }
      if (formData.multi_price !== undefined) {
        updateData.multi_price = formData.multi_price
      }
      
      // start_dateとend_dateフィールドは存在しないため送信しない
      
      console.log('Updating gacha with data:', updateData)
      
      const { error } = await supabase
        .from('gacha_products')
        .update(updateData)
        .eq('id', params?.id)
      
      if (error) {
        console.error('Update error details:', error)
        throw error
      }
      
      toast.success('ガチャ情報を更新しました')
      router.push('/admin/gacha')
    } catch (error) {
      console.error('Error updating gacha:', error)
      toast.error('ガチャの更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleDelete = async () => {
    if (!confirm('本当にこのガチャを削除しますか？この操作は取り消せません。')) {
      return
    }
    
    setIsDeleting(true)
    
    try {
      const { error } = await supabase
        .from('gacha_products')
        .delete()
        .eq('id', params?.id)
      
      if (error) throw error
      
      toast.success('ガチャを削除しました')
      router.push('/admin/gacha')
    } catch (error) {
      console.error('Error deleting gacha:', error)
      toast.error('ガチャの削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }
  
  if (isLoading || !formData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{minHeight: '50vh'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }
  
  return (
    <div>
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/admin/gacha" className="text-decoration-none">
              ガチャ管理
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            ガチャ編集
          </li>
        </ol>
      </nav>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">ガチャ編集</h1>
          <p className="text-muted">ID: {params?.id}</p>
        </div>
      </div>
      
      <div className="row">
        {/* メインフォーム */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    ガチャ名
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">
                    説明
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-control"
                    rows={4}
                  />
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        単発価格（円）
                      </label>
                      <input
                        type="number"
                        value={formData.single_price || formData.price || 0}
                        onChange={(e) => {
                          const singlePrice = Number(e.target.value)
                          setFormData({ 
                            ...formData, 
                            single_price: singlePrice,
                            price: singlePrice, // priceも同期更新
                            // multi_priceを自動計算（10連の場合、通常は単価×10）
                            multi_price: formData.multi_price || (singlePrice * 10)
                          })
                        }}
                        className="form-control"
                        required
                        min="0"
                      />
                      <div className="form-text">
                        1回分の価格
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        10連価格（円）
                      </label>
                      <input
                        type="number"
                        value={formData.multi_price || (formData.single_price || formData.price || 0) * 10}
                        onChange={(e) => setFormData({ ...formData, multi_price: Number(e.target.value) })}
                        className="form-control"
                        required
                        min="0"
                      />
                      <div className="form-text">
                        10回分の価格（通常は単価×10）
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        カード枚数
                      </label>
                      <input
                        type="number"
                        value={formData.card_count || 1}
                        onChange={(e) => setFormData({ ...formData, card_count: Number(e.target.value) })}
                        className="form-control"
                        required
                        min="1"
                      />
                      <div className="form-text">
                        1回のガチャで出るカード枚数
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    {/* 空のカラムでレイアウト調整 */}
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        総販売枚数
                      </label>
                      <input
                        type="number"
                        value={formData.total_stock}
                        onChange={(e) => setFormData({ ...formData, total_stock: Number(e.target.value) })}
                        className="form-control"
                        required
                        min="1"
                      />
                      <div className="form-text">
                        このガチャで販売する総枚数を設定
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        販売済み枚数
                      </label>
                      <input
                        type="number"
                        value={formData.sold_count}
                        className="form-control"
                        disabled
                      />
                      <div className="form-text">
                        残り: {formData.total_stock - formData.sold_count}枚
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">
                    バナー画像URL
                  </label>
                  <input
                    type="text"
                    value={formData.banner_image_url}
                    onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                    className="form-control"
                    placeholder="/images/banner.jpg または https://example.com/banner.jpg"
                  />
                  <div className="form-text">
                    推奨サイズ: 1024×1024px | 相対パス（/images/...）または完全なURL（https://...）を入力できます
                  </div>
                </div>
                
                
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="form-check-input"
                    />
                    <label className="form-check-label" htmlFor="is_active">
                      公開する
                    </label>
                  </div>
                  
                </div>
                
                <div className="d-flex justify-content-between pt-3 border-top">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="btn btn-danger"
                  >
                    {isDeleting ? '削除中...' : '削除'}
                  </button>
                  
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="btn btn-secondary"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="btn btn-primary"
                    >
                      {isSaving ? '保存中...' : '保存'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* サイドバー */}
        <div className="col-lg-4">
          <div className="d-flex flex-column gap-4">
          {/* プレビュー */}
          <div className="card">
            <div className="card-body">
            <h5 className="card-title">バナープレビュー</h5>
            {formData.banner_image_url ? (
              <div className="position-relative" style={{aspectRatio: '1/1'}}>
                <Image
                  src={formData.banner_image_url}
                  alt={formData.name}
                  fill
                  className="rounded"
                  style={{objectFit: 'cover'}}
                  unoptimized
                />
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-center bg-light rounded" style={{aspectRatio: '1/1'}}>
                <p className="text-muted">画像URLを入力してください</p>
              </div>
            )}
            </div>
          </div>
          
          {/* クイックアクション */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">クイックアクション</h5>
              <div className="d-grid gap-2">
                <Link
                  href={`/admin/gacha/${params?.id}/pools`}
                  className="btn btn-success"
                >
                  確率設定を編集
                </Link>
                <Link
                  href={`/admin/image-generator?gacha_id=${params?.id}`}
                  className="btn btn-warning"
                >
                  バナー画像を生成
                </Link>
                <Link
                  href={`/gacha/${params?.id}`}
                  className="btn btn-secondary"
                  target="_blank"
                >
                  プレビューを確認
                </Link>
              </div>
            </div>
          </div>
          
          {/* ステータス情報 */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">ステータス</h5>
              <dl className="row">
                <div className="col-12 mb-3">
                  <dt className="small text-muted">公開状態</dt>
                  <dd className="mt-1">
                    <span className={`badge ${
                      formData.is_active 
                        ? 'bg-success' 
                        : 'bg-secondary'
                    }`}>
                      {formData.is_active ? '公開中' : '非公開'}
                    </span>
                  </dd>
                </div>
                <div className="col-12 mb-3">
                  <dt className="small text-muted">価格設定</dt>
                  <dd className="mt-1 small">
                    単発: ¥{formData.single_price}<br/>
                    10連: ¥{formData.multi_price}
                  </dd>
                </div>
                <div className="col-12 mb-3">
                  <dt className="small text-muted">販売状況</dt>
                  <dd className="mt-1 small">
                    販売済: {formData.sold_count}枚 / {formData.total_stock}枚<br/>
                    <div className="progress mt-1" style={{height: '10px'}}>
                      <div 
                        className="progress-bar bg-success" 
                        role="progressbar" 
                        style={{width: `${(formData.sold_count / formData.total_stock) * 100}%`}}
                      ></div>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}