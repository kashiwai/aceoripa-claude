'use client';

// Canvas から実際の動画ファイル(.mp4)を生成するライブラリ
import { PremiumEffectsEngine } from './premium-effects';

export interface VideoGenerationOptions {
  width: number;
  height: number;
  fps: number;
  duration: number; // 秒
  bitrate?: number;
}

export class CanvasVideoEncoder {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;

  constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
  }

  // 動画録画開始
  async startRecording(options: Partial<VideoGenerationOptions> = {}): Promise<void> {
    const fps = options.fps || 30;
    const bitrate = options.bitrate || 5000000; // 5Mbps

    // Canvas から MediaStream を取得
    this.stream = this.canvas.captureStream(fps);
    
    // MediaRecorder 設定
    const mimeType = this.getSupportedMimeType();
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType,
      videoBitsPerSecond: bitrate
    });

    this.chunks = [];

    // データ収集
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    // 録画開始
    this.mediaRecorder.start();
  }

  // 動画録画停止して Blob を返す
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recording not started'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mediaRecorder!.mimeType });
        this.chunks = [];
        resolve(blob);
      };

      this.mediaRecorder.stop();
      
      // ストリームクリーンアップ
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
    });
  }

  // フレーム描画
  drawFrame(drawFunction: (ctx: CanvasRenderingContext2D, frame: number) => void, frame: number): void {
    drawFunction(this.ctx, frame);
  }

  // Canvas 取得（外部描画用）
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  // サポートされる MIME タイプを取得
  private getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'video/webm'; // フォールバック
  }

  // Blob を URL に変換
  static blobToURL(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  // Blob をダウンロード
  static downloadBlob(blob: Blob, filename: string): void {
    const url = this.blobToURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// アニメーション動画生成ヘルパー
export class AnimatedVideoGenerator {
  private encoder: CanvasVideoEncoder;
  private width: number;
  private height: number;
  private effectsEngine: PremiumEffectsEngine;

  constructor(width: number = 1080, height: number = 1920) {
    this.width = width;
    this.height = height;
    this.encoder = new CanvasVideoEncoder(width, height);
    this.effectsEngine = new PremiumEffectsEngine(width, height);
  }

  // DALL-E 画像からアニメーション動画を生成
  async generateFromImage(
    imageUrl: string,
    effects: string[],
    duration: number = 5,
    fps: number = 30,
    rarity?: 'SSR' | 'SR' | 'R' | 'N'
  ): Promise<Blob> {
    // 画像読み込み
    const img = await this.loadImage(imageUrl);
    
    // 録画開始
    await this.encoder.startRecording({ fps, duration });

    const totalFrames = duration * fps;
    const ctx = this.encoder.getContext();

    // フレームごとにアニメーション描画
    for (let frame = 0; frame < totalFrames; frame++) {
      const progress = frame / totalFrames;
      
      // 背景クリア
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, this.width, this.height);

      // レアリティに応じたプレミアムエフェクト使用
      if (rarity === 'SSR' && effects.includes('rainbow-particles')) {
        this.effectsEngine.renderSSRRainbowExplosion(ctx, progress, img);
      } else if (rarity === 'SR' && effects.includes('fire-particles')) {
        this.effectsEngine.renderSRFireBurst(ctx, progress, img);
      } else if (rarity === 'R' && effects.includes('water-ripples')) {
        this.effectsEngine.renderRWaterFlow(ctx, progress, img);
      } else {
        // 通常エフェクト
        ctx.save();
        this.applyEffects(ctx, img, effects, progress);
        ctx.restore();
      }

      // フレーム間待機（実際のFPSに合わせる）
      await this.waitFrame(1000 / fps);
    }

    // 録画停止
    const videoBlob = await this.encoder.stopRecording();
    return videoBlob;
  }

  // エフェクト適用
  private applyEffects(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    effects: string[],
    progress: number
  ): void {
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // 画像のアスペクト比を維持して描画
    const scale = Math.max(this.width / img.width, this.height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (this.width - w) / 2;
    const y = (this.height - h) / 2;

    // エフェクトごとの処理
    effects.forEach(effect => {
      switch (effect) {
        case 'zoom-burst':
          const zoom = 1 + progress * 0.3;
          ctx.translate(centerX, centerY);
          ctx.scale(zoom, zoom);
          ctx.translate(-centerX, -centerY);
          break;
          
        case 'rotation-spiral':
          ctx.translate(centerX, centerY);
          ctx.rotate(progress * Math.PI * 2);
          ctx.translate(-centerX, -centerY);
          break;
          
        case 'rainbow-particles':
          // パーティクル効果（後で実装）
          ctx.globalAlpha = 0.8 + Math.sin(progress * Math.PI) * 0.2;
          break;
          
        case 'fade-in':
          ctx.globalAlpha = progress;
          break;
      }
    });

    // 画像描画
    ctx.drawImage(img, x, y, w, h);

    // 追加のオーバーレイエフェクト
    if (effects.includes('rainbow-particles')) {
      this.drawRainbowParticles(ctx, progress);
    }
  }

  // レインボーパーティクル描画
  private drawRainbowParticles(ctx: CanvasRenderingContext2D, progress: number): void {
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 200 + Math.sin(progress * Math.PI * 2 + i) * 100;
      const x = this.width / 2 + Math.cos(angle + progress * Math.PI) * radius;
      const y = this.height / 2 + Math.sin(angle + progress * Math.PI) * radius;
      
      const hue = (i / particleCount * 360 + progress * 360) % 360;
      ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${0.5 + Math.sin(progress * Math.PI) * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, 5 + Math.sin(progress * Math.PI * 2 + i) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 画像読み込み
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  // フレーム待機
  private waitFrame(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// エクスポート用ユーティリティ
export async function generatePokemonGachaVideo(
  imageUrl: string,
  effects: string[],
  duration: number,
  outputFilename?: string,
  rarity?: 'SSR' | 'SR' | 'R' | 'N'
): Promise<string> {
  const generator = new AnimatedVideoGenerator(1080, 1920); // 9:16
  
  try {
    console.log('🎬 動画生成開始...');
    console.log('レアリティ:', rarity);
    console.log('エフェクト:', effects);
    
    const videoBlob = await generator.generateFromImage(imageUrl, effects, duration, 30, rarity);
    
    console.log('✅ 動画生成完了:', {
      size: `${(videoBlob.size / 1024 / 1024).toFixed(2)}MB`,
      type: videoBlob.type
    });
    
    // URL 生成
    const videoUrl = CanvasVideoEncoder.blobToURL(videoBlob);
    
    // オプション: 自動ダウンロード
    if (outputFilename) {
      CanvasVideoEncoder.downloadBlob(videoBlob, outputFilename);
    }
    
    return videoUrl;
  } catch (error) {
    console.error('❌ 動画生成エラー:', error);
    throw error;
  }
}