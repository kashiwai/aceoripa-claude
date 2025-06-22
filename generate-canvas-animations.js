// Canvas API アニメーション動画生成システム
import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

// 動画設定
const VIDEO_CONFIG = {
  width: 1024,
  height: 1024,
  fps: 30,
  duration: 8, // 8秒
  totalFrames: 240 // 30fps × 8秒
};

// アニメーション効果
const ANIMATION_EFFECTS = {
  explosion: {
    name: '爆発エフェクト',
    particles: 50,
    scaleAnimation: true,
    particleLife: 2.0,
    colors: ['#FFD700', '#FFA500', '#FF8C00', '#FF6347']
  },
  galaxy: {
    name: '銀河エフェクト',
    particles: 30,
    rotationSpeed: 0.02,
    spiralMotion: true,
    colors: ['#4B0082', '#8A2BE2', '#9370DB', '#00CED1']
  },
  lightning: {
    name: '雷撃エフェクト',
    bolts: 10,
    flickerEffect: true,
    electricFlow: true,
    colors: ['#00BFFF', '#1E90FF', '#0080FF', '#FFFFFF']
  },
  fire: {
    name: '炎エフェクト',
    flames: 20,
    heatWave: true,
    upwardMotion: true,
    colors: ['#FF4500', '#FF6347', '#DC143C', '#FFD700']
  }
};

// レアリティ設定
const RARITY_CONFIG = {
  N: { name: 'ノーマル', color: '#808080', intensity: 0.3 },
  R: { name: 'レア', color: '#0080FF', intensity: 0.5 },
  SR: { name: 'スーパーレア', color: '#FFD700', intensity: 0.7 },
  SSR: { name: 'スペシャルレア', color: '#FF69B4', intensity: 0.9 },
  SS: { name: 'スーパースペシャル', color: '#FF4500', intensity: 1.0 },
  PSA10: { name: 'パーフェクト', color: '#8B00FF', intensity: 1.2 }
};

