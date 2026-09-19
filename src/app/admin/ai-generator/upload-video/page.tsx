'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, Play, Trash2, Check, X } from 'lucide-react'
import Link from 'next/link'

type Rarity = 'SS' | 'S' | 'A' | 'B' | 'C'
type Phase = 'intro' | 'reveal' | 'final_reveal'

interface VideoLibraryEntry {
  id: string
  rarity: Rarity
  phase: Phase
  video_url: string
  thumbnail_url: string | null
  storage_path: string
  provider: string
  duration: number
  quality: string
  file_size: number
  is_active: boolean
  usage_count: number
  created_at: string
}

const RARITIES = [
  { id: 'SS' as Rarity, name: 'SS賞', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { id: 'S' as Rarity, name: 'S賞', color: 'text-red-600', bgColor: 'bg-red-50' },
  { id: 'A' as Rarity, name: 'A賞', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'B' as Rarity, name: 'B賞', color: 'text-green-600', bgColor: 'bg-green-50' },
  { id: 'C' as Rarity, name: 'C賞', color: 'text-gray-600', bgColor: 'bg-gray-50' },
]

const PHASES = [
  { id: 'intro' as Phase, name: 'イントロ', description: '演出開始', icon: '🎬' },
  { id: 'reveal' as Phase, name: 'リビール', description: 'カード公開', icon: '✨' },
  { id: 'final_reveal' as Phase, name: '最終演出', description: 'カード最終表示', icon: '🎪' },
]

export default function UploadVideoPage() {
  const [selectedRarity, setSelectedRarity] = useState<Rarity>('SS')
  const [selectedPhase, setSelectedPhase] = useState<Phase>('intro')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [videos, setVideos] = useState<VideoLibraryEntry[]>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(true)
  const [filterRarity, setFilterRarity] = useState<Rarity | 'ALL'>('ALL')
  const [filterPhase, setFilterPhase] = useState<Phase | 'ALL'>('ALL')
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)

  // 動画一覧を読み込み
  const loadVideos = async () => {
    setIsLoadingVideos(true)
    try {
      const params = new URLSearchParams()
      if (filterRarity !== 'ALL') params.append('rarity', filterRarity)
      if (filterPhase !== 'ALL') params.append('phase', filterPhase)

      const response = await fetch(`/api/ai/upload-video?${params}`)
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos || [])
      }
    } catch (error) {
      console.error('Failed to load videos:', error)
    } finally {
      setIsLoadingVideos(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [filterRarity, filterPhase])

  // ファイル選択
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 動画ファイルのみ許可
      if (!file.type.startsWith('video/')) {
        alert('動画ファイルを選択してください')
        return
      }
      setSelectedFile(file)
    }
  }

  // アップロード
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('ファイルを選択してください')
      return
    }

    setIsUploading(true)
    setUploadProgress('アップロード中...')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('rarity', selectedRarity)
      formData.append('phase', selectedPhase)
      formData.append('provider', 'manual')

      const response = await fetch('/api/ai/upload-video', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setUploadProgress('✅ アップロード完了！')
        setSelectedFile(null)
        // ファイル入力をリセット
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''

        // 動画一覧を再読み込み
        await loadVideos()

        setTimeout(() => setUploadProgress(''), 3000)
      } else {
        const error = await response.json()
        setUploadProgress(`❌ エラー: ${error.error}`)
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadProgress(`❌ エラー: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  // 動画の有効化/無効化
  const toggleVideoActive = async (videoId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/ai/upload-video', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: videoId,
          isActive: !currentStatus,
        }),
      })

      if (response.ok) {
        await loadVideos()
      } else {
        alert('ステータス更新に失敗しました')
      }
    } catch (error) {
      console.error('Toggle error:', error)
      alert('ステータス更新に失敗しました')
    }
  }

  // 動画削除
  const deleteVideo = async (videoId: string) => {
    if (!confirm('この動画を削除してもよろしいですか？')) {
      return
    }

    try {
      const response = await fetch(`/api/ai/upload-video?videoId=${videoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadVideos()
      } else {
        alert('削除に失敗しました')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('削除に失敗しました')
    }
  }

  // ファイルサイズを人間が読める形式に変換
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/admin/ai-generator/effect-video"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            AI動画生成に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            📹 ガチャ演出動画アップロード
          </h1>
          <p className="text-gray-600 mt-2">
            作成した動画をアップロードして、ガチャ演出に使用できます
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側: アップロードフォーム */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">動画をアップロード</h2>

            {/* レアリティ選択 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                レアリティ
              </label>
              <div className="grid grid-cols-5 gap-2">
                {RARITIES.map((rarity) => (
                  <button
                    key={rarity.id}
                    onClick={() => setSelectedRarity(rarity.id)}
                    className={`
                      p-3 rounded border-2 transition-all text-center
                      ${
                        selectedRarity === rarity.id
                          ? `${rarity.bgColor} border-current ${rarity.color} font-semibold`
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {rarity.name}
                  </button>
                ))}
              </div>
            </div>

            {/* フェーズ選択 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                演出フェーズ
              </label>
              <div className="space-y-2">
                {PHASES.map((phase) => (
                  <label
                    key={phase.id}
                    className={`
                      flex items-center cursor-pointer p-3 rounded border transition-all
                      ${
                        selectedPhase === phase.id
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="phase"
                      value={phase.id}
                      checked={selectedPhase === phase.id}
                      onChange={(e) => setSelectedPhase(e.target.value as Phase)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">
                        {phase.icon} {phase.name}
                      </div>
                      <div className="text-sm text-gray-600">{phase.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* ファイル選択 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                動画ファイル
              </label>
              <input
                id="file-input"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
              />
              {selectedFile && (
                <div className="mt-2 text-sm text-gray-600">
                  選択済み: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}
            </div>

            {/* アップロードボタン */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`
                w-full py-3 px-4 rounded-lg font-semibold text-white
                flex items-center justify-center gap-2
                ${
                  !selectedFile || isUploading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }
              `}
            >
              <Upload className="w-5 h-5" />
              {isUploading ? 'アップロード中...' : 'アップロード'}
            </button>

            {/* 進捗表示 */}
            {uploadProgress && (
              <div
                className={`
                  mt-4 p-3 rounded
                  ${
                    uploadProgress.includes('✅')
                      ? 'bg-green-50 text-green-700'
                      : uploadProgress.includes('❌')
                      ? 'bg-red-50 text-red-700'
                      : 'bg-blue-50 text-blue-700'
                  }
                `}
              >
                {uploadProgress}
              </div>
            )}
          </div>

          {/* 右側: 使い方ガイド */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">📖 使い方</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-1">1. レアリティを選択</h3>
                <p className="text-sm">
                  動画を使用するレアリティ（SS、S、A、B、C）を選択します。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">2. 演出フェーズを選択</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>イントロ</strong>: ガチャ演出の開始部分</li>
                  <li>• <strong>リビール</strong>: カードが公開される部分</li>
                  <li>• <strong>最終演出</strong>: カードが最終的に表示される部分</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-1">3. 動画ファイルを選択</h3>
                <p className="text-sm">
                  作成した動画ファイル（MP4推奨）を選択します。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">4. アップロード</h3>
                <p className="text-sm">
                  アップロードすると、同じレアリティ・フェーズの既存動画は自動的に無効化され、
                  新しい動画が有効になります。
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>💡 ヒント:</strong> 動画は下の一覧から有効/無効を切り替えたり、
                プレビュー再生、削除ができます。
              </p>
            </div>
          </div>
        </div>

        {/* 動画一覧 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">アップロード済み動画</h2>

            {/* フィルター */}
            <div className="flex gap-4">
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value as Rarity | 'ALL')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="ALL">全レアリティ</option>
                {RARITIES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <select
                value={filterPhase}
                onChange={(e) => setFilterPhase(e.target.value as Phase | 'ALL')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="ALL">全フェーズ</option>
                {PHASES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoadingVideos ? (
            <div className="text-center py-12 text-gray-500">読み込み中...</div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              動画がまだアップロードされていません
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => {
                const rarityInfo = RARITIES.find((r) => r.id === video.rarity)
                const phaseInfo = PHASES.find((p) => p.id === video.phase)

                return (
                  <div
                    key={video.id}
                    className={`
                      border-2 rounded-lg p-4 transition-all
                      ${video.is_active ? 'border-green-500 bg-green-50' : 'border-gray-200'}
                    `}
                  >
                    {/* ステータスバッジ */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${rarityInfo?.bgColor} ${rarityInfo?.color}`}>
                          {rarityInfo?.name}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700">
                          {phaseInfo?.icon} {phaseInfo?.name}
                        </span>
                      </div>
                      {video.is_active && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-600 text-white">
                          <Check className="w-3 h-3 inline" /> 有効
                        </span>
                      )}
                    </div>

                    {/* 動画情報 */}
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <div>サイズ: {formatFileSize(video.file_size)}</div>
                      <div>品質: {video.quality}</div>
                      <div>使用回数: {video.usage_count}回</div>
                      <div className="text-xs text-gray-500">
                        {new Date(video.created_at).toLocaleString('ja-JP')}
                      </div>
                    </div>

                    {/* アクション */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewVideo(video.video_url)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center justify-center gap-1"
                      >
                        <Play className="w-4 h-4" />
                        再生
                      </button>
                      <button
                        onClick={() => toggleVideoActive(video.id, video.is_active)}
                        className={`
                          flex-1 px-3 py-2 rounded text-sm font-semibold
                          ${
                            video.is_active
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }
                        `}
                      >
                        {video.is_active ? '無効化' : '有効化'}
                      </button>
                      <button
                        onClick={() => deleteVideo(video.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 動画プレビューモーダル */}
      {previewVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewVideo(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewVideo(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <video
              src={previewVideo}
              controls
              autoPlay
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
