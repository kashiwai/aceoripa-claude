'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

type VideoProvider = 'veo3' | 'sora2'
type Rarity = 'SS' | 'S' | 'A' | 'B' | 'C'
type Phase = 'intro' | 'reveal' | 'final_reveal'

interface GenerationJob {
  jobId: string
  rarity: Rarity
  phase: Phase
  provider: VideoProvider
  status: 'pending' | 'processing' | 'completed' | 'failed'
  videoUrl?: string
  thumbnailUrl?: string
  error?: string
  createdAt: string
}

const RARITIES: { id: Rarity; name: string; color: string }[] = [
  { id: 'SS', name: 'SS賞（最高レア）', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
  { id: 'S', name: 'S賞（高レア）', color: 'bg-gradient-to-r from-red-500 to-pink-500' },
  { id: 'A', name: 'A賞（中レア）', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
  { id: 'B', name: 'B賞（低レア）', color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
  { id: 'C', name: 'C賞（通常）', color: 'bg-gradient-to-r from-gray-400 to-gray-500' },
]

export default function EffectVideoGeneratorPage() {
  const [selectedRarity, setSelectedRarity] = useState<Rarity>('SS')
  const [selectedPhase, setSelectedPhase] = useState<Phase>('intro')
  const [selectedProvider, setSelectedProvider] = useState<VideoProvider>('veo3')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationJobs, setGenerationJobs] = useState<GenerationJob[]>([])
  const [cardName, setCardName] = useState('')

  const supabase = createClientComponentClient()

  // 生成ジョブの一覧を取得
  useEffect(() => {
    fetchGenerationJobs()
  }, [])

  const fetchGenerationJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_video_generation_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      const jobs: GenerationJob[] = data.map((job: any) => ({
        jobId: job.id,
        rarity: job.rarity,
        phase: job.phase,
        provider: job.provider,
        status: job.status,
        videoUrl: job.video_url,
        thumbnailUrl: job.thumbnail_url,
        error: job.error,
        createdAt: job.created_at,
      }))

      setGenerationJobs(jobs)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    }
  }

  // 動画生成
  const generateVideo = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rarity: selectedRarity,
          phase: selectedPhase,
          cardName: cardName || `${selectedRarity}賞カード`,
          provider: selectedProvider,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '動画生成に失敗しました')
      }

      const data = await response.json()

      toast.success(`動画生成を開始しました！（Job ID: ${data.jobId}）`)

      // ジョブリストに追加
      setGenerationJobs(prev => [{
        jobId: data.jobId,
        rarity: selectedRarity,
        phase: selectedPhase,
        provider: selectedProvider,
        status: data.status,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        createdAt: data.createdAt,
      }, ...prev])

      // ステータス確認ポーリング開始
      if (data.status !== 'completed') {
        startPollingJob(data.jobId)
      }
    } catch (error: any) {
      console.error('Error generating video:', error)
      toast.error(error.message || '動画生成中にエラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }

  // ジョブステータスのポーリング
  const startPollingJob = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/ai/generate-video?jobId=${jobId}`)
        if (!response.ok) {
          clearInterval(interval)
          return
        }

        const data = await response.json()

        // ジョブリスト更新
        setGenerationJobs(prev =>
          prev.map(job =>
            job.jobId === jobId
              ? { ...job, status: data.status, videoUrl: data.videoUrl, thumbnailUrl: data.thumbnailUrl, error: data.error }
              : job
          )
        )

        // 完了または失敗したらポーリング停止
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval)
          if (data.status === 'completed') {
            toast.success('動画生成が完了しました！')
          } else {
            toast.error(`動画生成に失敗しました: ${data.error}`)
          }
        }
      } catch (error) {
        console.error('Error polling job:', error)
        clearInterval(interval)
      }
    }, 5000) // 5秒ごとにチェック
  }

  // 動画をライブラリに保存
  const saveToLibrary = async (job: GenerationJob) => {
    try {
      const { error } = await supabase
        .from('gacha_animation_library')
        .insert({
          rarity: job.rarity,
          phase: job.phase,
          video_url: job.videoUrl,
          thumbnail_url: job.thumbnailUrl,
          storage_path: job.videoUrl, // 後でSupabase Storageに保存する場合は変更
          provider: job.provider,
          generation_job_id: job.jobId,
          is_active: true,
        })

      if (error) throw error
      toast.success('動画をライブラリに保存しました！')
    } catch (error: any) {
      console.error('Error saving to library:', error)
      toast.error('保存に失敗しました: ' + error.message)
    }
  }

  // 全レアリティの動画を一括生成
  const generateAllRarities = async () => {
    if (!confirm('全レアリティ（SS/S/A/B/C）のintro/reveal/final_reveal動画を生成します。よろしいですか？')) {
      return
    }

    setIsGenerating(true)

    try {
      for (const rarity of RARITIES) {
        for (const phase of ['intro', 'reveal', 'final_reveal'] as Phase[]) {
          await generateVideoWithParams(rarity.id, phase)
          // 各生成の間に少し待機（レート制限対策）
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
      toast.success('全レアリティの動画生成を開始しました！')
    } catch (error: any) {
      toast.error('一括生成中にエラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateVideoWithParams = async (rarity: Rarity, phase: Phase) => {
    const response = await fetch('/api/ai/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rarity,
        phase,
        cardName: `${rarity}賞カード`,
        provider: selectedProvider,
      }),
    })

    if (!response.ok) {
      throw new Error(`${rarity} ${phase} の生成に失敗しました`)
    }

    const data = await response.json()

    setGenerationJobs(prev => [{
      jobId: data.jobId,
      rarity,
      phase,
      provider: selectedProvider,
      status: data.status,
      videoUrl: data.videoUrl,
      thumbnailUrl: data.thumbnailUrl,
      createdAt: data.createdAt,
    }, ...prev])

    if (data.status !== 'completed') {
      startPollingJob(data.jobId)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/admin" className="hover:text-gray-700">
            管理画面
          </Link>
          <span className="mx-2">/</span>
          <Link href="/admin/ai-generator" className="hover:text-gray-700">
            AI生成管理
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">演出動画生成（VEO3/SORA2）</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">AI演出動画生成</h1>
            <p className="text-gray-600 mt-2">Google Veo 3 と OpenAI Sora 2 を使用してガチャ演出動画を生成</p>
          </div>
          <Link
            href="/admin/ai-generator/upload-video"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-md"
          >
            📹 動画をアップロード
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 設定パネル */}
        <div className="lg:col-span-1 space-y-6">
          {/* AIプロバイダー選択 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">AIプロバイダー</h2>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer p-3 rounded border hover:bg-gray-50">
                <input
                  type="radio"
                  name="provider"
                  value="veo3"
                  checked={selectedProvider === 'veo3'}
                  onChange={(e) => setSelectedProvider(e.target.value as VideoProvider)}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold">Google Veo 3</div>
                  <div className="text-sm text-gray-500">高品質、比較的高速</div>
                </div>
              </label>
              <label className="flex items-center cursor-pointer p-3 rounded border hover:bg-gray-50">
                <input
                  type="radio"
                  name="provider"
                  value="sora2"
                  checked={selectedProvider === 'sora2'}
                  onChange={(e) => setSelectedProvider(e.target.value as VideoProvider)}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold">OpenAI Sora 2</div>
                  <div className="text-sm text-gray-500">最高品質、時間がかかる</div>
                </div>
              </label>
            </div>
          </div>

          {/* レアリティ選択 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">レアリティ</h2>
            <div className="space-y-2">
              {RARITIES.map((rarity) => (
                <label
                  key={rarity.id}
                  className="flex items-center cursor-pointer p-3 rounded border hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="rarity"
                    value={rarity.id}
                    checked={selectedRarity === rarity.id}
                    onChange={(e) => setSelectedRarity(e.target.value as Rarity)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{rarity.name}</div>
                    <div className={`h-2 ${rarity.color} rounded mt-1`}></div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* フェーズ選択 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">演出フェーズ</h2>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer p-3 rounded border hover:bg-gray-50">
                <input
                  type="radio"
                  name="phase"
                  value="intro"
                  checked={selectedPhase === 'intro'}
                  onChange={(e) => setSelectedPhase(e.target.value as Phase)}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold">イントロ</div>
                  <div className="text-sm text-gray-500">期待感を高める導入演出</div>
                </div>
              </label>
              <label className="flex items-center cursor-pointer p-3 rounded border hover:bg-gray-50">
                <input
                  type="radio"
                  name="phase"
                  value="reveal"
                  checked={selectedPhase === 'reveal'}
                  onChange={(e) => setSelectedPhase(e.target.value as Phase)}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold">リビール</div>
                  <div className="text-sm text-gray-500">カード開封演出</div>
                </div>
              </label>
              <label className="flex items-center cursor-pointer p-3 rounded border hover:bg-gray-50 bg-purple-50">
                <input
                  type="radio"
                  name="phase"
                  value="final_reveal"
                  checked={selectedPhase === 'final_reveal'}
                  onChange={(e) => setSelectedPhase(e.target.value as Phase)}
                  className="mr-3"
                />
                <div>
                  <div className="font-semibold text-purple-700">🎬 最終演出（Final Reveal）</div>
                  <div className="text-sm text-purple-600">実際のカードが表示される最終演出（AI生成）</div>
                </div>
              </label>
            </div>
          </div>

          {/* カード名（オプション） */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">カード名（任意）</h2>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder={`${selectedRarity}賞カード`}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 生成ボタン */}
          <div className="space-y-3">
            <button
              onClick={generateVideo}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  生成中...
                </div>
              ) : (
                '🎬 動画を生成'
              )}
            </button>

            <button
              onClick={generateAllRarities}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              全レアリティ一括生成（15個）
            </button>
            <p className="text-xs text-gray-500 text-center">
              全5レアリティ × 3フェーズ（intro/reveal/final_reveal）
            </p>
          </div>
        </div>

        {/* 生成ジョブリスト */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">生成ジョブ一覧</h2>
              <button
                onClick={fetchGenerationJobs}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition"
              >
                🔄 更新
              </button>
            </div>

            <div className="space-y-4">
              {generationJobs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">まだ動画を生成していません</p>
              ) : (
                generationJobs.map((job) => (
                  <div key={job.jobId} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-bold">{job.rarity}</span>
                        <span className="text-gray-500">
                          / {job.phase === 'intro' ? 'イントロ' : job.phase === 'reveal' ? 'リビール' : '最終演出'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          job.provider === 'veo3' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {job.provider === 'veo3' ? 'Veo3' : 'Sora2'}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        job.status === 'completed' ? 'bg-green-100 text-green-700' :
                        job.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                        job.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {job.status === 'completed' ? '✓ 完了' :
                         job.status === 'processing' ? '⏳ 処理中' :
                         job.status === 'failed' ? '✗ 失敗' :
                         '待機中'}
                      </span>
                    </div>

                    {job.error && (
                      <div className="mt-2 p-2 bg-red-50 text-red-700 rounded text-sm">
                        {job.error}
                      </div>
                    )}

                    {job.videoUrl && (
                      <div className="mt-4">
                        <video
                          src={job.videoUrl}
                          controls
                          className="w-full rounded"
                          poster={job.thumbnailUrl}
                        />
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => saveToLibrary(job)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
                          >
                            ライブラリに保存
                          </button>
                          <a
                            href={job.videoUrl}
                            download
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                          >
                            ダウンロード
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-gray-400">
                      Job ID: {job.jobId}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
