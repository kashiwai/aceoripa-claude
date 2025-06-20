import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface ImageGeneratorHook {
  generateGachaImage: (config: any) => Promise<string>
  generateBannerImage: (config: any) => Promise<string>
  generateBatchImages: (configs: any[]) => Promise<any[]>
  generatePredefinedImages: () => Promise<void>
  isGenerating: boolean
}

export function useImageGenerator(): ImageGeneratorHook {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateGachaImage = useCallback(async (config: any): Promise<string> => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/images/auto-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'gacha',
          config
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('ガチャ画像を生成しました！')
        return data.imageUrl
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Failed to generate gacha image:', error)
      toast.error('ガチャ画像の生成に失敗しました')
      return ''
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const generateBannerImage = useCallback(async (config: any): Promise<string> => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/images/auto-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'banner',
          config
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('バナー画像を生成しました！')
        return data.imageUrl
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Failed to generate banner image:', error)
      toast.error('バナー画像の生成に失敗しました')
      return ''
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const generateBatchImages = useCallback(async (configs: any[]): Promise<any[]> => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/images/auto-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch: true,
          config: configs
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(`${data.results.length}枚の画像を生成しました！`)
        return data.results
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Failed to generate batch images:', error)
      toast.error('バッチ画像生成に失敗しました')
      return []
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const generatePredefinedImages = useCallback(async (): Promise<void> => {
    setIsGenerating(true)
    try {
      toast.loading('事前定義画像を生成中...', { id: 'predefined' })
      
      const response = await fetch('/api/images/auto-generate', {
        method: 'GET'
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(
          `事前定義画像の生成完了！ガチャ:${data.results.gachas.length}枚、バナー:${data.results.banners.length}枚`,
          { id: 'predefined' }
        )
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Failed to generate predefined images:', error)
      toast.error('事前定義画像の生成に失敗しました', { id: 'predefined' })
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return {
    generateGachaImage,
    generateBannerImage,
    generateBatchImages,
    generatePredefinedImages,
    isGenerating
  }
}