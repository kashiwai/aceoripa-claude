// OpenAI Video API統合（Sora + DALL-E 3）

interface OpenAIVideoRequest {
  prompt: string;
  duration?: number; // 秒 (最大60秒)
  aspect_ratio?: '9:16' | '16:9' | '1:1';
  quality?: 'standard' | 'hd';
  style?: string;
}

interface OpenAIVideoResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  progress?: number;
  error?: string;
}

export class OpenAIVideoAPI {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  // Sora動画生成（現在は利用不可のため、DALL-E 3に直接フォールバック）
  async generateVideoWithSora(request: OpenAIVideoRequest): Promise<OpenAIVideoResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Soraは現在一般公開されていないため、DALL-E 3 + Canvas アニメーションを使用
    // console.log('Soraは現在利用できません。DALL-E 3 + Canvas アニメーションを使用します。');
    return await this.generatePseudoVideoWithDALLE(request);
  }

  // DALL-E 3で画像生成 + CSS/WebGL動画演出
  async generatePseudoVideoWithDALLE(request: OpenAIVideoRequest): Promise<OpenAIVideoResponse> {
    try {
      // console.log('DALL-E 3で画像生成開始...', request.prompt);
      
      // DALL-E 3で高品質画像を生成
      const imageResponse = await fetch(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: this.enhancePromptForStillImage(request.prompt),
          size: request.aspect_ratio === '9:16' ? '1024x1792' : 
                request.aspect_ratio === '1:1' ? '1024x1024' : '1792x1024',
          quality: 'hd',
          style: 'natural',
          n: 1,
        }),
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error('DALL-E API error:', errorText);
        throw new Error(`DALL-E API error: ${imageResponse.status} ${errorText}`);
      }

      const imageData = await imageResponse.json();
      // console.log('DALL-E 3画像生成成功:', imageData);
      
      const imageUrl = imageData.data[0].url;

      // 疑似動画生成（Canvas + アニメーション）
      const animationData = {
        imageUrl,
        duration: request.duration || 5,
        effects: this.getAnimationEffects(request.prompt),
        aspectRatio: request.aspect_ratio || '9:16'
      };

      return {
        id: `dalle_${Date.now()}`,
        status: 'completed',
        video_url: `data:animation,${JSON.stringify(animationData)}`,
        thumbnail_url: imageUrl,
      };
    } catch (error) {
      console.error('DALL-E video generation failed:', error);
      throw new Error(`Video generation failed: ${error}`);
    }
  }

  // 静止画用プロンプト強化
  private enhancePromptForStillImage(prompt: string): string {
    return `${prompt}, highly detailed anime illustration, dynamic composition with energy effects, 
    cinematic lighting, professional quality artwork, vibrant colors, 
    perfect for animation and motion graphics, vertical mobile format`;
  }

  // 画像からアニメーション動画生成
  private async createAnimatedVideoFromImage(imageUrl: string, request: OpenAIVideoRequest): Promise<{videoUrl: string}> {
    // ブラウザ側で実行される動画生成コード
    const animationData = {
      imageUrl,
      duration: request.duration || 5,
      effects: this.getAnimationEffects(request.prompt),
    };

    // この部分は実際にはフロントエンドで実行される
    return {
      videoUrl: `data:animation,${JSON.stringify(animationData)}`
    };
  }

  // プロンプトからアニメーション効果を決定
  private getAnimationEffects(prompt: string): string[] {
    const effects: string[] = [];
    
    if (prompt.includes('SSR') || prompt.includes('legendary') || prompt.includes('rainbow')) {
      effects.push('rainbow-particles', 'zoom-burst', 'rotation-spiral');
    } else if (prompt.includes('SR') || prompt.includes('fire') || prompt.includes('explosion')) {
      effects.push('fire-particles', 'shake-effect', 'orange-glow');
    } else if (prompt.includes('water') || prompt.includes('blue')) {
      effects.push('water-ripples', 'blue-particles', 'gentle-sway');
    } else {
      effects.push('simple-glow', 'fade-in');
    }
    
    return effects;
  }

  // ステータス確認
  async checkStatus(id: string): Promise<OpenAIVideoResponse> {
    if (id.startsWith('dalle_')) {
      return {
        id,
        status: 'completed',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/videos/generations/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const data = await response.json();
      
      return {
        id: data.id,
        status: data.status,
        video_url: data.video_url,
        thumbnail_url: data.thumbnail_url,
        progress: data.progress,
      };
    } catch (error) {
      return {
        id,
        status: 'failed',
        error: `Status check failed: ${error}`,
      };
    }
  }
}

