// AI動画生成API統合レイヤー

interface VideoGenerationRequest {
  prompt: string;
  duration: number; // 秒
  resolution: '720p' | '1080p' | '4k';
  style?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  fps?: 24 | 30 | 60;
}

interface VideoGenerationResponse {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId: string;
}

export class AIVideoGenerationService {
  private apiKeys: {
    runwayML?: string;
    pika?: string;
    stabilityAI?: string;
    googleImagen?: string;
  };

  constructor() {
    this.apiKeys = {
      runwayML: process.env.RUNWAY_API_KEY,
      pika: process.env.PIKA_API_KEY,
      stabilityAI: process.env.STABILITY_API_KEY,
      googleImagen: process.env.GOOGLE_CLOUD_API_KEY
    };
  }

  // RunwayML Gen-2 API
  async generateWithRunway(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    if (!this.apiKeys.runwayML) {
      throw new Error('RunwayML API key not configured');
    }

    const response = await fetch('https://api.runwayml.com/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.runwayML}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: request.prompt,
        duration_seconds: request.duration,
        resolution: request.resolution,
        fps: request.fps || 24
      })
    });

    const data = await response.json();
    
    return {
      videoUrl: data.video_url,
      thumbnailUrl: data.thumbnail_url,
      duration: data.duration,
      status: data.status,
      jobId: data.job_id
    };
  }

  // Pika Labs API
  async generateWithPika(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    if (!this.apiKeys.pika) {
      throw new Error('Pika API key not configured');
    }

    const response = await fetch('https://api.pika.art/v1/video/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.pika}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: request.prompt,
        duration: request.duration,
        aspect_ratio: request.aspectRatio || '16:9',
        style: request.style
      })
    });

    const data = await response.json();
    
    return {
      videoUrl: data.result.video_url,
      thumbnailUrl: data.result.thumbnail,
      duration: data.result.duration,
      status: data.status,
      jobId: data.id
    };
  }

  // Stability AI Video API
  async generateWithStability(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    if (!this.apiKeys.stabilityAI) {
      throw new Error('Stability AI API key not configured');
    }

    const response = await fetch('https://api.stability.ai/v1/generation/video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.stabilityAI}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text_prompts: [{
          text: request.prompt,
          weight: 1
        }],
        cfg_scale: 7,
        clip_guidance_preset: 'FAST_BLUE',
        sampler: 'K_DPM_2_ANCESTRAL',
        samples: 1,
        seed: Math.floor(Math.random() * 1000000),
        steps: 50,
        style_preset: request.style || 'anime',
        height: request.resolution === '1080p' ? 1080 : 720,
        width: request.resolution === '1080p' ? 1920 : 1280,
        fps: request.fps || 24,
        seconds: request.duration
      })
    });

    const data = await response.json();
    
    return {
      videoUrl: data.artifacts[0].url,
      thumbnailUrl: data.artifacts[0].thumbnail,
      duration: request.duration,
      status: 'completed',
      jobId: data.id
    };
  }

  // Google Imagen Video API
  async generateWithImagen(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    if (!this.apiKeys.googleImagen) {
      throw new Error('Google Cloud API key not configured');
    }

    const response = await fetch('https://imagen.googleapis.com/v1/videos:generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.googleImagen}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: request.prompt,
        video_length_seconds: request.duration,
        aspect_ratio: request.aspectRatio || '16:9',
        model: 'imagen-video-1.0'
      })
    });

    const data = await response.json();
    
    return {
      videoUrl: data.video_url,
      thumbnailUrl: data.thumbnail_url,
      duration: data.duration,
      status: data.status,
      jobId: data.name
    };
  }

  // 統合メソッド：最適なAPIを選択
  async generateVideo(request: VideoGenerationRequest, preferredService?: string): Promise<VideoGenerationResponse> {
    const services = [
      { name: 'runway', method: this.generateWithRunway.bind(this), available: !!this.apiKeys.runwayML },
      { name: 'pika', method: this.generateWithPika.bind(this), available: !!this.apiKeys.pika },
      { name: 'stability', method: this.generateWithStability.bind(this), available: !!this.apiKeys.stabilityAI },
      { name: 'imagen', method: this.generateWithImagen.bind(this), available: !!this.apiKeys.googleImagen }
    ];

    // 優先サービスが指定されている場合
    if (preferredService) {
      const service = services.find(s => s.name === preferredService && s.available);
      if (service) {
        try {
          return await service.method(request);
        } catch (error) {
          console.error(`${preferredService} failed:`, error);
        }
      }
    }

    // 利用可能なサービスを順番に試行
    for (const service of services.filter(s => s.available)) {
      try {
        // console.log(`Trying ${service.name} for video generation...`);
        return await service.method(request);
      } catch (error) {
        console.error(`${service.name} failed:`, error);
        continue;
      }
    }

    throw new Error('No video generation service available');
  }

  // ジョブステータス確認
  async checkJobStatus(jobId: string, service: string): Promise<VideoGenerationResponse> {
    switch (service) {
      case 'runway':
        return this.checkRunwayStatus(jobId);
      case 'pika':
        return this.checkPikaStatus(jobId);
      case 'stability':
        return this.checkStabilityStatus(jobId);
      case 'imagen':
        return this.checkImagenStatus(jobId);
      default:
        throw new Error(`Unknown service: ${service}`);
    }
  }

  private async checkRunwayStatus(jobId: string): Promise<VideoGenerationResponse> {
    const response = await fetch(`https://api.runwayml.com/v1/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKeys.runwayML}`
      }
    });
    
    const data = await response.json();
    return {
      videoUrl: data.video_url || '',
      thumbnailUrl: data.thumbnail_url || '',
      duration: data.duration || 0,
      status: data.status,
      jobId: data.id
    };
  }

  private async checkPikaStatus(jobId: string): Promise<VideoGenerationResponse> {
    const response = await fetch(`https://api.pika.art/v1/video/status/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKeys.pika}`
      }
    });
    
    const data = await response.json();
    return {
      videoUrl: data.video_url || '',
      thumbnailUrl: data.thumbnail_url || '',
      duration: data.duration || 0,
      status: data.status,
      jobId: jobId
    };
  }

  private async checkStabilityStatus(jobId: string): Promise<VideoGenerationResponse> {
    // Stability AIは同期的なので、ステータスチェックは不要
    return {
      videoUrl: '',
      thumbnailUrl: '',
      duration: 0,
      status: 'completed',
      jobId: jobId
    };
  }

  private async checkImagenStatus(jobId: string): Promise<VideoGenerationResponse> {
    const response = await fetch(`https://imagen.googleapis.com/v1/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKeys.googleImagen}`
      }
    });
    
    const data = await response.json();
    return {
      videoUrl: data.video_url || '',
      thumbnailUrl: data.thumbnail_url || '',
      duration: data.duration || 0,
      status: data.done ? 'completed' : 'processing',
      jobId: jobId
    };
  }
}