// パーティクルクラス
class Particle {
  constructor(x, y, vx, vy, life, color, size = 3) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
    this.alpha = 1.0;
  }

  update(effect) {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.016; // 60fps基準
    this.alpha = Math.max(0, this.life / this.maxLife);
    
    // 重力効果
    if (effect.name === '炎エフェクト') {
      this.vy -= 0.1; // 上向きの動き
      this.vx *= 0.99; // 横の減衰
    } else {
      this.vy += 0.05; // 下向きの重力
    }
    
    this.vx *= 0.98; // 空気抵抗
    this.vy *= 0.98;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

// アニメーションフレーム生成
async function generateAnimationFrame(backgroundImage, frameIndex, totalFrames, effect, rarity, japaneseText) {
  const canvas = createCanvas(VIDEO_CONFIG.width, VIDEO_CONFIG.height);
  const ctx = canvas.getContext('2d');
  
  const progress = frameIndex / totalFrames;
  const time = progress * VIDEO_CONFIG.duration;

  // 背景描画
  ctx.drawImage(backgroundImage, 0, 0, VIDEO_CONFIG.width, VIDEO_CONFIG.height);

  // アニメーション効果の強度
  const intensity = rarity.intensity;
  
  // エフェクト別アニメーション
  switch (effect.name) {
    case '爆発エフェクト':
      drawExplosionEffect(ctx, time, intensity, effect.colors);
      break;
    case '銀河エフェクト':
      drawGalaxyEffect(ctx, time, intensity, effect.colors);
      break;
    case '雷撃エフェクト':
      drawLightningEffect(ctx, time, intensity, effect.colors);
      break;
    case '炎エフェクト':
      drawFireEffect(ctx, time, intensity, effect.colors);
      break;
  }

  // 日本語テキストアニメーション
  drawAnimatedText(ctx, japaneseText, time, rarity);

  // カード出現演出（4秒後）
  if (time >= 4.0) {
    drawCardReveal(ctx, time - 4.0, rarity);
  }

  return canvas.toBuffer('image/png');
}

// 爆発エフェクト
function drawExplosionEffect(ctx, time, intensity, colors) {
  const centerX = VIDEO_CONFIG.width / 2;
  const centerY = VIDEO_CONFIG.height / 2;
  
  // 爆発の段階
  let explosionPhase;
  if (time < 1.0) explosionPhase = 'buildup';
  else if (time < 3.0) explosionPhase = 'explosion';
  else explosionPhase = 'aftermath';

  switch (explosionPhase) {
    case 'buildup':
      // エネルギー蓄積
      const buildupRadius = (time / 1.0) * 100 * intensity;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, buildupRadius);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * intensity})`);
      gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, VIDEO_CONFIG.width, VIDEO_CONFIG.height);
      break;

    case 'explosion':
      // メイン爆発
      const explosionTime = (time - 1.0) / 2.0;
      const explosionRadius = explosionTime * 500 * intensity;
      
      // 複数の爆発リング
      for (let i = 0; i < 3; i++) {
        const ringDelay = i * 0.3;
        if (explosionTime > ringDelay) {
          const ringTime = explosionTime - ringDelay;
          const ringRadius = ringTime * 300 * intensity;
          const alpha = Math.max(0, 1 - ringTime);
          
          const ringGradient = ctx.createRadialGradient(centerX, centerY, ringRadius * 0.5, centerX, centerY, ringRadius);
          ringGradient.addColorStop(0, `rgba(255, 215, 0, ${alpha * intensity})`);
          ringGradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
          ctx.fillStyle = ringGradient;
          ctx.fillRect(0, 0, VIDEO_CONFIG.width, VIDEO_CONFIG.height);
        }
      }

      // パーティクル
      for (let i = 0; i < 20 * intensity; i++) {
        const angle = (i / (20 * intensity)) * Math.PI * 2;
        const distance = explosionTime * 300;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        const size = (1 - explosionTime) * 8 * intensity;
        
        ctx.fillStyle = colors[i % colors.length];
        ctx.globalAlpha = 1 - explosionTime;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;

    case 'aftermath':
      // 余韻
      const aftermathTime = (time - 3.0) / 5.0;
      const glowIntensity = (1 - aftermathTime) * intensity * 0.3;
      
      const afterGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 400);
      afterGlow.addColorStop(0, `rgba(255, 215, 0, ${glowIntensity})`);
      afterGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = afterGlow;
      ctx.fillRect(0, 0, VIDEO_CONFIG.width, VIDEO_CONFIG.height);
      break;
  }
}

// 銀河エフェクト
function drawGalaxyEffect(ctx, time, intensity, colors) {
  const centerX = VIDEO_CONFIG.width / 2;
  const centerY = VIDEO_CONFIG.height / 2;
  
  // 回転する銀河
  const rotation = time * 0.5;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);
  
  // 螺旋
  for (let i = 0; i < 5; i++) {
    const spiralOffset = (i / 5) * Math.PI * 2;
    const spiralLength = 300 * intensity;
    
    ctx.beginPath();
    ctx.strokeStyle = colors[i % colors.length];
    ctx.lineWidth = 3 * intensity;
    ctx.globalAlpha = 0.7;
    
    for (let j = 0; j < 100; j++) {
      const t = j / 100;
      const angle = spiralOffset + t * Math.PI * 4;
      const radius = t * spiralLength;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  
  ctx.restore();
  ctx.globalAlpha = 1;
}

// 雷撃エフェクト
function drawLightningEffect(ctx, time, intensity, colors) {
  // 電撃の描画
  for (let i = 0; i < 5 * intensity; i++) {
    if (Math.random() < 0.3) { // ランダムに点滅
      const startX = Math.random() * VIDEO_CONFIG.width;
      const startY = 0;
      const endX = Math.random() * VIDEO_CONFIG.width;
      const endY = VIDEO_CONFIG.height;
      
      ctx.strokeStyle = colors[i % colors.length];
      ctx.lineWidth = 2 + Math.random() * 4 * intensity;
      ctx.globalAlpha = 0.8;
      
      // ジグザグの電撃
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      const segments = 10;
      for (let j = 1; j <= segments; j++) {
        const x = startX + (endX - startX) * (j / segments) + (Math.random() - 0.5) * 50;
        const y = startY + (endY - startY) * (j / segments);
        ctx.lineTo(x, y);
      }
      
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

// 炎エフェクト
function drawFireEffect(ctx, time, intensity, colors) {
  // 炎の描画
  for (let i = 0; i < 15 * intensity; i++) {
    const x = VIDEO_CONFIG.width / 2 + (Math.random() - 0.5) * 200;
    const baseY = VIDEO_CONFIG.height;
    const height = 300 + Math.random() * 200 * intensity;
    const flicker = Math.sin(time * 10 + i) * 20;
    
    const gradient = ctx.createLinearGradient(x, baseY, x + flicker, baseY - height);
    gradient.addColorStop(0, colors[0]); // 赤
    gradient.addColorStop(0.5, colors[1]); // オレンジ
    gradient.addColorStop(1, colors[3]); // 黄色
    
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.6;
    
    // 炎の形状
    const flameWidth = 30 + Math.random() * 20;
    ctx.beginPath();
    ctx.ellipse(x, baseY - height/2, flameWidth, height/2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// アニメーション日本語テキスト
function drawAnimatedText(ctx, text, time, rarity) {
  const centerX = VIDEO_CONFIG.width / 2;
  const centerY = VIDEO_CONFIG.height / 2;
  
  // テキスト出現タイミング
  if (time < 1.5) return; // 1.5秒後に出現
  
  const textTime = time - 1.5;
  let scale = 1;
  let alpha = 1;
  
  // スケールアニメーション
  if (textTime < 0.5) {
    scale = 0.1 + (textTime / 0.5) * 0.9; // 0.1から1.0に拡大
    alpha = textTime / 0.5;
  } else if (textTime > 6.0) {
    // フェードアウト
    alpha = Math.max(0, 1 - (textTime - 6.0) / 0.5);
  }
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  
  const fontSize = 80 * rarity.intensity;
  ctx.font = `bold ${fontSize}px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 縁取り
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(text, 0, 0);
  
  // メインテキスト
  ctx.fillStyle = rarity.color;
  ctx.fillText(text, 0, 0);
  
  // 光沢効果
  ctx.shadowColor = rarity.color;
  ctx.shadowBlur = 20;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText(text, 0, -3);
  
  ctx.restore();
}

