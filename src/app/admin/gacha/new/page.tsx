'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function NewGachaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    single_price: 150,
    multi_price: 1500,
    is_active: true,
    start_date: '',
    end_date: '',
    banner_image_url: '',
    featured_card_ids: '',
    guarantee_sr_on_multi: true
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('gacha_products')
        .insert([{
          ...formData,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          featured_card_ids: formData.featured_card_ids 
            ? formData.featured_card_ids.split(',').map(id => id.trim())
            : []
        }])
        .select()
        .single()
      
      if (error) throw error
      
      toast.success('ガチャを作成しました')
      router.push(`/admin/gacha/${data.id}/pools`)
    } catch (error) {
      console.error('Error creating gacha:', error)
      toast.error('ガチャの作成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">新規ガチャ作成</h1>
      
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
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              単発価格（ポイント）
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
              10連価格（ポイント）
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
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              開始日（任意）
            </label>
            <input
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              終了日（任意）
            </label>
            <input
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ピックアップカードID（カンマ区切り）
          </label>
          <input
            type="text"
            value={formData.featured_card_ids}
            onChange={(e) => setFormData({ ...formData, featured_card_ids: e.target.value })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="card1, card2, card3"
          />
        </div>
        
        <div className="flex items-center space-x-4">
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
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '作成中...' : '作成'}
          </button>
        </div>
      </form>
    </div>
  )
}