const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// ディレクトリ作成
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// DOPA風ゴテゴテバナー生成関数
function createHeavyDOPABanner(title, subtitle, fileName, options = {}) {
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景: 濃い赤から明るい赤への激しいグラデーション
  const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
  bgGradient.addColorStop(0, '#FF6B6B');
  bgGradient.addColorStop(0.3, '#FF3366');
  bgGradient.addColorStop(0.6, '#FF0033');
  bgGradient.addColorStop(1, '#CC0033');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 複数の爆発エフェクト
  for (let e = 0; e < 3; e++) {
    const centerX = [width * 0.2, width * 0.5, width * 0.8][e];
    const centerY = [height * 0.3, height * 0.5, height * 0.7][e];
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // 爆発光線
    for (let i = 0; i < 36; i++) {
      ctx.rotate((Math.PI * 2) / 36);
      const gradient = ctx.createLinearGradient(0, 0, 200, 0);
      gradient.addColorStop(0, `rgba(255, 255, 0, ${0.8 - e * 0.2})`);
      gradient.addColorStop(0.5, `rgba(255, 215, 0, ${0.5 - e * 0.1})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, -2, 200, 4);
    }
    ctx.restore();
  }

  // 斜めストライプパターン
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 20;
  for (let i = -height; i < width + height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }

  // キラキラ粒子（大量）
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 5 + 2;
    
    ctx.save();
    ctx.translate(x, y);
    
    // 星型キラキラ
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
    ctx.beginPath();
    for (let j = 0; j < 4; j++) {
      ctx.rotate(Math.PI / 2);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -size);
      ctx.lineTo(size * 0.3, -size * 0.3);
    }
    ctx.fill();
    ctx.restore();
  }

  // 虹色の光線エフェクト
  const rainbowGradient = ctx.createLinearGradient(0, 0, width, height);
  rainbowGradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
  rainbowGradient.addColorStop(0.17, 'rgba(255, 165, 0, 0.3)');
  rainbowGradient.addColorStop(0.33, 'rgba(255, 255, 0, 0.3)');
  rainbowGradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.3)');
  rainbowGradient.addColorStop(0.67, 'rgba(0, 127, 255, 0.3)');
  rainbowGradient.addColorStop(0.83, 'rgba(139, 0, 255, 0.3)');
  rainbowGradient.addColorStop(1, 'rgba(255, 0, 255, 0.3)');
  
  ctx.fillStyle = rainbowGradient;
  ctx.fillRect(0, 0, width, height);

  // メガカード演出
  if (options.showMegaCard) {
    for (let c = 0; c < 3; c++) {
      ctx.save();
      ctx.translate(width * (0.6 + c * 0.15), height * (0.4 + c * 0.1));
      ctx.rotate((-0.3 + c * 0.2));
      ctx.scale(1 - c * 0.2, 1 - c * 0.2);
      
      // カード影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(-85, -125, 170, 250);
      
      // カード本体（ホログラフィック）
      const cardGrad = ctx.createLinearGradient(-80, -120, 80, 120);
      cardGrad.addColorStop(0, '#FFD700');
      cardGrad.addColorStop(0.25, '#FF69B4');
      cardGrad.addColorStop(0.5, '#00CED1');
      cardGrad.addColorStop(0.75, '#FFD700');
      cardGrad.addColorStop(1, '#FF1493');
      ctx.fillStyle = cardGrad;
      ctx.fillRect(-80, -120, 160, 240);
      
      // カード枠（ゴールド）
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 6;
      ctx.strokeRect(-80, -120, 160, 240);
      
      // カード光沢
      const shineGrad = ctx.createLinearGradient(-80, -120, 40, 0);
      shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      shineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
      shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = shineGrad;
      ctx.fillRect(-80, -120, 160, 240);
      
      ctx.restore();
    }
  }

  // 爆発テキストエフェクト背景
  ctx.save();
  ctx.translate(width / 2, height / 2 - 40);
  const textBgGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 300);
  textBgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  textBgGrad.addColorStop(0.3, 'rgba(255, 215, 0, 0.6)');
  textBgGrad.addColorStop(0.6, 'rgba(255, 69, 0, 0.4)');
  textBgGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
  ctx.fillStyle = textBgGrad;
  ctx.fillRect(-400, -100, 800, 200);
  ctx.restore();

  // メインタイトル（超極太・多重影）
  ctx.font = 'bold 80px "Hiragino Sans", "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 多重影効果
  for (let i = 10; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.5 - i * 0.04})`;
    ctx.fillText(title, width / 2 + i * 2, height / 2 - 40 + i * 2);
  }
  
  // 金色縁取り
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 10;
  ctx.strokeText(title, width / 2, height / 2 - 40);
  
  // 黒縁取り
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 6;
  ctx.strokeText(title, width / 2, height / 2 - 40);
  
  // 白文字
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(title, width / 2, height / 2 - 40);

  // サブタイトル（ネオン効果）
  ctx.font = 'bold 56px "Hiragino Sans", "Arial Black", sans-serif';
  
  // ネオングロー
  for (let i = 5; i > 0; i--) {
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.3 - i * 0.05})`;
    ctx.lineWidth = i * 4;
    ctx.strokeText(subtitle, width / 2, height / 2 + 50);
  }
  
  // 黒縁取り
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.strokeText(subtitle, width / 2, height / 2 + 50);
  
  // 金色グラデーション文字
  const goldTextGrad = ctx.createLinearGradient(0, height / 2 + 30, 0, height / 2 + 70);
  goldTextGrad.addColorStop(0, '#FFED4E');
  goldTextGrad.addColorStop(0.5, '#FFD700');
  goldTextGrad.addColorStop(1, '#FFA500');
  ctx.fillStyle = goldTextGrad;
  ctx.fillText(subtitle, width / 2, height / 2 + 50);

  // 超豪華バッジ
  if (options.badge) {
    ctx.save();
    ctx.translate(width - 120, 80);
    ctx.rotate(0.2);
    
    // バッジ爆発背景
    const badgeBurst = ctx.createRadialGradient(0, 0, 0, 0, 0, 80);
    badgeBurst.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
    badgeBurst.addColorStop(0.5, 'rgba(255, 165, 0, 0.5)');
    badgeBurst.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = badgeBurst;
    ctx.fillRect(-80, -80, 160, 160);
    
    // バッジ本体
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const radius = i % 2 === 0 ? 50 : 40;
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.fill();
    
    // バッジ枠
    ctx.strokeStyle = '#FF0033';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // バッジテキスト
    ctx.font = 'bold 32px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FF0033';
    ctx.fillText(options.badge, 0, 0);
    
    ctx.restore();
  }

  // 豪華ボトムバー
  const bottomGrad = ctx.createLinearGradient(0, height - 80, 0, height);
  bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  bottomGrad.addColorStop(0.5, 'rgba(50, 0, 0, 0.9)');
  bottomGrad.addColorStop(1, '#000000');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, height - 80, width, 80);
  
  // ボトムバー装飾ライン
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, height - 80);
  ctx.lineTo(width, height - 80);
  ctx.stroke();
  
  // ボトムテキスト
  if (options.bottomText) {
    ctx.font = 'bold 36px "Hiragino Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(options.bottomText, width / 2, height - 35);
  }

  // 最終キラキラオーバーレイ
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI * 2);
    
    const starGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
    starGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    starGrad.addColorStop(0.2, 'rgba(255, 255, 0, 0.8)');
    starGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = starGrad;
    
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(3, -3);
    ctx.lineTo(10, 0);
    ctx.lineTo(3, 3);
    ctx.lineTo(0, 10);
    ctx.lineTo(-3, 3);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-3, -3);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  // 画像保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(imagesDir, fileName), buffer);
  console.log(`✅ 生成完了: ${fileName}`);
}

// DOPA風超ゴテゴテバナー生成
console.log('🎨 DOPA風超ゴテゴテバナー生成開始...\n');

// 既存の画像をバックアップ
const files = ['pokemon-151.png', 'shiny-treasure.png', 'campaign.png'];
files.forEach(file => {
  const filePath = path.join(imagesDir, file);
  if (fs.existsSync(filePath)) {
    fs.renameSync(filePath, filePath + '.bak');
  }
});

// 1. ポケモンカード151（超豪華版）
createHeavyDOPABanner(
  'ポケモンカード151',
  'リザードンex確率UP!',
  'pokemon-151.png',
  { showMegaCard: true, badge: '激アツ', bottomText: '⚡ 1回 800円 ⚡' }
);

// 2. メインキャンペーンバナー
createHeavyDOPABanner(
  'シャイニートレジャー',
  'SSR確定オリパ',
  'メインキャンペーンバナー.png',
  { showMegaCard: true, badge: 'SSR確定', bottomText: '★ 1回 1,200円 ★' }
);

// 3. 期間限定キャンペーン
createHeavyDOPABanner(
  '期間限定キャンペーン',
  '10連ガチャ20%OFF',
  'ポケモンカード151オリパ.png',
  { badge: '本日限り', bottomText: '💥 今だけ超お得! 💥' }
);

console.log('\n🎉 全てのDOPA風超ゴテゴテバナー生成完了！');