'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AutoCreatePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  const createGachas = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/gacha/auto-create', {
        method: 'POST'
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setTimeout(() => {
          router.push('/admin/gacha')
        }, 3000)
      }
    } catch (error) {
      console.error('Auto create error:', error)
      setResult({
        success: false,
        error: 'リクエストエラーが発生しました'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">ガチャ商品自動作成</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">作成するガチャ商品</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-blue-600">ピカチュウ大祭り</h3>
            <p className="text-sm text-gray-600">単発: ¥150 / 10連: ¥1,350</p>
            <p className="text-xs text-gray-500 mt-1">ピカチュウの特別なカードが大量出現！</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-green-600">ナンジャモ大量発生オリパ</h3>
            <p className="text-sm text-gray-600">単発: ¥200 / 10連: ¥1,800</p>
            <p className="text-xs text-gray-500 mt-1">ナンジャモの激レアカードが手に入るチャンス！</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-red-600">リザードン祭盤 炎のプレミアオリパ</h3>
            <p className="text-sm text-gray-600">単発: ¥300 / 10連: ¥2,700</p>
            <p className="text-xs text-gray-500 mt-1">炎タイプの最強カードが集結！</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-purple-600">ブラッキー超感謝祭</h3>
            <p className="text-sm text-gray-600">単発: ¥250 / 10連: ¥2,250</p>
            <p className="text-xs text-gray-500 mt-1">ブラッキーの特別なカードが登場！</p>
          </div>
          
          <div className="border rounded-lg p-4 md:col-span-2">
            <h3 className="font-bold text-yellow-600">リーリエ×マリオピカチュウ 超豪華オリパ</h3>
            <p className="text-sm text-gray-600">単発: ¥400 / 10連: ¥3,600</p>
            <p className="text-xs text-gray-500 mt-1">最高級レアカードが勢揃い！プレミアム体験をあなたに！</p>
          </div>
        </div>
        
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6">
          <h4 className="font-bold text-blue-800 mb-2">各ガチャに含まれる設定:</h4>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>総販売数: 1,000回</li>
            <li>10連でS以上確定機能</li>
            <li>レアリティ別演出設定（SS:プレミアム、S:特別、A/B/C:通常）</li>
            <li>利益率計算機能（SS確定閾値: 70%）</li>
            <li>バナー画像設定済み</li>
          </ul>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={createGachas}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3 px-6 rounded-lg flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                作成中...
              </>
            ) : (
              '5つのガチャを一括作成'
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
      
      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">
            {result.success ? '✅ 作成結果' : '❌ エラー'}
          </h3>
          
          {result.success ? (
            <div>
              <p className="text-green-600 font-medium mb-3">{result.message}</p>
              <div className="space-y-2">
                {result.products?.map((product: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-sm text-gray-600">ID: {product.id}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                3秒後にガチャ管理ページに自動的に移動します...
              </p>
            </div>
          ) : (
            <div>
              <p className="text-red-600 font-medium mb-2">{result.error}</p>
              {result.details && (
                <pre className="bg-red-50 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}