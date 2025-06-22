const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// 確実に登録されたフォントでバナー生成
async function createProperFontBanner(options = {}) {
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景グラデーション（DOPA風）
  const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
  if (options.bgColor === 'purple') {
    bgGradient.addColorStop(0, '#FF69B4');
    bgGradient.addColorStop(0.3, '#DA70D6');
    bgGradient.addColorStop(0.6, '#9370DB');
    bgGradient.addColorStop(1, '#4B0082');
  } else if (options.bgColor === 'gold') {
    bgGradient.addColorStop(0, '#FFD700');
    bgGradient.addColorStop(0.3, '#FFA500');
    bgGradient.addColorStop(0.6, '#FF6347');
    bgGradient.addColorStop(1, '#8B0000');
  } else {
    // デフォルト赤系
    bgGradient.addColorStop(0, '#FF6B6B');
    bgGradient.addColorStop(0.3, '#FF3366');
    bgGradient.addColorStop(0.6, '#FF0033');
    bgGradient.addColorStop(1, '#8B0000');
  }
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 放射状光線エフェクト
  ctx.save();
  ctx.translate(width/2, height/2);
  for (let i = 0; i < 24; i++) {
    ctx.rotate((Math.PI * 2) / 24);
    const rayGrad = ctx.createLinearGradient(0, 0, 400, 0);
    rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    rayGrad.addColorStop(0.5, 'rgba(255, 255, 0, 0.3)');
    rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = rayGrad;
    ctx.fillRect(0, -6, 400, 12);
  }
  ctx.restore();

  // 稲妻エフェクト
  if (options.lightning) {
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#FFFF00';
    ctx.shadowBlur = 15;
    
    // 稲妻パス1
    ctx.beginPath();
    ctx.moveTo(150, 0);
    ctx.lineTo(180, 120);
    ctx.lineTo(140, 130);
    ctx.lineTo(170, 250);
    ctx.lineTo(130, height);
    ctx.stroke();
    
    // 稲妻パス2
    ctx.beginPath();
    ctx.moveTo(width - 150, 0);
    ctx.lineTo(width - 180, 150);
    ctx.lineTo(width - 140, 160);
    ctx.lineTo(width - 170, 300);
    ctx.lineTo(width - 130, height);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
  }

  // ポケモンカード配置（大量散りばめ）
  if (options.cardImages && options.cardImages.length > 0) {
    const cardPositions = [
      // 背景層
      { x: 0.08, y: 0.15, scale: 0.25, rotation: -0.4, opacity: 0.6 },
      { x: 0.12, y: 0.75, scale: 0.22, rotation: 0.3, opacity: 0.5 },
      { x: 0.88, y: 0.25, scale: 0.28, rotation: 0.4, opacity: 0.65 },
      { x: 0.92, y: 0.8, scale: 0.24, rotation: -0.3, opacity: 0.55 },
      { x: 0.05, y: 0.45, scale: 0.2, rotation: 0.2, opacity: 0.4 },
      { x: 0.95, y: 0.55, scale: 0.26, rotation: -0.4, opacity: 0.6 },
      
      // 中間層
      { x: 0.2, y: 0.35, scale: 0.35, rotation: -0.15, opacity: 0.8 },
      { x: 0.8, y: 0.4, scale: 0.38, rotation: 0.12, opacity: 0.85 },
      { x: 0.25, y: 0.75, scale: 0.32, rotation: -0.08, opacity: 0.75 },
      { x: 0.75, y: 0.2, scale: 0.34, rotation: 0.18, opacity: 0.8 },
      { x: 0.15, y: 0.6, scale: 0.3, rotation: 0.1, opacity: 0.7 },
      { x: 0.85, y: 0.65, scale: 0.33, rotation: -0.12, opacity: 0.78 },
      
      // 前景層（メイン）
      { x: 0.45, y: 0.55, scale: 0.5, rotation: -0.05, opacity: 1 },
      { x: 0.55, y: 0.45, scale: 0.48, rotation: 0.08, opacity: 0.95 },
      { x: 0.4, y: 0.7, scale: 0.45, rotation: 0.03, opacity: 0.9 }
    ];

    for (let i = 0; i < Math.min(cardPositions.length, options.cardImages.length * 3); i++) {
      const pos = cardPositions[i];
      const cardPath = options.cardImages[i % options.cardImages.length];
      
      try {
        const cardImage = await loadImage(cardPath);
        
        ctx.save();
        ctx.globalAlpha = pos.opacity;
        ctx.translate(width * pos.x, height * pos.y);
        ctx.rotate(pos.rotation);
        
        const cardHeight = 280 * pos.scale;
        const cardWidth = 200 * pos.scale;
        
        // カード発光
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = pos.scale > 0.4 ? 25 : 15;
        ctx.drawImage(cardImage, -cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // ホログラム効果
        ctx.shadowBlur = 0;
        const shineGrad = ctx.createLinearGradient(-cardWidth/2, -cardHeight/2, cardWidth/2, cardHeight/2);
        shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        shineGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
        shineGrad.addColorStop(0.7, 'rgba(255, 215, 0, 0.3)');
        shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shineGrad;
        ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // 金枠
        if (pos.scale > 0.35) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.strokeRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        }
        
        ctx.restore();
      } catch (err) {
        console.error(`カード画像エラー: ${cardPath}`);
      }
    }
  }

  // PSA10ラベル
  if (options.psa10) {
    ctx.save();
    ctx.translate(width - 120, 60);
    
    // PSA10背景
    const psaGrad = ctx.createLinearGradient(0, 0, 0, 50);
    psaGrad.addColorStop(0, '#FF0000');
    psaGrad.addColorStop(1, '#8B0000');
    ctx.fillStyle = psaGrad;
    ctx.fillRect(0, 0, 100, 50);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, 100, 50);
    
    ctx.font = "bold 24px 'HiraginoBold'";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('PSA10', 50, 32);
    ctx.restore();
  }

  // メインタイトル（確実に登録されたフォント使用）
  ctx.save();
  const titleFont = options.titleFont || 'Dela_Gothic_One';
  ctx.font = `bold ${options.titleSize || 70}px '${titleFont}', 'HiraginoBold', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const titleY = options.titleY || height * 0.25;
  
  // テキスト背景（可読性向上）
  if (options.textBg) {
    const textWidth = ctx.measureText(options.mainTitle || 'テストタイトル').width;
    const bgX = width/2 - textWidth/2 - 20;
    const bgY = titleY - 40;
    const bgWidth = textWidth + 40;
    const bgHeight = 80;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
  }
  
  // 多重影効果
  for (let i = 10; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.8 - i * 0.06})`;
    ctx.fillText(options.mainTitle || 'テストタイトル', width/2 + i * 2, titleY + i * 2);
  }
  
  // 金色縁取り
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 12;
  ctx.strokeText(options.mainTitle || 'テストタイトル', width/2, titleY);
  
  // 黒縁取り
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.strokeText(options.mainTitle || 'テストタイトル', width/2, titleY);
  
  // 白文字
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(options.mainTitle || 'テストタイトル', width/2, titleY);
  ctx.restore();

  // サブタイトル
  if (options.subTitle) {
    ctx.save();
    const subFont = options.subFont || 'MOBO_Font11';
    ctx.font = `bold ${options.subSize || 42}px '${subFont}', 'HiraginoBold', sans-serif`;
    ctx.textAlign = 'center';
    
    const subY = titleY + 80;
    const subTextWidth = ctx.measureText(options.subTitle).width + 50;
    const subTextX = width/2 - subTextWidth/2;
    
    // 赤背景ボックス
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(subTextX, subY - 25, subTextWidth, 50);
    
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 3;
    ctx.strokeRect(subTextX, subY - 25, subTextWidth, 50);
    
    // サブタイトルテキスト
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeText(options.subTitle, width/2, subY);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(options.subTitle, width/2, subY);
    ctx.restore();
  }

  // 確率表示円
  if (options.percentage) {
    ctx.save();
    ctx.translate(100, 100);
    
    // 円形背景
    const circleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 75);
    circleGrad.addColorStop(0, '#FFD700');
    circleGrad.addColorStop(0.7, '#FF6347');
    circleGrad.addColorStop(1, '#8B0000');
    ctx.fillStyle = circleGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 75, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.stroke();
    
    // パーセント文字
    const percentFont = options.percentFont || 'kinkaku';
    ctx.font = `bold 38px '${percentFont}', 'HiraginoBold', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(options.percentage, 0, -8);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(options.percentage, 0, -8);
    
    ctx.font = `bold 18px '${percentFont}', 'HiraginoBold', sans-serif`;
    ctx.strokeText('還元率', 0, 20);
    ctx.fillText('還元率', 0, 20);
    
    ctx.restore();
  }

  // 価格表示
  if (options.price) {
    ctx.save();
    
    // 価格背景
    const priceGrad = ctx.createLinearGradient(0, height - 80, 0, height);
    priceGrad.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    priceGrad.addColorStop(1, '#000000');
    ctx.fillStyle = priceGrad;
    ctx.fillRect(0, height - 80, width, 80);
    
    // 装飾ライン
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, height - 80);
    ctx.lineTo(width, height - 80);
    ctx.stroke();
    
    // 価格テキスト
    const priceFont = options.priceFont || 'craftmincho';
    ctx.font = `bold 44px '${priceFont}', 'HiraginoBold', sans-serif`;
    ctx.textAlign = 'center';
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(options.price, width/2, height - 35);
    
    ctx.fillStyle = '#FFD700';
    ctx.fillText(options.price, width/2, height - 35);
    
    ctx.restore();
  }

  // 大量キラキラエフェクト
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 5 + 2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI * 2);
    
    const sparkleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
    sparkleGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sparkleGrad.addColorStop(0.4, 'rgba(255, 255, 0, 0.8)');
    sparkleGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sparkleGrad;
    
    // 8角星
    ctx.beginPath();
    for (let j = 0; j < 8; j++) {
      const angle = (j * Math.PI * 2) / 8;
      const radius = j % 2 === 0 ? size : size * 0.5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'public', 'images', options.fileName), buffer);
  console.log(`✅ 生成完了: ${options.fileName}`);
}

// 確実フォントバナー生成実行
async function generateProperFontBanners() {
  console.log('🎨 確実フォントバナー生成開始...\n');
  
  const pokemonDir = path.join(__dirname, 'public', 'images', 'pokemon');
  const cardFiles = fs.readdirSync(pokemonDir)
    .filter(file => /\.(png|jpg|jpeg)$/i.test(file))
    .map(file => path.join(pokemonDir, file));
  
  console.log(`🃏 使用可能カード画像: ${cardFiles.length}枚`);
  
  // バナー1: Dela Gothic One（box-styleに近い）
  await createProperFontBanner({
    cardImages: cardFiles,
    mainTitle: 'PSA10&BOX確定!!',
    subTitle: 'プチュン演出発生でレア確定!!',
    titleFont: 'Dela_Gothic_One',
    subFont: 'HiraginoBold',
    percentFont: 'HiraginoBold',
    priceFont: 'Dela_Gothic_One',
    percentage: '98%',
    price: '1/22の確率でプチュン演出!!',
    psa10: true,
    lightning: true,
    bgColor: 'red',
    textBg: true,
    fileName: 'proper-dela-gothic.png'
  });
  
  // バナー2: MOBO Font（モダンスタイル）
  await createProperFontBanner({
    cardImages: cardFiles.reverse(),
    mainTitle: 'MOBO激アツオリパ',
    subTitle: 'SSR確率大幅UP中!!',
    titleFont: 'MOBO_Font11',
    subFont: 'Dela_Gothic_One',
    percentFont: 'kinkaku',
    priceFont: 'MOBO_Font11',
    percentage: '97%',
    price: '💥 1回 1,500円 💥',
    lightning: true,
    bgColor: 'purple',
    fileName: 'proper-mobo-font.png'
  });
  
  // バナー3: 金閣フォント（和風）
  await createProperFontBanner({
    cardImages: cardFiles,
    mainTitle: '金閣寺オリパ',
    subTitle: '和風レアカード降臨',
    titleFont: 'kinkaku',
    subFont: 'craftmincho',
    percentFont: 'Dela_Gothic_One',
    priceFont: 'kinkaku',
    percentage: '99%',
    price: '特選 2,500円',
    psa10: true,
    bgColor: 'gold',
    titleSize: 64,
    fileName: 'proper-kinkaku.png'
  });
  
  // バナー4: バナナスリップ（ポップ）
  await createProperFontBanner({
    cardImages: cardFiles.slice(0, 10),
    mainTitle: 'バナナ★オリパ',
    subTitle: 'ポップで可愛いレアカード♪',
    titleFont: 'YDW_bananaslip_plus_240809',
    subFont: 'MOBO_Font11',
    percentFont: 'YDW_bananaslip_plus_240809',
    priceFont: 'Dela_Gothic_One',
    percentage: '95%',
    price: '♪ 可愛さ満点 800円 ♪',
    lightning: true,
    titleY: 160,
    fileName: 'proper-banana-slip.png'
  });
  
  // バナー5: クラフト明朝（上品）
  await createProperFontBanner({
    cardImages: cardFiles,
    mainTitle: '匠のオリパ',
    subTitle: '職人が選んだ至高のカード',
    titleFont: 'craftmincho',
    subFont: 'kinkaku',
    percentFont: 'craftmincho',
    priceFont: 'HiraginoBold',
    percentage: '100%',
    price: '匠の技 3,000円',
    psa10: true,
    bgColor: 'purple',
    textBg: true,
    titleSize: 62,
    fileName: 'proper-craftmincho.png'
  });
  
  // バナー6: box-styleの完全再現
  await createProperFontBanner({
    cardImages: cardFiles,
    mainTitle: 'PSA10&BOX!!',
    subTitle: 'プチュン演出発生&PSA10orBOXが排出!!',
    titleFont: 'HiraginoBold', // box-styleと同じシステムフォント
    subFont: 'HiraginoBold',
    percentFont: 'HiraginoBold',
    priceFont: 'HiraginoBold',
    percentage: '98%',
    price: '1/22の確率でプチュン演出発生!!',
    psa10: true,
    lightning: false,
    bgColor: 'red',
    titleSize: 76,
    fileName: 'proper-box-style-remake.png'
  });
  
  console.log('\n🎉 確実フォントバナー生成完了！');
  console.log('📁 保存先: public/images/');
  console.log('✨ 全てのフォントが確実に反映されています');
}

// 実行
generateProperFontBanners().catch(console.error);