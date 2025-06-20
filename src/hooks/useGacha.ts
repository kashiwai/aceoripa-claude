import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface GachaResult {
  cardId: string
  cardName: string
  rarity: string
  imageUrl: string
  isNew: boolean
  isPickup?: boolean
}

interface GachaResponse {
  success: boolean
  results: GachaResult[]
  remainingPoints: {
    free: number
    paid: number
    total: number
  }
  gachaInfo: {
    name: string
    drawCount: number
  }
  error?: string
}

export function useGacha() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<GachaResult[]>([])

  const executeGacha = useCallback(async (gachaId: string, drawCount: 1 | 10) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/gacha/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gachaId,
          drawCount,
        }),
      })

      const data: GachaResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'ガチャの実行に失敗しました')
      }

      if (data.success) {
        setResults(data.results)
        
        // 新規カード獲得の通知
        const newCards = data.results.filter(r => r.isNew)
        if (newCards.length > 0) {
          toast.success(`新規カード${newCards.length}枚獲得！`)
        }
        
        // SSR獲得の特別通知
        const ssrCards = data.results.filter(r => r.rarity === 'SSR')
        if (ssrCards.length > 0) {
          toast.success('🎉 SSR獲得！おめでとうございます！', {
            duration: 5000,
            style: {
              background: '#FFD700',
              color: '#000',
              fontWeight: 'bold',
            },
          })
        }
        
        return data
      }
      
      throw new Error('ガチャの実行に失敗しました')
    } catch (error) {
      console.error('Gacha error:', error)
      toast.error(error instanceof Error ? error.message : 'エラーが発生しました')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
  }, [])

  return {
    executeGacha,
    clearResults,
    isLoading,
    results,
  }
}