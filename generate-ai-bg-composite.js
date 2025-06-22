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

// AI背景とポケカ・文字を合成
async function createAIBackgroundBanner(options = {}) {
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // AI背景を読み込み
  if (options.aiBackground) {
    try {
      const bgImage = await loadImage(options.aiBackground);
      // 背景を800x450にフィット
      ctx.drawImage(bgImage, 0, 0, width, height);
    } catch (err) {
      console.error('背景読み込みエラー:', err);
      // フォールバック背景
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#FF0000');
      gradient.addColorStop(1, '#FF6600');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // 半透明オーバーレイ（文字を見やすくするため）
  if (options.overlay) {
    ctx.fillStyle = `rgba(0, 0, 0, ${options.overlayOpacity || 0.2})`;
    ctx.fillRect(0, 0, width, height);
  }

  // ポケモンカード配置（8-10枚）
  if (options.cardImages && options.cardImages.length > 0) {
    const cardPositions = [
      // 背景層
      { x: 0.1, y: 0.2, scale: 0.25, rotation: -0.2, opacity: 0.6 },
      { x: 0.9, y: 0.25, scale: 0.23, rotation: 0.15, opacity: 0.6 },
      { x: 0.05, y: 0.75, scale: 0.24, rotation: 0.1, opacity: 0.55 },
      { x: 0.95, y: 0.8, scale: 0.25, rotation: -0.2, opacity: 0.6 },
      
      // 中間層
      { x: 0.25, y: 0.4, scale: 0.35, rotation: -0.1, opacity: 0.75 },
      { x: 0.75, y: 0.45, scale: 0.38, rotation: 0.08, opacity: 0.8 },
      { x: 0.2, y: 0.7, scale: 0.32, rotation: 0.05, opacity: 0.7 },
      { x: 0.8, y: 0.65, scale: 0.34, rotation: -0.12, opacity: 0.75 },
      
      // 前景層
      { x: 0.5, y: 0.55, scale: 0.45, rotation: 0, opacity: 0.9 }
    ];

    for (let i = 0; i < Math.min(cardPositions.length, options.cardImages.length); i++) {
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
        
        // カード影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        
        ctx.drawImage(cardImage, -cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // キラキラ効果
        const glossGrad = ctx.createLinearGradient(-cardWidth/2, -cardHeight/2, cardWidth/2, cardHeight/2);
        glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        glossGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glossGrad;
        ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // 金枠
        if (pos.scale > 0.35) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 4;
          ctx.strokeRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        }
        
        ctx.restore();
      } catch (err) {
        console.error(`カード読み込みエラー: ${cardPath}`);
      }
    }
  }

  // PSA10ラベル
  if (options.psa10) {
    ctx.save();
    ctx.translate(width - 100, 70);
    ctx.rotate(0.1);
    
    // 背景バースト
    const psaBurst = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
    psaBurst.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
    psaBurst.addColorStop(0.5, 'rgba(255, 165, 0, 0.6)');
    psaBurst.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = psaBurst;
    ctx.fillRect(-60, -60, 120, 120);
    
    // PSA10本体
    const psaGrad = ctx.createLinearGradient(0, -25, 0, 25);
    psaGrad.addColorStop(0, '#FF0000');
    psaGrad.addColorStop(0.5, '#DC143C');
    psaGrad.addColorStop(1, '#8B0000');
    ctx.fillStyle = psaGrad;
    ctx.fillRect(-50, -25, 100, 50);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.strokeRect(-50, -25, 100, 50);
    
    ctx.font = 'bold 30px "ArialBlack"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText('PSA10', 0, 7);
    ctx.fillText('PSA10', 0, 7);
    ctx.restore();
  }

  // メインタイトル
  ctx.save();
  const fontSize = options.titleSize || 76;
  const fontFamily = options.titleFont || 'DelaGothicOne';
  ctx.font = `bold ${fontSize}px "${fontFamily}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const titleY = height * 0.3;
  
  // テキスト背景プレート
  if (options.textBg) {
    const textWidth = ctx.measureText(options.title || 'テスト').width + 120;
    const bgGrad = ctx.createLinearGradient(width/2 - textWidth/2, titleY - 50, width/2 + textWidth/2, titleY + 50);
    bgGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    bgGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.85)');
    bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(width/2 - textWidth/2, titleY - 50, textWidth, 100);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(width/2 - textWidth/2, titleY - 50, textWidth, 100);
  }
  
  // 多重影
  for (let i = 10; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.7 - i * 0.06})`;
    ctx.fillText(options.title || 'テスト', width/2 + i * 2, titleY + i * 2);
  }
  
  // 金縁取り
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 18;
  ctx.strokeText(options.title || 'テスト', width/2, titleY);
  
  // 黒縁取り
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.strokeText(options.title || 'テスト', width/2, titleY);
  
  // メイン文字
  const titleGrad = ctx.createLinearGradient(0, titleY - 40, 0, titleY + 40);
  titleGrad.addColorStop(0, '#FFFFFF');
  titleGrad.addColorStop(0.5, '#FFFFCC');
  titleGrad.addColorStop(1, '#FFFF00');
  ctx.fillStyle = titleGrad;
  ctx.fillText(options.title || 'テスト', width/2, titleY);
  
  ctx.restore();

  // サブタイトル
  if (options.subtitle) {
    ctx.save();
    const subFontSize = 40;
    const subFontFamily = 'HiraKakuW9';
    ctx.font = `bold ${subFontSize}px "${subFontFamily}"`;
    ctx.textAlign = 'center';
    
    const subY = titleY + 80;
    const subTextWidth = ctx.measureText(options.subtitle).width + 80;
    
    // 背景
    const subBgGrad = ctx.createLinearGradient(width/2 - subTextWidth/2, subY - 30, width/2 + subTextWidth/2, subY + 30);
    subBgGrad.addColorStop(0, '#FF0000');
    subBgGrad.addColorStop(0.5, '#DC143C');
    subBgGrad.addColorStop(1, '#8B0000');
    ctx.fillStyle = subBgGrad;
    ctx.fillRect(width/2 - subTextWidth/2, subY - 30, subTextWidth, 60);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(width/2 - subTextWidth/2, subY - 30, subTextWidth, 60);
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeText(options.subtitle, width/2, subY);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(options.subtitle, width/2, subY);
    
    ctx.restore();
  }

  // 価格表示
  if (options.price) {
    ctx.save();
    
    const priceGrad = ctx.createLinearGradient(0, height - 90, 0, height);
    priceGrad.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    priceGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = priceGrad;
    ctx.fillRect(0, height - 90, width, 90);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, height - 90);
    ctx.lineTo(width, height - 90);
    ctx.stroke();
    
    const priceFontFamily = 'DelaGothicOne';
    ctx.font = `bold 52px "${priceFontFamily}"`;
    ctx.textAlign = 'center';
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.strokeText(options.price, width/2, height - 35);
    
    const priceTextGrad = ctx.createLinearGradient(0, height - 65, 0, height - 15);
    priceTextGrad.addColorStop(0, '#FFD700');
    priceTextGrad.addColorStop(0.5, '#FFFF00');
    priceTextGrad.addColorStop(1, '#FFD700');
    ctx.fillStyle = priceTextGrad;
    ctx.fillText(options.price, width/2, height - 35);
    
    ctx.restore();
  }

  // 追加キラキラ
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 5 + 1;
    
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

