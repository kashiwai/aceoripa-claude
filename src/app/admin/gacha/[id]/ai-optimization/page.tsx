'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface GachaData {
  id: string
  title: string
  description: string
  price: number
  total_packs: number
  remaining_packs: number
  status: string
}

interface OptimizationResult {
  success: boolean
  message: string
  suggestions?: {
    priceAdjustment?: number
    packCountAdjustment?: number
    rarityAdjustment?: string
    marketingTips?: string[]
  }
}

export default function AIOptimizationPage() {
  const params = useParams()
  const gachaId = params.id as string
  const [gachaData, setGachaData] = useState<GachaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [optimizing, setOptimizing] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)

  useEffect(() => {
    const fetchGachaData = async () => {
      try {
        const response = await fetch(`/api/admin/gacha/${gachaId}`)
        const data = await response.json()
        
        if (data.success && data.product) {
          setGachaData({
            id: data.product.id,
            title: data.product.name,
            description: data.product.description,
            price: data.product.single_price,
            total_packs: data.product.total_packs || 0,
            remaining_packs: data.product.remaining_packs || 0,
            status: data.product.is_active ? 'active' : 'inactive'
          })
        } else {
          console.error('ガチャデータの取得に失敗:', data.error)
        }
      } catch (error) {
        console.error('Error fetching gacha data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (gachaId) {
      fetchGachaData()
    }
  }, [gachaId])

  const handleOptimize = async () => {
    if (!gachaData) return

    setOptimizing(true)
    try {
      const response = await fetch(`/api/admin/gacha/${gachaId}/ai-optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gachaData: gachaData
        })
      })

      const result = await response.json()
      setOptimizationResult(result)
    } catch (error) {
      console.error('Error optimizing gacha:', error)
      setOptimizationResult({
        success: false,
        message: 'AI最適化に失敗しました'
      })
    } finally {
      setOptimizing(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!gachaData) {
    return (
      <div className="p-6">
        <div className="alert alert-danger">
          ガチャデータが見つかりません
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">AI最適化機能</h1>
        <button
          onClick={handleOptimize}
          disabled={optimizing}
          className="btn btn-primary"
        >
          {optimizing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              最適化中...
            </>
          ) : (
            'AI最適化を実行'
          )}
        </button>
      </div>

      {/* ガチャ情報 */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">ガチャ情報</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>タイトル:</strong> {gachaData.title}</p>
              <p><strong>価格:</strong> {gachaData.price.toLocaleString()}円</p>
              <p><strong>総パック数:</strong> {gachaData.total_packs}</p>
            </div>
            <div className="col-md-6">
              <p><strong>残りパック数:</strong> {gachaData.remaining_packs}</p>
              <p><strong>販売率:</strong> {Math.round(((gachaData.total_packs - gachaData.remaining_packs) / gachaData.total_packs) * 100)}%</p>
              <p><strong>ステータス:</strong> {gachaData.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 最適化結果 */}
      {optimizationResult && (
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">AI最適化結果</h5>
          </div>
          <div className="card-body">
            {optimizationResult.success ? (
              <div className="alert alert-success">
                <h6>最適化提案</h6>
                {optimizationResult.suggestions && (
                  <div className="mt-3">
                    {optimizationResult.suggestions.priceAdjustment && (
                      <p><strong>価格調整:</strong> {optimizationResult.suggestions.priceAdjustment > 0 ? '+' : ''}{optimizationResult.suggestions.priceAdjustment}円</p>
                    )}
                    {optimizationResult.suggestions.packCountAdjustment && (
                      <p><strong>パック数調整:</strong> {optimizationResult.suggestions.packCountAdjustment > 0 ? '+' : ''}{optimizationResult.suggestions.packCountAdjustment}パック</p>
                    )}
                    {optimizationResult.suggestions.rarityAdjustment && (
                      <p><strong>レアリティ調整:</strong> {optimizationResult.suggestions.rarityAdjustment}</p>
                    )}
                    {optimizationResult.suggestions.marketingTips && (
                      <div>
                        <p><strong>マーケティング提案:</strong></p>
                        <ul>
                          {optimizationResult.suggestions.marketingTips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="alert alert-danger">
                {optimizationResult.message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}