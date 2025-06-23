const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// カスタムフォントの登録
const fontDir = path.join(__dirname, 'public/images/font');
const fontFiles = [
  { file: 'Dela_Gothic_One/DelaGothicOne-Regular.ttf', family: 'DelaGothicOne' },
  { file: 'MOBO-Font11/MOBO-Bold.otf', family: 'MOBOFont' },
  { file: 'YDW_bananaslip_plus_240809/YDWbananaslipplus.otf', family: 'BananaSlip' },
  { file: 'craftmincho/craftmincho.otf', family: 'CraftMincho' },
  { file: 'kinkaku/Kinkakuji-Normal.otf', family: 'Kinkaku' }
];

// フォント登録
fontFiles.forEach(font => {
  try {
    const fontPath = path.join(fontDir, font.file);
    if (fs.existsSync(fontPath)) {
      registerFont(fontPath, { family: font.family });
      console.log(`✓ フォント登録成功: ${font.family}`);
    }
  } catch (err) {
    console.warn(`フォント登録エラー: ${font.family}`, err.message);
  }
});

// ディレクトリ作成
const createDirectories = () => {
  const dirs = [
    'public/images/banners/renewal'
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// バナーサイズ設定（スライダー用の横長バナー）
const BANNER_WIDTH = 400;
const BANNER_HEIGHT = 200;

// パターン1: リニューアル祝い - ポップなデザイン
const generateRenewalPattern1 = async () => {
  const canvas = createCanvas(BANNER_WIDTH, BANNER_HEIGHT);
  const ctx = canvas.getContext('2d');

  // 背景（虹色グラデーション）
  const bgGradient = ctx.createLinearGradient(0, 0, BANNER_WIDTH, BANNER_HEIGHT);
  bgGradient.addColorStop(0, '#FF6B6B');
  bgGradient.addColorStop(0.2, '#FFD93D');
  bgGradient.addColorStop(0.4, '#6BCF7F');
  bgGradient.addColorStop(0.6, '#4FC0D0');
  bgGradient.addColorStop(0.8, '#A275E3');
  bgGradient.addColorStop(1, '#FF6B6B');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);

  // キラキラエフェクト
  for (let i = 0; i < 30; i++) {
    ctx.save();
    const x = Math.random() * BANNER_WIDTH;
    const y = Math.random() * BANNER_HEIGHT;
    const size = Math.random() * 3 + 1;
    
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(0, -size * 2);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size * 2);
    ctx.lineTo(-size, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // NEW!リボン
  ctx.save();
  ctx.translate(50, 40);
  ctx.rotate(-15 * Math.PI / 180);
  
  ctx.fillStyle = '#FF0033';
  ctx.beginPath();
  ctx.moveTo(-40, -20);
  ctx.lineTo(40, -20);
  ctx.lineTo(50, 0);
  ctx.lineTo(40, 20);
  ctx.lineTo(-40, 20);
  ctx.lineTo(-50, 0);
  ctx.closePath();
  ctx.fill();
  
  ctx.font = 'bold 18px "MOBOFont"';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('NEW!', 0, 5);
  ctx.restore();

  // メインテキスト
  ctx.font = 'bold 28px "BananaSlip"';
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.textAlign = 'center';
  ctx.strokeText('サイト完全リニューアル！', 200, 65);
  ctx.fillText('サイト完全リニューアル！', 200, 65);

  // サブテキスト
  ctx.font = 'bold 20px "DelaGothicOne"';
  ctx.fillStyle = '#FFFF00';
  ctx.strokeStyle = '#FF0033';
  ctx.lineWidth = 3;
  ctx.strokeText('ポケモンカードを', 200, 105);
  ctx.fillText('ポケモンカードを', 200, 105);
  ctx.strokeText('みんなでゲット！', 200, 135);
  ctx.fillText('みんなでゲット！', 200, 135);

  // モンスターボール風の装飾
  ctx.beginPath();
  ctx.arc(350, 150, 25, 0, Math.PI * 2);
  ctx.fillStyle = '#FF0033';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(350, 150, 25, 0, Math.PI);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(350, 150, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(350, 150, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  return canvas.toBuffer('image/png');
};

// パターン2: エレガントなリニューアル告知
const generateRenewalPattern2 = async () => {
  const canvas = createCanvas(BANNER_WIDTH, BANNER_HEIGHT);
  const ctx = canvas.getContext('2d');

  // 背景（高級感のあるグラデーション）
  const bgGradient = ctx.createRadialGradient(200, 100, 0, 200, 100, 300);
  bgGradient.addColorStop(0, '#1a1a1a');
  bgGradient.addColorStop(0.5, '#2c2c2c');
  bgGradient.addColorStop(1, '#000000');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);

  // ゴールドの光線
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.translate(200, 100);
    ctx.rotate(i * 45 * Math.PI / 180);
    
    const rayGradient = ctx.createLinearGradient(0, 0, 0, -200);
    rayGradient.addColorStop(0, 'rgba(255, 215, 0, 0)');
    rayGradient.addColorStop(1, 'rgba(255, 215, 0, 0.8)');
    
    ctx.fillStyle = rayGradient;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(5, 0);
    ctx.lineTo(2, -200);
    ctx.lineTo(-2, -200);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // ゴールドフレーム
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, BANNER_WIDTH - 20, BANNER_HEIGHT - 20);

  // RENEWALバッジ
  ctx.font = 'bold 14px "Kinkaku"';
  ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'left';
  ctx.fillText('GRAND RENEWAL', 30, 40);

  // メインテキスト
  ctx.font = 'bold 24px "Kinkaku"';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('サイト完全リニューアル', 200, 80);

  // 装飾ライン
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 95);
  ctx.lineTo(350, 95);
  ctx.stroke();

  // サブテキスト
  ctx.font = '18px "CraftMincho"';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('ポケモンカードを', 200, 125);
  ctx.fillText('みんなでゲット！', 200, 150);

  // エレガントな装飾
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(100 + i * 100, 170, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
  }

  return canvas.toBuffer('image/png');
};

// パターン3: ゲーム風リニューアル告知
const generateRenewalPattern3 = async () => {
  const canvas = createCanvas(BANNER_WIDTH, BANNER_HEIGHT);
  const ctx = canvas.getContext('2d');

  // 背景（ゲーム風のビビッドカラー）
  const bgGradient = ctx.createLinearGradient(0, 0, BANNER_WIDTH, 0);
  bgGradient.addColorStop(0, '#FF1744');
  bgGradient.addColorStop(0.5, '#FF6B6B');
  bgGradient.addColorStop(1, '#FF1744');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);

  // ピクセルアート風の背景パターン
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let x = 0; x < BANNER_WIDTH; x += 10) {
    for (let y = 0; y < BANNER_HEIGHT; y += 10) {
      if ((x + y) % 20 === 0) {
        ctx.fillRect(x, y, 10, 10);
      }
    }
  }

  // 8ビット風の星
  const drawPixelStar = (x, y, size) => {
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(x - size, y, size * 2, size);
    ctx.fillRect(x, y - size, size, size * 2);
  };
  
  drawPixelStar(40, 40, 4);
  drawPixelStar(360, 160, 4);
  drawPixelStar(80, 140, 3);

  // レトロゲーム風フレーム
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(20, 50, BANNER_WIDTH - 40, 100);
  ctx.fillStyle = '#000000';
  ctx.fillRect(25, 55, BANNER_WIDTH - 50, 90);

  // START!風のテキスト
  ctx.font = 'bold 20px "MOBOFont"';
  ctx.fillStyle = '#00FF00';
  ctx.textAlign = 'center';
  ctx.fillText('▶ START!', 200, 45);

  // メインテキスト
  ctx.font = 'bold 22px "DelaGothicOne"';
  ctx.fillStyle = '#FFFF00';
  ctx.textAlign = 'center';
  ctx.fillText('サイト完全リニューアル！', 200, 90);

  // ゲーム風のサブテキスト
  ctx.font = 'bold 16px "MOBOFont"';
  ctx.fillStyle = '#00FF00';
  ctx.fillText('ポケモンカードを', 200, 115);
  ctx.fillText('みんなでゲット！', 200, 135);

  // コイン風アイコン
  ctx.beginPath();
  ctx.arc(350, 40, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD700';
  ctx.fill();
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.fillText('P', 350, 46);

  // PRESS ENTERテキスト
  ctx.font = '12px "MOBOFont"';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('PRESS ENTER', 200, 175);

  return canvas.toBuffer('image/png');
};

