'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface CSVRow {
  card_name: string
  product_code: string
  rarity: string
  product_points: string
  card_image_url: string
  card_image_filename: string
}

export default function CardImportPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [preview, setPreview] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = text.split('\n')
      const headers = rows[0].split(',').map(h => h.trim())
      
      const data: CSVRow[] = []
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim() === '') continue
        
        const values = rows[i].split(',').map(v => v.trim())
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        data.push(row)
      }
      
      setCsvData(data)
      setPreview(true)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/cards/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: csvData })
      })
      
      if (!response.ok) throw new Error('Import failed')
      
      const result = await response.json()
      toast.success(`${result.imported}枚のカードをインポートしました`)
      router.push('/admin/cards')
    } catch (error) {
      console.error('Import error:', error)
      toast.error('インポートに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ポケモンカードCSVインポート</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">CSVフォーマット</h2>
            <a
              href="/api/admin/cards/sample-csv"
              download="pokemon_cards_sample.csv"
              className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              サンプルCSVダウンロード
            </a>
          </div>
          <div className="bg-gray-100 p-4 rounded text-sm font-mono">
            card_name,product_code,rarity,product_points,card_image_url,card_image_filename
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ※ レアリティ: SSR, SR, R, N<br/>
            ※ 商品PT: ポイント数値（例: 50000）<br/>
            ※ 画像: URLまたはファイル名のいずれかを入力<br/>
            ※ ファイル名指定時は /images/cards/ フォルダに配置
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CSVファイルを選択
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        
        {preview && csvData.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">プレビュー（最初の5件）</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">カード名</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">商品コード</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">レアリティ</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">商品PT</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">画像設定</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {csvData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{row.card_name}</td>
                      <td className="px-4 py-2 text-sm font-mono">{row.product_code}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold
                          ${row.rarity === 'SSR' ? 'bg-yellow-100 text-yellow-800' :
                            row.rarity === 'SR' ? 'bg-purple-100 text-purple-800' :
                            row.rarity === 'R' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {row.rarity}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{parseInt(row.product_points).toLocaleString()}PT</td>
                      <td className="px-4 py-2 text-sm">
                        {row.card_image_url ? (
                          <span className="text-blue-600">URL指定</span>
                        ) : row.card_image_filename ? (
                          <span className="text-green-600">ファイル: {row.card_image_filename}</span>
                        ) : (
                          <span className="text-gray-400">画像なし</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              合計 {csvData.length} 件のカードをインポートします
            </p>
          </div>
        )}
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleImport}
            disabled={!csvData.length || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'インポート中...' : 'インポート実行'}
          </button>
        </div>
      </div>
    </div>
  )
}