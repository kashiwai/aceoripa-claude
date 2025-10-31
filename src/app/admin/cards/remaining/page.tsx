'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Card {
  id: string
  card_name: string
  product_code: string
  image_url: string | null
  rarity: string | null
}

interface ApiResponse {
  cards: Card[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function RemainingCardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploadingCardId, setUploadingCardId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchCards(page)
  }, [page])

  const fetchCards = async (pageNum: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/cards/without-images?page=${pageNum}&limit=50`)
      const data: ApiResponse = await response.json()
      setCards(data.cards)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Failed to fetch cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (cardId: string, file: File) => {
    setUploadingCardId(cardId)
    setUploadProgress(prev => ({ ...prev, [cardId]: 'アップロード中...' }))

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('cardId', cardId)

      const response = await fetch('/api/admin/cards/upload-image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      setUploadProgress(prev => ({ ...prev, [cardId]: 'アップロード完了!' }))
      
      // カードリストを再取得
      setTimeout(() => {
        fetchCards(page)
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[cardId]
          return newProgress
        })
      }, 1000)

    } catch (error) {
      console.error('Upload failed:', error)
      setUploadProgress(prev => ({ ...prev, [cardId]: 'エラーが発生しました' }))
    } finally {
      setUploadingCardId(null)
    }
  }

  const handleFileSelect = (cardId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(cardId, file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">画像なしカード一覧</h1>
          <p className="text-gray-600">
            残り <span className="font-bold text-blue-600">{total}件</span> のカードに画像がありません
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <div key={card.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{card.card_name}</h3>
                    
                    <div className="space-y-2 mb-4">
                      {card.product_code && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">品番:</span> {card.product_code}
                        </p>
                      )}
                      {card.rarity && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">レアリティ:</span> {card.rarity}
                        </p>
                      )}
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor={`file-${card.id}`}
                        className={`block w-full text-center px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                          uploadingCardId === card.id
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {uploadingCardId === card.id ? '処理中...' : '画像をアップロード'}
                      </label>
                      <input
                        id={`file-${card.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(card.id, e)}
                        disabled={uploadingCardId === card.id}
                      />

                      {uploadProgress[card.id] && (
                        <p className={`mt-2 text-sm text-center ${
                          uploadProgress[card.id].includes('完了') ? 'text-green-600' :
                          uploadProgress[card.id].includes('エラー') ? 'text-red-600' :
                          'text-blue-600'
                        }`}>
                          {uploadProgress[card.id]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ページネーション */}
            <div className="mt-8 flex justify-center items-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                前へ
              </button>
              
              <span className="text-gray-700">
                {page} / {totalPages} ページ
              </span>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                次へ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
