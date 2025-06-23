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
  single_price: number
  multi_price: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
  banner_image_url: string
  featured_card_ids: string[]
  guarantee_sr_on_multi: boolean
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
        featured_card_ids: data.featured_card_ids || []
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
      const { error } = await supabase
        .from('gacha_products')
        .update({
          name: formData.name,
          description: formData.description,
          single_price: formData.single_price,
          multi_price: formData.multi_price,
          is_active: formData.is_active,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          banner_image_url: formData.banner_image_url,
          featured_card_ids: formData.featured_card_ids,
          guarantee_sr_on_multi: formData.guarantee_sr_on_multi
        })
        .eq('id', params?.id)
      
      if (error) throw error
      
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
                        value={formData.single_price}
                        onChange={(e) => setFormData({ ...formData, single_price: Number(e.target.value) })}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        10連価格（円）
                      </label>
                      <input
                        type="number"
                        value={formData.multi_price}
                        onChange={(e) => setFormData({ ...formData, multi_price: Number(e.target.value) })}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">
                    バナー画像URL
                  </label>
                  <input
                    type="url"
                    value={formData.banner_image_url}
                    onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                    className="form-control"
                    placeholder="https://example.com/banner.jpg"
                  />
                  <div className="form-text">
                    推奨サイズ: 1024×1024px
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        開始日時
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.start_date || ''}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        終了日時
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.end_date || ''}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="form-control"
                      />
                    </div>
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
                  
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="guarantee_sr"
                      checked={formData.guarantee_sr_on_multi}
                      onChange={(e) => setFormData({ ...formData, guarantee_sr_on_multi: e.target.checked })}
                      className="form-check-input"
                    />
                    <label className="form-check-label" htmlFor="guarantee_sr">
                      10連でS賞以上確定
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
                  <dt className="small text-muted">期間</dt>
                  <dd className="mt-1 small">
                    {formData.start_date && formData.end_date ? (
                      <>
                        {new Date(formData.start_date).toLocaleDateString('ja-JP')}<br/>
                        〜 {new Date(formData.end_date).toLocaleDateString('ja-JP')}
                      </>
                    ) : (
                      '期間限定なし'
                    )}
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