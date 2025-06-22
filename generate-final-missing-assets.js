const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// カスタムフォントの登録
const fontDir = path.join(__dirname, 'images/font');
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
    'public/images/gacha-buttons',
    'public/images/banners/1024x1024'
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// 5回ガチャボタンの生成
const generate5xGachaButton = () => {
  const canvas = createCanvas(300, 80);
  const ctx = canvas.getContext('2d');

  // グラデーション背景
  const gradient = ctx.createLinearGradient(0, 0, 300, 80);
  gradient.addColorStop(0, '#9B59B6');
  gradient.addColorStop(0.5, '#E74C3C');
  gradient.addColorStop(1, '#F39C12');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(0, 0, 300, 80, 20);
  ctx.fill();

  // 光沢効果
  const glossGradient = ctx.createLinearGradient(0, 0, 0, 40);
  glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
  
  ctx.fillStyle = glossGradient;
  ctx.beginPath();
  ctx.roundRect(0, 0, 300, 40, [20, 20, 0, 0]);
  ctx.fill();

  // 縁取り
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(2, 2, 296, 76, 18);
  ctx.stroke();

  // テキスト（影付き）
  ctx.font = 'bold 36px "MOBOFont"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 影
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#000000';
  ctx.fillText('5回ガチャ', 150, 42);
  
  // 本体
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('5回ガチャ', 150, 40);

  // キラキラエフェクト
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * 280 + 10;
    const y = Math.random() * 60 + 10;
    const size = Math.random() * 3 + 1;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toBuffer('image/png');
};

