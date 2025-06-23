'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import GachaAnimationPreview from '@/components/admin/GachaAnimationPreview'

export default function EditGachaPage() {
  const router = useRouter()
  const params = useParams()
  const gachaId = params.id as string
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  
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
    guarantee_sr_on_multi: true,
    // 追加フィールド
    total_stock: 1000,
    is_free_points_only: false,
    required_user_rank: '',
    cost_per_card: 50,
    ss_guarantee_threshold: 0.7,
    ss_animation_type: 'premium',
    s_animation_type: 'special',
    a_animation_type: 'normal',
    b_animation_type: 'normal',
    c_animation_type: 'normal'
  })
  
  const [profitInfo, setProfitInfo] = useState({
    totalRevenue: 0,
    totalCost: 0,
    profit: 0,
    profitRate: 0,
    ssGuaranteeActive: false
  })
  
  // ガチャデータの取得
  useEffect(() => {
    const fetchGachaData = async () => {
      try {
        const { data, error } = await supabase
          .from('gacha_products')
          .select('*')
          .eq('id', gachaId)
          .single()
        
        if (error) throw error
        
        if (data) {
          // メタデータから追加情報を取得
          const metadata = data.metadata || {}
          
          setFormData({
            name: data.name || '',
            description: data.description || '',
            single_price: data.single_price || 150,
            multi_price: data.multi_price || 1500,
            is_active: data.is_active ?? true,
            start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : '',
            end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : '',
            banner_image_url: data.banner_image_url || '',
            featured_card_ids: data.featured_card_ids?.join(', ') || '',
            guarantee_sr_on_multi: data.guarantee_sr_on_multi ?? true,
            // メタデータから復元
            total_stock: metadata.total_stock || 1000,
            is_free_points_only: metadata.is_free_points_only || false,
            required_user_rank: metadata.required_user_rank || '',
            cost_per_card: metadata.cost_per_card || 50,
            ss_guarantee_threshold: metadata.ss_guarantee_threshold || 0.7,
            ss_animation_type: metadata.animation_settings?.SS || 'premium',
            s_animation_type: metadata.animation_settings?.S || 'special',
            a_animation_type: metadata.animation_settings?.A || 'normal',
            b_animation_type: metadata.animation_settings?.B || 'normal',
            c_animation_type: metadata.animation_settings?.C || 'normal'
          })
        }
      } catch (error) {
        console.error('Error fetching gacha:', error)
        toast.error('ガチャ情報の取得に失敗しました')
      } finally {
        setIsLoadingData(false)
      }
    }
    
    fetchGachaData()
  }, [gachaId, supabase])
  
  // 利益計算を自動更新
  useEffect(() => {
    const totalRevenue = formData.single_price * formData.total_stock
    const totalCost = formData.cost_per_card * formData.total_stock
    const profit = totalRevenue - totalCost
    const profitRate = totalRevenue > 0 ? profit / totalRevenue : 0
    const ssGuaranteeActive = profitRate <= formData.ss_guarantee_threshold
    
    setProfitInfo({
      totalRevenue,
      totalCost,
      profit,
      profitRate,
      ssGuaranteeActive
    })
  }, [formData.single_price, formData.total_stock, formData.cost_per_card, formData.ss_guarantee_threshold])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // メタデータとして追加情報を保存
      const metadata = {
        total_stock: formData.total_stock,
        is_free_points_only: formData.is_free_points_only,
        required_user_rank: formData.required_user_rank,
        cost_per_card: formData.cost_per_card,
        ss_guarantee_threshold: formData.ss_guarantee_threshold,
        animation_settings: {
          SS: formData.ss_animation_type,
          S: formData.s_animation_type,
          A: formData.a_animation_type,
          B: formData.b_animation_type,
          C: formData.c_animation_type
        },
        profit_info: profitInfo
      }
      
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
          featured_card_ids: formData.featured_card_ids 
            ? formData.featured_card_ids.split(',').map(id => id.trim())
            : [],
          guarantee_sr_on_multi: formData.guarantee_sr_on_multi,
          metadata: metadata
        })
        .eq('id', gachaId)
      
      if (error) throw error
      
      toast.success('ガチャを更新しました')
      router.push('/admin/gacha')
    } catch (error) {
      console.error('Error updating gacha:', error)
      toast.error('ガチャの更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/admin/gacha" className="hover:text-gray-700">
            ガチャ管理
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">ガチャ編集</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">ガチャ編集</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">基本情報</h2>
          
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
          
          <div className="grid grid-cols-3 gap-4">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                総販売数
              </label>
              <select
                value={formData.total_stock}
                onChange={(e) => setFormData({ ...formData, total_stock: Number(e.target.value) })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value={1000}>1,000回</option>
                <option value={3000}>3,000回</option>
                <option value={5000}>5,000回</option>
                <option value={10000}>10,000回</option>
              </select>
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
          
          <div className="grid grid-cols-2 gap-4">
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
                <span className="ml-2 text-sm text-gray-700">10連でS以上確定</span>
              </label>
            </div>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_free_points_only}
                onChange={(e) => setFormData({ ...formData, is_free_points_only: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">無料ポイント専用</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              必要ユーザーランク（任意）
            </label>
            <select
              value={formData.required_user_rank}
              onChange={(e) => setFormData({ ...formData, required_user_rank: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">制限なし</option>
              <option value="bronze">ブロンズ以上</option>
              <option value="silver">シルバー以上</option>
              <option value="gold">ゴールド以上</option>
              <option value="platinum">プラチナ以上</option>
              <option value="diamond">ダイヤモンド以上</option>
            </select>
          </div>
        </div>
        
        {/* コスト・利益計算 */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">コスト・利益計算</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カード原価（平均/枚）
              </label>
              <input
                type="number"
                value={formData.cost_per_card}
                onChange={(e) => setFormData({ ...formData, cost_per_card: Number(e.target.value) })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SS確定利益率閾値
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.ss_guarantee_threshold}
                onChange={(e) => setFormData({ ...formData, ss_guarantee_threshold: Number(e.target.value) })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">利益率がこの値以下の場合、SS賞を1枚確定で出現させます</p>
            </div>
          </div>
          
          {/* 利益計算結果表示 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3">収益シミュレーション</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">総売上:</span>
                <span className="ml-2 font-bold">¥{profitInfo.totalRevenue.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">総原価:</span>
                <span className="ml-2 font-bold">¥{profitInfo.totalCost.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">利益:</span>
                <span className={`ml-2 font-bold ${profitInfo.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ¥{profitInfo.profit.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">利益率:</span>
                <span className={`ml-2 font-bold ${profitInfo.profitRate >= formData.ss_guarantee_threshold ? 'text-green-600' : 'text-red-600'}`}>
                  {(profitInfo.profitRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            {profitInfo.ssGuaranteeActive && (
              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-400 rounded">
                <p className="text-sm text-yellow-800">
                  ⚠️ 利益率が閾値以下のため、SS賞が1枚確定で出現します（非公開設定）
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* 演出設定 */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">レアリティ別演出設定</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SS賞演出
              </label>
              <select
                value={formData.ss_animation_type}
                onChange={(e) => setFormData({ ...formData, ss_animation_type: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="premium">プレミアム演出（虹色＋爆発）</option>
                <option value="special">特別演出（金色＋キラキラ）</option>
                <option value="normal">通常演出</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                S賞演出
              </label>
              <select
                value={formData.s_animation_type}
                onChange={(e) => setFormData({ ...formData, s_animation_type: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="special">特別演出（金色＋キラキラ）</option>
                <option value="normal">通常演出</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                A賞演出
              </label>
              <select
                value={formData.a_animation_type}
                onChange={(e) => setFormData({ ...formData, a_animation_type: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="normal">通常演出</option>
                <option value="special">特別演出</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                B賞演出
              </label>
              <select
                value={formData.b_animation_type}
                onChange={(e) => setFormData({ ...formData, b_animation_type: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="normal">通常演出</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                C賞演出
              </label>
              <select
                value={formData.c_animation_type}
                onChange={(e) => setFormData({ ...formData, c_animation_type: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="normal">通常演出</option>
              </select>
            </div>
          </div>
          
          {/* 演出プレビュー */}
          <GachaAnimationPreview animationSettings={{
            SS: formData.ss_animation_type,
            S: formData.s_animation_type,
            A: formData.a_animation_type,
            B: formData.b_animation_type,
            C: formData.c_animation_type
          }} />
        </div>
        
        <div className="flex justify-between items-center">
          <Link
            href={`/admin/gacha/${gachaId}/pools`}
            className="text-blue-600 hover:text-blue-700"
          >
            カードプール設定へ →
          </Link>
          
          <div className="flex space-x-4">
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
              {isLoading ? '更新中...' : '更新'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}