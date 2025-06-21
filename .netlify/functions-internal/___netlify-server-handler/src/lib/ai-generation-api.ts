// AI画像生成API統合（将来的な実装例）

interface AIGenerationConfig {
  openaiApiKey?: string;
  leonardoApiKey?: string;
  stabilityApiKey?: string;
}

export class AIGenerationAPI {
  private config: AIGenerationConfig;

  constructor(config: AIGenerationConfig) {
    this.config = config;
  }

  // DALL-E 3 API統合
  async generateWithDalle3(prompt: string): Promise<string> {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI APIキーが設定されていません');
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'url'
      }),
    });

    const data = await response.json();
    return data.data[0].url;
  }

  // Leonardo.ai API統合
  async generateWithLeonardo(prompt: string): Promise<string> {
    if (!this.config.leonardoApiKey) {
      throw new Error('Leonardo APIキーが設定されていません');
    }

    // Leonardo.ai APIの実装
    const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.leonardoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        modelId: 'anime-v3',
        width: 1024,
        height: 1024,
        num_images: 1,
        guidance_scale: 7,
        transparency: 'foreground_only'
      }),
    });

    const data = await response.json();
    return data.generations[0].url;
  }

  // Stability AI (Stable Diffusion) API統合
  async generateWithStability(prompt: string): Promise<string> {
    if (!this.config.stabilityApiKey) {
      throw new Error('Stability APIキーが設定されていません');
    }

    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.stabilityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      }),
    });

    const data = await response.json();
    return `data:image/png;base64,${data.artifacts[0].base64}`;
  }
}

// 使用例
export async function generateAssetsWithAPI() {
  const api = new AIGenerationAPI({
    openaiApiKey: process.env.OPENAI_API_KEY,
    leonardoApiKey: process.env.LEONARDO_API_KEY,
    stabilityApiKey: process.env.STABILITY_API_KEY,
  });

  try {
    // SSR素材生成
    const ssrEffect = await api.generateWithDalle3(
      'Rainbow magical aura effect, transparent background...'
    );
    
    // SR素材生成
    const srEffect = await api.generateWithLeonardo(
      'Fire explosion effect, transparent background...'
    );
    
    return { ssrEffect, srEffect };
  } catch (error) {
    console.error('API生成エラー:', error);
    throw error;
  }
}

// コスト計算
export function calculateAPICost(generations: number) {
  const costs = {
    dalle3: 0.04,        // $0.04 per image (1024x1024)
    leonardo: 0.002,     // ~$0.002 per image (credits based)
    stability: 0.002,    // $0.002 per image
  };
  
  return {
    dalle3Total: generations * costs.dalle3,
    leonardoTotal: generations * costs.leonardo,
    stabilityTotal: generations * costs.stability,
    totalUSD: generations * (costs.dalle3 + costs.leonardo + costs.stability)
  };
}