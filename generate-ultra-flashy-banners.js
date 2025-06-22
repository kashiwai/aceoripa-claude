const { createCanvas, registerFont, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// フォント登録
function registerAllFonts() {
  const fontsDir = path.join(__dirname, 'public', 'fonts');
  const fontFiles = [
    { file: 'Dela_Gothic_One.ttf', family: 'DelaGothicOne' },
    { file: 'MOBO-Font11.otf', family: 'MOBOFont' },
    { file: 'MOBO-Font11_2.otf', family: 'MOBOFont2' },
    { file: 'MOBO-Font11_3.otf', family: 'MOBOFont3' },
    { file: 'MOBO-Font11_4.otf', family: 'MOBOFont4' },
    { file: 'YDW_bananaslip_plus_240809.otf', family: 'BananaSlip' },
    { file: 'craftmincho_2.otf', family: 'CraftMincho' },
    { file: 'kinkaku.otf', family: 'Kinkaku' },
    { file: 'kinkaku_2.ttf', family: 'Kinkaku2' }
  ];
  
  fontFiles.forEach(({ file, family }) => {
    const fontPath = path.join(fontsDir, file);
    if (fs.existsSync(fontPath)) {
      try {
        registerFont(fontPath, { family: family });
        console.log(`✅ ${family}`);
      } catch (err) {
        console.error(`❌ ${family}:`, err.message);
      }
    }
  });
  
  // システムフォント
  const systemFonts = [
    { path: '/System/Library/Fonts/ヒラギノ角ゴシック W9.ttc', family: 'HiraKakuW9' },
    { path: '/Library/Fonts/Arial Black.ttf', family: 'ArialBlack' }
  ];
  
  systemFonts.forEach(({ path, family }) => {
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

// 超派手なDOPAスタイルバナー生成
async function createUltraFlashyBanner(options = {}) {
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 派手な虹色グラデーション背景
  const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
  if (options.bgType === 'rainbow') {
    bgGradient.addColorStop(0, '#FF0080');
    bgGradient.addColorStop(0.2, '#FF0000');
    bgGradient.addColorStop(0.4, '#FF8C00');
    bgGradient.addColorStop(0.6, '#FFD700');
    bgGradient.addColorStop(0.8, '#00CED1');
    bgGradient.addColorStop(1, '#9400D3');
  } else {
    bgGradient.addColorStop(0, '#FF6B6B');
    bgGradient.addColorStop(0.3, '#FF3366');
    bgGradient.addColorStop(0.6, '#FF0033');
    bgGradient.addColorStop(1, '#CC0033');
  }
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
      const gradient = ctx.createLinearGradient(0, 0, 300, 0);
      gradient.addColorStop(0, `rgba(255, 255, 0, ${0.8 - e * 0.2})`);
      gradient.addColorStop(0.5, `rgba(255, 215, 0, ${0.5 - e * 0.1})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, -3, 300, 6);
    }
    ctx.restore();
  }

  // 稲妻エフェクト
  ctx.strokeStyle = '#FFFF00';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#FFFF00';
  ctx.shadowBlur = 25;
  
  // 稲妻1
  ctx.beginPath();
  ctx.moveTo(width * 0.15, 0);
  ctx.lineTo(width * 0.2, height * 0.3);
  ctx.lineTo(width * 0.12, height * 0.35);
  ctx.lineTo(width * 0.18, height * 0.7);
  ctx.lineTo(width * 0.1, height);
  ctx.stroke();
  
  // 稲妻2
  ctx.beginPath();
  ctx.moveTo(width * 0.85, 0);
  ctx.lineTo(width * 0.8, height * 0.4);
  ctx.lineTo(width * 0.88, height * 0.45);
  ctx.lineTo(width * 0.82, height);
  ctx.stroke();
  
  ctx.shadowBlur = 0;

  // 大量のポケモンカード散りばめ
  if (options.cardImages && options.cardImages.length > 0) {
    const cardPositions = [
      // 背景層（小さく、薄く）
      { x: 0.05, y: 0.1, scale: 0.2, rotation: -0.5, opacity: 0.4 },
      { x: 0.1, y: 0.8, scale: 0.18, rotation: 0.4, opacity: 0.35 },
      { x: 0.95, y: 0.2, scale: 0.22, rotation: 0.3, opacity: 0.45 },
      { x: 0.9, y: 0.85, scale: 0.19, rotation: -0.4, opacity: 0.4 },
      { x: 0.08, y: 0.45, scale: 0.17, rotation: 0.25, opacity: 0.3 },
      { x: 0.92, y: 0.6, scale: 0.21, rotation: -0.35, opacity: 0.4 },
      { x: 0.15, y: 0.25, scale: 0.23, rotation: -0.2, opacity: 0.5 },
      { x: 0.85, y: 0.75, scale: 0.2, rotation: 0.15, opacity: 0.45 },
      
      // 中間層
      { x: 0.2, y: 0.4, scale: 0.35, rotation: -0.2, opacity: 0.7 },
      { x: 0.8, y: 0.35, scale: 0.38, rotation: 0.15, opacity: 0.75 },
      { x: 0.25, y: 0.7, scale: 0.32, rotation: -0.1, opacity: 0.65 },
      { x: 0.75, y: 0.65, scale: 0.36, rotation: 0.2, opacity: 0.7 },
      { x: 0.18, y: 0.55, scale: 0.3, rotation: 0.08, opacity: 0.6 },
      { x: 0.82, y: 0.5, scale: 0.34, rotation: -0.12, opacity: 0.68 },
      
      // 前景層（大きく、はっきり）
      { x: 0.35, y: 0.5, scale: 0.5, rotation: -0.08, opacity: 0.95 },
      { x: 0.65, y: 0.45, scale: 0.52, rotation: 0.1, opacity: 1 },
      { x: 0.5, y: 0.65, scale: 0.48, rotation: 0.05, opacity: 0.9 },
      { x: 0.45, y: 0.35, scale: 0.45, rotation: -0.05, opacity: 0.88 },
      { x: 0.55, y: 0.55, scale: 0.55, rotation: 0, opacity: 1 }
    ];

    for (let i = 0; i < cardPositions.length; i++) {
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
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 8;
        
        // カード描画
        ctx.drawImage(cardImage, -cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // ホログラム効果
        ctx.shadowBlur = 0;
        const holoGrad = ctx.createLinearGradient(-cardWidth/2, -cardHeight/2, cardWidth/2, cardHeight/2);
        holoGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        holoGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.5)');
        holoGrad.addColorStop(0.4, 'rgba(255, 215, 0, 0.3)');
        holoGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)');
        holoGrad.addColorStop(0.8, 'rgba(255, 105, 180, 0.3)');
        holoGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = holoGrad;
        ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // 金枠
        if (pos.scale > 0.3) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 3;
          ctx.strokeRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        }
        
        ctx.restore();
      } catch (err) {
        console.error(`カード画像エラー: ${cardPath}`);
      }
    }
  }

  // PSA10ラベル（派手版）
  if (options.psa10) {
    ctx.save();
    ctx.translate(width - 100, 60);
    ctx.rotate(0.1);
    
    // 光る背景
    const psaBurst = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
    psaBurst.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
    psaBurst.addColorStop(0.5, 'rgba(255, 165, 0, 0.5)');
    psaBurst.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = psaBurst;
    ctx.fillRect(-60, -60, 120, 120);
    
    // PSA10本体
    const psaGrad = ctx.createLinearGradient(0, 0, 0, 50);
    psaGrad.addColorStop(0, '#FF0000');
    psaGrad.addColorStop(0.5, '#DC143C');
    psaGrad.addColorStop(1, '#8B0000');
    ctx.fillStyle = psaGrad;
    ctx.fillRect(-50, -25, 100, 50);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.strokeRect(-50, -25, 100, 50);
    
    ctx.font = 'bold 28px "ArialBlack"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText('PSA10', 0, 5);
    ctx.fillText('PSA10', 0, 5);
    ctx.restore();
  }

  // 確率表示（超派手版）
  if (options.percentage) {
    ctx.save();
    ctx.translate(100, 100);
    ctx.rotate(-0.15);
    
    // 爆発背景
    const burstGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
    burstGrad.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
    burstGrad.addColorStop(0.3, 'rgba(255, 165, 0, 0.7)');
    burstGrad.addColorStop(0.6, 'rgba(255, 0, 0, 0.5)');
    burstGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = burstGrad;
    ctx.fillRect(-100, -100, 200, 200);
    
    // 円形本体
    const circleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 75);
    circleGrad.addColorStop(0, '#FFD700');
    circleGrad.addColorStop(0.5, '#FF6347');
    circleGrad.addColorStop(1, '#8B0000');
    ctx.fillStyle = circleGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 75, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.stroke();
    
    // パーセント表示
    ctx.font = `bold 48px "${options.percentFont || 'DelaGothicOne'}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(options.percentage, 0, -5);
    ctx.fillText(options.percentage, 0, -5);
    
    ctx.font = `bold 20px "${options.percentFont || 'DelaGothicOne'}"`;
    ctx.strokeText('還元率', 0, 25);
    ctx.fillText('還元率', 0, 25);
    
    ctx.restore();
  }

  // メインタイトル（超派手版）
  ctx.save();
  
  // テキスト爆発背景
  ctx.translate(width/2, height * 0.25);
  const textBurst = ctx.createRadialGradient(0, 0, 0, 0, 0, 300);
  textBurst.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  textBurst.addColorStop(0.3, 'rgba(255, 215, 0, 0.6)');
  textBurst.addColorStop(0.6, 'rgba(255, 69, 0, 0.4)');
  textBurst.addColorStop(1, 'rgba(255, 0, 0, 0)');
  ctx.fillStyle = textBurst;
  ctx.fillRect(-400, -150, 800, 300);
  ctx.restore();
  
  // メインタイトル本体
  ctx.save();
  const fontSize = options.titleSize || 80;
  const fontFamily = options.titleFont || 'DelaGothicOne';
  ctx.font = `bold ${fontSize}px "${fontFamily}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const titleY = height * 0.25;
  
  // 多重影効果
  for (let i = 15; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.7 - i * 0.04})`;
    ctx.fillText(options.title || 'テスト', width/2 + i * 3, titleY + i * 3);
  }
  
  // 金色太縁取り
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 15;
  ctx.strokeText(options.title || 'テスト', width/2, titleY);
  
  // 黒縁取り
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.strokeText(options.title || 'テスト', width/2, titleY);
  
  // グラデーション文字
  const titleGrad = ctx.createLinearGradient(0, titleY - 40, 0, titleY + 40);
  titleGrad.addColorStop(0, '#FFFFFF');
  titleGrad.addColorStop(0.5, '#FFFFCC');
  titleGrad.addColorStop(1, '#FFFF00');
  ctx.fillStyle = titleGrad;
  ctx.fillText(options.title || 'テスト', width/2, titleY);
  
  ctx.restore();

  // サブタイトル（派手版）
  if (options.subtitle) {
    ctx.save();
    const subFontSize = options.subSize || 48;
    const subFontFamily = options.subFont || 'MOBOFont';
    ctx.font = `bold ${subFontSize}px "${subFontFamily}"`;
    ctx.textAlign = 'center';
    
    const subY = titleY + 90;
    const subTextWidth = ctx.measureText(options.subtitle).width + 80;
    const subTextX = width/2 - subTextWidth/2;
    
    // 赤グラデーション背景
    const subBgGrad = ctx.createLinearGradient(subTextX, subY - 30, subTextX, subY + 30);
    subBgGrad.addColorStop(0, '#FF0000');
    subBgGrad.addColorStop(0.5, '#DC143C');
    subBgGrad.addColorStop(1, '#8B0000');
    ctx.fillStyle = subBgGrad;
    ctx.fillRect(subTextX, subY - 30, subTextWidth, 60);
    
    // 金枠
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.strokeRect(subTextX, subY - 30, subTextWidth, 60);
    
    // サブタイトル文字
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeText(options.subtitle, width/2, subY);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(options.subtitle, width/2, subY);
    
    ctx.restore();
  }

  // 価格表示（派手版）
  if (options.price) {
    ctx.save();
    
    // 価格背景グラデーション
    const priceGrad = ctx.createLinearGradient(0, height - 90, 0, height);
    priceGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    priceGrad.addColorStop(0.5, 'rgba(50, 0, 0, 0.9)');
    priceGrad.addColorStop(1, '#000000');
    ctx.fillStyle = priceGrad;
    ctx.fillRect(0, height - 90, width, 90);
    
    // 装飾ライン
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, height - 90);
    ctx.lineTo(width, height - 90);
    ctx.stroke();
    
    // 価格テキスト
    const priceFontFamily = options.priceFont || 'Kinkaku';
    ctx.font = `bold 48px "${priceFontFamily}"`;
    ctx.textAlign = 'center';
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(options.price, width/2, height - 35);
    
    const priceTextGrad = ctx.createLinearGradient(0, height - 60, 0, height - 10);
    priceTextGrad.addColorStop(0, '#FFD700');
    priceTextGrad.addColorStop(0.5, '#FFFF00');
    priceTextGrad.addColorStop(1, '#FFD700');
    ctx.fillStyle = priceTextGrad;
    ctx.fillText(options.price, width/2, height - 35);
    
    ctx.restore();
  }

  // 超大量キラキラエフェクト
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 6 + 2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI * 2);
    
    const sparkleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
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

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'public', 'images', options.fileName), buffer);
  console.log(`✅ 生成完了: ${options.fileName}`);
}