// パターン4: シンプルモダンなリニューアル告知
const generateRenewalPattern4 = async () => {
  const canvas = createCanvas(BANNER_WIDTH, BANNER_HEIGHT);
  const ctx = canvas.getContext('2d');

  // 背景（クリーンなグラデーション）
  const bgGradient = ctx.createLinearGradient(0, 0, 0, BANNER_HEIGHT);
  bgGradient.addColorStop(0, '#FFFFFF');
  bgGradient.addColorStop(1, '#F0F0F0');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);

  // アクセントカラーの帯
  ctx.fillStyle = '#FF0033';
  ctx.fillRect(0, 0, BANNER_WIDTH, 5);
  ctx.fillRect(0, BANNER_HEIGHT - 5, BANNER_WIDTH, 5);

  // 左側のアクセント
  ctx.fillStyle = '#FF0033';
  ctx.fillRect(0, 0, 5, BANNER_HEIGHT);

  // Renewalマーク
  ctx.save();
  ctx.translate(40, 100);
  ctx.font = 'bold 48px Arial';
  ctx.fillStyle = '#FF0033';
  ctx.textAlign = 'center';
  ctx.fillText('🔄', 0, 0);
  ctx.restore();

  // メインテキスト
  ctx.font = '24px "DelaGothicOne"';
  ctx.fillStyle = '#333333';
  ctx.textAlign = 'left';
  ctx.fillText('サイト完全', 90, 60);
  ctx.fillText('リニューアル！', 90, 90);

  // 区切り線
  ctx.strokeStyle = '#CCCCCC';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(90, 105);
  ctx.lineTo(300, 105);
  ctx.stroke();

  // サブテキスト
  ctx.font = '16px "DelaGothicOne"';
  ctx.fillStyle = '#666666';
  ctx.fillText('ポケモンカードを', 90, 130);
  
  ctx.font = 'bold 18px "DelaGothicOne"';
  ctx.fillStyle = '#FF0033';
  ctx.fillText('みんなでゲット！', 90, 155);

  // CTAボタン風
  ctx.fillStyle = '#FF0033';
  ctx.fillRect(310, 125, 80, 35);
  ctx.font = 'bold 14px "MOBOFont"';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('詳細を見る', 350, 147);

  // 右下の装飾
  ctx.beginPath();
  ctx.moveTo(BANNER_WIDTH - 30, BANNER_HEIGHT - 30);
  ctx.lineTo(BANNER_WIDTH, BANNER_HEIGHT - 30);
  ctx.lineTo(BANNER_WIDTH, BANNER_HEIGHT);
  ctx.fillStyle = '#FF0033';
  ctx.fill();

  return canvas.toBuffer('image/png');
};

