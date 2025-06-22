const { createCanvas, registerFont, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// 太字フォント登録
function registerBoldFonts() {
  const fontsDir = path.join(__dirname, 'public', 'fonts');
  
  const boldFonts = [
    { file: 'Dela_Gothic_One.ttf', family: 'DelaGothicOne' },
    { file: 'MOBO-Font11.otf', family: 'MOBOFont' },
    { file: 'kinkaku.otf', family: 'Kinkaku' },
  ];
  
  boldFonts.forEach(({ file, family }) => {
    const fontPath = path.join(fontsDir, file);
    if (fs.existsSync(fontPath)) {
      try {
        registerFont(fontPath, { family: family });
        console.log(`✅ Font: ${family}`);
      } catch (err) {
        console.error(`❌ ${family}:`, err.message);
      }
    }
  });
  
  const systemBoldFonts = [
    { path: '/System/Library/Fonts/ヒラギノ角ゴシック W9.ttc', family: 'HiraKakuW9' },
    { path: '/Library/Fonts/Arial Black.ttf', family: 'ArialBlack' }
  ];
  
  systemBoldFonts.forEach(({ path, family }) => {
    if (fs.existsSync(path)) {
      try {
        registerFont(path, { family: family });
        console.log(`✅ System: ${family}`);
      } catch (err) {
        console.error(`❌ System: ${family}`);
      }
    }
  });
}

// 1024x1024バナー生成（すべてのスタイル対応）
async function create1024Banner(options = {}) {
  const width = 1024;
  const height = 1024;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景処理
  if (options.aiBackground) {
    // AI背景を使用
    try {
      const bgImage = await loadImage(options.aiBackground);
      // 背景画像を中央でクロップして1024x1024に
      const bgWidth = bgImage.width;
      const bgHeight = bgImage.height;
      const scale = Math.max(width / bgWidth, height / bgHeight);
      const scaledWidth = bgWidth * scale;
      const scaledHeight = bgHeight * scale;
      const x = (width - scaledWidth) / 2;
      const y = (height - scaledHeight) / 2;
      ctx.drawImage(bgImage, x, y, scaledWidth, scaledHeight);
    } catch (err) {
      console.error('背景読み込みエラー:', err);
      // フォールバック
      createGradientBackground(ctx, options.bgType || 'red-explosion');
    }
  } else {
    // グラデーション背景
    createGradientBackground(ctx, options.bgType || 'red-explosion');
  }

  // 半透明オーバーレイ
  if (options.overlay) {
    ctx.fillStyle = `rgba(0, 0, 0, ${options.overlayOpacity || 0.2})`;
    ctx.fillRect(0, 0, width, height);
  }

  // 追加エフェクト
  if (options.effects) {
    addSpecialEffects(ctx, options.effects);
  }

  // ポケモンカード配置（8-10枚）
  if (options.cardImages && options.cardImages.length > 0) {
    await addPokemonCards(ctx, options.cardImages, width, height);
  }

  // PSA10ラベル
  if (options.psa10) {
    addPSA10Label(ctx, width, height);
  }

  // パーセント表示
  if (options.percentage) {
    addPercentageCircle(ctx, options.percentage, options.percentFont);
  }

  // メインタイトル
  addMainTitle(ctx, options, width, height);

  // サブタイトル
  if (options.subtitle) {
    addSubtitle(ctx, options, width, height);
  }

  // 価格表示
  if (options.price) {
    addPriceSection(ctx, options, width, height);
  }

  // キラキラエフェクト
  addSparkles(ctx, width, height, 150);

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'public', 'images', options.fileName), buffer);
  console.log(`✅ 生成完了: ${options.fileName}`);
}

