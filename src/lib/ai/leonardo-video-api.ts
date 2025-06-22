// Leonardo.ai Video API統合

interface LeonardoVideoRequest {
  prompt: string;
  style?: 'anime' | 'realistic' | 'fantasy' | 'cyberpunk';
  duration?: number; // 秒
  aspect_ratio?: '9:16' | '16:9' | '1:1';
  motion_strength?: number; // 1-10
  seed?: number;
}

interface LeonardoVideoResponse {
  generationId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  progress?: number;
}

export class LeonardoVideoAPI {
  private apiKey: string;
  private baseUrl = 'https://cloud.leonardo.ai/api/rest/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.LEONARDO_API_KEY || '';
  }

  // 動画生成リクエスト
  async generateVideo(request: LeonardoVideoRequest): Promise<LeonardoVideoResponse> {
    if (!this.apiKey) {
      throw new Error('Leonardo API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/generations-motion-svd`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId: await this.generateImageForVideo(request.prompt, request.style),
        motionStrength: request.motion_strength || 5,
        isPublic: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Leonardo API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      generationId: data.sdGenerationJob.generationId,
      status: 'pending',
    };
  }

  // まず画像を生成してから動画にする
  private async generateImageForVideo(prompt: string, style?: string): Promise<string> {
    const stylePrompt = this.getStylePrompt(style);
    const fullPrompt = `${prompt}, ${stylePrompt}, vertical composition 9:16 aspect ratio, high quality, detailed`;

    const response = await fetch(`${this.baseUrl}/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        height: 1024,
        width: 576, // 9:16 aspect ratio
        modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876', // Leonardo Anime XL
        prompt: fullPrompt,
        num_images: 1,
        guidance_scale: 7,
        seed: Math.floor(Math.random() * 1000000),
      }),
    });

    const data = await response.json();
    
    // 画像生成完了まで待機
    const generationId = data.sdGenerationJob.generationId;
    const imageId = await this.waitForImageGeneration(generationId);
    
    return imageId;
  }

  // 画像生成完了待機
  private async waitForImageGeneration(generationId: string): Promise<string> {
    let attempts = 0;
    const maxAttempts = 30; // 5分間待機

    while (attempts < maxAttempts) {
      const response = await fetch(`${this.baseUrl}/generations/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const data = await response.json();
      
      if (data.generations_by_pk.status === 'COMPLETE') {
        return data.generations_by_pk.generated_images[0].id;
      }

      await new Promise(resolve => setTimeout(resolve, 10000)); // 10秒待機
      attempts++;
    }

    throw new Error('Image generation timeout');
  }

  // 動画生成ステータス確認
  async checkStatus(generationId: string): Promise<LeonardoVideoResponse> {
    const response = await fetch(`${this.baseUrl}/generations/${generationId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    const data = await response.json();
    const generation = data.generations_by_pk;

    if (generation.status === 'COMPLETE') {
      const videoUrl = generation.generated_images[0]?.motion_mp4_url;
      return {
        generationId,
        status: 'completed',
        videoUrl,
        thumbnailUrl: generation.generated_images[0]?.url,
      };
    }

    return {
      generationId,
      status: generation.status === 'PENDING' ? 'pending' : 'processing',
      progress: generation.status === 'PENDING' ? 10 : 50,
    };
  }

  // スタイル別プロンプト
  private getStylePrompt(style?: string): string {
    const stylePrompts = {
      anime: 'anime style, vibrant colors, dynamic lighting, Japanese animation',
      realistic: 'photorealistic, cinematic lighting, high detail, professional photography',
      fantasy: 'fantasy art, magical effects, mystical atmosphere, ethereal lighting',
      cyberpunk: 'cyberpunk style, neon lights, futuristic, digital effects'
    };

    return stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.anime;
  }
}

// ポケモンガチャ専用プロンプト生成
export class PokemonGachaVideoPrompts {
  // SSR演出プロンプト
  static generateSSRPrompt(pokemonName: string, pokemonType: string): string {
    return `
Epic ${pokemonName} Pokemon reveal, legendary aura explosion, 
rainbow prismatic energy burst radiating outward, 
holographic particles swirling in spiral formation,
${pokemonType} type elemental effects surrounding the character,
golden light rays piercing through dimensional portals,
dramatic camera zoom with slow motion reveal,
ultra rare SSR quality animation with sparkles and starbursts,
vertical 9:16 composition perfect for mobile viewing,
anime style with premium quality effects
    `.trim();
  }

  // SR演出プロンプト  
  static generateSRPrompt(pokemonName: string, pokemonType: string): string {
    return `
Dramatic ${pokemonName} Pokemon emergence with ${pokemonType} elemental burst,
fiery explosion effects with orange and red energy waves,
dynamic lightning strikes in the background,
powerful aura emanating from the center,
cinematic reveal with intense lighting,
vertical 9:16 mobile optimized composition,
anime style with high impact visual effects
    `.trim();
  }

  // R演出プロンプト
  static generateRPrompt(pokemonName: string, pokemonType: string): string {
    return `
${pokemonName} Pokemon reveal with ${pokemonType} type energy,
blue mystical aura with gentle particle effects,
water-like ripples expanding outward,
smooth animation with moderate lighting effects,
vertical 9:16 composition,
anime style with clean visual design
    `.trim();
  }

  // N演出プロンプト
  static generateNPrompt(pokemonName: string): string {
    return `
Simple ${pokemonName} Pokemon reveal with soft white glow,
gentle light particles floating upward,
minimal but elegant animation effects,
clean vertical 9:16 composition,
anime style with subtle lighting
    `.trim();
  }

  // パック開封プロンプト
  static generatePackOpeningPrompt(): string {
    return `
Pokemon trading card pack opening animation,
foil wrapper tearing with realistic physics,
golden light bursting from inside the pack,
holographic cards sliding out dramatically,
anticipation building with particle effects,
vertical 9:16 mobile composition,
anime style with premium packaging effects
    `.trim();
  }

  // 宝箱開封プロンプト
  static generateTreasureChestPrompt(rarity: string): string {
    const rarityEffects = {
      SSR: 'rainbow explosion, legendary aura, divine light',
      SR: 'fiery burst, orange flames, powerful energy',
      R: 'blue mystical glow, water effects, gentle aura',
      N: 'soft white light, simple sparkles, minimal effects'
    };

    return `
Magical treasure chest opening with ${rarityEffects[rarity as keyof typeof rarityEffects]},
ancient wooden chest with golden hinges and locks,
lid slowly opening to reveal brilliant light within,
energy particles escaping and swirling upward,
vertical 9:16 composition perfect for mobile,
fantasy anime style with rich detail and atmosphere
    `.trim();
  }
}

// 使用例
export async function generateGachaVideo(
  pokemonName: string,
  pokemonType: string,
  rarity: 'SSR' | 'SR' | 'R' | 'N',
  apiKey?: string
): Promise<LeonardoVideoResponse> {
  const api = new LeonardoVideoAPI(apiKey);
  
  let prompt = '';
  switch (rarity) {
    case 'SSR':
      prompt = PokemonGachaVideoPrompts.generateSSRPrompt(pokemonName, pokemonType);
      break;
    case 'SR':
      prompt = PokemonGachaVideoPrompts.generateSRPrompt(pokemonName, pokemonType);
      break;
    case 'R':
      prompt = PokemonGachaVideoPrompts.generateRPrompt(pokemonName, pokemonType);
      break;
    default:
      prompt = PokemonGachaVideoPrompts.generateNPrompt(pokemonName);
  }

  return await api.generateVideo({
    prompt,
    style: 'anime',
    aspect_ratio: '9:16',
    motion_strength: rarity === 'SSR' ? 8 : rarity === 'SR' ? 6 : 4,
  });
}