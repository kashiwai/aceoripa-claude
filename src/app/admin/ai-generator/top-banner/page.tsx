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
  type: 'mobile' | 'desktop'
}

const BANNER_TEMPLATES = [
  {
    name: '新ガチャ告知',
    promptMobile: 'Create a 375x200 horizontal banner for Pokemon gacha game, new release announcement, epic Pokemon silhouettes, "NEW GACHA" text, gradient background, mobile optimized',
    promptDesktop: 'Create a 1920x400 ultra-wide banner for Pokemon gacha game, new release announcement, multiple Pokemon characters, cinematic composition, "NEW GACHA" text overlay',
    category: 'announcement'
  },
  {
    name: '期間限定イベント',
    promptMobile: 'Design a 375x200 limited time event banner, countdown timer visual, urgent red and gold colors, "LIMITED TIME" Japanese text, mobile game aesthetic',
    promptDesktop: 'Design a 1920x400 limited time event banner, dramatic countdown atmosphere, premium effects, wide cinematic layout, "期間限定" large text',
    category: 'event'
  },
  {
    name: 'SSRピックアップ',
    promptMobile: 'Create 375x200 SSR Pokemon featured banner, holographic effects, rainbow gradient, luxury feel, "SSR PICKUP" text, mobile optimized layout',
    promptDesktop: 'Create 1920x400 SSR Pokemon showcase banner, multiple legendary Pokemon, premium golden frame, particle effects, wide screen composition',
    category: 'pickup'
  },
  {
    name: 'コラボレーション',
    promptMobile: 'Design 375x200 collaboration event banner, two franchises meeting, special crossover theme, "COLLABORATION" text, mobile friendly',
    promptDesktop: 'Design 1920x400 collaboration event banner, epic crossover scene, dual franchise elements, cinematic wide layout',
    category: 'collab'
  },
  {
    name: '周年記念',
    promptMobile: 'Create 375x200 anniversary celebration banner, festive confetti, gold and silver theme, "ANNIVERSARY" text, mobile layout',
    promptDesktop: 'Create 1920x400 anniversary celebration banner, grand celebration scene, fireworks, premium anniversary logo, ultra-wide format',
    category: 'anniversary'
  }
]

export default function TopBannerGeneratorPage() {
  const [loading, setLoading] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [bannerType, setBannerType] = useState<'mobile' | 'desktop'>('mobile')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [generatedBanners, setGeneratedBanners] = useState<GeneratedBanner[]>([])

  const generateBanner = async (prompt: string, type: 'mobile' | 'desktop') => {
    setLoading(true)
    try {
      const size = type === 'mobile' ? '1024x1024' : '1792x1024' // DALL-E 3のサポートサイズ
      
      const response = await fetch('/api/admin/ai-generator/top-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt + ', high quality, gacha game style, no text overlapping important elements',
          size: size,
          type: type
        })
      })

      if (!response.ok) throw new Error('生成に失敗しました')

      const data = await response.json()
      
      const newBanner: GeneratedBanner = {
        id: Date.now().toString(),
        url: data.imageUrl,
        prompt: prompt,
        timestamp: new Date().toISOString(),
        type: type
      }

      setGeneratedBanners([newBanner, ...generatedBanners])
      toast.success('バナーを生成しました！')
    } catch (error) {
      console.error(error)
      toast.error('バナー生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateGenerate = (template: typeof BANNER_TEMPLATES[0]) => {
    setSelectedTemplate(template.name)
    const prompt = bannerType === 'mobile' ? template.promptMobile : template.promptDesktop
    generateBanner(prompt, bannerType)
  }

  const handleCustomGenerate = () => {
    if (!customPrompt.trim()) {
      toast.error('プロンプトを入力してください')
      return
    }
    generateBanner(customPrompt, bannerType)
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">トップページ用バナー生成</h1>
          <p className="text-muted">スライダー表示用の横長バナーを生成</p>
        </div>
        <Link href="/admin/ai-generator" className="btn btn-secondary">
          戻る
        </Link>
      </div>

      {/* バナータイプ選択 */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">バナータイプ選択</h3>
        </div>
        <div className="card-body">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${bannerType === 'mobile' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setBannerType('mobile')}
            >
              モバイル用 (375×200)
            </button>
            <button
              type="button"
              className={`btn ${bannerType === 'desktop' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setBannerType('desktop')}
            >
              デスクトップ用 (1920×400)
            </button>
          </div>
        </div>
      </div>

      {/* テンプレート選択 */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">テンプレートから生成</h3>
        </div>
        <div className="card-body">
          <div className="row">
            {BANNER_TEMPLATES.map((template) => (
              <div key={template.name} className="col-md-6 col-lg-4 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{template.name}</h5>
                    <p className="card-text small text-muted">
                      カテゴリ: {template.category}
                    </p>
                    <button
                      onClick={() => handleTemplateGenerate(template)}
                      disabled={loading}
                      className="btn btn-primary btn-sm w-100"
                    >
                      このテンプレートで生成
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* カスタムプロンプト */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h5 mb-0">カスタムプロンプトで生成</h3>
        </div>
        <div className="card-body">
          <div className="form-group mb-3">
            <label htmlFor="prompt">プロンプト（英語推奨）</label>
            <textarea
              id="prompt"
              className="form-control"
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={`例: Create a ${bannerType === 'mobile' ? '375x200' : '1920x400'} Pokemon gacha banner...`}
            />
            <small className="form-text text-muted">
              ※ {bannerType === 'mobile' ? 'モバイル用' : 'デスクトップ用'}に最適化されます
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
              'カスタム生成'
            )}
          </button>
        </div>
      </div>

      {/* 生成履歴 */}
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
                <div key={banner.id} className="col-12 mb-4">
                  <div className="card">
                    <div className="row g-0">
                      <div className={banner.type === 'mobile' ? 'col-md-4' : 'col-12'}>
                        <div 
                          className="position-relative" 
                          style={{ 
                            paddingTop: banner.type === 'mobile' ? '53.33%' : '20.83%' 
                          }}
                        >
                          <Image
                            src={banner.url}
                            alt="Generated banner"
                            fill
                            className="card-img"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      </div>
                      <div className={banner.type === 'mobile' ? 'col-md-8' : 'col-12'}>
                        <div className="card-body">
                          <h5 className="card-title">
                            {banner.type === 'mobile' ? 'モバイル' : 'デスクトップ'}バナー
                          </h5>
                          <p className="card-text small text-muted">
                            {banner.prompt}
                          </p>
                          <p className="card-text">
                            <small className="text-muted">
                              {new Date(banner.timestamp).toLocaleString('ja-JP')}
                            </small>
                          </p>
                          <div className="d-flex gap-2">
                            <a
                              href={banner.url}
                              download={`banner-${banner.type}-${banner.id}.png`}
                              className="btn btn-sm btn-primary"
                            >
                              ダウンロード
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(banner.url)
                                toast.success('URLをコピーしました')
                              }}
                              className="btn btn-sm btn-outline-secondary"
                            >
                              URLコピー
                            </button>
                          </div>
                        </div>
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
  )
}