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
      
      if (error && error.code !== 'PGRST116') {
        throw error
      }
      
      // データが見つからない場合はサンプルデータを使用
      if (!data) {
        const sampleGacha = {
          id: params?.id as string,
          name: 'ピカチュウ大祭り',
          description: 'ピカチュウがメインのプレミアムオリパ',
          single_price: 150,
          multi_price: 1400,
          is_active: true,
          start_date: null,
          end_date: null,
          banner_image_url: '/images/banners/real-gacha/S__44392515_0.jpg',
          featured_card_ids: [],
          guarantee_sr_on_multi: true
        }
        setFormData(sampleGacha)
      } else {
        setFormData({
          ...data,
          featured_card_ids: data.featured_card_ids || []
        })
      }
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ガチャ編集</h1>
          <p className="text-gray-600 mt-1">ID: {params?.id}</p>
        </div>
        <Link
          href="/admin/gacha"
          className="text-gray-600 hover:text-gray-900"
        >
          ← 一覧に戻る
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインフォーム */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ガチャ名
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                説明
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  単発価格（円）
                </label>
                <input
                  type="number"
                  value={formData.single_price}
                  onChange={(e) => setFormData({ ...formData, single_price: Number(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  10連価格（円）
                </label>
                <input
                  type="number"
                  value={formData.multi_price}
                  onChange={(e) => setFormData({ ...formData, multi_price: Number(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                バナー画像URL
              </label>
              <input
                type="url"
                value={formData.banner_image_url}
                onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://example.com/banner.jpg"
              />
              <p className="mt-1 text-sm text-gray-500">
                推奨サイズ: 1024×1024px
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始日時
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  終了日時
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">公開する</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.guarantee_sr_on_multi}
                  onChange={(e) => setFormData({ ...formData, guarantee_sr_on_multi: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">10連でSR以上確定</span>
              </label>
            </div>
            
            <div className="flex justify-between pt-6 border-t">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? '削除中...' : '削除'}
              </button>
              
              <div className="space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* サイドバー */}
        <div className="space-y-6">
          {/* プレビュー */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">バナープレビュー</h3>
            {formData.banner_image_url ? (
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={formData.banner_image_url}
                  alt={formData.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">画像URLを入力してください</p>
              </div>
            )}
          </div>
          
          {/* クイックアクション */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h3>
            <div className="space-y-3">
              <Link
                href={`/admin/gacha/${params?.id}/pools`}
                className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                確率設定を編集
              </Link>
              <Link
                href={`/admin/image-generator?gacha_id=${params?.id}`}
                className="block w-full text-center bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
              >
                バナー画像を生成
              </Link>
              <Link
                href={`/gacha/${params?.id}`}
                className="block w-full text-center bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                target="_blank"
              >
                プレビューを確認
              </Link>
            </div>
          </div>
          
          {/* ステータス情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ステータス</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">公開状態</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                    formData.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.is_active ? '公開中' : '非公開'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">価格設定</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  単発: ¥{formData.single_price}<br/>
                  10連: ¥{formData.multi_price}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">期間</dt>
                <dd className="mt-1 text-sm text-gray-900">
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
  )
}