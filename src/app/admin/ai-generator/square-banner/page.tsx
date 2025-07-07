'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'

interface GeneratedBanner {
  id: string
  url: string
  prompt: string
  timestamp: string
  editedUrl?: string
}

const BANNER_TEMPLATES = [
  {
    name: 'ピカチュウスペシャル',
    basePrompt: 'Create a vibrant 300x300 Pokemon gacha banner featuring Pikachu with electric effects, golden sparkles, ultra rare holographic style, luxury gacha machine aesthetic',
    placeholderText: 'ピカチュウ大祭り',
    style: 'holographic'
  },
  {
    name: 'リザードン炎の祭典',
    basePrompt: 'Design a 300x300 premium gacha banner with Charizard breathing fire, epic flames background, SSR rarity effects, golden frame',
    placeholderText: 'リザードン祭盤',
    style: 'fire'
  },
  {
    name: 'イーブイコレクション',
    basePrompt: 'Create a cute 300x300 gacha banner with all Eevee evolutions, pastel rainbow background, kawaii style, sparkle effects',
    placeholderText: 'イーブイ進化祭',
    style: 'cute'
  },
  {
    name: 'レジェンド降臨',
    basePrompt: 'Design a 300x300 legendary Pokemon gacha banner, cosmic background with Arceus silhouette, premium gold and purple gradient',
    placeholderText: '神話降臨',
    style: 'legendary'
  },
  {
    name: 'ナンジャモ限定',
    basePrompt: 'Create a 300x300 gacha banner featuring trainer Iono (Nanjamo), electric gym theme, pink and blue colors, modern stylish design',
    placeholderText: 'ナンジャモ祭',
    style: 'trainer'
  }
]

const JAPANESE_FONTS = [
  { name: 'Noto Sans JP', value: 'Noto Sans JP', weight: 'bold' },
  { name: 'M PLUS Rounded 1c', value: 'M PLUS Rounded 1c', weight: 'bold' },
  { name: 'Kosugi Maru', value: 'Kosugi Maru', weight: 'normal' },
  { name: 'Zen Maru Gothic', value: 'Zen Maru Gothic', weight: 'bold' },
  { name: 'BIZ UDPGothic', value: 'BIZ UDPGothic', weight: 'bold' }
]