// カード出現演出
function drawCardReveal(ctx, revealTime, rarity) {
  const centerX = VIDEO_CONFIG.width / 2;
  const centerY = VIDEO_CONFIG.height / 2 + 100;
  
  let cardScale = 0;
  let cardAlpha = 0;
  
  if (revealTime < 1.0) {
    // カード拡大
    cardScale = revealTime;
    cardAlpha = revealTime;
  } else {
    cardScale = 1;
    cardAlpha = 1;
  }
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(cardScale, cardScale);
  ctx.globalAlpha = cardAlpha;
  
  // カード背景
  const cardWidth = 200;
  const cardHeight = 280;
  
  ctx.fillStyle = rarity.color;
  ctx.shadowColor = rarity.color;
  ctx.shadowBlur = 20;
  ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
  
  // カード枠
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.strokeRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
  
  // レアリティ表示
  ctx.font = 'bold 24px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(rarity.name, 0, 0);
  
  ctx.restore();
}

// メイン動画生成関数
async function generateCanvasAnimations() {
  console.log('🚀 Canvas API アニメーション動画生成開始...\n');

  // 出力ディレクトリ作成
  const outputDirs = ['images/canvas-videos', 'images/frames'];
  outputDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // 背景画像とエフェクトの組み合わせ
  const animations = [
    {
      backgroundPath: 'images/bg-ssr-explosion.png',
      effect: ANIMATION_EFFECTS.explosion,
      rarity: RARITY_CONFIG.SSR,
      text: '超激レア',
      name: 'ssr-explosion-animation'
    },
    {
      backgroundPath: 'images/bg-jackpot-fire.png',
      effect: ANIMATION_EFFECTS.fire,
      rarity: RARITY_CONFIG.SR,
      text: '大当たり！',
      name: 'fire-jackpot-animation'
    },
    {
      backgroundPath: 'images/bg-galaxy-effect.png',
      effect: ANIMATION_EFFECTS.galaxy,
      rarity: RARITY_CONFIG.SS,
      text: 'SSR確定',
      name: 'galaxy-ssr-animation'
    },
    {
      backgroundPath: 'images/bg-lightning-storm.png',
      effect: ANIMATION_EFFECTS.lightning,
      rarity: RARITY_CONFIG.PSA10,
      text: '雷撃演出',
      name: 'lightning-perfect-animation'
    }
  ];

  const results = [];

  for (const [index, animation] of animations.entries()) {
    console.log(`\n🎬 アニメーション生成 ${index + 1}/${animations.length}`);
    console.log(`   エフェクト: ${animation.effect.name}`);
    console.log(`   レアリティ: ${animation.rarity.name}`);
    console.log(`   テキスト: ${animation.text}`);

    try {
      // 背景画像読み込み
      const backgroundImage = await loadImage(animation.backgroundPath);
      
      // フレーム生成
      console.log(`   🎨 ${VIDEO_CONFIG.totalFrames}フレーム生成中...`);
      
      const frameDir = `images/frames/${animation.name}`;
      if (!fs.existsSync(frameDir)) {
        fs.mkdirSync(frameDir, { recursive: true });
      }

      for (let frameIndex = 0; frameIndex < VIDEO_CONFIG.totalFrames; frameIndex++) {
        const frameBuffer = await generateAnimationFrame(
          backgroundImage,
          frameIndex,
          VIDEO_CONFIG.totalFrames,
          animation.effect,
          animation.rarity,
          animation.text
        );
        
        const frameFilename = `${frameDir}/frame_${frameIndex.toString().padStart(4, '0')}.png`;
        fs.writeFileSync(frameFilename, frameBuffer);
        
        if (frameIndex % 30 === 0) {
          console.log(`   📊 進行状況: ${Math.round((frameIndex / VIDEO_CONFIG.totalFrames) * 100)}%`);
        }
      }

      console.log(`   ✅ フレーム生成完了: ${VIDEO_CONFIG.totalFrames}枚`);
      
      // FFmpeg用の指示を表示
      console.log(`   🎥 動画変換コマンド:`);
      console.log(`   ffmpeg -r ${VIDEO_CONFIG.fps} -i "${frameDir}/frame_%04d.png" -c:v libx264 -pix_fmt yuv420p "images/canvas-videos/${animation.name}.mp4"`);

      results.push({
        name: animation.name,
        effect: animation.effect.name,
        rarity: animation.rarity.name,
        text: animation.text,
        frameDir: frameDir,
        frameCount: VIDEO_CONFIG.totalFrames,
        success: true
      });

    } catch (error) {
      console.error(`   ❌ エラー: ${error.message}`);
      results.push({
        name: animation.name,
        success: false,
        error: error.message
      });
    }
  }

  // 結果サマリー
  console.log('\n\n📊 Canvas アニメーション生成結果');
  console.log('===========================');
  
  const successful = results.filter(r => r.success).length;
  console.log(`✅ 成功: ${successful}/${results.length}`);
  
  console.log('\n🎬 生成されたアニメーション:');
  results.filter(r => r.success).forEach((result, index) => {
    console.log(`${index + 1}. ${result.effect} × ${result.rarity}`);
    console.log(`   テキスト: ${result.text}`);
    console.log(`   フレーム: ${result.frameCount}枚`);
    console.log(`   フォルダ: ${result.frameDir}`);
  });

  // 結果をJSONで保存
  fs.writeFileSync(
    'images/canvas-animation-results.json',
    JSON.stringify(results, null, 2)
  );

  console.log('\n📂 出力:');
  console.log('- images/frames/ (フレーム画像)');
  console.log('- images/canvas-videos/ (FFmpegで動画変換後)');
  
  console.log('\n🔄 次のステップ:');
  console.log('1. FFmpegで各フレームセットを動画に変換');
  console.log('2. BGM・効果音の追加');
  console.log('3. 最終動画の出力');

  return results;
}

// 実行
generateCanvasAnimations().catch(console.error);