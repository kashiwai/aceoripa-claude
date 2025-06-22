const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// 登録されたカスタムフォントでバナー生成
async function createCustomFontBanner(options = {}) {
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景グラデーション
  const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
  bgGradient.addColorStop(0, '#FF6B6B');
  bgGradient.addColorStop(0.3, '#FF3366');
  bgGradient.addColorStop(0.6, '#FF0033');
  bgGradient.addColorStop(1, '#8B0000');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 爆発エフェクト
  ctx.save();
  ctx.translate(width/2, height/2);
  for (let i = 0; i < 36; i++) {
    ctx.rotate((Math.PI * 2) / 36);
    const rayGrad = ctx.createLinearGradient(0, 0, 400, 0);
    rayGrad.addColorStop(0, 'rgba(255, 255, 0, 0.6)');
    rayGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.3)');
    rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = rayGrad;
    ctx.fillRect(0, -4, 400, 8);
  }
  ctx.restore();

  // ポケモンカード配置
  if (options.cardImages && options.cardImages.length > 0) {
    const cardPositions = [
      { x: 0.15, y: 0.3, scale: 0.4, rotation: -0.3, opacity: 0.8 },
      { x: 0.85, y: 0.4, scale: 0.45, rotation: 0.2, opacity: 0.9 },
      { x: 0.25, y: 0.7, scale: 0.35, rotation: -0.1, opacity: 0.85 },
      { x: 0.75, y: 0.75, scale: 0.4, rotation: 0.15, opacity: 0.8 },
      { x: 0.5, y: 0.6, scale: 0.5, rotation: 0, opacity: 1 }
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
        
        // カード光る効果
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.drawImage(cardImage, -cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // ホログラム効果
        ctx.shadowBlur = 0;
        const shineGrad = ctx.createLinearGradient(-cardWidth/2, -cardHeight/2, cardWidth/2, cardHeight/2);
        shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        shineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
        shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shineGrad;
        ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        ctx.restore();
      } catch (err) {
        console.error(`カード画像エラー: ${cardPath}`, err);
      }
    }
  }

  // カスタムフォントでメインタイトル
  ctx.save();
  ctx.font = `bold ${options.titleSize || 72}px '${options.titleFont || 'Dela_Gothic_One_1'}'`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const titleY = options.titleY || height * 0.25;
  
  // 多重影
  for (let i = 8; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.7 - i * 0.06})`;
    ctx.fillText(options.mainTitle || 'カスタムフォント', width/2 + i * 3, titleY + i * 3);
  }
  
  // 金色縁取り
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 10;
  ctx.strokeText(options.mainTitle || 'カスタムフォント', width/2, titleY);
  
  // 黒縁取り
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 6;
  ctx.strokeText(options.mainTitle || 'カスタムフォント', width/2, titleY);
  
  // 白文字
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(options.mainTitle || 'カスタムフォント', width/2, titleY);
  ctx.restore();

  // サブタイトル（別フォント）
  if (options.subTitle) {
    ctx.save();
    ctx.font = `bold ${options.subSize || 48}px '${options.subFont || 'MOBO-Font11_1'}'`;
    ctx.textAlign = 'center';
    
    const subY = (options.titleY || height * 0.25) + 80;
    
    // 赤い背景ボックス
    const subTextWidth = ctx.measureText(options.subTitle).width + 40;
    const subTextX = width/2 - subTextWidth/2;
    
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(subTextX, subY - 25, subTextWidth, 50);
    
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 3;
    ctx.strokeRect(subTextX, subY - 25, subTextWidth, 50);
    
    // サブタイトルテキスト
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(options.subTitle, width/2, subY);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(options.subTitle, width/2, subY);
    ctx.restore();
  }

  // 確率表示（円形バッジ）
  if (options.percentage) {
    ctx.save();
    ctx.translate(100, 100);
    
    // 円形背景
    const circleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 70);
    circleGrad.addColorStop(0, '#FFD700');
    circleGrad.addColorStop(0.7, '#FF6347');
    circleGrad.addColorStop(1, '#8B0000');
    ctx.fillStyle = circleGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 70, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // パーセント文字
    ctx.font = `bold 42px '${options.percentFont || 'kinkaku_2'}'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(options.percentage, 0, -5);
    ctx.fillText(options.percentage, 0, -5);
    
    ctx.font = `bold 20px '${options.percentFont || 'kinkaku_2'}'`;
    ctx.fillText('還元率', 0, 25);
    
    ctx.restore();
  }

  // 価格表示
  if (options.price) {
    ctx.save();
    
    // 価格背景
    const priceGrad = ctx.createLinearGradient(0, height - 80, 0, height);
    priceGrad.addColorStop(0, '#000000');
    priceGrad.addColorStop(1, '#333333');
    ctx.fillStyle = priceGrad;
    ctx.fillRect(0, height - 80, width, 80);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height - 80);
    ctx.lineTo(width, height - 80);
    ctx.stroke();
    
    // 価格テキスト
    ctx.font = `bold 48px '${options.priceFont || 'craftmincho_2'}'`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(options.price, width/2, height - 30);
    
    ctx.restore();
  }

  // キラキラエフェクト
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 4 + 1;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI * 2);
    
    const sparkleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
    sparkleGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sparkleGrad.addColorStop(0.5, 'rgba(255, 255, 0, 0.7)');
    sparkleGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sparkleGrad;
    ctx.fillRect(-size * 2, -size * 2, size * 4, size * 4);
    
    ctx.restore();
  }

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'public', 'images', options.fileName), buffer);
  console.log(`✅ 生成完了: ${options.fileName}`);
}