// グラデーション背景作成
function createGradientBackground(ctx, bgType) {
  const width = 1024;
  const height = 1024;
  
  if (bgType === 'white-premium') {
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
    bgGradient.addColorStop(0, '#FFFFFF');
    bgGradient.addColorStop(0.3, '#F8F8F8');
    bgGradient.addColorStop(0.6, '#F0F0F0');
    bgGradient.addColorStop(1, '#E8E8E8');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 薄いゴールドの光線
    ctx.save();
    ctx.translate(width/2, height/2);
    for (let i = 0; i < 36; i++) {
      ctx.rotate((Math.PI * 2) / 36);
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'rgba(255, 215, 0, 0.2)');
      gradient.addColorStop(0.5, 'rgba(255, 223, 0, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, -3, width, 6);
    }
    ctx.restore();
    
  } else if (bgType === 'blue-ocean') {
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
    bgGradient.addColorStop(0, '#00BFFF');
    bgGradient.addColorStop(0.3, '#1E90FF');
    bgGradient.addColorStop(0.6, '#0000CD');
    bgGradient.addColorStop(1, '#000080');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 水の波紋
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(width/2, height/2, 100 + i * 100, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 - i * 0.05})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    
  } else if (bgType === 'black-luxury') {
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
    bgGradient.addColorStop(0, '#1C1C1C');
    bgGradient.addColorStop(0.5, '#0A0A0A');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // ゴールドダスト
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 5 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${Math.random() * 0.8 + 0.2})`;
      ctx.fill();
    }
    
  } else if (bgType === 'purple-royal') {
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
    bgGradient.addColorStop(0, '#9370DB');
    bgGradient.addColorStop(0.3, '#8B008B');
    bgGradient.addColorStop(0.6, '#4B0082');
    bgGradient.addColorStop(1, '#310062');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
  } else if (bgType === 'green-emerald') {
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
    bgGradient.addColorStop(0, '#50C878');
    bgGradient.addColorStop(0.3, '#228B22');
    bgGradient.addColorStop(0.6, '#006400');
    bgGradient.addColorStop(1, '#004225');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
  } else if (bgType === 'rainbow') {
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
    bgGradient.addColorStop(0, '#FF0080');
    bgGradient.addColorStop(0.2, '#FF0000');
    bgGradient.addColorStop(0.4, '#FF8C00');
    bgGradient.addColorStop(0.6, '#FFD700');
    bgGradient.addColorStop(0.8, '#00CED1');
    bgGradient.addColorStop(1, '#9400D3');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
  } else {
    // デフォルト：赤爆発
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
    bgGradient.addColorStop(0, '#FF6B6B');
    bgGradient.addColorStop(0.3, '#FF3366');
    bgGradient.addColorStop(0.6, '#FF0033');
    bgGradient.addColorStop(1, '#CC0033');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 爆発エフェクト
    ctx.save();
    ctx.translate(width/2, height/2);
    for (let i = 0; i < 48; i++) {
      ctx.rotate((Math.PI * 2) / 48);
      const gradient = ctx.createLinearGradient(0, 0, width * 0.7, 0);
      gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, -4, width * 0.7, 8);
    }
    ctx.restore();
  }
}

// 特殊エフェクト追加
function addSpecialEffects(ctx, effects) {
  const width = 1024;
  const height = 1024;
  
  if (effects.includes('lightning')) {
    // 稲妻エフェクト
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#FFFF00';
    ctx.shadowBlur = 30;
    
    ctx.beginPath();
    ctx.moveTo(width * 0.2, 0);
    ctx.lineTo(width * 0.25, height * 0.3);
    ctx.lineTo(width * 0.15, height * 0.35);
    ctx.lineTo(width * 0.22, height * 0.7);
    ctx.lineTo(width * 0.18, height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width * 0.8, 0);
    ctx.lineTo(width * 0.75, height * 0.4);
    ctx.lineTo(width * 0.85, height * 0.45);
    ctx.lineTo(width * 0.78, height);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
  }
  
  if (effects.includes('explosion')) {
    // 複数の爆発中心
    for (let e = 0; e < 3; e++) {
      const centerX = [width * 0.2, width * 0.5, width * 0.8][e];
      const centerY = [height * 0.3, height * 0.5, height * 0.7][e];
      
      ctx.save();
      ctx.translate(centerX, centerY);
      
      for (let i = 0; i < 36; i++) {
        ctx.rotate((Math.PI * 2) / 36);
        const gradient = ctx.createLinearGradient(0, 0, 400, 0);
        gradient.addColorStop(0, `rgba(255, 255, 0, ${0.8 - e * 0.2})`);
        gradient.addColorStop(0.5, `rgba(255, 215, 0, ${0.5 - e * 0.1})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, -3, 400, 6);
      }
      ctx.restore();
    }
  }
}

