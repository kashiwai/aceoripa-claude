'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function CardImageUploadPage() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/admin/upload/card-image', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`${file.name} のアップロードに失敗しました`)
        }

        const data = await response.json()
        uploadedUrls.push(data.url)
        
        // プログレス表示
        toast.success(`${file.name} アップロード完了 (${i + 1}/${files.length})`)
      }

      setUploadedFiles([...uploadedFiles, ...uploadedUrls])
      toast.success(`${files.length}ファイルのアップロードが完了しました`)
      
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'アップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const generateCSVTemplate = () => {
    if (uploadedFiles.length === 0) {
      toast.error('アップロード済みのファイルがありません')
      return
    }

    // CSVテンプレート生成
    let csvContent = 'カード名,商品コード,レアリティ,還元pt,カード画像URL,ローカル画像パス\n'
    
    uploadedFiles.forEach((url, index) => {
      const filename = url.split('/').pop() || ''
      const cardName = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '').replace(/-/g, ' ')
      const productCode = `PKM-${String(index + 1).padStart(3, '0')}`
      const rarity = index < 3 ? 'SS' : index < 10 ? 'S' : index < 30 ? 'A' : index < 100 ? 'B' : 'C'
      const points = rarity === 'SS' ? 50000 : rarity === 'S' ? 10000 : rarity === 'A' ? 1000 : rarity === 'B' ? 300 : 100
      
      csvContent += `${cardName},${productCode},${rarity},${points},${url},\n`
    })

    // ダウンロード
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `card-images-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('CSVファイルをダウンロードしました')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/admin/cards" className="hover:text-gray-700">
            カード管理
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">画像アップロード</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">カード画像アップロード</h1>
      </div>

      <div className="space-y-6">
        {/* アップロードエリア */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">画像ファイルアップロード</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="space-y-4">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {uploading ? 'アップロード中...' : 'ファイルを選択またはドラッグ&ドロップ'}
                  </p>
                  <p className="text-sm text-gray-500">
                    JPG, PNG, WEBP ファイル / 複数選択可能
                  </p>
                </div>
              </div>
            </label>
          </div>
          
          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">アップロード中...</span>
              </div>
            </div>
          )}
        </div>

        {/* アップロード済みファイル一覧 */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">アップロード済み画像 ({uploadedFiles.length}枚)</h2>
              <button
                onClick={generateCSVTemplate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                CSVテンプレート生成
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
              {uploadedFiles.map((url, index) => (
                <div key={index} className="border rounded-lg p-2">
                  <img
                    src={url}
                    alt={`Card ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {url.split('/').pop()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 説明 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">画像アップロードの流れ</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>カード画像をまとめて選択・アップロード</li>
            <li>「CSVテンプレート生成」ボタンでCSVファイルをダウンロード</li>
            <li>CSVファイルを編集（カード名、レアリティ、還元ptを修正）</li>
            <li>「CSVインポート」ページで編集したCSVをインポート</li>
          </ol>
        </div>
      </div>
    </div>
  )
}