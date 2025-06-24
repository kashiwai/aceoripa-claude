'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface GeneratedBanner {
  style: string
  imageUrl: string
  prompt: string
  revisedPrompt?: string
}

const CAMPAIGN_TYPES = [
  { id: 'newUserCampaign', label: '新規登録キャンペーン', icon: '🎉' },
  { id: 'referralCampaign', label: '友達紹介キャンペーン', icon: '👥' },
  { id: 'specialEvent', label: '特別イベント', icon: '⭐' }
]

export default function GenerateBannerPage() {
  const [campaignType, setCampaignType] = useState('newUserCampaign')
  const [customPrompt, setCustomPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedBanners, setGeneratedBanners] = useState<GeneratedBanner[]>([])
  const [selectedBanner, setSelectedBanner] = useState<GeneratedBanner | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setGeneratedBanners([])

    try {
      // まずは本番のAPIを試す
      let response = await fetch('/api/ai/generate-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignType,
          customPrompt: customPrompt || undefined
        })
      })

      let data = await response.json()

      // OpenAI APIエラーの場合、モックAPIにフォールバック
      if (!response.ok && data.error && data.error.includes('API key')) {
        // console.log('OpenAI API failed, falling back to mock...')
        response = await fetch('/api/ai/generate-banner-mock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignType,
            customPrompt: customPrompt || undefined
          })
        })
        data = await response.json()
        
        if (data.mock) {
          setError('注意: OpenAI APIキーが無効なため、サンプル画像を表示しています')
        }
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'バナー生成に失敗しました')
      }

      setGeneratedBanners(data.banners)
    } catch (error) {
      console.error('Generation error:', error)
      setError(error instanceof Error ? error.message : 'エラーが発生しました')
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveBanner = async (banner: GeneratedBanner) => {
    try {
      // 選択したバナーをメインバナーとして保存
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: campaignType === 'newUserCampaign' ? '新規登録キャンペーン' : 
                 campaignType === 'referralCampaign' ? '友達紹介キャンペーン' : 
                 '特別イベント',
          subtitle: 'AI生成バナー',
          description: banner.revisedPrompt || banner.prompt,
          imageUrl: banner.imageUrl,
          linkUrl: campaignType === 'newUserCampaign' ? '/auth/register' : 
                   campaignType === 'referralCampaign' ? '/mypage/referral' : 
                   '/campaign',
          linkType: 'campaign',
          priority: 10,
          isActive: true,
          backgroundColor: 'from-purple-500 to-pink-500',
          textColor: 'text-white'
        })
      })

      if (response.ok) {
        alert('バナーが保存されました！')
      } else {
        throw new Error('保存に失敗しました')
      }
    } catch (error) {
      alert('バナーの保存中にエラーが発生しました')
      console.error('Save error:', error)
    }
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-1">AIバナー生成</h1>
          <p className="text-muted">AIを使用してキャンペーンバナーを自動生成します</p>
        </div>
      </div>

      {/* 生成設定 */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">生成設定</h5>
        </div>
        <div className="card-body">
          {/* キャンペーンタイプ選択 */}
          <div className="mb-4">
            <label className="form-label">キャンペーンタイプ</label>
            <div className="btn-group w-100" role="group">
              {CAMPAIGN_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  className={`btn ${campaignType === type.id ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setCampaignType(type.id)}
                >
                  <span className="me-2">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* カスタムプロンプト */}
          <div className="mb-4">
            <label className="form-label">
              カスタムプロンプト（オプション）
              <small className="text-muted ms-2">より具体的な指示を追加できます</small>
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="例: ピカチュウをメインに、金色の背景で豪華な雰囲気のバナー"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>

          {/* 生成ボタン */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn btn-lg btn-primary w-100"
          >
            {generating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                生成中... (約30秒かかります)
              </>
            ) : (
              <>
                <i className="bi bi-magic me-2"></i>
                AIバナーを生成
              </>
            )}
          </button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* 生成結果 */}
      {generatedBanners.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">生成されたバナー（{generatedBanners.length}パターン）</h5>
          </div>
          <div className="card-body">
            <div className="row g-4">
              {generatedBanners.map((banner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="col-12"
                >
                  <div className="border rounded p-3">
                    <div className="row">
                      <div className="col-md-8">
                        <div className="position-relative" style={{ aspectRatio: '16/9' }}>
                          <Image
                            src={banner.imageUrl}
                            alt={`Generated banner ${index + 1}`}
                            fill
                            className="rounded object-cover"
                            unoptimized
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <h6 className="mb-3">スタイル: {banner.style}</h6>
                        <p className="text-muted small mb-3">
                          {banner.revisedPrompt || banner.prompt}
                        </p>
                        <div className="d-grid gap-2">
                          <button
                            onClick={() => setSelectedBanner(banner)}
                            className="btn btn-outline-primary"
                          >
                            <i className="bi bi-eye me-2"></i>
                            プレビュー
                          </button>
                          <button
                            onClick={() => handleSaveBanner(banner)}
                            className="btn btn-success"
                          >
                            <i className="bi bi-save me-2"></i>
                            このバナーを保存
                          </button>
                          <a
                            href={banner.imageUrl}
                            download={`banner-${campaignType}-${index + 1}.png`}
                            className="btn btn-outline-secondary"
                          >
                            <i className="bi bi-download me-2"></i>
                            画像をダウンロード
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* プレビューモーダル */}
      {selectedBanner && (
        <div 
          className="modal d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          onClick={() => setSelectedBanner(null)}
        >
          <div 
            className="modal-dialog modal-xl modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">バナープレビュー</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedBanner(null)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <div className="position-relative" style={{ aspectRatio: '16/9' }}>
                  <Image
                    src={selectedBanner.imageUrl}
                    alt="Banner preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {/* サンプルテキストオーバーレイ */}
                  <div className="position-absolute top-50 start-50 translate-middle text-center text-white">
                    <h1 className="display-3 fw-bold mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                      {campaignType === 'newUserCampaign' ? '新規登録で500Pプレゼント！' : 
                       campaignType === 'referralCampaign' ? '友達紹介で1000Pゲット！' : 
                       '期間限定スペシャルイベント'}
                    </h1>
                    <button className="btn btn-lg btn-warning">
                      今すぐ参加
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}