// レアリティ別バナーの生成
const generateRarityBanner = (rarity) => {
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext('2d');

  const rarityConfig = {
    N: { colors: ['#B0B0B0', '#808080'], sparkles: 20, font: 'DelaGothicOne' },
    R: { colors: ['#4ECDC4', '#2E86C1'], sparkles: 30, font: 'MOBOFont' },
    SR: { colors: ['#FFD93D', '#F39C12'], sparkles: 40, font: 'BananaSlip' },
    SSR: { colors: ['#FF6B6B', '#E74C3C'], sparkles: 60, font: 'Kinkaku' },
    UR: { colors: ['#DA70D6', '#8E44AD'], sparkles: 80, font: 'MOBOFont' },
    PSA10: { colors: ['#FFD700', '#FFA500'], sparkles: 100, font: 'Kinkaku' }
  };

  const config = rarityConfig[rarity];

  // 背景グラデーション
  const bgGradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
  bgGradient.addColorStop(0, config.colors[0]);
  bgGradient.addColorStop(1, config.colors[1]);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 1024, 1024);

  // 放射状エフェクト
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 36; i++) {
    ctx.save();
    ctx.translate(512, 512);
    ctx.rotate((i * 10) * Math.PI / 180);
    
    const rayGradient = ctx.createLinearGradient(0, 0, 0, -512);
    rayGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    rayGradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
    
    ctx.fillStyle = rayGradient;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, 0);
    ctx.lineTo(10, -512);
    ctx.lineTo(-10, -512);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // 中央の円形エフェクト
  const centerGradient = ctx.createRadialGradient(512, 512, 100, 512, 512, 400);
  centerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = centerGradient;
  ctx.beginPath();
  ctx.arc(512, 512, 400, 0, Math.PI * 2);
  ctx.fill();

  // レアリティテキスト
  ctx.font = `bold 180px "${config.font}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // テキストアウトライン
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 20;
  ctx.strokeText(rarity, 512, 350);
  
  // テキスト本体
  const textGradient = ctx.createLinearGradient(0, 250, 0, 450);
  textGradient.addColorStop(0, '#FFFFFF');
  textGradient.addColorStop(1, config.colors[0]);
  
  ctx.fillStyle = textGradient;
  ctx.fillText(rarity, 512, 350);

  // サブテキスト
  const subTexts = {
    N: 'ノーマル',
    R: 'レア',
    SR: 'スーパーレア',
    SSR: 'スペシャルスーパーレア',
    UR: 'ウルトラレア',
    PSA10: 'パーフェクト'
  };

  ctx.font = `bold 60px "${config.font}"`;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.strokeText(subTexts[rarity], 512, 500);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(subTexts[rarity], 512, 500);

  // 「激アツ！」テキスト
  if (['SSR', 'UR', 'PSA10'].includes(rarity)) {
    ctx.save();
    ctx.translate(512, 650);
    ctx.rotate(-15 * Math.PI / 180);
    
    ctx.font = 'bold 100px "MOBOFont"';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 10;
    ctx.strokeText('激アツ！', 0, 0);
    
    const hotGradient = ctx.createLinearGradient(-150, -50, 150, 50);
    hotGradient.addColorStop(0, '#FF0000');
    hotGradient.addColorStop(0.5, '#FFFF00');
    hotGradient.addColorStop(1, '#FF0000');
    
    ctx.fillStyle = hotGradient;
    ctx.fillText('激アツ！', 0, 0);
    ctx.restore();
  }

  // ポケモンカードプレースホルダー（円形配置）
  const cardCount = rarity === 'PSA10' ? 10 : rarity === 'UR' ? 8 : 6;
  for (let i = 0; i < cardCount; i++) {
    const angle = (i / cardCount) * Math.PI * 2;
    const radius = 300;
    const x = 512 + Math.cos(angle) * radius;
    const y = 512 + Math.sin(angle) * radius;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    
    // カード背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(-60, -84, 120, 168);
    
    // カード枠
    ctx.strokeStyle = config.colors[1];
    ctx.lineWidth = 4;
    ctx.strokeRect(-60, -84, 120, 168);
    
    // カードテキスト
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CARD', 0, 0);
    
    ctx.restore();
  }

  // スパークルエフェクト
  for (let i = 0; i < config.sparkles; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const size = Math.random() * 4 + 2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  return canvas.toBuffer('image/png');
};

// メインガチャバナーの生成
const generateMainGachaBanner = () => {
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext('2d');

  // 虹色グラデーション背景（放射状で実装）
  const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
  gradient.addColorStop(0, '#FFD700');
  gradient.addColorStop(0.2, '#FF6B6B');
  gradient.addColorStop(0.4, '#DA70D6');
  gradient.addColorStop(0.6, '#4ECDC4');
  gradient.addColorStop(0.8, '#FFD93D');
  gradient.addColorStop(1, '#FF6B6B');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 1024);

  // 暗めのオーバーレイ
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, 1024, 1024);

  // 中央の爆発エフェクト
  const explosionGradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 400);
  explosionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  explosionGradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.4)');
  explosionGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
  
  ctx.fillStyle = explosionGradient;
  ctx.fillRect(0, 0, 1024, 1024);

  // メインテキスト
  ctx.font = 'bold 120px "Kinkaku"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // アウトライン
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 20;
  ctx.strokeText('超激レア', 512, 300);
  ctx.strokeText('ガチャ', 512, 450);
  
  // グラデーションテキスト
  const textGradient = ctx.createLinearGradient(0, 200, 0, 550);
  textGradient.addColorStop(0, '#FFD700');
  textGradient.addColorStop(0.5, '#FFFFFF');
  textGradient.addColorStop(1, '#FFD700');
  
  ctx.fillStyle = textGradient;
  ctx.fillText('超激レア', 512, 300);
  ctx.fillText('ガチャ', 512, 450);

  // サブテキスト
  ctx.font = 'bold 50px "MOBOFont"';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 8;
  ctx.strokeText('PSA10確率UP!', 512, 600);
  
  ctx.fillStyle = '#FF0000';
  ctx.fillText('PSA10確率UP!', 512, 600);

  // 回転する星
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = 512 + Math.cos(angle) * 350;
    const y = 512 + Math.sin(angle) * 350;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // 星
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    for (let j = 0; j < 5; j++) {
      const starAngle = (j / 5) * Math.PI * 2 - Math.PI / 2;
      const radius = j % 2 === 0 ? 40 : 20;
      const sx = Math.cos(starAngle) * radius;
      const sy = Math.sin(starAngle) * radius;
      if (j === 0) {
        ctx.moveTo(sx, sy);
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  // 下部のキャンペーン表示
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 850, 1024, 174);
  
  ctx.font = 'bold 60px "DelaGothicOne"';
  ctx.fillStyle = '#FFFF00';
  ctx.fillText('期間限定キャンペーン', 512, 900);
  
  ctx.font = 'bold 40px "MOBOFont"';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('今なら10連でSSR確定！', 512, 970);

  return canvas.toBuffer('image/png');
};

// メイン実行
const main = async () => {
  createDirectories();

  // 5回ガチャボタン
  console.log('5回ガチャボタンを生成中...');
  fs.writeFileSync(
    'public/images/gacha-buttons/five-gacha.png',
    generate5xGachaButton()
  );

  // レアリティ別バナー
  const rarities = ['N', 'R', 'SR', 'SSR', 'UR', 'PSA10'];
  for (const rarity of rarities) {
    console.log(`${rarity}バナーを生成中...`);
    fs.writeFileSync(
      `public/images/banners/1024x1024/${rarity.toLowerCase()}-banner.png`,
      generateRarityBanner(rarity)
    );
  }

  // メインガチャバナー
  console.log('メインガチャバナーを生成中...');
  fs.writeFileSync(
    'public/images/banners/1024x1024/main-gacha-banner.png',
    generateMainGachaBanner()
  );

  console.log('\n✅ 全ての不足アセットの生成が完了しました！');
  console.log('生成されたファイル:');
  console.log('- public/images/gacha-buttons/five-gacha.png');
  rarities.forEach(rarity => {
    console.log(`- public/images/banners/1024x1024/${rarity.toLowerCase()}-banner.png`);
  });
  console.log('- public/images/banners/1024x1024/main-gacha-banner.png');
};

main().catch(console.error);