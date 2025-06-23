const { createCanvas, loadImage, registerFont } = require('canvas');
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
    'public/images/banners/real-gacha'
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// プレミアムPSA10ガチャバナー
const generatePremiumPSA10Banner = async () => {
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext('2d');

  // 背景（プレミアムゴールドグラデーション）
  const bgGradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
  bgGradient.addColorStop(0, '#FFD700');
  bgGradient.addColorStop(0.5, '#FFA500');
  bgGradient.addColorStop(1, '#FF6B6B');
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
    rayGradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
    
    ctx.fillStyle = rayGradient;
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.lineTo(30, 0);
    ctx.lineTo(15, -512);
    ctx.lineTo(-15, -512);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // タイトル背景
  const titleGradient = ctx.createLinearGradient(0, 50, 0, 200);
  titleGradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
  titleGradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
  ctx.fillStyle = titleGradient;
  ctx.fillRect(0, 50, 1024, 150);

  // メインタイトル
  ctx.font = 'bold 72px "Kinkaku"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // アウトライン
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 8;
  ctx.strokeText('PSA10確定オリパ', 512, 125);
  
  // テキスト本体
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('PSA10確定オリパ', 512, 125);

  // ポケモンカード配置（実際の画像を使用）
  const cardPositions = [
    { file: '008_マリオピカチュウ PSA10_PK-0008.jpg', x: 200, y: 300, scale: 0.8, rotation: -15 },
    { file: '010_ポンチョを着たピカチュウ(黒リザ) PSA10_PK-0010.jpg', x: 512, y: 400, scale: 1.2, rotation: 0 },
    { file: '185_ブルーの探索 PSA10_PK-0187.jpg', x: 824, y: 300, scale: 0.8, rotation: 15 }
  ];

  // カード画像の読み込みと描画
  for (const card of cardPositions) {
    try {
      const imagePath = path.join(__dirname, 'public/images/pokemon', card.file);
      if (fs.existsSync(imagePath)) {
        const img = await loadImage(imagePath);
        
        ctx.save();
        ctx.translate(card.x, card.y);
        ctx.rotate(card.rotation * Math.PI / 180);
        
        // カードの影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;
        
        // カード描画
        const width = 200 * card.scale;
        const height = 280 * card.scale;
        ctx.drawImage(img, -width/2, -height/2, width, height);
        
        // PSA10ラベル強調
        if (card.scale === 1.2) {
          // 中央カードにキラキラエフェクト
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 30;
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 4;
          ctx.strokeRect(-width/2, -height/2, width, height);
        }
        
        ctx.restore();
      }
    } catch (err) {
      console.warn(`カード画像読み込みエラー: ${card.file}`);
    }
  }

  // 価格表示エリア
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 750, 1024, 200);

  // 価格テキスト
  ctx.font = 'bold 48px "MOBOFont"';
  ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'left';
  ctx.fillText('1回', 150, 820);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 64px "MOBOFont"';
  ctx.fillText('¥3,000', 250, 820);

  ctx.font = 'bold 48px "MOBOFont"';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('10連', 550, 820);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 64px "MOBOFont"';
  ctx.fillText('¥27,000', 680, 820);

  // 特典表示
  ctx.font = 'bold 32px "BananaSlip"';
  ctx.fillStyle = '#FF0000';
  ctx.textAlign = 'center';
  ctx.fillText('10連でSSR1枚確定！', 512, 900);

  // キラキラエフェクト
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const size = Math.random() * 4 + 2;
    
    ctx.save();
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

  return canvas.toBuffer('image/png');
};

// アセロラ特集バナー
const generateAcerolaSpecialBanner = async () => {
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext('2d');

  // 背景（パープルグラデーション）
  const bgGradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
  bgGradient.addColorStop(0, '#DA70D6');
  bgGradient.addColorStop(0.5, '#8B008B');
  bgGradient.addColorStop(1, '#4B0082');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 1024, 1024);

  // ハート背景パターン
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const size = Math.random() * 30 + 20;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(255, 182, 193, 0.2)';
    
    // ハート形
    ctx.beginPath();
    ctx.moveTo(0, size * 0.3);
    ctx.bezierCurveTo(-size * 0.5, -size * 0.2, -size, size * 0.2, 0, size);
    ctx.bezierCurveTo(size, size * 0.2, size * 0.5, -size * 0.2, 0, size * 0.3);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  // タイトル
  ctx.font = 'bold 80px "BananaSlip"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // テキストエフェクト
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 10;
  ctx.strokeText('アセロラ祭り', 512, 120);
  
  const titleGradient = ctx.createLinearGradient(0, 80, 0, 160);
  titleGradient.addColorStop(0, '#FF69B4');
  titleGradient.addColorStop(0.5, '#FFFFFF');
  titleGradient.addColorStop(1, '#FF1493');
  
  ctx.fillStyle = titleGradient;
  ctx.fillText('アセロラ祭り', 512, 120);

  // アセロラカード配置
  const acerolaCards = [
    { file: '003_アセロラ(エクバ) PSA10_PK-0003.jpg', x: 256, y: 400, scale: 0.9 },
    { file: '015_アセロラ PSA10_PK-0015.jpg', x: 512, y: 450, scale: 1.1 },
    { file: '028_アセロラ_PK-0028.jpg', x: 768, y: 400, scale: 0.9 }
  ];

  // カード描画
  for (const card of acerolaCards) {
    try {
      const imagePath = path.join(__dirname, 'public/images/pokemon', card.file);
      if (fs.existsSync(imagePath)) {
        const img = await loadImage(imagePath);
        
        ctx.save();
        ctx.translate(card.x, card.y);
        
        // ピンクのオーラエフェクト
        ctx.shadowColor = '#FF69B4';
        ctx.shadowBlur = 30;
        
        const width = 180 * card.scale;
        const height = 250 * card.scale;
        ctx.drawImage(img, -width/2, -height/2, width, height);
        
        ctx.restore();
      }
    } catch (err) {
      console.warn(`カード画像読み込みエラー: ${card.file}`);
    }
  }

  // 特別価格表示
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(100, 750, 824, 150);

  ctx.font = 'bold 60px "Kinkaku"';
  ctx.fillStyle = '#FF1493';
  ctx.textAlign = 'center';
  ctx.fillText('期間限定特別価格', 512, 800);

  ctx.font = 'bold 48px "MOBOFont"';
  ctx.fillStyle = '#8B008B';
  ctx.fillText('1回 ¥1,500 → ¥1,200', 512, 860);

  return canvas.toBuffer('image/png');
};

