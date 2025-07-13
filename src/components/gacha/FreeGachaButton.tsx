'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface FreeGachaButtonProps {
  gachaId: string
  className?: string
}

interface FreeGachaStatus {
  can_use: boolean
  reason?: string
  message?: string
  next_reset_time?: string
  hours_until_reset?: number
  gacha_title?: string
}

export default function FreeGachaButton({ gachaId, className = '' }: FreeGachaButtonProps) {
  const router = useRouter()
  const [status, setStatus] = useState<FreeGachaStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [timeUntilReset, setTimeUntilReset] = useState<string>('')

  // 無料ガチャ状況をチェック
  const checkFreeGachaStatus = async () => {
    try {
      const response = await fetch(`/api/gacha/free/check?gacha_product_id=${gachaId}`)
      const data = await response.json()
      
      if (data.success) {
        setStatus(data)
      } else {
        setStatus(null)
      }
    } catch (error) {
      console.error('Error checking free gacha status:', error)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  // 残り時間のカウントダウン
  useEffect(() => {
    if (!status?.next_reset_time) return

    const updateCountdown = () => {
      const now = new Date()
      const reset = new Date(status.next_reset_time!)
      const diff = reset.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeUntilReset('利用可能')
        // 利用可能になったら状況を再チェック
        checkFreeGachaStatus()
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeUntilReset(`${hours}時間${minutes}分${seconds}秒`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [status?.next_reset_time])

  // 初回読み込み
  useEffect(() => {
    checkFreeGachaStatus()
  }, [gachaId])

  // 無料ガチャ実行
  const handleFreeGacha = async () => {
    if (!status?.can_use) return

    setExecuting(true)
    try {
      const response = await fetch('/api/gacha/free', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gacha_product_id: gachaId
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('無料ガチャを引きました！')
        // ガチャ結果ページに遷移
        router.push(`/gacha/${gachaId}/result?free=true&card_id=${data.card.id}`)
      } else {
        toast.error(data.error || '無料ガチャに失敗しました')
        // エラー後は状況を再チェック
        checkFreeGachaStatus()
      }
    } catch (error) {
      console.error('Error executing free gacha:', error)
      toast.error('エラーが発生しました')
    } finally {
      setExecuting(false)
    }
  }

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-700 rounded-xl h-16 ${className}`}>
        <div className="h-full bg-gray-600 rounded-xl"></div>
      </div>
    )
  }

  // 無料ガチャが利用可能でない場合は表示しない
  if (!status) return null

  if (status.can_use) {
    return (
      <button
        onClick={handleFreeGacha}
        disabled={executing}
        className={`bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black py-4 px-6 rounded-xl hover:scale-105 transform transition shadow-lg text-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <span className="relative z-10 flex items-center justify-center">
          {executing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              実行中...
            </>
          ) : (
            <>
              <span className="text-2xl mr-2">🆓</span>
              無料ガチャ
            </>
          )}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        
        {/* 脈動エフェクト */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-30 transition-opacity rounded-xl animate-pulse"></div>
      </button>
    )
  }

  // 利用済みの場合はカウントダウン表示
  if (status.reason === 'already_used_today') {
    return (
      <div className={`bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg text-center ${className}`}>
        <div className="flex items-center justify-center mb-1">
          <span className="text-xl mr-2">⏰</span>
          <span className="text-lg">無料ガチャ</span>
        </div>
        <div className="text-sm opacity-80">
          次回利用まで: {timeUntilReset}
        </div>
        <div className="text-xs opacity-60 mt-1">
          毎日午前4時にリセット
        </div>
      </div>
    )
  }

  // その他の理由で利用不可
  return (
    <div className={`bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg text-center opacity-50 ${className}`}>
      <div className="flex items-center justify-center">
        <span className="text-xl mr-2">❌</span>
        <span className="text-lg">無料ガチャ利用不可</span>
      </div>
      <div className="text-sm opacity-80 mt-1">
        {status.message || '利用できません'}
      </div>
    </div>
  )
}