// ポケモンカード配置
async function addPokemonCards(ctx, cardImages, width, height) {
  const cardPositions = [
    // 背景層（4-5枚）
    { x: 0.12, y: 0.18, scale: 0.28, rotation: -0.3, opacity: 0.55 },
    { x: 0.88, y: 0.22, scale: 0.26, rotation: 0.25, opacity: 0.55 },
    { x: 0.08, y: 0.78, scale: 0.27, rotation: 0.2, opacity: 0.5 },
    { x: 0.92, y: 0.82, scale: 0.28, rotation: -0.25, opacity: 0.55 },
    { x: 0.5, y: 0.12, scale: 0.25, rotation: 0.1, opacity: 0.45 },
    
    // 中間層（3-4枚）
    { x: 0.25, y: 0.45, scale: 0.38, rotation: -0.1, opacity: 0.75 },
    { x: 0.75, y: 0.5, scale: 0.4, rotation: 0.08, opacity: 0.8 },
    { x: 0.2, y: 0.68, scale: 0.36, rotation: 0.05, opacity: 0.7 },
    { x: 0.8, y: 0.72, scale: 0.37, rotation: -0.12, opacity: 0.75 },
    
    // 前景層（1-2枚）
    { x: 0.5, y: 0.55, scale: 0.5, rotation: 0, opacity: 0.95 }
  ];

  for (let i = 0; i < Math.min(cardPositions.length, 10); i++) {
    const pos = cardPositions[i];
    const cardPath = cardImages[i % cardImages.length];
    
    try {
      const cardImage = await loadImage(cardPath);
      
      ctx.save();
      ctx.globalAlpha = pos.opacity;
      ctx.translate(width * pos.x, height * pos.y);
      ctx.rotate(pos.rotation);
      
      const cardHeight = 350 * pos.scale;
      const cardWidth = 250 * pos.scale;
      
      // カード影
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;
      
      ctx.drawImage(cardImage, -cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
      
      // キラキラ効果
      ctx.shadowBlur = 0;
      const glossGrad = ctx.createLinearGradient(-cardWidth/2, -cardHeight/2, cardWidth/2, cardHeight/2);
      glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      glossGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
      glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glossGrad;
      ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
      
      // 金枠
      if (pos.scale > 0.35) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 5;
        ctx.strokeRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
      }
      
      ctx.restore();
    } catch (err) {
      console.error(`カード読み込みエラー: ${cardPath}`);
    }
  }
}

// PSA10ラベル
function addPSA10Label(ctx, width, height) {
  ctx.save();
  ctx.translate(width - 150, 120);
  ctx.rotate(0.1);
  
  // 背景バースト
  const psaBurst = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
  psaBurst.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
  psaBurst.addColorStop(0.5, 'rgba(255, 165, 0, 0.6)');
  psaBurst.addColorStop(1, 'rgba(255, 0, 0, 0)');
  ctx.fillStyle = psaBurst;
  ctx.fillRect(-100, -100, 200, 200);
  
  // PSA10本体
  const psaGrad = ctx.createLinearGradient(0, -40, 0, 40);
  psaGrad.addColorStop(0, '#FF0000');
  psaGrad.addColorStop(0.5, '#DC143C');
  psaGrad.addColorStop(1, '#8B0000');
  ctx.fillStyle = psaGrad;
  ctx.fillRect(-80, -40, 160, 80);
  
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 6;
  ctx.strokeRect(-80, -40, 160, 80);
  
  ctx.font = 'bold 48px "ArialBlack"';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeText('PSA10', 0, 10);
  ctx.fillText('PSA10', 0, 10);
  ctx.restore();
}

