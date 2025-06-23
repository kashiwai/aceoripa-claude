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
      // 画像URLが空の場合はデフォルト画像を設定
      const finalImageUrl = formData.image_url || '/images/ngcard.jpg'
      
      const { data, error } = await supabase
        .from('pokemon_cards')
        .insert([{
          ...formData,
          image_url: finalImageUrl
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('カードを追加しました')
      router.push('/admin/cards')
    } catch (error) {
      console.error('Error creating card:', error)
      toast.error('カードの追加に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/admin/cards" className="hover:text-gray-700">
            カード管理
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">新規カード追加</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">新規カード追加</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* フォーム */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カード名 *
              </label>
              <input
                type="text"
                value={formData.card_name}
                onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="例: ピカチュウex"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品コード *
              </label>
              <input
                type="text"
                value={formData.product_code}
                onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="例: PKM-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                レアリティ *
              </label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="SS">SS賞（超激レア）</option>
                <option value="S">S賞（激レア）</option>
                <option value="A">A賞（レア）</option>
                <option value="B">B賞（アンコモン）</option>
                <option value="C">C賞（コモン）</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                市場価格（円）*
              </label>
              <input
                type="number"
                min="0"
                value={formData.market_price}
                onChange={(e) => setFormData({ ...formData, market_price: Number(e.target.value) })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="例: 1000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                画像URL（オプション）
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://example.com/card.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                空の場合はデフォルト画像（/images/ngcard.jpg）が使用されます
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                説明（オプション）
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="カードの詳細説明..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '追加中...' : 'カード追加'}
              </button>
            </div>
          </form>
        </div>

        {/* プレビュー */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">プレビュー</h2>
          
          <div className="max-w-sm mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* カード画像 */}
              <div className="relative aspect-[2/3] bg-gray-100">
                <Image
                  src={formData.image_url || '/images/ngcard.jpg'}
                  alt="プレビュー"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/images/ngcard.jpg'
                  }}
                />
                {/* レアリティバッジ */}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold text-white ${
                  formData.rarity === 'SS' ? 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500' :
                  formData.rarity === 'S' ? 'bg-gradient-to-r from-purple-400 to-pink-400' :
                  formData.rarity === 'A' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                  formData.rarity === 'B' ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                  'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}>
                  {formData.rarity === 'SS' ? 'SS賞' :
                   formData.rarity === 'S' ? 'S賞' :
                   formData.rarity === 'A' ? 'A賞' :
                   formData.rarity === 'B' ? 'B賞' : 'C賞'}
                </div>
              </div>

              {/* カード情報 */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2 truncate">
                  {formData.card_name || 'カード名'}
                </h3>
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p>商品コード: {formData.product_code || 'コード'}</p>
                  <p className="font-semibold text-lg text-green-600">
                    ¥{formData.market_price?.toLocaleString() || '0'}
                  </p>
                </div>
                {formData.description && (
                  <p className="text-xs text-gray-500 line-clamp-3">
                    {formData.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* レアリティ説明 */}
          <div className="mt-6 space-y-2 text-sm">
            <h3 className="font-semibold text-gray-700">レアリティについて</h3>
            <div className="space-y-1 text-xs text-gray-500">
              <p><span className="font-semibold">SS賞:</span> 超激レア（排出率 ~1%）</p>
              <p><span className="font-semibold">S賞:</span> 激レア（排出率 ~4%）</p>
              <p><span className="font-semibold">A賞:</span> レア（排出率 ~15%）</p>
              <p><span className="font-semibold">B賞:</span> アンコモン（排出率 ~30%）</p>
              <p><span className="font-semibold">C賞:</span> コモン（排出率 ~50%）</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}