// ピカチュウコレクションバナー
const generatePikachuCollectionBanner = async () => {
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext('2d');

  // 背景（電気イエロー）
  const bgGradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
  bgGradient.addColorStop(0, '#FFFF00');
  bgGradient.addColorStop(0.5, '#FFD700');
  bgGradient.addColorStop(1, '#FFA500');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 1024, 1024);

  // 電気エフェクト
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.5;
  
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 1024, 0);
    const points = 5 + Math.floor(Math.random() * 5);
    for (let j = 0; j < points; j++) {
      ctx.lineTo(
        Math.random() * 1024,
        (j + 1) * (1024 / points)
      );
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // タイトル
  ctx.font = 'bold 72px "DelaGothicOne"';
  ctx.textAlign = 'center';
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.strokeText('ピカチュウ大集合！', 512, 100);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('ピカチュウ大集合！', 512, 100);

  // ピカチュウカード配置
  const pikachuCards = [
    { file: '008_マリオピカチュウ PSA10_PK-0008.jpg', x: 200, y: 350 },
    { file: '016_ポンチョを着たピカチュウ(リザ) PSA10_PK-0016.jpg', x: 400, y: 400 },
    { file: '019_ポンチョを着たピカチュウ(黒レックウザ) PSA10_PK-0019.jpg', x: 600, y: 400 },
    { file: '151_ポンチョを着たピカチュウ(ロコン)_PK-0153.jpg', x: 800, y: 350 }
  ];

  // カード描画
  for (let i = 0; i < pikachuCards.length; i++) {
    const card = pikachuCards[i];
    try {
      const imagePath = path.join(__dirname, 'public/images/pokemon', card.file);
      if (fs.existsSync(imagePath)) {
        const img = await loadImage(imagePath);
        
        ctx.save();
        ctx.translate(card.x, card.y);
        ctx.rotate((i % 2 === 0 ? -10 : 10) * Math.PI / 180);
        
        // 電気オーラ
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 20;
        
        const width = 160;
        const height = 220;
        ctx.drawImage(img, -width/2, -height/2, width, height);
        
        ctx.restore();
      }
    } catch (err) {
      console.warn(`カード画像読み込みエラー: ${card.file}`);
    }
  }

  // キャンペーン情報
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 750, 1024, 200);

  ctx.font = 'bold 48px "MOBOFont"';
  ctx.fillStyle = '#FFFF00';
  ctx.textAlign = 'center';
  ctx.fillText('ピカチュウ出現率2倍！', 512, 820);

  ctx.font = 'bold 36px "MOBOFont"';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('1回 ¥800 / 10連 ¥7,200', 512, 880);

  return canvas.toBuffer('image/png');
};

// メイン実行
const main = async () => {
  createDirectories();

  console.log('本物のポケモンカードを使用したガチャバナーを生成中...');

  // バナー1: プレミアムPSA10
  console.log('1. プレミアムPSA10バナーを生成中...');
  fs.writeFileSync(
    'public/images/banners/real-gacha/premium-psa10-banner.png',
    await generatePremiumPSA10Banner()
  );

  // バナー2: アセロラ特集
  console.log('2. アセロラ特集バナーを生成中...');
  fs.writeFileSync(
    'public/images/banners/real-gacha/acerola-special-banner.png',
    await generateAcerolaSpecialBanner()
  );

  // バナー3: ピカチュウコレクション
  console.log('3. ピカチュウコレクションバナーを生成中...');
  fs.writeFileSync(
    'public/images/banners/real-gacha/pikachu-collection-banner.png',
    await generatePikachuCollectionBanner()
  );

  console.log('\n✅ 本格的なガチャバナーの生成が完了しました！');
  console.log('生成されたファイル:');
  console.log('- public/images/banners/real-gacha/premium-psa10-banner.png');
  console.log('- public/images/banners/real-gacha/acerola-special-banner.png');
  console.log('- public/images/banners/real-gacha/pikachu-collection-banner.png');
};

main().catch(console.error);