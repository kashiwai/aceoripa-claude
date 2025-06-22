'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'spark' | 'star' | 'flame' | 'water' | 'electric' | 'psychic';
  rotation?: number;
  rotationSpeed?: number;
  gravity?: number;
  fade?: boolean;
}

interface AdvancedParticleSystemProps {
  type: 'SSR' | 'SR' | 'R' | 'N';
  pokemonType?: 'fire' | 'water' | 'electric' | 'psychic' | 'grass' | 'normal';
  intensity?: number;
  duration?: number;
}

export const AdvancedParticleSystem = ({ 
  type, 
  pokemonType = 'normal',
  intensity = 1,
  duration = 5000 
}: AdvancedParticleSystemProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスサイズ設定
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // パーティクル生成
    const createParticle = (x: number, y: number): Particle => {
      const particleTypes = getParticleTypes(type, pokemonType);
      const particleType = particleTypes[Math.floor(Math.random() * particleTypes.length)];
      
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 10 * intensity,
        vy: (Math.random() - 0.5) * 10 * intensity - 2,
        size: Math.random() * 5 + 2,
        color: getParticleColor(particleType, type),
        life: 100,
        maxLife: 100,
        type: particleType,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        gravity: particleType === 'flame' ? -0.1 : 0.2,
        fade: true
      };
    };

    // エミッター設定
    const emitters = getEmitterPositions(type);
    let lastEmit = 0;
    const emitInterval = 50 / intensity;

    // アニメーションループ
    const animate = (timestamp: number) => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 新しいパーティクル生成
      if (timestamp - lastEmit > emitInterval) {
        emitters.forEach(emitter => {
          for (let i = 0; i < 3 * intensity; i++) {
            const x = canvas.width * emitter.x + (Math.random() - 0.5) * emitter.spread;
            const y = canvas.height * emitter.y + (Math.random() - 0.5) * emitter.spread;
            particlesRef.current.push(createParticle(x, y));
          }
        });
        lastEmit = timestamp;
      }

      // パーティクル更新と描画
      particlesRef.current = particlesRef.current.filter(particle => {
        // 物理演算
        particle.vy += particle.gravity || 0.2;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;

        if (particle.rotation !== undefined && particle.rotationSpeed) {
          particle.rotation += particle.rotationSpeed;
        }

        // 寿命チェック
        if (particle.life <= 0 || particle.y > canvas.height + 50) {
          return false;
        }

        // 描画
        drawParticle(ctx, particle);
        return true;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // 演出時間で自動停止
    const stopTimer = setTimeout(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }, duration);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(stopTimer);
    };
  }, [type, pokemonType, intensity, duration]);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

// パーティクル描画
function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle) {
  ctx.save();
  
  const alpha = particle.fade ? particle.life / particle.maxLife : 1;
  ctx.globalAlpha = alpha;
  
  ctx.translate(particle.x, particle.y);
  if (particle.rotation !== undefined) {
    ctx.rotate(particle.rotation);
  }

  switch (particle.type) {
    case 'star':
      drawStar(ctx, 0, 0, particle.size, particle.color);
      break;
    case 'spark':
      drawSpark(ctx, 0, 0, particle.size, particle.color);
      break;
    case 'flame':
      drawFlame(ctx, 0, 0, particle.size, particle.color);
      break;
    case 'water':
      drawWaterDrop(ctx, 0, 0, particle.size, particle.color);
      break;
    case 'electric':
      drawElectric(ctx, 0, 0, particle.size, particle.color);
      break;
    case 'psychic':
      drawPsychic(ctx, 0, 0, particle.size, particle.color);
      break;
    default:
      // デフォルトは円
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
      ctx.fill();
  }
  
  ctx.restore();
}

// 星形描画
function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  const spikes = 5;
  const outerRadius = size;
  const innerRadius = size / 2;
  
  ctx.fillStyle = color;
  ctx.beginPath();
  
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  
  ctx.closePath();
  ctx.fill();
  
  // グロー効果
  ctx.shadowBlur = size * 2;
  ctx.shadowColor = color;
  ctx.fill();
}

// 火花描画
function drawSpark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.4, color);
  gradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

// 炎描画
function drawFlame(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.quadraticCurveTo(x - size, y, x, y + size);
  ctx.quadraticCurveTo(x + size, y, x, y - size);
  ctx.fill();
}

// 水滴描画
function drawWaterDrop(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  const gradient = ctx.createRadialGradient(x - size/3, y - size/3, 0, x, y, size);
  gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, color);
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

// 電気描画
function drawElectric(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowBlur = size * 3;
  ctx.shadowColor = color;
  
  ctx.beginPath();
  ctx.moveTo(x - size, y - size);
  ctx.lineTo(x, y);
  ctx.lineTo(x - size/2, y);
  ctx.lineTo(x + size, y + size);
  ctx.stroke();
}

// サイコ描画
function drawPsychic(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.5, 'transparent');
  gradient.addColorStop(1, color);
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  
  // 内側の円
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();
}

// パーティクルタイプ取得
function getParticleTypes(rarity: string, pokemonType: string): Particle['type'][] {
  if (rarity === 'SSR') {
    return ['star', 'spark', 'electric'];
  } else if (rarity === 'SR') {
    return ['spark', 'flame'];
  }
  
  // ポケモンタイプ別
  switch (pokemonType) {
    case 'fire':
      return ['flame', 'spark'];
    case 'water':
      return ['water'];
    case 'electric':
      return ['electric', 'spark'];
    case 'psychic':
      return ['psychic', 'star'];
    default:
      return ['spark'];
  }
}

// パーティクル色取得
function getParticleColor(type: Particle['type'], rarity: string): string {
  if (rarity === 'SSR') {
    // 虹色
    const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  const colorMap = {
    star: '#ffd700',
    spark: '#ffffff',
    flame: '#ff4500',
    water: '#00bfff',
    electric: '#ffff00',
    psychic: '#ff1493'
  };
  
  return colorMap[type] || '#ffffff';
}

// エミッター位置取得
function getEmitterPositions(rarity: string) {
  switch (rarity) {
    case 'SSR':
      return [
        { x: 0.5, y: 0.5, spread: 200 },
        { x: 0.2, y: 0.3, spread: 100 },
        { x: 0.8, y: 0.3, spread: 100 },
        { x: 0.2, y: 0.7, spread: 100 },
        { x: 0.8, y: 0.7, spread: 100 }
      ];
    case 'SR':
      return [
        { x: 0.5, y: 0.5, spread: 150 },
        { x: 0.3, y: 0.5, spread: 80 },
        { x: 0.7, y: 0.5, spread: 80 }
      ];
    case 'R':
      return [
        { x: 0.5, y: 0.5, spread: 100 },
        { x: 0.5, y: 0.7, spread: 50 }
      ];
    default:
      return [
        { x: 0.5, y: 0.5, spread: 50 }
      ];
  }
}