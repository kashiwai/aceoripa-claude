'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface ImportedCard {
  category: string
  product_code: string
  card_name: string
  rank: string
  price: number
  rarity: string
}

export default function ImportCardsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isImporting, setIsImporting] = useState(false)
  const [previewData, setPreviewData] = useState<ImportedCard[]>([])
  const [csvFile, setCsvFile] = useState<File | null>(null)

  // ランクをレアリティにマッピング
  const mapRankToRarity = (rank: string): string => {
    const normalizedRank = rank.toLowerCase().replace('rank', '')
    switch (normalizedRank) {
      case 'ss':
        return 'SS'
      case 's':
        return 'S'
      case 'a':
        return 'A'
      case 'b':
        return 'B'
      case 'c':
        return 'C'
      default:
        return 'C' // デフォルト
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const csv = e.target?.result as string
      const lines = csv.split('\n')
      const headers = lines[0].split(',')
      
      // BOMを除去
      const cleanHeaders = headers.map(h => h.replace(/^\uFEFF/, '').trim())
      
      const data: ImportedCard[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const values = line.split(',')
        if (values.length >= 5) {
          const rank = values[3]?.trim() || ''
          const rarity = mapRankToRarity(rank)
          
          data.push({
            category: values[0]?.trim() || '',
            product_code: values[1]?.trim() || '',
            card_name: values[2]?.trim() || '',
            rank: rank,
            price: parseInt(values[4]?.trim() || '0'),
            rarity: rarity
          })
        }
      }
      
      setPreviewData(data)
      toast.success(`${data.length}件のカードデータを読み込みました`)
    }
    
    reader.readAsText(file, 'UTF-8')
  }

  const handleImport = async () => {
    if (previewData.length === 0) {
      toast.error('インポートするデータがありません')
      return
    }

    setIsImporting(true)
    
    try {
      // バッチでインサート（重複チェック付き）
      const insertData = previewData.map(card => ({
        card_name: card.card_name,
        product_code: card.product_code,
        rarity: card.rarity,
        image_url: '/images/ngcard.jpg', // 全てNGカード画像を使用
        market_price: card.price,
        description: `${card.category}カード - ${card.rank}`
      }))

      // 既存の商品コードをチェック
      const existingCodes = await supabase
        .from('pokemon_cards')
        .select('product_code')
        .in('product_code', insertData.map(c => c.product_code))

      const existingCodesSet = new Set(
        existingCodes.data?.map(c => c.product_code) || []
      )

      // 重複していないデータのみフィルタリング
      const newData = insertData.filter(
        card => !existingCodesSet.has(card.product_code)
      )

      if (newData.length === 0) {
        toast.error('すべてのカードが既に登録済みです')
        return
      }

      // インサート実行
      const { data, error } = await supabase
        .from('pokemon_cards')
        .insert(newData)

      if (error) throw error

      const duplicateCount = insertData.length - newData.length
      
      toast.success(
        `${newData.length}件のカードをインポートしました` +
        (duplicateCount > 0 ? `（重複スキップ: ${duplicateCount}件）` : '')
      )
      
      router.push('/admin/cards')
    } catch (error) {
      console.error('Error importing cards:', error)
      toast.error('カードのインポートに失敗しました')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/admin/cards" className="hover:text-gray-700">
            カード管理
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">CSVインポート</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">CSVインポート</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* アップロードエリア */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">CSVファイルアップロード</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSVファイルを選択
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors"
              />
            </div>

            {previewData.length > 0 && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm text-green-800">
                    ✅ {previewData.length}件のカードデータを読み込みました
                  </p>
                </div>
                
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                >
                  {isImporting ? 'インポート中...' : `${previewData.length}件をインポート`}
                </button>
              </div>
            )}
          </div>

          {/* フォーマット説明 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">CSVフォーマット</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• カテゴリー名,新コード,商品名,ランク,交換ポイント</p>
              <p>• ランク: RankSS, RankS, RankA, RankB, RankC</p>
              <p>• 交換ポイント: 数値（円）</p>
              <p>• 文字エンコード: UTF-8</p>
              <p>• 画像: 全て /images/ngcard.jpg を使用</p>
            </div>
          </div>
        </div>

        {/* プレビューエリア */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            プレビュー ({previewData.length}件)
          </h2>
          
          {previewData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>CSVファイルをアップロードしてプレビューを表示</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      カード名
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品コード
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      レアリティ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      価格
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.slice(0, 10).map((card, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {card.card_name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {card.product_code}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          card.rarity === 'SS' ? 'bg-yellow-100 text-yellow-800' :
                          card.rarity === 'S' ? 'bg-purple-100 text-purple-800' :
                          card.rarity === 'A' ? 'bg-blue-100 text-blue-800' :
                          card.rarity === 'B' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {card.rarity}賞
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        ¥{card.price.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {previewData.length > 10 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  ...他 {previewData.length - 10}件
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 注意事項 */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ 注意事項</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• 商品コードが重複する場合、既存データはスキップされます</li>
          <li>• カード画像は全て /images/ngcard.jpg が設定されます</li>
          <li>• インポート後、個別にカード編集画面で実際の画像URLを設定してください</li>
          <li>• 大量データの場合、処理に時間がかかる場合があります</li>
        </ul>
      </div>
    </div>
  )
}