// AI動画生成の型定義

export type VideoProvider = 'veo3' | 'sora2'

export type VideoQuality = '720p' | '1080p' | '4k'

export type VideoAspectRatio = '16:9' | '9:16' | '1:1' | '4:3'

export interface VideoGenerationRequest {
  prompt: string
  provider: VideoProvider
  duration?: number // 秒数（3-30秒）
  quality?: VideoQuality
  aspectRatio?: VideoAspectRatio
  seed?: number // 再現性のためのシード値
}

export interface VideoGenerationResponse {
  id: string // ジョブID
  status: 'pending' | 'processing' | 'completed' | 'failed'
  videoUrl?: string // 生成完了時のURL
  thumbnailUrl?: string // サムネイルURL
  duration?: number
  provider: VideoProvider
  createdAt: string
  completedAt?: string
  error?: string
}

export interface VideoGenerationJob {
  id: string
  userId: string
  provider: VideoProvider
  prompt: string
  settings: {
    duration: number
    quality: VideoQuality
    aspectRatio: VideoAspectRatio
    seed?: number
  }
  status: 'pending' | 'processing' | 'completed' | 'failed'
  providerJobId?: string // プロバイダー側のジョブID
  videoUrl?: string
  thumbnailUrl?: string
  error?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

// レアリティ別の演出プロンプトテンプレート
export const RARITY_PROMPTS = {
  SS: {
    intro: 'Epic cinematic reveal animation with golden lightning bolts, dramatic camera zoom, heavenly light rays piercing through clouds, particles of stardust swirling around, ultra premium feel',
    reveal: 'Legendary card reveal with explosive golden aura, rainbow holographic effects, 3D card rotation in slow motion, triumphant orchestral crescendo',
    final_reveal: 'The card materializes from golden light particles, rotating majestically in 3D space with holographic rainbow effects, surrounded by divine rays and sparkles, epic slow-motion finale with triumphant music',
  },
  S: {
    intro: 'Premium reveal animation with red and white energy spirals, dynamic camera movement, sparkling light particles, special atmosphere',
    reveal: 'Special card reveal with crimson flames effect, glowing edges, smooth 3D rotation, exciting BGM',
    final_reveal: 'The card emerges through crimson flames, spinning elegantly with fiery particles trailing behind, surrounded by red energy waves and sparkles',
  },
  A: {
    intro: 'Quality reveal animation with blue energy waves, gentle camera pan, floating light particles, pleasant atmosphere',
    reveal: 'Card reveal with blue aurora effect, subtle glow, elegant rotation',
    final_reveal: 'The card appears through blue aurora lights, rotating smoothly with cool energy particles, surrounded by cyan glowing effects',
  },
  B: {
    intro: 'Standard reveal animation with green sparkles, steady camera, light particle effects',
    reveal: 'Card reveal with green shine effect, basic rotation',
    final_reveal: 'The card slides into view with green sparkles, simple rotation with pleasant green glow',
  },
  C: {
    intro: 'Simple reveal animation with white fade-in, static camera, minimal effects',
    reveal: 'Basic card reveal with simple flip animation',
    final_reveal: 'The card fades in smoothly with subtle white glow, simple presentation',
  },
} as const

export type Rarity = keyof typeof RARITY_PROMPTS
