'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Card {
  id: string
  card_name: string
  product_code: string
  image_url: string | null
}

interface ImageFile {
  fileName: string
  score: number
  reason?: string
  cardName?: string
}

interface CardWithCandidates {
  card: Card
  candidates: ImageFile[]
}

export default function ManualMatchPage() {
  const [cards, setCards] = useState<CardWithCandidates[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ImageFile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    matched: 0,
    skipped: 0
  })

  useEffect(() => {
    fetchCardsWithoutImages()
  }, [])

  const fetchCardsWithoutImages = async () => {
    try {
      const response = await fetch('/api/admin/cards/without-images')
      if (response.ok) {
        const data = await response.json()
        setCards(data.cards)
        setStats(prev => ({ ...prev, total: data.cards.length }))
      }
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `/api/admin/cards/search-images?query=${encodeURIComponent(searchQuery)}`
      )
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.images)
      }
    } catch (error) {
      console.error('Error searching images:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleMatch = async (imageFileName: string) => {
    if (uploading) return

    setUploading(true)
    const currentCard = cards[currentIndex]

    try {
      const response = await fetch('/api/admin/cards/manual-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cardId: currentCard.card.id,
          imageFileName
        })
      })

      if (response.ok) {
        setStats(prev => ({ ...prev, matched: prev.matched + 1 }))
        // 検索結果をクリア
        setSearchQuery('')
        setSearchResults([])
        nextCard()
      } else {
        alert('アップロードに失敗しました')
      }
    } catch (error) {
      console.error('Error uploading:', error)
      alert('エラーが発生しました')
    } finally {
      setUploading(false)
    }
  }

  const handleSkip = () => {
    setStats(prev => ({ ...prev, skipped: prev.skipped + 1 }))
    nextCard()
  }

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🎉 完了！</h2>
          <p className="text-gray-600">画像なしカードはありません</p>
        </div>
      </div>
    )
  }

  if (currentIndex >= cards.length) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🎉 完了！</h2>
          <p className="text-gray-600 mb-4">すべてのカードを処理しました</p>
          <div className="space-y-2">
            <p>マッチング: {stats.matched}件</p>
            <p>スキップ: {stats.skipped}件</p>
          </div>
        </div>
      </div>
    )
  }

  const currentCard = cards[currentIndex]

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">手動画像マッチング</h1>

          {/* 進捗 */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">進捗</p>
              <p className="text-2xl font-bold text-blue-600">
                {currentIndex + 1} / {cards.length}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">マッチング</p>
              <p className="text-2xl font-bold text-green-600">{stats.matched}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">スキップ</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.skipped}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">残り</p>
              <p className="text-2xl font-bold text-purple-600">
                {cards.length - currentIndex - 1}
              </p>
            </div>
          </div>

          {/* プログレスバー */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* カード情報 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            対象カード
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {currentCard.card.card_name}
            </p>
            <p className="text-gray-600">商品コード: {currentCard.card.product_code}</p>
          </div>
        </div>

        {/* 画像検索 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            画像を検索
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="ファイル名で検索（例: ピカチュウ、sv1a、など）"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? '検索中...' : '検索'}
            </button>
            {searchResults.length > 0 && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                クリア
              </button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">
                検索結果: {searchResults.length}件
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleMatch(image.fileName)}
                    disabled={uploading}
                    className="group relative bg-gray-50 rounded-lg p-3 hover:bg-blue-50 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="aspect-[3/4] relative mb-2 bg-white rounded overflow-hidden">
                      <Image
                        src={`/api/admin/cards/preview-image?fileName=${encodeURIComponent(image.fileName)}`}
                        alt={image.fileName}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="text-left">
                      {image.cardName && (
                        <p className="text-xs font-bold text-blue-700 truncate mb-1">
                          {image.cardName}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 truncate">
                        {image.fileName}
                      </p>
                    </div>
                    <div className="absolute inset-0 border-4 border-transparent group-hover:border-blue-500 rounded-lg transition-colors pointer-events-none"></div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 画像候補 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            おすすめ候補（クリックしてマッチング）
          </h2>

          {currentCard.candidates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">候補が見つかりませんでした</p>
              <button
                onClick={handleSkip}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                スキップ
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentCard.candidates.slice(0, 12).map((candidate, idx) => (
                <button
                  key={idx}
                  onClick={() => handleMatch(candidate.fileName)}
                  disabled={uploading}
                  className="group relative bg-gray-50 rounded-lg p-3 hover:bg-blue-50 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="aspect-[3/4] relative mb-2 bg-white rounded overflow-hidden">
                    <Image
                      src={`/api/admin/cards/preview-image?fileName=${encodeURIComponent(candidate.fileName)}`}
                      alt={candidate.fileName}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="text-left">
                    {candidate.cardName && (
                      <p className="text-xs font-bold text-blue-700 truncate mb-1">
                        {candidate.cardName}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 truncate mb-1">
                      {candidate.fileName}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{candidate.reason}</span>
                      <span className="text-xs font-bold text-blue-600">
                        {candidate.score}%
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 border-4 border-transparent group-hover:border-blue-500 rounded-lg transition-colors pointer-events-none"></div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ナビゲーション */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={prevCard}
              disabled={currentIndex === 0}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← 前へ
            </button>

            <button
              onClick={handleSkip}
              disabled={uploading}
              className="px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              スキップ
            </button>

            <button
              onClick={nextCard}
              disabled={currentIndex >= cards.length - 1}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