// ポケモンガチャ専用プロンプト生成
export class PokemonGachaVideoPrompts {
  static generateSSRPrompt(pokemonName: string, type: string): string {
    return `Ultra rare Pokemon ${pokemonName} emerging from golden treasure chest, 
    rainbow aura, lightning strikes, epic reveal, ${type} type energy burst, 
    holographic effects, particles floating, dramatic lighting, cinematic quality, 
    slow motion, 8K ultra detailed, masterpiece composition`;
  }

  static generateSRPrompt(pokemonName: string, type: string): string {
    return `Rare Pokemon ${pokemonName} appearing from silver chest, 
    ${type} type elemental effects, glowing aura, energy particles, 
    dynamic camera movement, high quality animation, dramatic reveal`;
  }

  static generateRPrompt(pokemonName: string, type: string): string {
    return `Pokemon ${pokemonName} reveal animation, ${type} type background, 
    soft glow effect, smooth transition, clean animation`;
  }

  static generatePackOpeningPrompt(packType: string): string {
    return `Pokemon TCG ${packType} pack opening animation, foil wrapper tearing, 
    cards sliding out dramatically, holographic reflections, anticipation build-up, 
    close-up shot transitioning to wide reveal, studio lighting`;
  }

  static generateBattleIntroPrompt(pokemon1: string, pokemon2: string): string {
    return `Pokemon battle introduction, ${pokemon1} vs ${pokemon2}, 
    split screen reveal, energy charging, stadium atmosphere, 
    crowd cheering ambience, dramatic face-off, anime style`;
  }
}