// パーセント表示
function addPercentageCircle(ctx, percentage, percentFont) {
  ctx.save();
  ctx.translate(150, 150);
  ctx.rotate(-0.15);
  
  // 爆発背景
  const burstGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 120);
  burstGrad.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
  burstGrad.addColorStop(0.3, 'rgba(255, 165, 0, 0.7)');
  burstGrad.addColorStop(0.6, 'rgba(255, 0, 0, 0.5)');
  burstGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
  ctx.fillStyle = burstGrad;
  ctx.fillRect(-120, -120, 240, 240);
  
  // 円形本体
  const circleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 90);
  circleGrad.addColorStop(0, '#FFD700');
  circleGrad.addColorStop(0.5, '#FF6347');
  circleGrad.addColorStop(1, '#8B0000');
  ctx.fillStyle = circleGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 90, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.stroke();
  
  // パーセント表示
  ctx.font = `bold 64px "${percentFont || 'DelaGothicOne'}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 5;
  ctx.strokeText(percentage, 0, -5);
  ctx.fillText(percentage, 0, -5);
  
  ctx.font = `bold 28px "${percentFont || 'DelaGothicOne'}"`;
  ctx.strokeText('還元率', 0, 35);
  ctx.fillText('還元率', 0, 35);
  
  ctx.restore();
}

// メインタイトル
function addMainTitle(ctx, options, width, height) {
  ctx.save();
  const fontSize = options.titleSize || 96;
  const fontFamily = options.titleFont || 'DelaGothicOne';
  ctx.font = `bold ${fontSize}px "${fontFamily}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const titleY = height * 0.35;
  
  // テキスト背景プレート
  if (options.textBg !== false) {
    const textWidth = ctx.measureText(options.title || 'テスト').width + 160;
    const bgGrad = ctx.createLinearGradient(width/2 - textWidth/2, titleY - 70, width/2 + textWidth/2, titleY + 70);
    bgGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    bgGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.85)');
    bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(width/2 - textWidth/2, titleY - 70, textWidth, 140);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.strokeRect(width/2 - textWidth/2, titleY - 70, textWidth, 140);
  }
  
  // 多重影
  for (let i = 15; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.7 - i * 0.04})`;
    ctx.fillText(options.title || 'テスト', width/2 + i * 3, titleY + i * 3);
  }
  
  // 金縁取り
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 24;
  ctx.strokeText(options.title || 'テスト', width/2, titleY);
  
  // 黒縁取り
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 12;
  ctx.strokeText(options.title || 'テスト', width/2, titleY);
  
  // メイン文字
  const titleGrad = ctx.createLinearGradient(0, titleY - 50, 0, titleY + 50);
  const isLightBg = options.bgType === 'white-premium';
  if (isLightBg) {
    titleGrad.addColorStop(0, '#FF0000');
    titleGrad.addColorStop(0.5, '#DC143C');
    titleGrad.addColorStop(1, '#8B0000');
  } else {
    titleGrad.addColorStop(0, '#FFFFFF');
    titleGrad.addColorStop(0.5, '#FFFFCC');
    titleGrad.addColorStop(1, '#FFFF00');
  }
  ctx.fillStyle = titleGrad;
  ctx.fillText(options.title || 'テスト', width/2, titleY);
  
  ctx.restore();
}

// サブタイトル
function addSubtitle(ctx, options, width, height) {
  ctx.save();
  const titleY = height * 0.35;
  const subFontSize = options.subSize || 52;
  const subFontFamily = options.subFont || 'HiraKakuW9';
  ctx.font = `bold ${subFontSize}px "${subFontFamily}"`;
  ctx.textAlign = 'center';
  
  const subY = titleY + 120;
  const subTextWidth = ctx.measureText(options.subtitle).width + 100;
  
  // 背景
  const subBgGrad = ctx.createLinearGradient(width/2 - subTextWidth/2, subY - 40, width/2 + subTextWidth/2, subY + 40);
  subBgGrad.addColorStop(0, '#FF0000');
  subBgGrad.addColorStop(0.5, '#DC143C');
  subBgGrad.addColorStop(1, '#8B0000');
  ctx.fillStyle = subBgGrad;
  ctx.fillRect(width/2 - subTextWidth/2, subY - 40, subTextWidth, 80);
  
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 4;
  ctx.strokeRect(width/2 - subTextWidth/2, subY - 40, subTextWidth, 80);
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.strokeText(options.subtitle, width/2, subY);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(options.subtitle, width/2, subY);
  
  ctx.restore();
}

// 価格表示
function addPriceSection(ctx, options, width, height) {
  ctx.save();
  
  const priceGrad = ctx.createLinearGradient(0, height - 130, 0, height);
  priceGrad.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
  priceGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
  ctx.fillStyle = priceGrad;
  ctx.fillRect(0, height - 130, width, 130);
  
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, height - 130);
  ctx.lineTo(width, height - 130);
  ctx.stroke();
  
  const priceFontFamily = options.priceFont || 'DelaGothicOne';
  ctx.font = `bold 72px "${priceFontFamily}"`;
  ctx.textAlign = 'center';
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 6;
  ctx.strokeText(options.price, width/2, height - 50);
  
  const priceTextGrad = ctx.createLinearGradient(0, height - 90, 0, height - 10);
  priceTextGrad.addColorStop(0, '#FFD700');
  priceTextGrad.addColorStop(0.5, '#FFFF00');
  priceTextGrad.addColorStop(1, '#FFD700');
  ctx.fillStyle = priceTextGrad;
  ctx.fillText(options.price, width/2, height - 50);
  
  ctx.restore();
}

// キラキラエフェクト
function addSparkles(ctx, width, height, count) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 7 + 2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI * 2);
    
    const sparkleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    sparkleGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sparkleGrad.addColorStop(0.3, 'rgba(255, 255, 0, 0.9)');
    sparkleGrad.addColorStop(0.6, 'rgba(255, 165, 0, 0.7)');
    sparkleGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sparkleGrad;
    
    // 星型
    ctx.beginPath();
    for (let j = 0; j < 8; j++) {
      const angle = (j * Math.PI * 2) / 8;
      const radius = j % 2 === 0 ? size : size * 0.5;
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
}

// メイン実行
async function main() {
  console.log('🚀 全バナー1024x1024サイズ生成開始\n');
  
  // フォント登録
  registerBoldFonts();
  
  // AI背景画像リスト
  const bgDir = path.join(__dirname, 'public', 'images', 'basebg');
  const bgFiles = fs.readdirSync(bgDir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .map(f => path.join(bgDir, f))
    .sort(); // ファイル名でソート
  
  // ポケモンカード画像
  const pokemonDir = path.join(__dirname, 'public', 'images', 'pokemon');
  const cardFiles = fs.readdirSync(pokemonDir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .map(f => path.join(pokemonDir, f));
  
  console.log(`\n🖼️  使用可能背景: ${bgFiles.length}枚`);
  console.log(`🃏 使用可能カード: ${cardFiles.length}枚\n`);
  
  // 全バナー定義
  const allBanners = [
    // AI背景使用バナー
    {
      title: '爆熱★ガチャ降臨',
      subtitle: '激レア確定！神引き演出発生中！！',
      price: '1回 2,000円',
      aiBackground: bgFiles[0],
      psa10: true,
      effects: ['lightning'],
      fileName: '1024-ai-bg-1.png'
    },
    {
      title: 'GOLD★CASINO',
      subtitle: 'ジャックポット！大当たり確定！！',
      price: 'VIP限定 5,000円',
      aiBackground: bgFiles[1],
      overlay: true,
      overlayOpacity: 0.3,
      fileName: '1024-ai-bg-2.png'
    },
    {
      title: '虹色★レインボー',
      subtitle: '全色コンプリート！激レア確定！！',
      price: '特別価格 3,000円',
      aiBackground: bgFiles[13],
      psa10: true,
      fileName: '1024-ai-bg-3.png'
    },
    {
      title: '深海の秘宝',
      subtitle: '海底に眠る激レアカード発掘！！',
      price: 'OCEAN 3,000円',
      aiBackground: bgFiles[2],
      overlay: true,
      overlayOpacity: 0.2,
      fileName: '1024-ai-bg-4.png'
    },
    {
      title: '黄金★帝国',
      subtitle: 'ゴールドラッシュ！大当たり確定！！',
      price: 'PREMIUM 10,000円',
      aiBackground: bgFiles[5],
      psa10: true,
      fileName: '1024-ai-bg-5.png'
    },
    
    // グラデーション背景バナー
    {
      title: 'PSA10確定ガチャ',
      subtitle: '激アツ演出発生で神引き確定！！',
      titleFont: 'DelaGothicOne',
      subFont: 'HiraKakuW9',
      percentFont: 'DelaGothicOne',
      priceFont: 'DelaGothicOne',
      percentage: '98%',
      price: '1回1,500円',
      psa10: true,
      bgType: 'red-explosion',
      effects: ['explosion'],
      fileName: '1024-red-explosion.png'
    },
    {
      title: '白銀★極上オリパ',
      subtitle: '選ばれし者への特別価格',
      titleFont: 'DelaGothicOne',
      subFont: 'HiraKakuW9',
      priceFont: 'Kinkaku',
      price: 'LIMITED 5,000円',
      bgType: 'white-premium',
      psa10: true,
      fileName: '1024-white-premium.png'
    },
    {
      title: '深海の秘宝BOX',
      subtitle: '海底に眠る激レアカード！！',
      titleFont: 'MOBOFont',
      subFont: 'DelaGothicOne',
      percentFont: 'HiraKakuW9',
      priceFont: 'DelaGothicOne',
      percentage: '95%',
      price: 'OCEAN 2,000円',
      bgType: 'blue-ocean',
      fileName: '1024-blue-ocean.png'
    },
    {
      title: 'BLACK★GOLD',
      subtitle: '漆黒の最高級カード降臨！！',
      titleFont: 'Kinkaku',
      subFont: 'HiraKakuW9',
      priceFont: 'Kinkaku',
      price: 'VIP限定 10,000円',
      bgType: 'black-luxury',
      psa10: true,
      titleSize: 88,
      fileName: '1024-black-luxury.png'
    },
    {
      title: '紫電の王者オリパ',
      subtitle: 'ロイヤルパープル限定版',
      titleFont: 'DelaGothicOne',
      subFont: 'Kinkaku',
      percentFont: 'DelaGothicOne',
      priceFont: 'MOBOFont',
      percentage: '97%',
      price: 'ROYAL 3,500円',
      bgType: 'purple-royal',
      fileName: '1024-purple-royal.png'
    },
    {
      title: 'エメラルド★ガチャ',
      subtitle: '翡翠の輝き・希少カード確定！！',
      titleFont: 'MOBOFont',
      subFont: 'DelaGothicOne',
      priceFont: 'DelaGothicOne',
      price: 'EMERALD 4,000円',
      bgType: 'green-emerald',
      psa10: true,
      fileName: '1024-green-emerald.png'
    },
    {
      title: '爆熱100%オリパ',
      subtitle: 'ハズレなし！全部当たり！！',
      titleFont: 'HiraKakuW9',
      subFont: 'DelaGothicOne',
      percentFont: 'MOBOFont',
      priceFont: 'MOBOFont',
      percentage: '100%',
      price: '特価3,000円',
      bgType: 'red-explosion',
      psa10: true,
      effects: ['explosion', 'lightning'],
      fileName: '1024-red-100.png'
    },
    {
      title: '激熱★オリパ爆誕',
      subtitle: 'SSR確率驚異の爆上げ中!!',
      titleFont: 'MOBOFont',
      subFont: 'DelaGothicOne',
      percentFont: 'Kinkaku',
      priceFont: 'DelaGothicOne',
      percentage: '97%',
      price: '1回 1,500円',
      psa10: true,
      bgType: 'rainbow',
      fileName: '1024-rainbow-hot.png'
    }
  ];
  
  // バナー生成
  for (const banner of allBanners) {
    await create1024Banner({
      ...banner,
      cardImages: cardFiles
    });
  }
  
  console.log('\n🎉 全バナー1024x1024サイズ生成完了！');
  console.log(`📁 合計 ${allBanners.length} 枚のバナーを生成しました！`);
}

// 実行
main().catch(console.error);