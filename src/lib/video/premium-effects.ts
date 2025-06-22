'use client';

// プレミアム動画エフェクトライブラリ
// サンプル動画と同等の高品質エフェクトを実装

export interface PremiumEffect {
  name: string;
  duration: number;
  render: (ctx: CanvasRenderingContext2D, progress: number, params: any) => void;
}

export class PremiumEffectsEngine {
  private width: number;
  private height: number;
  private particles: Particle[] = [];
  private lightnings: Lightning[] = [];
  private auras: Aura[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  // SSR レインボー爆発エフェクト
  renderSSRRainbowExplosion(ctx: CanvasRenderingContext2D, progress: number, img: HTMLImageElement) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Stage 1: エネルギー蓄積 (0-30%)
    if (progress < 0.3) {
      const chargeProgress = progress / 0.3;
      
      // 画像をゆっくりズームイン
      ctx.save();
      const scale = 1 + chargeProgress * 0.1;
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
      
      // グロー効果
      ctx.shadowBlur = 30 + chargeProgress * 50;
      ctx.shadowColor = `hsla(${chargeProgress * 60}, 100%, 50%, ${chargeProgress})`;
      
      this.drawImage(ctx, img);
      ctx.restore();

      // エネルギー粒子
      this.drawChargingParticles(ctx, chargeProgress);
    }
    
    // Stage 2: 爆発 (30-50%)
    else if (progress < 0.5) {
      const explosionProgress = (progress - 0.3) / 0.2;
      
      // フラッシュ効果
      if (explosionProgress < 0.1) {
        ctx.fillStyle = `rgba(255, 255, 255, ${1 - explosionProgress * 10})`;
        ctx.fillRect(0, 0, this.width, this.height);
      }
      
      // 画像を振動させる
      ctx.save();
      const shakeX = (Math.random() - 0.5) * 20 * (1 - explosionProgress);
      const shakeY = (Math.random() - 0.5) * 20 * (1 - explosionProgress);
      ctx.translate(shakeX, shakeY);
      
      this.drawImage(ctx, img);
      ctx.restore();
      
      // レインボー爆発
      this.drawRainbowExplosion(ctx, explosionProgress);
    }
    
    // Stage 3: レインボーオーラ (50-100%)
    else {
      const auraProgress = (progress - 0.5) / 0.5;
      
      // 画像を優雅に表示
      ctx.save();
      const scale = 1.1 + Math.sin(auraProgress * Math.PI * 2) * 0.05;
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.rotate(Math.sin(auraProgress * Math.PI * 4) * 0.02);
      ctx.translate(-centerX, -centerY);
      
      this.drawImage(ctx, img);
      ctx.restore();
      
      // レインボーオーラ
      this.drawRainbowAura(ctx, auraProgress);
      
      // キラキラ粒子
      this.drawSparkles(ctx, auraProgress);
    }
  }

  // SR 炎エフェクト
  renderSRFireBurst(ctx: CanvasRenderingContext2D, progress: number, img: HTMLImageElement) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // 画像表示
    ctx.save();
    const scale = 1 + Math.sin(progress * Math.PI) * 0.2;
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    
    this.drawImage(ctx, img);
    ctx.restore();

    // 炎エフェクト
    this.drawFireEffect(ctx, progress);
    
