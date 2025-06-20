'use client';

import { useEffect, useRef, useState } from 'react';

export interface GachaResult {
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  item: {
    id: string;
    name: string;
    imageUrl: string;
  };
  theme?: string;
  animationType?: string;
}

interface AnimationLayer {
  type: 'background' | 'object' | 'effect' | 'ui';
  asset: string;
  transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    opacity: number;
  };
  animation?: {
    from: Partial<typeof transform>;
    to: Partial<typeof transform>;
    easing: string;
  };
}

interface AnimationFrame {
  time: number;
  duration: number;
  layers: AnimationLayer[];
}

export class GachaVideoEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: OffscreenCanvas | null = null;
  private offscreenCtx: OffscreenCanvasRenderingContext2D | null = null;
  private assets: Map<string, HTMLImageElement> = new Map();
  private audioContext: AudioContext | null = null;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.ctx = this.canvas.getContext('2d', { alpha: false })!;
    
    // OffscreenCanvas対応チェック
    if (typeof OffscreenCanvas !== 'undefined') {
      this.offscreenCanvas = new OffscreenCanvas(1920, 1080);
      this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
    }
  }

  async generateGachaVideo(result: GachaResult, onProgress?: (progress: number) => void): Promise<Blob> {
    try {
      // 1. アセット選択
      const requiredAssets = this.selectAssets(result);
      
      // 2. アセット読み込み
      await this.loadAssets(requiredAssets);
      onProgress?.(20);
      
      // 3. タイムライン生成
      const timeline = this.createTimeline(result);
      onProgress?.(40);
      
      // 4. 動画レンダリング
      const videoBlob = await this.renderVideo(timeline, (renderProgress) => {
        onProgress?.(40 + renderProgress * 0.6);
      });
      
      onProgress?.(100);
      return videoBlob;
    } catch (error) {
      console.error('Video generation failed:', error);
      throw error;
    }
  }

  private selectAssets(result: GachaResult) {
    const assets: string[] = [];
    
    // 背景
    assets.push(this.selectBackground(result.theme || 'fantasy'));
    
    // エフェクト
    assets.push(...this.selectEffects(result.rarity));
    
    // オブジェクト
    assets.push('treasure-box-closed.webp', 'treasure-box-open.webp');
    
    // UI要素
    assets.push(`ui-${result.rarity.toLowerCase()}-text.webp`);
    
    return assets;
  }

  private selectBackground(theme: string): string {
    const backgrounds: Record<string, string> = {
      'fantasy': 'bg-ancient-temple.webp',
      'sci-fi': 'bg-cosmic-space.webp',
      'modern': 'bg-city-night.webp',
      'cute': 'bg-fairy-garden.webp'
    };
    return backgrounds[theme] || backgrounds.fantasy;
  }

  private selectEffects(rarity: string): string[] {
    const effectSets: Record<string, string[]> = {
      'SSR': [
        'effect-rainbow-aura.webp',
        'effect-golden-particles.webp',
        'effect-light-explosion.webp',
        'effect-divine-rays.webp'
      ],
      'SR': [
        'effect-fire-aura.webp',
        'effect-flame-particles.webp',
        'effect-red-explosion.webp'
      ],
      'R': [
        'effect-blue-aura.webp',
        'effect-water-particles.webp'
      ],
      'N': [
        'effect-white-glow.webp',
        'effect-gentle-sparkles.webp'
      ]
    };
    return effectSets[rarity] || effectSets.N;
  }

  private async loadAssets(assetPaths: string[]): Promise<void> {
    const loadPromises = assetPaths.map(async (path) => {
      if (this.assets.has(path)) return;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // プレースホルダーアセットの代わりに動的生成
      const placeholder = await this.createPlaceholderAsset(path);
      img.src = placeholder;
      
      await img.decode();
      this.assets.set(path, img);
    });
    
    await Promise.all(loadPromises);
  }

  private async createPlaceholderAsset(assetName: string): Promise<string> {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 512;
    tempCanvas.height = 512;
    const tempCtx = tempCanvas.getContext('2d')!;
    
    // アセット種別で背景色を決定
    let bgColor = '#333';
    let textColor = '#fff';
    
    if (assetName.includes('bg-')) {
      bgColor = '#1a1a2e';
    } else if (assetName.includes('effect-rainbow')) {
      const gradient = tempCtx.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, '#ff0000');
      gradient.addColorStop(0.17, '#ff7f00');
      gradient.addColorStop(0.33, '#ffff00');
      gradient.addColorStop(0.5, '#00ff00');
      gradient.addColorStop(0.67, '#0000ff');
      gradient.addColorStop(0.83, '#4b0082');
      gradient.addColorStop(1, '#9400d3');
      bgColor = gradient as any;
    } else if (assetName.includes('effect-fire')) {
      bgColor = '#ff4500';
    } else if (assetName.includes('effect-blue') || assetName.includes('water')) {
      bgColor = '#00bfff';
    } else if (assetName.includes('effect-golden')) {
      bgColor = '#ffd700';
    }
    
    tempCtx.fillStyle = bgColor;
    tempCtx.fillRect(0, 0, 512, 512);
    
    // テキスト
    tempCtx.fillStyle = textColor;
    tempCtx.font = 'bold 24px Arial';
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText(assetName.replace('.webp', '').replace(/-/g, ' '), 256, 256);
    
    return tempCanvas.toDataURL();
  }

  private createTimeline(result: GachaResult): AnimationFrame[] {
    switch (result.rarity) {
      case 'SSR':
        return this.buildSSRTimeline(result);
      case 'SR':
        return this.buildSRTimeline(result);
      case 'R':
        return this.buildRTimeline(result);
      default:
        return this.buildNTimeline(result);
    }
  }

  private buildSSRTimeline(result: GachaResult): AnimationFrame[] {
    const bgAsset = this.selectBackground(result.theme || 'fantasy');
    
    return [
      // Stage 1: 導入 (0-1秒)
      {
        time: 0,
        duration: 1000,
        layers: [
          {
            type: 'background',
            asset: bgAsset,
            transform: { x: 960, y: 540, scale: 1.2, rotation: 0, opacity: 0 },
            animation: {
              from: { opacity: 0, scale: 1.2 },
              to: { opacity: 1, scale: 1 },
              easing: 'ease-in'
            }
          },
          {
            type: 'object',
            asset: 'treasure-box-closed.webp',
            transform: { x: 960, y: 700, scale: 0, rotation: 0, opacity: 0 },
            animation: {
              from: { scale: 0, y: 700, opacity: 0 },
              to: { scale: 1, y: 540, opacity: 1 },
              easing: 'bounce-out'
            }
          }
        ]
      },
      
      // Stage 2: エネルギー蓄積 (1-3秒)
      {
        time: 1000,
        duration: 2000,
        layers: [
          {
            type: 'effect',
            asset: 'effect-golden-particles.webp',
            transform: { x: 960, y: 540, scale: 0.5, rotation: 0, opacity: 0.7 },
            animation: {
              from: { scale: 0.5, opacity: 0.7, rotation: 0 },
              to: { scale: 1.5, opacity: 1, rotation: 180 },
              easing: 'ease-in-out'
            }
          }
        ]
      },
      
      // Stage 3: 爆発 (3-4秒)
      {
        time: 3000,
        duration: 1000,
        layers: [
          {
            type: 'effect',
            asset: 'effect-light-explosion.webp',
            transform: { x: 960, y: 540, scale: 0, rotation: 0, opacity: 1 },
            animation: {
              from: { scale: 0 },
              to: { scale: 3 },
              easing: 'expo-out'
            }
          },
          {
            type: 'object',
            asset: 'treasure-box-open.webp',
            transform: { x: 960, y: 540, scale: 1, rotation: 0, opacity: 0 },
            animation: {
              from: { opacity: 0 },
              to: { opacity: 1 },
              easing: 'ease-out'
            }
          }
        ]
      },
      
      // Stage 4: レインボーエフェクト (4-8秒)
      {
        time: 4000,
        duration: 4000,
        layers: [
          {
            type: 'effect',
            asset: 'effect-rainbow-aura.webp',
            transform: { x: 960, y: 540, scale: 1, rotation: 0, opacity: 1 },
            animation: {
              from: { rotation: 0 },
              to: { rotation: 720 },
              easing: 'linear'
            }
          },
          {
            type: 'ui',
            asset: 'ui-ssr-text.webp',
            transform: { x: 960, y: 200, scale: 0, rotation: 0, opacity: 0 },
            animation: {
              from: { scale: 0, opacity: 0 },
              to: { scale: 1, opacity: 1 },
              easing: 'elastic-out'
            }
          }
        ]
      }
    ];
  }

  private buildSRTimeline(result: GachaResult): AnimationFrame[] {
    // SR用のタイムライン (簡略版)
    return [
      {
        time: 0,
        duration: 1000,
        layers: [
          {
            type: 'background',
            asset: this.selectBackground(result.theme || 'fantasy'),
            transform: { x: 960, y: 540, scale: 1, rotation: 0, opacity: 0 },
            animation: {
              from: { opacity: 0 },
              to: { opacity: 1 },
              easing: 'ease-in'
            }
          }
        ]
      },
      {
        time: 1000,
        duration: 2000,
        layers: [
          {
            type: 'effect',
            asset: 'effect-fire-aura.webp',
            transform: { x: 960, y: 540, scale: 0.5, rotation: 0, opacity: 0.8 },
            animation: {
              from: { scale: 0.5, opacity: 0.8 },
              to: { scale: 1.2, opacity: 1 },
              easing: 'ease-out'
            }
          }
        ]
      }
    ];
  }

  private buildRTimeline(result: GachaResult): AnimationFrame[] {
    // R用のタイムライン (簡略版)
    return [
      {
        time: 0,
        duration: 1500,
        layers: [
          {
            type: 'effect',
            asset: 'effect-water-particles.webp',
            transform: { x: 960, y: 540, scale: 1, rotation: 0, opacity: 0.8 },
            animation: {
              from: { opacity: 0 },
              to: { opacity: 0.8 },
              easing: 'ease-in-out'
            }
          }
        ]
      }
    ];
  }

  private buildNTimeline(result: GachaResult): AnimationFrame[] {
    // N用のタイムライン (簡略版)
    return [
      {
        time: 0,
        duration: 1000,
        layers: [
          {
            type: 'effect',
            asset: 'effect-white-glow.webp',
            transform: { x: 960, y: 540, scale: 1, rotation: 0, opacity: 0.5 },
            animation: {
              from: { opacity: 0 },
              to: { opacity: 0.5 },
              easing: 'ease-in-out'
            }
          }
        ]
      }
    ];
  }

  private async renderVideo(timeline: AnimationFrame[], onProgress?: (progress: number) => void): Promise<Blob> {
    const totalDuration = Math.max(...timeline.map(f => f.time + f.duration));
    const fps = 30; // 30FPSで十分
    const frameDuration = 1000 / fps;
    const totalFrames = Math.ceil(totalDuration / frameDuration);
    
    // MediaRecorderを使用
    const stream = this.canvas.captureStream(fps);
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8',
      videoBitsPerSecond: 2500000 // 2.5Mbps
    });
    
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    
    recorder.start();
    
    // フレーム毎のレンダリング
    for (let frame = 0; frame < totalFrames; frame++) {
      const currentTime = frame * frameDuration;
      
      // キャンバスクリア
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, 1920, 1080);
      
      // アクティブなレイヤーを描画
      timeline.forEach(animFrame => {
        if (currentTime >= animFrame.time && currentTime < animFrame.time + animFrame.duration) {
          const elapsed = currentTime - animFrame.time;
          animFrame.layers.forEach(layer => {
            this.drawLayer(layer, elapsed, animFrame.duration);
          });
        }
      });
      
      // プログレス更新
      onProgress?.(frame / totalFrames);
      
      // 次のフレームまで待機
      await new Promise(resolve => setTimeout(resolve, frameDuration));
    }
    
    recorder.stop();
    
    return new Promise(resolve => {
      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: 'video/webm' }));
      };
    });
  }

  private drawLayer(layer: AnimationLayer, elapsed: number, duration: number) {
    const progress = Math.min(elapsed / duration, 1);
    const transform = this.interpolateTransform(layer, progress);
    
    this.ctx.save();
    this.ctx.globalAlpha = transform.opacity;
    this.ctx.translate(transform.x, transform.y);
    this.ctx.scale(transform.scale, transform.scale);
    this.ctx.rotate(transform.rotation * Math.PI / 180);
    
    const asset = this.assets.get(layer.asset);
    if (asset) {
      this.ctx.drawImage(asset, -asset.width / 2, -asset.height / 2);
    }
    
    this.ctx.restore();
  }

  private interpolateTransform(layer: AnimationLayer, progress: number) {
    if (!layer.animation) return layer.transform;
    
    const { from, to, easing } = layer.animation;
    const easedProgress = this.applyEasing(progress, easing);
    
    const current = { ...layer.transform };
    
    Object.keys(from).forEach((key) => {
      const fromValue = from[key as keyof typeof from] ?? current[key as keyof typeof current];
      const toValue = to[key as keyof typeof to] ?? current[key as keyof typeof current];
      current[key as keyof typeof current] = fromValue + (toValue - fromValue) * easedProgress;
    });
    
    return current;
  }

  private applyEasing(t: number, easing: string): number {
    const easingFunctions: Record<string, (t: number) => number> = {
      'linear': (t) => t,
      'ease-in': (t) => t * t,
      'ease-out': (t) => t * (2 - t),
      'ease-in-out': (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      'bounce-out': (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        else return n1 * (t -= 2.625 / d1) * t + 0.984375;
      },
      'elastic-out': (t) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
      },
      'expo-out': (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
    };
    
    return easingFunctions[easing]?.(t) || t;
  }

  cleanup() {
    this.assets.clear();
    this.audioContext?.close();
  }
}