// メイン実行
async function main() {
  console.log('🎨 AI背景合成バナー生成開始\n');
  
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
  
  // バナー生成例
  const banners = [
    {
      title: '爆熱★ガチャ降臨',
      subtitle: '激レア確定！神引き演出発生中！！',
      price: '1回 2,000円',
      aiBackground: bgFiles[0], // 最初の背景
      psa10: true,
      textBg: true,
      fileName: 'ai-bg-banner-1.png'
    },
    {
      title: 'GOLD★RUSH',
      subtitle: 'カジノで大当たり！豪華景品GET！！',
      price: 'VIP限定 5,000円',
      aiBackground: bgFiles[1], // 2番目の背景
      overlay: true,
      overlayOpacity: 0.3,
      fileName: 'ai-bg-banner-2.png'
    },
    {
      title: '虹色★爆裂オリパ',
      subtitle: 'レインボー演出で神カード確定！！',
      price: '特価 1,500円',
      aiBackground: bgFiles[13], // rainbow背景
      psa10: true,
      fileName: 'ai-bg-banner-3.png'
    },
    {
      title: '深海の秘宝',
      subtitle: '海底に眠る激レアカード発掘！！',
      price: 'OCEAN 3,000円',
      aiBackground: bgFiles[2], // 水系背景
      textBg: true,
      overlay: true,
      overlayOpacity: 0.2,
      fileName: 'ai-bg-banner-4.png'
    },
    {
      title: '黄金★帝国',
      subtitle: 'ゴールドラッシュ！大当たり確定！！',
      price: 'PREMIUM 10,000円',
      aiBackground: bgFiles[5], // 豪華背景
      psa10: true,
      fileName: 'ai-bg-banner-5.png'
    }
  ];
  
  for (const banner of banners) {
    await createAIBackgroundBanner({
      ...banner,
      cardImages: cardFiles
    });
  }
  
  console.log('\n🎉 AI背景合成バナー生成完了！');
  console.log('✨ AI背景とポケカ・文字の組み合わせが完成しました！');
}

// 実行
main().catch(console.error);