    // 電撃エフェクト
    if (progress > 0.3 && progress < 0.7) {
      this.drawLightning(ctx, (progress - 0.3) / 0.4);
    }
  }

  // R 水流エフェクト
  renderRWaterFlow(ctx: CanvasRenderingContext2D, progress: number, img: HTMLImageElement) {
    // 波紋エフェクト
    ctx.save();
    const waveOffset = Math.sin(progress * Math.PI * 4) * 10;
    ctx.translate(0, waveOffset);
    
    this.drawImage(ctx, img);
    ctx.restore();
    
    // 水の粒子
    this.drawWaterParticles(ctx, progress);
    
    // 青いオーラ
    this.drawBlueAura(ctx, progress);
  }

  // エネルギー粒子描画
  private drawChargingParticles(ctx: CanvasRenderingContext2D, progress: number) {
    const particleCount = Math.floor(progress * 100);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 300 - progress * 200;
      const x = this.width / 2 + Math.cos(angle) * radius;
      const y = this.height / 2 + Math.sin(angle) * radius;
      
      const size = 3 + Math.random() * 5;
      const hue = i % 360;
      
      ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${progress})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // レインボー爆発描画
  private drawRainbowExplosion(ctx: CanvasRenderingContext2D, progress: number) {
    const rays = 36;
    
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2;
      const length = progress * 1000;
      
      ctx.save();
      ctx.rotate(angle);
      
      const gradient = ctx.createLinearGradient(0, 0, length, 0);
      const hue = (i / rays) * 360;
      gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, ${1 - progress})`);
      gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, -5, length, 10);
      ctx.restore();
    }
    
    ctx.restore();
  }

  // レインボーオーラ描画
  private drawRainbowAura(ctx: CanvasRenderingContext2D, progress: number) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    for (let i = 0; i < 5; i++) {
      const radius = 200 + i * 50;
      const alpha = 0.3 * (1 - i / 5) * Math.sin(progress * Math.PI);
      
      ctx.strokeStyle = `hsla(${progress * 360 + i * 60}, 100%, 50%, ${alpha})`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + Math.sin(progress * Math.PI * 2 + i) * 20, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // キラキラ粒子描画
  private drawSparkles(ctx: CanvasRenderingContext2D, progress: number) {
    const sparkleCount = 50;
    
    for (let i = 0; i < sparkleCount; i++) {
      const t = (progress * 3 + i / sparkleCount) % 1;
      const x = this.width * (0.1 + Math.random() * 0.8);
      const y = this.height * (0.1 + Math.random() * 0.8);
      
      const size = Math.sin(t * Math.PI) * 10;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * Math.PI * 2);
      
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(t * Math.PI)})`;
      ctx.fillRect(-size/2, -1, size, 2);
      ctx.fillRect(-1, -size/2, 2, size);
      
      ctx.restore();
    }
  }

  // 炎エフェクト描画
  private drawFireEffect(ctx: CanvasRenderingContext2D, progress: number) {
    const fireParticles = 100;
    
    for (let i = 0; i < fireParticles; i++) {
      const x = this.width / 2 + (Math.random() - 0.5) * 400;
      const baseY = this.height * 0.8;
      const y = baseY - progress * 800 * Math.random();
      
      const size = 20 + Math.random() * 30;
      const alpha = (1 - (baseY - y) / 800) * 0.8;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, `rgba(255, 255, 0, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(255, 100, 0, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 電撃エフェクト描画
  private drawLightning(ctx: CanvasRenderingContext2D, progress: number) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 + Math.random() * 0.2})`;
    ctx.lineWidth = 3 + Math.random() * 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(100, 200, 255, 1)';
    
    const startX = Math.random() * this.width;
    const startY = 0;
    const endX = Math.random() * this.width;
    const endY = this.height;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    let currentX = startX;
    let currentY = startY;
    const segments = 10;
    
    for (let i = 0; i < segments; i++) {
      const targetX = startX + (endX - startX) * ((i + 1) / segments);
      const targetY = startY + (endY - startY) * ((i + 1) / segments);
      
      const offsetX = (Math.random() - 0.5) * 100;
      const offsetY = (Math.random() - 0.5) * 50;
      
      ctx.lineTo(targetX + offsetX, targetY + offsetY);
    }
    
    ctx.stroke();
  }

  // 水粒子描画
  private drawWaterParticles(ctx: CanvasRenderingContext2D, progress: number) {
    const particleCount = 80;
    
    for (let i = 0; i < particleCount; i++) {
      const t = (progress + i / particleCount) % 1;
      const x = this.width * Math.random();
      const y = this.height * (1 - t);
      
      const size = 5 + Math.random() * 10;
      const alpha = Math.sin(t * Math.PI) * 0.6;
      
      ctx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 青いオーラ描画
  private drawBlueAura(ctx: CanvasRenderingContext2D, progress: number) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    ctx.fillStyle = `rgba(100, 200, 255, ${0.2 * Math.sin(progress * Math.PI)})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 300 + Math.sin(progress * Math.PI * 2) * 50, 0, Math.PI * 2);
    ctx.fill();
  }

  // 画像描画（共通）
  private drawImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    const scale = Math.max(this.width / img.width, this.height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (this.width - w) / 2;
    const y = (this.height - h) / 2;
    
    ctx.drawImage(img, x, y, w, h);
  }
}

// パーティクルクラス
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;

  constructor(x: number, y: number, vx: number, vy: number, size: number, color: string) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.color = color;
    this.life = 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.5; // 重力
    this.life -= 0.02;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// 電撃クラス
class Lightning {
  points: {x: number, y: number}[];
  life: number;
  color: string;

  constructor(startX: number, startY: number, endX: number, endY: number) {
    this.points = this.generatePath(startX, startY, endX, endY);
    this.life = 1;
    this.color = '#ffffff';
  }

  generatePath(x1: number, y1: number, x2: number, y2: number): {x: number, y: number}[] {
    const points = [{x: x1, y: y1}];
    const segments = 8;
    
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 100;
      const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 50;
      points.push({x, y});
    }
    
    points.push({x: x2, y: y2});
    return points;
  }
}

// オーラクラス
class Aura {
  x: number;
  y: number;
  radius: number;
  color: string;
  pulse: number;

  constructor(x: number, y: number, radius: number, color: string) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.pulse = 0;
  }

  update() {
    this.pulse += 0.05;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const currentRadius = this.radius + Math.sin(this.pulse) * 20;
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentRadius);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}