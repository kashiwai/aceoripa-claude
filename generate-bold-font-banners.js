const { createCanvas, registerFont, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// フォント登録（太いフォントのみ）
function registerBoldFonts() {
  const fontsDir = path.join(__dirname, 'public', 'fonts');
  
  // 太いフォントのみ使用
  const boldFonts = [
    { file: 'Dela_Gothic_One.ttf', family: 'DelaGothicOne' }, // 極太ゴシック
    { file: 'MOBO-Font11.otf', family: 'MOBOFont' }, // 太い
    { file: 'kinkaku.otf', family: 'Kinkaku' }, // 太い和風
  ];
  
  boldFonts.forEach(({ file, family }) => {
    const fontPath = path.join(fontsDir, file);
    if (fs.existsSync(fontPath)) {
      try {
        registerFont(fontPath, { family: family });
        console.log(`✅ Bold Font: ${family}`);
      } catch (err) {
        console.error(`❌ ${family}:`, err.message);
      }
    }
  });
  
  // システムの太いフォント
  const systemBoldFonts = [
    { path: '/System/Library/Fonts/ヒラギノ角ゴシック W9.ttc', family: 'HiraKakuW9' }, // 極太
    { path: '/Library/Fonts/Arial Black.ttf', family: 'ArialBlack' } // 極太
  ];
  
  systemBoldFonts.forEach(({ path, family }) => {
    if (fs.existsSync(path)) {
      try {
        registerFont(path, { family: family });
        console.log(`✅ System Bold: ${family}`);
      } catch (err) {
        console.error(`❌ System Bold: ${family}`);
      }
    }
  });
}

// 太字専用バナー生成
async function createBoldFontBanner(options = {}) {
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景色バリエーション
  if (options.bgType === 'white-premium') {
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
    for (let i = 0; i < 24; i++) {
      ctx.rotate((Math.PI * 2) / 24);
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
      gradient.addColorStop(0.5, 'rgba(255, 223, 0, 0.15)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, -3, width, 6);
    }
    ctx.restore();
    
  } else if (options.bgType === 'blue-ocean') {
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
    bgGradient.addColorStop(0, '#00BFFF');
    bgGradient.addColorStop(0.3, '#1E90FF');
    bgGradient.addColorStop(0.6, '#0000CD');
    bgGradient.addColorStop(1, '#000080');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 水の波紋エフェクト
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(width/2, height/2, 50 + i * 80, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 - i * 0.1})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    
  } else if (options.bgType === 'black-luxury') {
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
    bgGradient.addColorStop(0, '#1C1C1C');
    bgGradient.addColorStop(0.5, '#0A0A0A');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // ゴールドダスト
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 4 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${Math.random() * 0.9 + 0.1})`;
      ctx.fill();
    }
    
  } else if (options.bgType === 'red-explosion') {
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
    for (let i = 0; i < 36; i++) {
      ctx.rotate((Math.PI * 2) / 36);
      const gradient = ctx.createLinearGradient(0, 0, 300, 0);
      gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, -4, 300, 8);
    }
    ctx.restore();
  }

  // 8-10枚のポケモンカード配置
  if (options.cardImages && options.cardImages.length > 0) {
    const cardPositions = [
      // 背景層（4-5枚）
      { x: 0.08, y: 0.15, scale: 0.22, rotation: -0.3, opacity: 0.5 },
      { x: 0.92, y: 0.18, scale: 0.24, rotation: 0.25, opacity: 0.5 },
      { x: 0.05, y: 0.82, scale: 0.23, rotation: 0.2, opacity: 0.45 },
      { x: 0.95, y: 0.85, scale: 0.22, rotation: -0.28, opacity: 0.5 },
      { x: 0.15, y: 0.5, scale: 0.25, rotation: -0.15, opacity: 0.4 },
      
      // 中間層（3-4枚）
      { x: 0.25, y: 0.3, scale: 0.35, rotation: -0.1, opacity: 0.7 },
      { x: 0.75, y: 0.35, scale: 0.38, rotation: 0.12, opacity: 0.75 },
      { x: 0.3, y: 0.7, scale: 0.36, rotation: 0.08, opacity: 0.7 },
      { x: 0.7, y: 0.65, scale: 0.35, rotation: -0.1, opacity: 0.72 },
      
      // 前景層（1-2枚）
      { x: 0.5, y: 0.5, scale: 0.5, rotation: 0, opacity: 0.95 }
    ];

    for (let i = 0; i < Math.min(cardPositions.length, 10); i++) {
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
        
        // カード影（濃い目）
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        
        // カード描画
        ctx.drawImage(cardImage, -cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // 光沢効果
        ctx.shadowBlur = 0;
        const glossGrad = ctx.createLinearGradient(-cardWidth/2, -cardHeight/2, cardWidth/2, cardHeight/2);
        glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        glossGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
        glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glossGrad;
        ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // 金枠（大きいカードのみ）
        if (pos.scale > 0.35) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 4;
          ctx.strokeRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        }
        
        ctx.restore();
      } catch (err) {
        console.error(`カード画像エラー: ${cardPath}`);
      }
    }
  }

  // PSA10ラベル（太字版）
  if (options.psa10) {
    ctx.save();
    ctx.translate(width - 100, 60);
    ctx.rotate(0.1);
    
    // 光る背景
    const psaBurst = ctx.createRadialGradient(0, 0, 0, 0, 0, 70);
    psaBurst.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
    psaBurst.addColorStop(0.5, 'rgba(255, 165, 0, 0.6)');
    psaBurst.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = psaBurst;
    ctx.fillRect(-70, -70, 140, 140);
    
    // PSA10本体
    const psaGrad = ctx.createLinearGradient(0, -25, 0, 25);
    psaGrad.addColorStop(0, '#FF0000');
    psaGrad.addColorStop(0.5, '#DC143C');
    psaGrad.addColorStop(1, '#8B0000');
    ctx.fillStyle = psaGrad;
    ctx.fillRect(-50, -25, 100, 50);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.strokeRect(-50, -25, 100, 50);
    
    // 太字フォントでPSA10
    ctx.font = 'bold 32px "ArialBlack"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText('PSA10', 0, 8);
    ctx.fillText('PSA10', 0, 8);
    ctx.restore();
  }

  // パーセント表示（太字版）
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
    ctx.lineWidth = 8;
    ctx.stroke();
    
    // 太字フォントでパーセント（数字も日本語フォント）
    ctx.font = 'bold 56px "DelaGothicOne"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.strokeText(options.percentage, 0, -5);
    ctx.fillText(options.percentage, 0, -5);
    
    ctx.font = 'bold 24px "DelaGothicOne"';
    ctx.strokeText('還元率', 0, 30);
    ctx.fillText('還元率', 0, 30);
    
    ctx.restore();
  }

  // メインタイトル（超太字）
  ctx.save();
  const isLightBg = options.bgType === 'white-premium';
  
  // タイトル爆発背景
  ctx.translate(width/2, height * 0.25);
  const textBurst = ctx.createRadialGradient(0, 0, 0, 0, 0, 300);
  textBurst.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  textBurst.addColorStop(0.3, 'rgba(255, 215, 0, 0.7)');
  textBurst.addColorStop(0.6, 'rgba(255, 69, 0, 0.5)');
  textBurst.addColorStop(1, 'rgba(255, 0, 0, 0)');
  ctx.fillStyle = textBurst;
  ctx.fillRect(-400, -150, 800, 300);
  ctx.restore();
  
  // メインタイトル本体（太字のみ）
  ctx.save();
  const fontSize = options.titleSize || 84; // より大きく
  const fontFamily = options.titleFont || 'DelaGothicOne'; // 太字フォント
  ctx.font = `bold ${fontSize}px "${fontFamily}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const titleY = height * 0.25;
  
  // 多重影効果（より濃く）
  for (let i = 12; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.8 - i * 0.06})`;
    ctx.fillText(options.title || 'テスト', width/2 + i * 3, titleY + i * 3);
  }
  
  // 金色太縁取り
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 20;
  ctx.strokeText(options.title || 'テスト', width/2, titleY);
  
  // 黒太縁取り
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 10;
  ctx.strokeText(options.title || 'テスト', width/2, titleY);
  
  // グラデーション文字
  const titleGrad = ctx.createLinearGradient(0, titleY - 50, 0, titleY + 50);
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

  // サブタイトル（太字版）
  if (options.subtitle) {
    ctx.save();
    const subFontSize = options.subSize || 42; // より大きく
    const subFontFamily = options.subFont || 'HiraKakuW9'; // 太字フォント
    ctx.font = `bold ${subFontSize}px "${subFontFamily}"`;
    ctx.textAlign = 'center';
    
    const subY = titleY + 100;
    const subTextWidth = ctx.measureText(options.subtitle).width + 100;
    const subTextX = width/2 - subTextWidth/2;
    
    // 赤グラデーション背景
    const subBgGrad = ctx.createLinearGradient(subTextX, subY - 35, subTextX, subY + 35);
    subBgGrad.addColorStop(0, '#FF0000');
    subBgGrad.addColorStop(0.5, '#DC143C');
    subBgGrad.addColorStop(1, '#8B0000');
    ctx.fillStyle = subBgGrad;
    ctx.fillRect(subTextX, subY - 35, subTextWidth, 70);
    
    // 金太枠
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.strokeRect(subTextX, subY - 35, subTextWidth, 70);
    
    // サブタイトル文字（太字）
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.strokeText(options.subtitle, width/2, subY);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(options.subtitle, width/2, subY);
    
    ctx.restore();
  }

  // 価格表示（太字版、数字も日本語フォント）
  if (options.price) {
    ctx.save();
    
    // 価格背景
    const priceGrad = ctx.createLinearGradient(0, height - 100, 0, height);
    priceGrad.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    priceGrad.addColorStop(1, '#000000');
    ctx.fillStyle = priceGrad;
    ctx.fillRect(0, height - 100, width, 100);
    
    // 装飾ライン（太く）
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, height - 100);
    ctx.lineTo(width, height - 100);
    ctx.stroke();
    
    // 価格テキスト（太字、数字も日本語フォント）
    const priceFontFamily = options.priceFont || 'DelaGothicOne';
    ctx.font = `bold 56px "${priceFontFamily}"`;
    ctx.textAlign = 'center';
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeText(options.price, width/2, height - 35);
    
    const priceTextGrad = ctx.createLinearGradient(0, height - 70, 0, height - 10);
    priceTextGrad.addColorStop(0, '#FFD700');
    priceTextGrad.addColorStop(0.5, '#FFFF00');
    priceTextGrad.addColorStop(1, '#FFD700');
    ctx.fillStyle = priceTextGrad;
    ctx.fillText(options.price, width/2, height - 35);
    
    ctx.restore();
  }

  // 派手なキラキラ（増量）
  for (let i = 0; i < 100; i++) {
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
  console.log('🔥 太字専用DOPAスタイルバナー生成開始\n');
  
  // 太字フォントのみ登録
  registerBoldFonts();
  
  // ポケモンカード画像
  const pokemonDir = path.join(__dirname, 'public', 'images', 'pokemon');
  const cardFiles = fs.readdirSync(pokemonDir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .map(f => path.join(pokemonDir, f));
  
  console.log(`\n🃏 使用可能カード: ${cardFiles.length}枚\n`);
  
  // 太字専用バナー生成
  const banners = [
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
      fileName: 'bold-red-explosion.png'
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
      fileName: 'bold-white-premium.png'
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
      fileName: 'bold-blue-ocean.png'
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
      titleSize: 72,
      fileName: 'bold-black-luxury.png'
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
      fileName: 'bold-red-100.png'
    }
  ];
  
  for (const banner of banners) {
    await createBoldFontBanner({
      ...banner,
      cardImages: cardFiles
    });
  }
  
  console.log('\n💪 太字専用DOPAスタイルバナー生成完了！');
  console.log('🔥 すべて太字フォントで力強いバナーができました！');
}

// 実行
main().catch(console.error);