// メイン実行
async function main() {
  console.log('🚀 超派手DOPAスタイルバナー生成開始\n');
  
  // フォント登録
  registerAllFonts();
  
  // ポケモンカード画像
  const pokemonDir = path.join(__dirname, 'public', 'images', 'pokemon');
  const cardFiles = fs.readdirSync(pokemonDir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .map(f => path.join(pokemonDir, f));
  
  console.log(`\n🃏 使用可能カード: ${cardFiles.length}枚\n`);
  
  // 超派手バナー生成
  const banners = [
    {
      title: 'PSA10&BOX確定!!',
      subtitle: 'プチュン演出発生でレア確定!!',
      titleFont: 'DelaGothicOne',
      subFont: 'HiraKakuW9',
      percentFont: 'DelaGothicOne',
      priceFont: 'DelaGothicOne',
      percentage: '98%',
      price: '⚡ 1/22の確率でプチュン演出発生!! ⚡',
      psa10: true,
      bgType: 'red',
      fileName: 'ultra-flashy-dela.png'
    },
    {
      title: '激熱★オリパ爆誕',
      subtitle: 'SSR確率驚異の爆上げ中!!',
      titleFont: 'MOBOFont',
      subFont: 'MOBOFont2',
      percentFont: 'Kinkaku',
      priceFont: 'MOBOFont3',
      percentage: '97%',
      price: '💥 1回 1,500円 💥',
      psa10: true,
      bgType: 'rainbow',
      fileName: 'ultra-flashy-mobo.png'
    },
    {
      title: '金閣寺★極上オリパ',
      subtitle: '和風レアカード大量放出中!!',
      titleFont: 'Kinkaku',
      subFont: 'CraftMincho',
      percentFont: 'Kinkaku2',
      priceFont: 'Kinkaku',
      percentage: '99%',
      price: '⭐ 至高の逸品 2,500円 ⭐',
      psa10: true,
      titleSize: 72,
      fileName: 'ultra-flashy-kinkaku.png'
    },
    {
      title: 'バナナ爆裂オリパ',
      subtitle: 'ポップでキュート♪レア確定!!',
      titleFont: 'BananaSlip',
      subFont: 'DelaGothicOne',
      percentFont: 'BananaSlip',
      priceFont: 'MOBOFont',
      percentage: '95%',
      price: '🌟 お得価格 800円 🌟',
      bgType: 'rainbow',
      titleSize: 76,
      fileName: 'ultra-flashy-banana.png'
    },
    {
      title: '明朝極道オリパ',
      subtitle: '職人魂の一撃必殺カード!!',
      titleFont: 'CraftMincho',
      subFont: 'Kinkaku',
      percentFont: 'CraftMincho',
      priceFont: 'CraftMincho',
      percentage: '100%',
      price: '⚔️ 伝説の3,000円 ⚔️',
      psa10: true,
      titleSize: 68,
      fileName: 'ultra-flashy-craft.png'
    }
  ];
  
  for (const banner of banners) {
    await createUltraFlashyBanner({
      ...banner,
      cardImages: cardFiles
    });
  }
  
  console.log('\n🎉 超派手DOPAスタイルバナー生成完了！');
  console.log('💥 最高に派手でゴテゴテしたバナーができました！');
}

// 実行
main().catch(console.error);