// OpenAI Sora 2 API Client

import { VideoGenerationRequest, VideoGenerationResponse } from './types'

const SORA2_API_ENDPOINT = 'https://api.openai.com/v1'

export class Sora2Client {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_SORA2_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('OpenAI Sora 2 API key is required')
    }
  }

  /**
   * 動画生成リクエスト
   */
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      console.log('[Sora2] Generating video with prompt:', request.prompt.substring(0, 100))

      // Sora 2のリクエスト形式
      // 注: 実際のSora APIが公開されたら、正式なエンドポイントとリクエスト形式に更新が必要
      const sora2Request = {
        model: 'sora-2', // または 'sora-turbo' など
        prompt: request.prompt,
        duration: request.duration || 5,
        size: this.mapAspectRatioToSize(request.aspectRatio || '16:9'),
        quality: request.quality || '1080p',
        n: 1, // 生成数
      }

      // Sora APIエンドポイント（仮）
      // 実際のエンドポイントは公式ドキュメントに基づいて調整
      const endpoint = `${SORA2_API_ENDPOINT}/videos/generations`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'sora-2', // βアクセス用ヘッダー（必要に応じて）
        },
        body: JSON.stringify(sora2Request),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
        console.error('[Sora2] API error:', errorData)
        throw new Error(`Sora2 API error: ${response.status} - ${errorData.error?.message || JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      console.log('[Sora2] Generation response received')

      // レスポンス形式の例（実際のAPIに基づいて調整）
      // {
      //   "id": "gen_xxx",
      //   "object": "video.generation",
      //   "created": 1234567890,
      //   "data": [
      //     {
      //       "url": "https://...",
      //       "thumbnail_url": "https://..."
      //     }
      //   ]
      // }

      const jobId = data.id || `sora2_${Date.now()}`
      const videoUrl = data.data?.[0]?.url || data.url
      const thumbnailUrl = data.data?.[0]?.thumbnail_url || data.thumbnail_url

      return {
        id: jobId,
        status: videoUrl ? 'completed' : 'processing',
        videoUrl: videoUrl,
        thumbnailUrl: thumbnailUrl,
        provider: 'sora2',
        createdAt: new Date().toISOString(),
        duration: request.duration,
      }
    } catch (error) {
      console.error('[Sora2] Error generating video:', error)
      throw error
    }
  }

  /**
   * ジョブステータス確認
   */
  async getJobStatus(jobId: string): Promise<VideoGenerationResponse> {
    try {
      console.log('[Sora2] Checking job status:', jobId)

      const endpoint = `${SORA2_API_ENDPOINT}/videos/generations/${jobId}`

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'sora-2',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get job status: ${response.status}`)
      }

      const data = await response.json()

      const status = data.status || 'processing'
      const videoUrl = data.data?.[0]?.url || data.url
      const thumbnailUrl = data.data?.[0]?.thumbnail_url

      return {
        id: jobId,
        status: this.mapSoraStatus(status),
        videoUrl: videoUrl,
        thumbnailUrl: thumbnailUrl,
        provider: 'sora2',
        createdAt: data.created_at || new Date().toISOString(),
        completedAt: status === 'succeeded' ? new Date().toISOString() : undefined,
        error: data.error?.message,
      }
    } catch (error) {
      console.error('[Sora2] Error checking job status:', error)
      throw error
    }
  }

  /**
   * アスペクト比をSora APIのサイズ形式にマッピング
   */
  private mapAspectRatioToSize(aspectRatio: string): string {
    const sizeMap: Record<string, string> = {
      '16:9': '1920x1080',
      '9:16': '1080x1920',
      '1:1': '1080x1080',
      '4:3': '1440x1080',
    }
    return sizeMap[aspectRatio] || '1920x1080'
  }

  /**
   * Sora APIのステータスを統一形式にマッピング
   */
  private mapSoraStatus(status: string): 'pending' | 'processing' | 'completed' | 'failed' {
    const statusMap: Record<string, 'pending' | 'processing' | 'completed' | 'failed'> = {
      pending: 'pending',
      queued: 'pending',
      processing: 'processing',
      in_progress: 'processing',
      succeeded: 'completed',
      completed: 'completed',
      failed: 'failed',
      error: 'failed',
    }
    return statusMap[status.toLowerCase()] || 'processing'
  }
}
