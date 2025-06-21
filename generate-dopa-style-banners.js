const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// ディレクトリ作成
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// DOPA風バナー生成関数
function createDOPABanner(title, subtitle, fileName, options = {}) {
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景: DOPA風赤グラデーション
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#FF0033');
  gradient.addColorStop(0.5, '#FF3366');
  gradient.addColorStop(1, '#FF6B6B');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 斜めのエフェクトライン
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  for (let i = -height; i < width + height; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }

  // 爆発エフェクト（放射状）
  ctx.save();
  ctx.translate(width / 2, height / 2);
  for (let i = 0; i < 20; i++) {
    ctx.rotate((Math.PI * 2) / 20);
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.3 - i * 0.01})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width / 2, 0);
    ctx.stroke();
  }
  ctx.restore();

  // カードのホログラム効果
  if (options.showCard) {
    ctx.save();
    ctx.translate(width * 0.7, height * 0.5);
    ctx.rotate(-0.1);
    
    // カード背景
    const cardGradient = ctx.createLinearGradient(-80, -120, 80, 120);
    cardGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    cardGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.8)');
    cardGradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
    ctx.fillStyle = cardGradient;
    ctx.fillRect(-80, -120, 160, 240);
    
    // カード枠
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.strokeRect(-80, -120, 160, 240);
    
    ctx.restore();
  }

  // メインタイトル（白文字、黒縁取り）
  ctx.font = 'bold 72px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 黒縁取り
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.strokeText(title, width / 2, height / 2 - 40);
  
  // 白文字
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(title, width / 2, height / 2 - 40);

  // サブタイトル（金色、黒縁取り）
  ctx.font = 'bold 48px "Hiragino Sans", "Noto Sans JP", sans-serif';
  
  // 黒縁取り
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 6;
  ctx.strokeText(subtitle, width / 2, height / 2 + 40);
  
  // 金色グラデーション
  const goldGradient = ctx.createLinearGradient(0, height / 2 + 20, 0, height / 2 + 60);
  goldGradient.addColorStop(0, '#FFD700');
  goldGradient.addColorStop(0.5, '#FFED4E');
  goldGradient.addColorStop(1, '#FFD700');
  ctx.fillStyle = goldGradient;
  ctx.fillText(subtitle, width / 2, height / 2 + 40);

  // キラキラエフェクト
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 3 + 1;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    
    const sparkleGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
    sparkleGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sparkleGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.8)');
    sparkleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = sparkleGradient;
    ctx.fillRect(-size * 2, -size * 2, size * 4, size * 4);
    ctx.restore();
  }

  // NEW/限定バッジ
  if (options.badge) {
    ctx.save();
    ctx.translate(width - 100, 60);
    ctx.rotate(0.1);
    
    // バッジ背景
    const badgeGradient = ctx.createLinearGradient(-40, -25, 40, 25);
    badgeGradient.addColorStop(0, '#FFD700');
    badgeGradient.addColorStop(0.5, '#FFED4E');
    badgeGradient.addColorStop(1, '#FFA500');
    ctx.fillStyle = badgeGradient;
    ctx.fillRect(-40, -25, 80, 50);
    
    // バッジ枠
    ctx.strokeStyle = '#FF0033';
    ctx.lineWidth = 3;
    ctx.strokeRect(-40, -25, 80, 50);
    
    // バッジテキスト
    ctx.font = 'bold 24px "Hiragino Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FF0033';
    ctx.fillText(options.badge, 0, 0);
    
    ctx.restore();
  }

  // ボトムバー
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, height - 60, width, 60);
  
  // ボトムテキスト
  if (options.bottomText) {
    ctx.font = 'bold 24px "Hiragino Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(options.bottomText, width / 2, height - 20);
  }

  // 画像保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(imagesDir, fileName), buffer);
  console.log(`✅ 生成完了: ${fileName}`);
}

// DOPA風バナー生成
console.log('🎨 DOPA風バナー生成開始...\n');

// 1. ポケモンカード151
createDOPABanner(
  'ポケモンカード151',
  'リザードンex確率UP!',
  'pokemon-151.png',
  { showCard: true, badge: 'HOT', bottomText: '1回 800円' }
);

// 2. シャイニートレジャー
createDOPABanner(
  'シャイニートレジャー',
  'SSR確定オリパ',
  'shiny-treasure.png',
  { showCard: true, badge: 'SSR', bottomText: '1回 1,200円' }
);

// 3. 期間限定キャンペーン
createDOPABanner(
  '期間限定キャンペーン',
  '10連ガチャ20%OFF',
  'campaign.png',
  { badge: '限定', bottomText: '今だけお得！' }
);

// 4. ワンピース頂上決戦
createDOPABanner(
  'ワンピース頂上決戦',
  'ルフィSR確率UP!',
  'onepiece-summit.png',
  { showCard: true, badge: 'NEW', bottomText: '1回 1,500円' }
);

// 5. 遊戯王レアコレ
createDOPABanner(
  '遊戯王レアコレ',
  'ブラマジ確定!?',
  'yugioh-rare.png',
  { showCard: true, badge: 'RARE', bottomText: '1回 2,000円' }
);

console.log('\n🎉 全てのDOPAスタイルバナー生成完了！');