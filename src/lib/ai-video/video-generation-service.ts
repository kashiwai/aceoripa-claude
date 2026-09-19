// 統一動画生成サービス

import { Veo3Client } from './veo3-client'
import { Sora2Client } from './sora2-client'
import {
  VideoProvider,
  VideoGenerationRequest,
  VideoGenerationResponse,
  Rarity,
  RARITY_PROMPTS,
} from './types'

export class VideoGenerationService {
  private veo3Client: Veo3Client
  private sora2Client: Sora2Client

  constructor() {
    this.veo3Client = new Veo3Client()
    this.sora2Client = new Sora2Client()
  }

  /**
   * 動画生成リクエスト（プロバイダー自動選択）
   */
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const client = this.getClient(request.provider)
    return await client.generateVideo(request)
  }

  /**
   * レアリティベースの演出動画生成
   */
  async generateGachaAnimation(
    rarity: Rarity,
    phase: 'intro' | 'reveal' | 'final_reveal',
    cardName: string,
    provider: VideoProvider = 'veo3', // デフォルトはVEO3
    customPrompt?: string,
    cardImageUrl?: string // final_reveal用のカード画像URL
  ): Promise<VideoGenerationResponse> {
    // プロンプトの構築
    const basePrompt = RARITY_PROMPTS[rarity][phase]
    const prompt = customPrompt || this.buildGachaPrompt(rarity, phase, cardName, basePrompt, cardImageUrl)

    // 動画生成設定
    const request: VideoGenerationRequest = {
      prompt,
      provider,
      duration: this.getDurationByRarity(rarity, phase),
      quality: rarity === 'SS' || rarity === 'S' ? '1080p' : '720p',
      aspectRatio: '16:9',
    }

    console.log(`[VideoGen] Generating ${rarity} ${phase} animation for ${cardName}`)
    return await this.generateVideo(request)
  }

  /**
   * カード画像からfinal_reveal動画を生成（Image-to-Video）
   */
  async generateFinalRevealFromImage(
    rarity: Rarity,
    cardName: string,
    cardImageUrl: string,
    provider: VideoProvider = 'veo3'
  ): Promise<VideoGenerationResponse> {
    const basePrompt = RARITY_PROMPTS[rarity].final_reveal

    const prompt = `
${basePrompt}

This is the final card reveal animation for "${cardName}".
The card should be the central focus, prominently displayed.
Style: Premium Pokemon card game animation, cinematic quality
Camera: Smooth rotation around the card, dramatic angles
Lighting: ${this.getLightingByRarity(rarity)}
Duration: ${this.getDurationByRarity(rarity, 'final_reveal')} seconds

IMPORTANT: The card image provided should be the main subject of the video.
Animate the card with particle effects, lighting, and camera movement matching the ${rarity} rarity tier.
`.trim()

    const request: VideoGenerationRequest = {
      prompt,
      provider,
      duration: this.getDurationByRarity(rarity, 'final_reveal'),
      quality: rarity === 'SS' || rarity === 'S' ? '1080p' : '720p',
      aspectRatio: '16:9',
    }

    console.log(`[VideoGen] Generating ${rarity} final_reveal (Image-to-Video) for ${cardName}`)
    console.log(`[VideoGen] Source image: ${cardImageUrl}`)

    // TODO: Image-to-Video APIの実装
    // 現在のVEO3/SORA2クライアントにImage-to-Video機能を追加する必要があります
    return await this.generateVideo(request)
  }

  /**
   * ジョブステータス確認
   */
  async getJobStatus(jobId: string, provider: VideoProvider): Promise<VideoGenerationResponse> {
    const client = this.getClient(provider)
    return await client.getJobStatus(jobId)
  }

  /**
   * プロバイダーに応じたクライアント取得
   */
  private getClient(provider: VideoProvider) {
    switch (provider) {
      case 'veo3':
        return this.veo3Client
      case 'sora2':
        return this.sora2Client
      default:
        throw new Error(`Unknown video provider: ${provider}`)
    }
  }

  /**
   * ガチャ演出用のプロンプト構築
   */
  private buildGachaPrompt(
    rarity: Rarity,
    phase: 'intro' | 'reveal' | 'final_reveal',
    cardName: string,
    basePrompt: string,
    cardImageUrl?: string
  ): string {
    const phaseText =
      phase === 'intro'
        ? 'anticipation build-up'
        : phase === 'reveal'
        ? 'card reveal moment'
        : 'final card presentation with the actual card'

    const cardImageNote = cardImageUrl
      ? `\n\nIMPORTANT: Use the provided card image (${cardImageUrl}) as the main subject. The card should be clearly visible and be the focal point of the animation.`
      : ''

    return `
${basePrompt}

Context: This is a ${phaseText} animation for a Pokemon card gacha game.
Card: "${cardName}" (${rarity} rarity)
Style: Cinematic, high-quality, game-like animation
Camera: Dynamic camera movements, professional cinematography
Lighting: Dramatic and atmospheric lighting matching the ${rarity} rarity tier
Effects: High-quality particle effects, smooth transitions

Technical requirements:
- Smooth 60fps animation
- High contrast and vibrant colors
- Professional game trailer quality
- Clear focus on the main subject
${
  phase === 'final_reveal'
    ? '- The actual card image should be the centerpiece\n- Animate around the card with effects and camera movements'
    : phase === 'reveal'
    ? '- Card should be prominently displayed'
    : '- Build anticipation and excitement'
}${cardImageNote}
`.trim()
  }

  /**
   * レアリティとフェーズに応じた動画の長さ
   */
  private getDurationByRarity(rarity: Rarity, phase: 'intro' | 'reveal' | 'final_reveal'): number {
    const durations: Record<Rarity, { intro: number; reveal: number; final_reveal: number }> = {
      SS: { intro: 5, reveal: 8, final_reveal: 6 },
      S: { intro: 4, reveal: 6, final_reveal: 5 },
      A: { intro: 3, reveal: 5, final_reveal: 4 },
      B: { intro: 3, reveal: 4, final_reveal: 3 },
      C: { intro: 2, reveal: 3, final_reveal: 2 },
    }

    return durations[rarity][phase]
  }

  /**
   * レアリティに応じたライティング設定
   */
  private getLightingByRarity(rarity: Rarity): string {
    const lighting = {
      SS: 'Divine golden light with rainbow reflections, heavenly glow',
      S: 'Intense red and orange flames, dramatic lighting',
      A: 'Cool blue aurora lights, elegant illumination',
      B: 'Soft green glow, pleasant ambiance',
      C: 'Simple white lighting, minimal effects',
    }
    return lighting[rarity]
  }

  /**
   * 複数の動画を一括生成（並列処理）
   */
  async generateBatch(
    requests: VideoGenerationRequest[]
  ): Promise<VideoGenerationResponse[]> {
    console.log(`[VideoGen] Generating ${requests.length} videos in batch`)

    const promises = requests.map((request) => this.generateVideo(request))
    return await Promise.all(promises)
  }

  /**
   * 全レアリティの演出動画を生成（管理画面用）
   */
  async generateAllRarityAnimations(
    provider: VideoProvider = 'veo3'
  ): Promise<Record<Rarity, { intro: VideoGenerationResponse; reveal: VideoGenerationResponse }>> {
    const rarities: Rarity[] = ['SS', 'S', 'A', 'B', 'C']
    const results: any = {}

    for (const rarity of rarities) {
      console.log(`[VideoGen] Generating animations for ${rarity} rarity...`)

      const [intro, reveal] = await Promise.all([
        this.generateGachaAnimation(rarity, 'intro', `${rarity} Card`, provider),
        this.generateGachaAnimation(rarity, 'reveal', `${rarity} Card`, provider),
      ])

      results[rarity] = { intro, reveal }
    }

    return results
  }
}

// シングルトンインスタンス
export const videoGenerationService = new VideoGenerationService()