// カスタムフォントバナー生成実行
async function generateCustomFontBanners() {
  console.log('🎨 カスタムフォントバナー生成開始...\n');
  
  const pokemonDir = path.join(__dirname, 'public', 'images', 'pokemon');
  const cardFiles = fs.readdirSync(pokemonDir)
    .filter(file => /\.(png|jpg|jpeg)$/i.test(file))
    .map(file => path.join(pokemonDir, file));
  
  // フォント一覧読み込み
  const fontListPath = path.join(__dirname, 'public', 'fonts', 'font-list.json');
  let availableFonts = [];
  if (fs.existsSync(fontListPath)) {
    const fontData = JSON.parse(fs.readFileSync(fontListPath, 'utf8'));
    availableFonts = fontData.fonts.map(f => f.family);
  }
  
  console.log(`📝 利用可能フォント: ${availableFonts.length}個`);
  availableFonts.forEach(font => console.log(`   - ${font}`));
  
  // バナー1: Dela Gothic One (極太ゴシック)
  await createCustomFontBanner({
    cardImages: cardFiles,
    mainTitle: '超激アツオリパ',
    subTitle: 'PSA10確定!!',
    titleFont: 'Dela_Gothic_One_1',
    subFont: 'MOBO-Font11_1',
    percentFont: 'kinkaku_2',
    priceFont: 'craftmincho_2',
    percentage: '99%',
    price: '1回 1,500円',
    fileName: 'custom-font-dela.png'
  });
  
  // バナー2: MOBO Font (モダンボールド)
  await createCustomFontBanner({
    cardImages: cardFiles.reverse(),
    mainTitle: 'プレミアムBOX',
    subTitle: '限定カード封入中',
    titleFont: 'MOBO-Font11_2',
    subFont: 'YDW_bananaslip_plus_240809_1',
    percentFont: 'Dela_Gothic_One_1',
    priceFont: 'kinkaku_1',
    percentage: '97%',
    price: '🎁 特別価格 🎁',
    titleY: 180,
    fileName: 'custom-font-mobo.png'
  });
  
  // バナー3: 金閣 (和風フォント)
  await createCustomFontBanner({
    cardImages: cardFiles,
    mainTitle: '和風激レアオリパ',
    subTitle: '伝説のカード降臨',
    titleFont: 'kinkaku_1',
    subFont: 'craftmincho_2',
    percentFont: 'MOBO-Font11_3',
    priceFont: 'YDW_bananaslip_plus_240809_1',
    percentage: '98%',
    price: '一回勝負 2,000円',
    titleSize: 64,
    fileName: 'custom-font-kinkaku.png'
  });
  
  // バナー4: バナナスリップ (ポップ)
  await createCustomFontBanner({
    cardImages: cardFiles.slice(0, 8),
    mainTitle: 'ポップ★オリパ',
    subTitle: 'キュートなレアカード♪',
    titleFont: 'YDW_bananaslip_plus_240809_1',
    subFont: 'Dela_Gothic_One_1',
    percentFont: 'kinkaku_2',
    priceFont: 'MOBO-Font11_4',
    percentage: '95%',
    price: '♪ 1回 800円 ♪',
    titleY: 150,
    fileName: 'custom-font-banana.png'
  });
  
  // バナー5: クラフト明朝 (上品)
  await createCustomFontBanner({
    cardImages: cardFiles,
    mainTitle: '至高のオリパ',
    subTitle: '品格あるレアカード',
    titleFont: 'craftmincho_2',
    subFont: 'kinkaku_1',
    percentFont: 'Dela_Gothic_One_1',
    priceFont: 'MOBO-Font11_1',
    percentage: '100%',
    price: '特選 3,000円',
    titleSize: 68,
    fileName: 'custom-font-craft.png'
  });
  
  console.log('\n🎉 カスタムフォントバナー生成完了！');
  console.log('📁 保存先: public/images/');
}

// 実行
generateCustomFontBanners().catch(console.error);