// ポケモンガチャ専用プロンプト（Sora/OpenAI最適化）
export class OpenAIPokemonPrompts {
  static generateSSRPrompt(pokemonName: string, pokemonType: string): string {
    return `
A breathtaking ${pokemonName} Pokemon emerges from a burst of rainbow-colored energy. 
The scene opens with a mystical treasure chest cracking open, releasing prismatic light beams. 
${pokemonName} materializes in the center with a powerful ${pokemonType}-type aura surrounding it. 
Golden particles spiral upward as lightning strikes flash in the background. 
The camera slowly zooms in on the majestic Pokemon as holographic effects shimmer around it. 
Epic orchestral music would accompany this legendary reveal. 
Shot in vertical 9:16 aspect ratio perfect for mobile viewing. 
Anime style with cinematic quality and premium visual effects.
Duration: 8 seconds of pure epicness.
    `.trim();
  }

  static generateSRPrompt(pokemonName: string, pokemonType: string): string {
    return `
Dynamic reveal of ${pokemonName} Pokemon with intense ${pokemonType} elemental effects. 
The scene begins with a silver chest bursting open in flames. 
${pokemonName} appears with a powerful orange and red energy aura. 
Fire particles dance around the Pokemon as the camera performs a dramatic reveal. 
Lightning effects and energy waves ripple outward. 
Vertical mobile format 9:16. 
Anime style with high-impact visual effects.
Duration: 5 seconds of intense action.
    `.trim();
  }

  static generateRPrompt(pokemonName: string, pokemonType: string): string {
    return `
Graceful ${pokemonName} Pokemon reveal with ${pokemonType} elemental harmony. 
A blue-glowing chest opens gently releasing mystical energy. 
${pokemonName} appears with elegant water-like ripples expanding outward. 
Soft blue particles float upward as the camera smoothly reveals the Pokemon. 
Vertical 9:16 composition. 
Anime style with beautiful, clean effects.
Duration: 3 seconds of serene beauty.
    `.trim();
  }

  static generateNPrompt(pokemonName: string): string {
    return `
Simple yet charming ${pokemonName} Pokemon reveal. 
A wooden chest opens with a gentle white glow. 
${pokemonName} appears with soft sparkles surrounding it. 
Minimal but elegant particle effects. 
Vertical mobile format. 
Clean anime style.
Duration: 2 seconds of simple charm.
    `.trim();
  }
}

// 統合使用例
export async function generateOpenAIGachaVideo(
  pokemonName: string,
  pokemonType: string,
  rarity: 'SSR' | 'SR' | 'R' | 'N',
  apiKey?: string
): Promise<OpenAIVideoResponse> {
  const api = new OpenAIVideoAPI(apiKey);
  
  let prompt = '';
  let duration = 2;
  
  switch (rarity) {
    case 'SSR':
      prompt = OpenAIPokemonPrompts.generateSSRPrompt(pokemonName, pokemonType);
      duration = 8;
      break;
    case 'SR':
      prompt = OpenAIPokemonPrompts.generateSRPrompt(pokemonName, pokemonType);
      duration = 5;
      break;
    case 'R':
      prompt = OpenAIPokemonPrompts.generateRPrompt(pokemonName, pokemonType);
      duration = 3;
      break;
    default:
      prompt = OpenAIPokemonPrompts.generateNPrompt(pokemonName);
      duration = 2;
  }

  return await api.generateVideoWithSora({
    prompt,
    duration,
    aspect_ratio: '9:16',
    quality: 'hd',
  });
}