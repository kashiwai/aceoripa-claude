'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface UserPoints {
  free_points: number
  paid_points: number
  total_points: number
  last_updated: string
}

interface PointsResponse {
  success: boolean
  points: UserPoints
  error?: string
}

export function usePoints() {
  const [points, setPoints] = useState<UserPoints>({
    free_points: 0,
    paid_points: 0,
    total_points: 0,
    last_updated: new Date().toISOString()
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ポイント残高を取得
  const fetchPoints = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/user/points', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('ポイント情報の取得に失敗しました')
      }

      const data: PointsResponse = await response.json()

      if (data.success && data.points) {
        setPoints(data.points)
      } else {
        throw new Error(data.error || 'ポイント情報の取得に失敗しました')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました'
      setError(errorMessage)
      console.error('Points fetch error:', err)
      
      // 開発環境でのフォールバック
      if (process.env.NODE_ENV === 'development') {
        setPoints({
          free_points: 1000,
          paid_points: 5000,
          total_points: 6000,
          last_updated: new Date().toISOString()
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // コンポーネントマウント時にポイントを取得
  useEffect(() => {
    fetchPoints()
  }, [fetchPoints])

  // ポイント使用後の更新
  const updatePoints = useCallback((newPoints: Partial<UserPoints>) => {
    setPoints(prev => ({
      ...prev,
      ...newPoints,
      total_points: (newPoints.free_points ?? prev.free_points) + (newPoints.paid_points ?? prev.paid_points),
      last_updated: new Date().toISOString()
    }))
  }, [])

  // ポイント不足チェック
  const hasEnoughPoints = useCallback((requiredPoints: number) => {
    return points.total_points >= requiredPoints
  }, [points.total_points])

  return {
    points,
    isLoading,
    error,
    fetchPoints,
    updatePoints,
    hasEnoughPoints,
    totalPoints: points.total_points
  }
}