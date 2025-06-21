'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Imagen4TestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testTypes = [
    { key: 'dopa-main', name: 'DOPAメインバナー', title: '激レア確定オリパ', subtitle: 'SSR確率大幅UP中' },
    { key: 'dopa-pokemon', name: 'ポケモンカード', title: 'ポケモンカード151オリパ', subtitle: 'リザードンex SAR確率UP！' },
    { key: 'dopa-campaign', name: 'キャンペーン', title: '期間限定大特価', subtitle: '今だけ50%OFF' },
    { key: 'dopa-line', name: 'LINE連携', title: 'LINE友達登録で', subtitle: '500円クーポンGET' },
    { key: 'dopa-winner', name: '当選報告', title: '大当たり続出中！', subtitle: 'レア当選報告多数' },
    { key: 'dopa-new', name: '新商品', title: '新商品入荷', subtitle: '最新レアカード追加' }
  ]

  const generateBanner = async (type: string, title: string, subtitle: string) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/generate-banner-imagen4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          title,
          subtitle,
          style: 'premium',
          dimensions: '16:9'
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'バナー生成に失敗しました')
      }
    } catch (err: any) {
      setError(err.message || '通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Google Imagen 4 バナー生成テスト
          </h1>
          <p className="text-lg text-gray-600">
            最新のGoogle Imagen 4 AIを使用したDOPA風バナー生成のテスト
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>注意:</strong> Google Cloud認証が設定されていない場合は、高品質Canvasフォールバックが使用されます
            </p>
          </div>
        </div>

        {/* テストボタン一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testTypes.map((test) => (
            <div key={test.key} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">{test.name}</h3>
              <p className="text-sm text-gray-600 mb-1">タイトル: {test.title}</p>
              <p className="text-sm text-gray-600 mb-4">サブタイトル: {test.subtitle}</p>
              <button
                onClick={() => generateBanner(test.key, test.title, test.subtitle)}
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '生成中...' : 'バナー生成'}
              </button>
            </div>
          ))}
        </div>

        {/* 読み込み状態 */}
        {loading && (
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-lg text-gray-600">
              Google Imagen 4 でバナーを生成中...
            </p>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-2">エラー</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* 結果表示 */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              生成結果
            </h2>
            
            {/* 生成されたバナー画像 */}
            <div className="mb-6 text-center">
              <div className="inline-block relative">
                <Image
                  src={result.imageUrl}
                  alt="Generated Banner"
                  width={800}
                  height={450}
                  className="rounded-lg shadow-md"
                  onError={(e) => {
                    console.error('Image load error:', e)
                  }}
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  {result.engine}
                </div>
              </div>
            </div>

            {/* メタデータ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">API情報</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>エンジン:</strong> {result.engine}</div>
                  <div><strong>成功:</strong> {result.success ? 'Yes' : 'No'}</div>
                  {result.metadata && (
                    <>
                      <div><strong>モデル:</strong> {result.metadata.model}</div>
                      <div><strong>品質:</strong> {result.metadata.quality}</div>
                      <div><strong>解像度:</strong> {result.metadata.resolution}</div>
                      <div><strong>最適化:</strong> {result.metadata.optimizedFor}</div>
                      <div><strong>ブランド準拠:</strong> {result.metadata.brandCompliant ? 'Yes' : 'No'}</div>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">生成プロンプト</h3>
                <div className="text-xs bg-gray-100 p-3 rounded max-h-40 overflow-y-auto">
                  {result.revised_prompt}
                </div>
              </div>
            </div>

            {/* フォールバック情報 */}
            {result.fallback_reason && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800">フォールバック使用</h4>
                <p className="text-yellow-700 text-sm">
                  理由: {result.fallback_reason}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Google Cloud設定説明 */}
        <div className="mt-12 bg-gray-800 text-white p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Google Imagen 4 設定方法</h3>
          <div className="space-y-2 text-sm">
            <p>1. Google Cloud Console でプロジェクトを作成</p>
            <p>2. Vertex AI API を有効化</p>
            <p>3. サービスアカウントキーを作成</p>
            <p>4. 環境変数を設定:</p>
            <div className="bg-gray-900 p-3 rounded mt-2 font-mono text-xs">
              GOOGLE_CLOUD_PROJECT=your-project-id<br/>
              GOOGLE_CLOUD_LOCATION=us-central1<br/>
              GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}