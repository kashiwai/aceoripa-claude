// Google Veo 3 API Client

import { VideoGenerationRequest, VideoGenerationResponse } from './types'

const VEO3_API_ENDPOINT = 'https://us-central1-aiplatform.googleapis.com/v1'
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'aceoripa'
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'

export class Veo3Client {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_VEO3_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('Google Veo 3 API key is required')
    }
  }

  /**
   * 動画生成リクエスト
   */
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      console.log('[Veo3] Generating video with prompt:', request.prompt.substring(0, 100))

      // Veo 3のリクエスト形式（実際のAPIドキュメントに基づいて調整が必要）
      const veo3Request = {
        instances: [
          {
            prompt: request.prompt,
            parameters: {
              duration: request.duration || 5, // デフォルト5秒
              aspectRatio: request.aspectRatio || '16:9',
              quality: request.quality || '1080p',
              seed: request.seed,
            },
          },
        ],
      }

      const endpoint = `${VEO3_API_ENDPOINT}/projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/veo3:predict`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'X-Goog-User-Project': PROJECT_ID,
        },
        body: JSON.stringify(veo3Request),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[Veo3] API error:', errorData)
        throw new Error(`Veo3 API error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      console.log('[Veo3] Generation response received')

      // レスポンスの解析（実際のAPIレスポンス形式に基づいて調整が必要）
      const jobId = data.name || data.id || `veo3_${Date.now()}`
      const videoUrl = data.predictions?.[0]?.videoUri || data.videoUrl

      return {
        id: jobId,
        status: videoUrl ? 'completed' : 'processing',
        videoUrl: videoUrl,
        provider: 'veo3',
        createdAt: new Date().toISOString(),
        duration: request.duration,
      }
    } catch (error) {
      console.error('[Veo3] Error generating video:', error)
      throw error
    }
  }

  /**
   * ジョブステータス確認
   */
  async getJobStatus(jobId: string): Promise<VideoGenerationResponse> {
    try {
      console.log('[Veo3] Checking job status:', jobId)

      const endpoint = `${VEO3_API_ENDPOINT}/projects/${PROJECT_ID}/locations/${LOCATION}/operations/${jobId}`

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'X-Goog-User-Project': PROJECT_ID,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get job status: ${response.status}`)
      }

      const data = await response.json()

      const isDone = data.done === true
      const hasError = !!data.error
      const videoUrl = data.response?.videoUri || data.response?.videoUrl

      return {
        id: jobId,
        status: hasError ? 'failed' : isDone ? 'completed' : 'processing',
        videoUrl: videoUrl,
        provider: 'veo3',
        createdAt: data.metadata?.createTime || new Date().toISOString(),
        completedAt: isDone ? new Date().toISOString() : undefined,
        error: data.error?.message,
      }
    } catch (error) {
      console.error('[Veo3] Error checking job status:', error)
      throw error
    }
  }
}
