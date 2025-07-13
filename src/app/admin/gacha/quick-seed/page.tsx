'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function QuickSeedPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const seedGachaData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/gacha/seed', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        setTimeout(() => {
          router.push('/admin/gacha')
        }, 1500)
      } else {
        toast.error(data.error || 'ガチャ登録に失敗しました')
        console.error('Seed error:', data)
      }
    } catch (error) {
      console.error('Request error:', error)
      toast.error('リクエストエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">ガチャ商品クイック登録</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">登録するガチャ商品</h2>
        
        <div className="space-y-3 mb-6 text-sm">
          <div className="p-3 bg-blue-50 rounded">
            <strong>ピカチュウ大祭り</strong> - 150円
          </div>
          <div className="p-3 bg-green-50 rounded">
            <strong>ナンジャモ大量発生オリパ</strong> - 200円
          </div>
          <div className="p-3 bg-red-50 rounded">
            <strong>リザードン祭盤 炎のプレミアオリパ</strong> - 300円
          </div>
          <div className="p-3 bg-purple-50 rounded">
            <strong>ブラッキー超感謝祭</strong> - 250円
          </div>
          <div className="p-3 bg-yellow-50 rounded">
            <strong>リーリエ×マリオピカチュウ 超豪華オリパ</strong> - 400円
          </div>
        </div>
        
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-blue-700">
            現在トップページに表示されているガチャと同じデータをデータベースに登録します。
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={seedGachaData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-lg flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                登録中...
              </>
            ) : (
              'ガチャ商品を登録'
            )}
          </button>
          
          <button
            onClick={() => router.push('/admin/gacha')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}