// メイン実行
const main = async () => {
  createDirectories();

  console.log('サイトリニューアル告知バナーを生成中...');

  // パターン1: ポップなデザイン
  console.log('1. ポップなリニューアルバナーを生成中...');
  fs.writeFileSync(
    'public/images/banners/renewal/renewal-pop-banner.png',
    await generateRenewalPattern1()
  );

  // パターン2: エレガントなデザイン
  console.log('2. エレガントなリニューアルバナーを生成中...');
  fs.writeFileSync(
    'public/images/banners/renewal/renewal-elegant-banner.png',
    await generateRenewalPattern2()
  );

  // パターン3: ゲーム風デザイン
  console.log('3. ゲーム風リニューアルバナーを生成中...');
  fs.writeFileSync(
    'public/images/banners/renewal/renewal-game-banner.png',
    await generateRenewalPattern3()
  );

  // パターン4: シンプルモダンなデザイン
  console.log('4. シンプルモダンなリニューアルバナーを生成中...');
  fs.writeFileSync(
    'public/images/banners/renewal/renewal-modern-banner.png',
    await generateRenewalPattern4()
  );

  console.log('\n✅ サイトリニューアル告知バナーの生成が完了しました！');
  console.log('生成されたファイル:');
  console.log('- public/images/banners/renewal/renewal-pop-banner.png （ポップなデザイン）');
  console.log('- public/images/banners/renewal/renewal-elegant-banner.png （エレガントなデザイン）');
  console.log('- public/images/banners/renewal/renewal-game-banner.png （ゲーム風デザイン）');
  console.log('- public/images/banners/renewal/renewal-modern-banner.png （シンプルモダン）');
  console.log('\nサイズ: 400x200px（スライダー表示用）');
};

main().catch(console.error);