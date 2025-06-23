'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ReferralData {
  code: string
  isActive: boolean
  referralUrl: string
  totalReferrals: number
  completedReferrals: number
  pendingReferrals: number
  totalPointsEarned: number
  referrals: Array<{
    id: string
    referredEmail: string
    registeredAt: string
    firstPaymentAt: string | null
    status: 'pending' | 'completed'
    pointsAwarded: number
  }>
}

interface CampaignSettings {
  referrerBonusPoints: number
  referredBonusPoints: number
  minPaymentAmount: number
}

export default function ReferralPage() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [campaignSettings, setCampaignSettings] = useState<CampaignSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchReferralData()
    fetchCampaignSettings()
  }, [])

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/mypage/referral')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
        throw new Error('データの取得に失敗しました')
      }
      const data = await response.json()
      setReferralData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaignSettings = async () => {
    try {
      const response = await fetch('/api/referral/campaign-settings')
      if (response.ok) {
        const data = await response.json()
        setCampaignSettings(data)
      }
    } catch (err) {
      console.error('キャンペーン設定の取得エラー:', err)
    }
  }

  const toggleReferralStatus = async () => {
    try {
      const response = await fetch('/api/mypage/referral/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !referralData?.isActive })
      })

      if (!response.ok) {
        throw new Error('ステータスの更新に失敗しました')
      }

      await fetchReferralData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'エラーが発生しました')
    }
  }

  const copyToClipboard = () => {
    if (referralData?.referralUrl) {
      navigator.clipboard.writeText(referralData.referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareOnTwitter = () => {
    if (referralData?.referralUrl) {
      const text = 'ACEORIPAで一緒にポケモンカードをゲットしよう！紹介コードを使うとボーナスポイントがもらえます！'
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralData.referralUrl)}`
      window.open(url, '_blank')
    }
  }

  const shareOnLine = () => {
    if (referralData?.referralUrl) {
      const text = 'ACEORIPAで一緒にポケモンカードをゲットしよう！紹介コードを使うとボーナスポイントがもらえます！'
      const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(referralData.referralUrl)}&text=${encodeURIComponent(text)}`
      window.open(url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dopa-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Link href="/mypage" className="text-dopa-red hover:underline">
            マイページに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/mypage" className="text-dopa-red hover:underline">
            ← マイページに戻る
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">紹介キャンペーン</h1>

        {/* キャンペーン説明 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">キャンペーン内容</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">紹介した方</h3>
              <p className="text-2xl font-bold text-blue-600 mb-2">
                {campaignSettings?.referrerBonusPoints.toLocaleString() || '1,000'}ポイント
              </p>
              <p className="text-sm text-gray-600">
                紹介した方が初回決済（{campaignSettings?.minPaymentAmount || 100}円以上）を完了すると獲得
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">紹介された方</h3>
              <p className="text-2xl font-bold text-green-600 mb-2">
                {campaignSettings?.referredBonusPoints.toLocaleString() || '500'}ポイント
              </p>
              <p className="text-sm text-gray-600">
                初回決済（{campaignSettings?.minPaymentAmount || 100}円以上）完了時に自動付与
              </p>
            </div>
          </div>
        </div>

        {/* 紹介URL管理 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">あなたの紹介URL</h2>
            <button
              onClick={toggleReferralStatus}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                referralData?.isActive
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-dopa-red text-white hover:bg-red-700'
              }`}
            >
              {referralData?.isActive ? 'キャンペーンを停止' : 'キャンペーンを開始'}
            </button>
          </div>

          {referralData?.isActive ? (
            <>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">紹介コード</p>
                <p className="text-2xl font-bold text-dopa-red mb-4">{referralData.code}</p>
                
                <p className="text-sm text-gray-600 mb-2">紹介URL</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={referralData.referralUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg bg-white"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-dopa-red text-white rounded-lg hover:bg-red-700 transition"
                  >
                    {copied ? 'コピー済み' : 'コピー'}
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={shareOnTwitter}
                  className="flex-1 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition"
                >
                  Twitterでシェア
                </button>
                <button
                  onClick={shareOnLine}
                  className="flex-1 px-4 py-2 bg-[#00B900] text-white rounded-lg hover:bg-[#00a000] transition"
                >
                  LINEでシェア
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              キャンペーンを開始すると、紹介URLが表示されます
            </div>
          )}
        </div>

        {/* 紹介実績 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">紹介実績</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{referralData?.totalReferrals || 0}</p>
              <p className="text-sm text-gray-600">総紹介数</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{referralData?.completedReferrals || 0}</p>
              <p className="text-sm text-gray-600">成約数</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500">{referralData?.pendingReferrals || 0}</p>
              <p className="text-sm text-gray-600">決済待ち</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-dopa-red">
                {referralData?.totalPointsEarned.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600">獲得ポイント</p>
            </div>
          </div>

          {/* 紹介履歴 */}
          {referralData?.referrals && referralData.referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">登録日</th>
                    <th className="text-left py-2">ステータス</th>
                    <th className="text-left py-2">初回決済日</th>
                    <th className="text-right py-2">獲得ポイント</th>
                  </tr>
                </thead>
                <tbody>
                  {referralData.referrals.map((referral) => (
                    <tr key={referral.id} className="border-b">
                      <td className="py-3">
                        {new Date(referral.registeredAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          referral.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {referral.status === 'completed' ? '成約' : '決済待ち'}
                        </span>
                      </td>
                      <td className="py-3">
                        {referral.firstPaymentAt
                          ? new Date(referral.firstPaymentAt).toLocaleDateString('ja-JP')
                          : '-'}
                      </td>
                      <td className="py-3 text-right font-bold">
                        {referral.pointsAwarded > 0
                          ? `+${referral.pointsAwarded.toLocaleString()}`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              まだ紹介実績がありません
            </p>
          )}
        </div>

        {/* 注意事項 */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="font-bold mb-2">注意事項</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• ポイントは紹介された方が初回決済を完了した時点で付与されます</li>
            <li>• 最低決済金額は{campaignSettings?.minPaymentAmount || 100}円です</li>
            <li>• 不正な紹介が発覚した場合、ポイントの取り消しやアカウント停止の対象となります</li>
            <li>• キャンペーン内容は予告なく変更される場合があります</li>
          </ul>
        </div>
      </div>
    </div>
  )
}