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

// 1024x1024バナー生成
async function create1024Banner(options = {}) {
  const width = 1024;
  const height = 1024;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // AI背景を読み込み
  if (options.aiBackground) {
    try {
      const bgImage = await loadImage(options.aiBackground);
      // 背景を1024x1024にフィット
      ctx.drawImage(bgImage, 0, 0, width, height);
    } catch (err) {
      console.error('背景読み込みエラー:', err);
      // フォールバック背景
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
      gradient.addColorStop(0, '#FF6B6B');
      gradient.addColorStop(0.3, '#FF3366');
      gradient.addColorStop(0.6, '#FF0033');
      gradient.addColorStop(1, '#CC0033');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // 半透明オーバーレイ
  if (options.overlay) {
    ctx.fillStyle = `rgba(0, 0, 0, ${options.overlayOpacity || 0.25})`;
    ctx.fillRect(0, 0, width, height);
  }

  // ポケモンカード配置（10-12枚）
  if (options.cardImages && options.cardImages.length > 0) {
    const cardPositions = [
      // 背景層（5枚）
      { x: 0.15, y: 0.2, scale: 0.3, rotation: -0.25, opacity: 0.6 },
      { x: 0.85, y: 0.25, scale: 0.28, rotation: 0.2, opacity: 0.6 },
      { x: 0.1, y: 0.75, scale: 0.29, rotation: 0.15, opacity: 0.55 },
      { x: 0.9, y: 0.8, scale: 0.3, rotation: -0.2, opacity: 0.6 },
      { x: 0.5, y: 0.15, scale: 0.27, rotation: 0.1, opacity: 0.5 },
      
      // 中間層（5枚）
      { x: 0.25, y: 0.45, scale: 0.4, rotation: -0.1, opacity: 0.75 },
      { x: 0.75, y: 0.5, scale: 0.42, rotation: 0.08, opacity: 0.8 },
      { x: 0.2, y: 0.65, scale: 0.38, rotation: 0.05, opacity: 0.7 },
      { x: 0.8, y: 0.7, scale: 0.39, rotation: -0.12, opacity: 0.75 },
      { x: 0.5, y: 0.85, scale: 0.37, rotation: -0.05, opacity: 0.7 },
      
      // 前景層（2枚）
      { x: 0.35, y: 0.55, scale: 0.5, rotation: -0.05, opacity: 0.9 },
      { x: 0.65, y: 0.55, scale: 0.5, rotation: 0.05, opacity: 0.95 }
    ];

    for (let i = 0; i < Math.min(cardPositions.length, 12); i++) {
      const pos = cardPositions[i];
      const cardPath = options.cardImages[i % options.cardImages.length];
      
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
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 8;
        
        ctx.drawImage(cardImage, -cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // キラキラ効果
        const glossGrad = ctx.createLinearGradient(-cardWidth/2, -cardHeight/2, cardWidth/2, cardHeight/2);
        glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        glossGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glossGrad;
        ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // 金枠（大きいカードのみ）
        if (pos.scale > 0.4) {
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

  // PSA10ラベル（大きめ）
  if (options.psa10) {
    ctx.save();
    ctx.translate(width - 150, 100);
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

  // メインタイトル（大きめ）
  ctx.save();
  const fontSize = options.titleSize || 96;
  const fontFamily = options.titleFont || 'DelaGothicOne';
  ctx.font = `bold ${fontSize}px "${fontFamily}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const titleY = height * 0.35;
  
  // テキスト背景プレート
  if (options.textBg) {
    const textWidth = ctx.measureText(options.title || 'テスト').width + 150;
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
  for (let i = 12; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.7 - i * 0.05})`;
    ctx.fillText(options.title || 'テスト', width/2 + i * 3, titleY + i * 3);
  }
  
  // 金縁取り
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 22;
  ctx.strokeText(options.title || 'テスト', width/2, titleY);
  
  // 黒縁取り
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 10;
  ctx.strokeText(options.title || 'テスト', width/2, titleY);
  
  // メイン文字
  const titleGrad = ctx.createLinearGradient(0, titleY - 50, 0, titleY + 50);
  titleGrad.addColorStop(0, '#FFFFFF');
  titleGrad.addColorStop(0.5, '#FFFFCC');
  titleGrad.addColorStop(1, '#FFFF00');
  ctx.fillStyle = titleGrad;
  ctx.fillText(options.title || 'テスト', width/2, titleY);
  
  ctx.restore();

  // サブタイトル（大きめ）
  if (options.subtitle) {
    ctx.save();
    const subFontSize = 52;
    const subFontFamily = 'HiraKakuW9';
    ctx.font = `bold ${subFontSize}px "${subFontFamily}"`;
    ctx.textAlign = 'center';
    
    const subY = titleY + 110;
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

  // 価格表示（大きめ）
  if (options.price) {
    ctx.save();
    
    const priceGrad = ctx.createLinearGradient(0, height - 120, 0, height);
    priceGrad.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    priceGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = priceGrad;
    ctx.fillRect(0, height - 120, width, 120);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, height - 120);
    ctx.lineTo(width, height - 120);
    ctx.stroke();
    
    const priceFontFamily = 'DelaGothicOne';
    ctx.font = `bold 68px "${priceFontFamily}"`;
    ctx.textAlign = 'center';
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeText(options.price, width/2, height - 45);
    
    const priceTextGrad = ctx.createLinearGradient(0, height - 85, 0, height - 15);
    priceTextGrad.addColorStop(0, '#FFD700');
    priceTextGrad.addColorStop(0.5, '#FFFF00');
    priceTextGrad.addColorStop(1, '#FFD700');
    ctx.fillStyle = priceTextGrad;
    ctx.fillText(options.price, width/2, height - 45);
    
    ctx.restore();
  }

  // キラキラ（多め）
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 6 + 2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI * 2);
    
    const sparkleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    sparkleGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sparkleGrad.addColorStop(0.5, 'rgba(255, 255, 0, 0.8)');
    sparkleGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sparkleGrad;
    
    ctx.beginPath();
    for (let j = 0; j < 4; j++) {
      const angle = (j * Math.PI * 2) / 4;
      ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
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

// ガチャボタン生成
async function createGachaButtons() {
  // 1回ガチャボタン
  const single = createCanvas(300, 100);
  const sCtx = single.getContext('2d');
  
  // ボタン背景
  const sGrad = sCtx.createLinearGradient(0, 0, 0, 100);
  sGrad.addColorStop(0, '#FF6B6B');
  sGrad.addColorStop(0.5, '#FF3366');
  sGrad.addColorStop(1, '#CC0033');
  sCtx.fillStyle = sGrad;
  sCtx.roundRect(10, 10, 280, 80, 20);
  sCtx.fill();
  
  // ボタン枠
  sCtx.strokeStyle = '#FFD700';
  sCtx.lineWidth = 4;
  sCtx.roundRect(10, 10, 280, 80, 20);
  sCtx.stroke();
  
  // テキスト
  sCtx.font = 'bold 36px "DelaGothicOne"';
  sCtx.textAlign = 'center';
  sCtx.textBaseline = 'middle';
  sCtx.fillStyle = '#FFFFFF';
  sCtx.strokeStyle = '#000000';
  sCtx.lineWidth = 3;
  sCtx.strokeText('1回ガチャ', 150, 50);
  sCtx.fillText('1回ガチャ', 150, 50);
  
  const singleBuffer = single.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'public', 'images', 'gacha-button-single.png'), singleBuffer);
  
  // 10連ガチャボタン
  const multi = createCanvas(300, 100);
  const mCtx = multi.getContext('2d');
  
  // ボタン背景
  const mGrad = mCtx.createLinearGradient(0, 0, 0, 100);
  mGrad.addColorStop(0, '#FFD700');
  mGrad.addColorStop(0.5, '#FFA500');
  mGrad.addColorStop(1, '#FF8C00');
  mCtx.fillStyle = mGrad;
  mCtx.roundRect(10, 10, 280, 80, 20);
  mCtx.fill();
  
  // ボタン枠
  mCtx.strokeStyle = '#FF0000';
  mCtx.lineWidth = 4;
  mCtx.roundRect(10, 10, 280, 80, 20);
  mCtx.stroke();
  
  // キラキラエフェクト
  for (let i = 0; i < 20; i++) {
    const x = 20 + Math.random() * 260;
    const y = 20 + Math.random() * 60;
    mCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    mCtx.beginPath();
    mCtx.arc(x, y, 2, 0, Math.PI * 2);
    mCtx.fill();
  }
  
  // テキスト
  mCtx.font = 'bold 36px "DelaGothicOne"';
  mCtx.textAlign = 'center';
  mCtx.textBaseline = 'middle';
  mCtx.fillStyle = '#FFFFFF';
  mCtx.strokeStyle = '#000000';
  mCtx.lineWidth = 3;
  mCtx.strokeText('10連ガチャ', 150, 50);
  mCtx.fillText('10連ガチャ', 150, 50);
  
  const multiBuffer = multi.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'public', 'images', 'gacha-button-10.png'), multiBuffer);
  
  // 指定数ガチャボタン（2行）
  const custom = createCanvas(300, 100);
  const cCtx = custom.getContext('2d');
  
  // ボタン背景
  const cGrad = cCtx.createLinearGradient(0, 0, 0, 100);
  cGrad.addColorStop(0, '#9370DB');
  cGrad.addColorStop(0.5, '#8B008B');
  cGrad.addColorStop(1, '#4B0082');
  cCtx.fillStyle = cGrad;
  cCtx.roundRect(10, 10, 280, 80, 20);
  cCtx.fill();
  
  // ボタン枠
  cCtx.strokeStyle = '#FFD700';
  cCtx.lineWidth = 4;
  cCtx.roundRect(10, 10, 280, 80, 20);
  cCtx.stroke();
  
  // ダイヤモンドパターン
  cCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  cCtx.lineWidth = 1;
  for (let x = 20; x < 280; x += 20) {
    cCtx.beginPath();
    cCtx.moveTo(x, 10);
    cCtx.lineTo(x + 10, 50);
    cCtx.lineTo(x, 90);
    cCtx.stroke();
  }
  
  // テキスト（2行）
  cCtx.font = 'bold 28px "DelaGothicOne"';
  cCtx.textAlign = 'center';
  cCtx.textBaseline = 'middle';
  cCtx.fillStyle = '#FFFFFF';
  cCtx.strokeStyle = '#000000';
  cCtx.lineWidth = 3;
  cCtx.strokeText('指定数ガチャ', 150, 35);
  cCtx.fillText('指定数ガチャ', 150, 35);
  
  cCtx.font = 'bold 20px "DelaGothicOne"';
  cCtx.strokeText('(何回でもOK)', 150, 65);
  cCtx.fillText('(何回でもOK)', 150, 65);
  
  const customBuffer = custom.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'public', 'images', 'gacha-button-custom.png'), customBuffer);
  
  console.log('✅ ガチャボタン生成完了');
}

// メイン実行
async function main() {
  console.log('🎨 1024x1024バナー＆ガチャボタン生成開始\n');
  
  // フォント登録
  registerBoldFonts();
  
  // AI背景画像リスト
  const bgDir = path.join(__dirname, 'public', 'images', 'basebg');
  const bgFiles = fs.readdirSync(bgDir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .map(f => path.join(bgDir, f));
  
  // ポケモンカード画像
  const pokemonDir = path.join(__dirname, 'public', 'images', 'pokemon');
  const cardFiles = fs.readdirSync(pokemonDir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .map(f => path.join(pokemonDir, f));
  
  console.log(`\n🖼️  使用可能背景: ${bgFiles.length}枚`);
  console.log(`🃏 使用可能カード: ${cardFiles.length}枚\n`);
  
  // 1024x1024バナー生成
  const banners = [
    {
      title: '超激熱★爆裂ガチャ',
      subtitle: '神引き確定！SSR演出発生中！！',
      price: '1回 2,000円',
      aiBackground: bgFiles[0],
      psa10: true,
      textBg: true,
      fileName: '1024-banner-1.png'
    },
    {
      title: 'GOLD★CASINO',
      subtitle: 'ジャックポット！大当たり確定！！',
      price: 'VIP限定 5,000円',
      aiBackground: bgFiles[1],
      overlay: true,
      overlayOpacity: 0.3,
      fileName: '1024-banner-2.png'
    },
    {
      title: '虹色★レインボー',
      subtitle: '全色コンプリート！激レア確定！！',
      price: '特別価格 3,000円',
      aiBackground: bgFiles[13],
      psa10: true,
      titleSize: 88,
      fileName: '1024-banner-3.png'
    }
  ];
  
  for (const banner of banners) {
    await create1024Banner({
      ...banner,
      cardImages: cardFiles
    });
  }
  
  // ガチャボタン生成
  await createGachaButtons();
  
  console.log('\n🎉 1024x1024バナー＆ガチャボタン生成完了！');
  console.log('✨ バナーとボタンの準備ができました！');
}

// 実行
main().catch(console.error);