export default function SquareBannerGeneratorPage() {
  const [loading, setLoading] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [generatedBanners, setGeneratedBanners] = useState<GeneratedBanner[]>([])
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null)
  const [textSettings, setTextSettings] = useState({
    text: '',
    font: JAPANESE_FONTS[0].value,
    size: 48,
    color: '#FFFFFF',
    positionY: 50,
    shadow: true,
    stroke: true,
    strokeColor: '#000000'
  })

  const generateBanner = async (prompt: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/ai-generator/square-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt + ', square format 300x300 pixels, high quality, gacha game style, no text',
          size: '1024x1024'
        })
      })

      if (!response.ok) throw new Error('生成に失敗しました')

      const data = await response.json()
      
      const newBanner: GeneratedBanner = {
        id: Date.now().toString(),
        url: data.imageUrl,
        prompt: prompt,
        timestamp: new Date().toISOString()
      }

      setGeneratedBanners([newBanner, ...generatedBanners])
      
      // バナーをデータベースに保存
      await saveBannerToDatabase(newBanner)
      
      toast.success('バナーを生成しました！')
    } catch (error) {
      console.error(error)
      toast.error('バナー生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (template: typeof BANNER_TEMPLATES[0]) => {
    setSelectedTemplate(template.name)
    setCustomPrompt(template.basePrompt)
    setTextSettings(prev => ({ ...prev, text: template.placeholderText }))
  }

  const handleCustomGenerate = () => {
    if (!customPrompt.trim()) {
      toast.error('プロンプトを入力してください')
      return
    }
    generateBanner(customPrompt)
  }

  const saveBannerToDatabase = async (banner: GeneratedBanner) => {
    try {
      await fetch('/api/admin/ai-generator/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: banner.editedUrl || banner.url,
          originalUrl: banner.url,
          type: 'square',
          name: textSettings.text || '新規スクエアバナー',
          prompt: banner.prompt,
          hasText: !!banner.editedUrl
        })
      })
    } catch (error) {
      console.error('Failed to save banner:', error)
    }
  }

  const addTextToBanner = async (bannerId: string) => {
    const banner = generatedBanners.find(b => b.id === bannerId)
    if (!banner) return

    try {
      const response = await fetch('/api/admin/ai-generator/add-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: banner.editedUrl || banner.url,
          ...textSettings
        })
      })

      if (!response.ok) throw new Error('テキスト追加に失敗しました')

      const data = await response.json()
      
      const updatedBanner = { ...banner, editedUrl: data.imageUrl }
      setGeneratedBanners(prevBanners => 
        prevBanners.map(b => 
          b.id === bannerId ? updatedBanner : b
        )
      )
      
      // テキスト追加後のバナーをデータベースに保存
      await saveBannerToDatabase(updatedBanner)
      
      toast.success('テキストを追加しました！')
    } catch (error) {
      console.error(error)
      toast.error('テキスト追加に失敗しました')
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">300×300 スクエアバナー生成</h1>
          <p className="text-muted">ガチャ一覧やSNSシェア用の正方形バナーを生成</p>
        </div>
        <Link href="/admin/ai-generator" className="btn btn-secondary">
          戻る
        </Link>
      </div>

      {/* プロンプト入力エリア */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">バナー生成</h3>
        </div>
        <div className="card-body">
          {/* テンプレート選択ボタン */}
          <div className="mb-3">
            <label className="form-label">テンプレートを選択（カスタマイズ可能）</label>
            <div className="d-flex flex-wrap gap-2">
              {BANNER_TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  onClick={() => handleTemplateSelect(template)}
                  className={`btn btn-sm ${selectedTemplate === template.name ? 'btn-primary' : 'btn-outline-primary'}`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* カスタムプロンプト */}
          <div className="form-group mb-3">
            <label htmlFor="prompt">プロンプト（英語のみ、日本語は後で追加）</label>
            <textarea
              id="prompt"
              className="form-control"
              rows={4}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="例: Create a 300x300 Pokemon gacha banner with..."
            />
            <small className="form-text text-muted">
              ※ DALL-E 3は日本語に対応していないため、英語でプロンプトを入力してください
            </small>
          </div>
          
          <button
            onClick={handleCustomGenerate}
            disabled={loading || !customPrompt.trim()}
            className="btn btn-success"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                生成中...
              </>
            ) : (
              'バナーを生成'
            )}
          </button>
        </div>
      </div>

      {/* 生成履歴と編集エリア */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h3 className="h5 mb-0">生成履歴</h3>
            </div>
            <div className="card-body">
              {generatedBanners.length === 0 ? (
                <p className="text-muted text-center py-4">
                  まだバナーが生成されていません
                </p>
              ) : (
                <div className="row">
                  {generatedBanners.map((banner) => (
                    <div key={banner.id} className="col-md-6 col-lg-4 mb-4">
                      <div className={`card ${selectedBanner === banner.id ? 'border-primary' : ''}`}>
                        <div className="position-relative" style={{ paddingTop: '100%' }}>
                          <Image
                            src={banner.editedUrl || banner.url}
                            alt="Generated banner"
                            fill
                            className="card-img-top"
                            style={{ objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => setSelectedBanner(banner.id)}
                          />
                        </div>
                        <div className="card-body p-2">
                          <small className="text-muted d-block text-truncate">
                            {new Date(banner.timestamp).toLocaleString('ja-JP')}
                          </small>
                          <div className="mt-2 d-grid gap-1">
                            <button
                              onClick={() => setSelectedBanner(banner.id)}
                              className="btn btn-sm btn-outline-primary"
                            >
                              テキスト編集
                            </button>
                            <a
                              href={banner.editedUrl || banner.url}
                              download={`banner-${banner.id}.png`}
                              className="btn btn-sm btn-success"
                            >
                              ダウンロード
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* テキスト編集パネル */}
        <div className="col-lg-4">
          <div className="card sticky-top" style={{ top: '20px' }}>
            <div className="card-header">
              <h3 className="h5 mb-0">日本語テキスト追加</h3>
            </div>
            <div className="card-body">
              {selectedBanner ? (
                <>
                  <div className="mb-3">
                    <label htmlFor="text" className="form-label">テキスト</label>
                    <input
                      type="text"
                      id="text"
                      className="form-control"
                      value={textSettings.text}
                      onChange={(e) => setTextSettings(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="例：ピカチュウ大祭り"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="font" className="form-label">フォント</label>
                    <select
                      id="font"
                      className="form-select"
                      value={textSettings.font}
                      onChange={(e) => setTextSettings(prev => ({ ...prev, font: e.target.value }))}
                    >
                      {JAPANESE_FONTS.map(font => (
                        <option key={font.value} value={font.value}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="size" className="form-label">
                      サイズ: {textSettings.size}px
                    </label>
                    <input
                      type="range"
                      id="size"
                      className="form-range"
                      min="20"
                      max="80"
                      value={textSettings.size}
                      onChange={(e) => setTextSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="color" className="form-label">文字色</label>
                    <div className="d-flex gap-2">
                      <input
                        type="color"
                        id="color"
                        className="form-control form-control-color"
                        value={textSettings.color}
                        onChange={(e) => setTextSettings(prev => ({ ...prev, color: e.target.value }))}
                      />
                      <input
                        type="text"
                        className="form-control"
                        value={textSettings.color}
                        onChange={(e) => setTextSettings(prev => ({ ...prev, color: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="positionY" className="form-label">
                      縦位置: {textSettings.positionY}%
                    </label>
                    <input
                      type="range"
                      id="positionY"
                      className="form-range"
                      min="10"
                      max="90"
                      value={textSettings.positionY}
                      onChange={(e) => setTextSettings(prev => ({ ...prev, positionY: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="shadow"
                        className="form-check-input"
                        checked={textSettings.shadow}
                        onChange={(e) => setTextSettings(prev => ({ ...prev, shadow: e.target.checked }))}
                      />
                      <label htmlFor="shadow" className="form-check-label">
                        影をつける
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="stroke"
                        className="form-check-input"
                        checked={textSettings.stroke}
                        onChange={(e) => setTextSettings(prev => ({ ...prev, stroke: e.target.checked }))}
                      />
                      <label htmlFor="stroke" className="form-check-label">
                        縁取りをつける
                      </label>
                    </div>
                    {textSettings.stroke && (
                      <div className="mt-2">
                        <label htmlFor="strokeColor" className="form-label">縁取り色</label>
                        <div className="d-flex gap-2">
                          <input
                            type="color"
                            id="strokeColor"
                            className="form-control form-control-color"
                            value={textSettings.strokeColor}
                            onChange={(e) => setTextSettings(prev => ({ ...prev, strokeColor: e.target.value }))}
                          />
                          <input
                            type="text"
                            className="form-control"
                            value={textSettings.strokeColor}
                            onChange={(e) => setTextSettings(prev => ({ ...prev, strokeColor: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => addTextToBanner(selectedBanner)}
                    className="btn btn-primary w-100"
                    disabled={!textSettings.text.trim()}
                  >
                    テキストを適用
                  </button>
                </>
              ) : (
                <p className="text-muted text-center">
                  編集するバナーを選択してください
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}