// Leonardo AI API クライアント
class LeonardoAIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://cloud.leonardo.ai/api/rest/v1';
  }

  // 画像生成
  async generateImage(prompt, options = {}) {
    const response = await fetch(`${this.baseURL}/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: options.negativePrompt || '',
        modelId: options.modelId || '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3', // Leonardo Creative
        width: options.width || 1024,
        height: options.height || 1024,
        num_images: options.numImages || 1,
        promptMagic: true,
        promptMagicVersion: 'v3',
        promptMagicStrength: 0.5,
        public: false,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`Leonardo AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.sdGenerationJob;
  }

  // 動画生成（Motion機能）
  async generateVideo(imageId, options = {}) {
    const response = await fetch(`${this.baseURL}/generations-motion-svd`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageId,
        motionStrength: options.motionStrength || 5,
        public: false,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`Leonardo AI Motion API error: ${response.status}`);
    }

    const data = await response.json();
    return data.motionSvdGenerationJob;
  }

  // 生成状況確認
  async getGenerationStatus(generationId) {
    const response = await fetch(`${this.baseURL}/generations/${generationId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Leonardo AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.generations_by_pk;
  }

  // モーション生成状況確認
  async getMotionStatus(motionId) {
    const response = await fetch(`${this.baseURL}/generations-motion-svd/${motionId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Leonardo AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.motion_svd_generation_by_pk;
  }

  // ガチャ演出用プロンプト生成
  generateGachaPrompt(template, rarity) {
    const prompts = {
      explosion: {
        base: 'Epic explosion effect with golden particles, dramatic lighting, cinematic style',
        N: 'simple sparkle effect, soft glow',
        R: 'blue energy burst, moderate explosion',
        SR: 'golden explosion with lightning, intense light',
        SSR: 'massive rainbow explosion, prismatic colors, divine light',
        SS: 'ultimate cosmic explosion, galaxy background, godly aura',
        PSA10: 'legendary crimson explosion, reality-breaking effect, supreme power'
      },
      galaxy: {
        base: 'Cosmic galaxy effect with shooting stars, nebula swirls, space theme',
        N: 'starry night sky, gentle twinkle',
        R: 'blue nebula, shooting star',
        SR: 'golden galaxy spiral, comet trail',
        SSR: 'rainbow nebula explosion, supernova',
        SS: 'cosmic birth, galaxy collision, divine space',
        PSA10: 'universe creation, big bang effect, reality warp'
      },
      lightning: {
        base: 'Lightning storm effect with electric bolts, thunder strikes',
        N: 'small electric spark, static effect',
        R: 'blue lightning bolt, thunder',
        SR: 'golden lightning storm, electric field',
        SSR: 'rainbow lightning web, plasma explosion',
        SS: 'divine thunder, storm of gods',
        PSA10: 'crimson lightning apocalypse, world-ending storm'
      }
    };

    const basePrompt = prompts[template]?.base || prompts.explosion.base;
    const rarityPrompt = prompts[template]?.[rarity] || prompts.explosion[rarity];

    return `${basePrompt}, ${rarityPrompt}, ultra detailed, 8k quality, masterpiece`;
  }
}

export default LeonardoAIClient;