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

// プレミアムカラーバナー生成
async function createPremiumColorBanner(options = {}) {
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景色バリエーション
  if (options.bgType === 'white-premium') {
    // 白ベース高級感
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
      gradient.addColorStop(0, 'rgba(255, 215, 0, 0.2)');
      gradient.addColorStop(0.5, 'rgba(255, 223, 0, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, -2, width, 4);
    }
    ctx.restore();
    
  } else if (options.bgType === 'blue-ocean') {
    // 青海洋系
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
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 - i * 0.08})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
  } else if (options.bgType === 'black-luxury') {
    // 黒高級
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
    bgGradient.addColorStop(0, '#1C1C1C');
    bgGradient.addColorStop(0.5, '#0A0A0A');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // ゴールドダスト
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${Math.random() * 0.8 + 0.2})`;
      ctx.fill();
    }
    
  } else if (options.bgType === 'purple-royal') {
    // 紫ロイヤル
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
    bgGradient.addColorStop(0, '#9370DB');
    bgGradient.addColorStop(0.3, '#8B008B');
    bgGradient.addColorStop(0.6, '#4B0082');
    bgGradient.addColorStop(1, '#310062');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
  } else if (options.bgType === 'green-emerald') {
    // 緑エメラルド
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
    bgGradient.addColorStop(0, '#50C878');
    bgGradient.addColorStop(0.3, '#228B22');
    bgGradient.addColorStop(0.6, '#006400');
    bgGradient.addColorStop(1, '#004225');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
  }

  // プレミアムエフェクト（背景色に応じて調整）
  const isLightBg = options.bgType === 'white-premium';
  
  // ダイヤモンドパターン
  ctx.save();
  for (let x = 0; x < width; x += 50) {
    for (let y = 0; y < height; y += 50) {
      ctx.save();
      ctx.translate(x + 25, y + 25);
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = isLightBg ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-10, -10, 20, 20);
      ctx.restore();
    }
  }
  ctx.restore();

  // ポケモンカード配置（プレミアム感重視）
  if (options.cardImages && options.cardImages.length > 0) {
    const premiumPositions = [
      // 背景層（エレガントな配置）
      { x: 0.1, y: 0.15, scale: 0.25, rotation: -0.1, opacity: 0.3 },
      { x: 0.9, y: 0.15, scale: 0.25, rotation: 0.1, opacity: 0.3 },
      { x: 0.1, y: 0.85, scale: 0.25, rotation: 0.1, opacity: 0.3 },
      { x: 0.9, y: 0.85, scale: 0.25, rotation: -0.1, opacity: 0.3 },
      
      // メイン層（中央に大きく）
      { x: 0.25, y: 0.5, scale: 0.45, rotation: -0.05, opacity: 0.9 },
      { x: 0.5, y: 0.5, scale: 0.5, rotation: 0, opacity: 1 },
      { x: 0.75, y: 0.5, scale: 0.45, rotation: 0.05, opacity: 0.9 }
    ];

    for (let i = 0; i < premiumPositions.length; i++) {
      const pos = premiumPositions[i];
      const cardPath = options.cardImages[i % options.cardImages.length];
      
      try {
        const cardImage = await loadImage(cardPath);
        
        ctx.save();
        ctx.globalAlpha = pos.opacity;
        ctx.translate(width * pos.x, height * pos.y);
        ctx.rotate(pos.rotation);
        
        const cardHeight = 280 * pos.scale;
        const cardWidth = 200 * pos.scale;
        
        // プレミアムカード影
        if (!isLightBg) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 10;
        } else {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 8;
        }
        
        // カード描画
        ctx.drawImage(cardImage, -cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // プレミアム光沢
        ctx.shadowBlur = 0;
        const glossGrad = ctx.createLinearGradient(-cardWidth/2, -cardHeight/2, cardWidth/2, 0);
        glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        glossGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glossGrad;
        ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // プラチナ枠
        if (pos.scale > 0.4) {
          ctx.strokeStyle = '#E5E4E2';
          ctx.lineWidth = 4;
          ctx.strokeRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        }
        
        ctx.restore();
      } catch (err) {
        console.error(`カード画像エラー: ${cardPath}`);
      }
    }
  }

  // レアリティバッジ
  if (options.rarity) {
    ctx.save();
    ctx.translate(width - 120, 80);
    
    // バッジ背景
    const badgeGrad = ctx.createLinearGradient(0, -40, 0, 40);
    if (options.rarity === 'SECRET') {
      badgeGrad.addColorStop(0, '#FFD700');
      badgeGrad.addColorStop(0.5, '#FFA500');
      badgeGrad.addColorStop(1, '#FF6347');
    } else if (options.rarity === 'ULTRA') {
      badgeGrad.addColorStop(0, '#E5E4E2');
      badgeGrad.addColorStop(0.5, '#C0C0C0');
      badgeGrad.addColorStop(1, '#808080');
    }
    
    ctx.fillStyle = badgeGrad;
    ctx.beginPath();
    ctx.moveTo(-60, -30);
    ctx.lineTo(60, -30);
    ctx.lineTo(50, 0);
    ctx.lineTo(60, 30);
    ctx.lineTo(-60, 30);
    ctx.lineTo(-50, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = isLightBg ? '#000000' : '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // レアリティテキスト
    ctx.font = 'bold 24px "ArialBlack"';
    ctx.textAlign = 'center';
    ctx.fillStyle = isLightBg ? '#000000' : '#FFFFFF';
    ctx.fillText(options.rarity, 0, 5);
    
    ctx.restore();
  }

  // メインタイトル（背景色対応）
  ctx.save();
  const fontSize = options.titleSize || 72;
  const fontFamily = options.titleFont || 'DelaGothicOne';
  ctx.font = `bold ${fontSize}px "${fontFamily}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const titleY = height * 0.25;
  
  // タイトル背景プレート
  if (options.titlePlate) {
    const textWidth = ctx.measureText(options.title || 'テスト').width + 100;
    ctx.fillStyle = isLightBg ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(width/2 - textWidth/2, titleY - 45, textWidth, 90);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.strokeRect(width/2 - textWidth/2, titleY - 45, textWidth, 90);
  }
  
  // 影効果
  for (let i = 8; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.5 - i * 0.05})`;
    ctx.fillText(options.title || 'テスト', width/2 + i * 2, titleY + i * 2);
  }
  
  // メインテキスト
  if (isLightBg) {
    // 白背景用：濃い色
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.strokeText(options.title || 'テスト', width/2, titleY);
    
    const titleGrad = ctx.createLinearGradient(0, titleY - 40, 0, titleY + 40);
    titleGrad.addColorStop(0, '#FF0000');
    titleGrad.addColorStop(0.5, '#DC143C');
    titleGrad.addColorStop(1, '#8B0000');
    ctx.fillStyle = titleGrad;
  } else {
    // 暗い背景用：明るい色
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 10;
    ctx.strokeText(options.title || 'テスト', width/2, titleY);
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.strokeText(options.title || 'テスト', width/2, titleY);
    
    const titleGrad = ctx.createLinearGradient(0, titleY - 40, 0, titleY + 40);
    titleGrad.addColorStop(0, '#FFFFFF');
    titleGrad.addColorStop(0.5, '#FFFFCC');
    titleGrad.addColorStop(1, '#FFFF00');
    ctx.fillStyle = titleGrad;
  }
  ctx.fillText(options.title || 'テスト', width/2, titleY);
  
  ctx.restore();

  // サブタイトル
  if (options.subtitle) {
    ctx.save();
    const subFontSize = options.subSize || 36;
    const subFontFamily = options.subFont || 'MOBOFont';
    ctx.font = `bold ${subFontSize}px "${subFontFamily}"`;
    ctx.textAlign = 'center';
    
    const subY = titleY + 80;
    
    // サブタイトル背景
    const subTextWidth = ctx.measureText(options.subtitle).width + 60;
    const subBgGrad = ctx.createLinearGradient(width/2 - subTextWidth/2, subY - 25, width/2 + subTextWidth/2, subY + 25);
    if (isLightBg) {
      subBgGrad.addColorStop(0, '#FF6347');
      subBgGrad.addColorStop(0.5, '#FF0000');
      subBgGrad.addColorStop(1, '#DC143C');
    } else {
      subBgGrad.addColorStop(0, '#FFD700');
      subBgGrad.addColorStop(0.5, '#FFA500');
      subBgGrad.addColorStop(1, '#FF8C00');
    }
    ctx.fillStyle = subBgGrad;
    ctx.fillRect(width/2 - subTextWidth/2, subY - 25, subTextWidth, 50);
    
    ctx.strokeStyle = isLightBg ? '#000000' : '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(width/2 - subTextWidth/2, subY - 25, subTextWidth, 50);
    
    // サブタイトルテキスト
    ctx.fillStyle = isLightBg ? '#FFFFFF' : '#000000';
    ctx.fillText(options.subtitle, width/2, subY);
    
    ctx.restore();
  }

  // 価格表示（プレミアム版）
  if (options.price) {
    ctx.save();
    
    // 価格背景
    const priceGrad = ctx.createLinearGradient(0, height - 80, 0, height);
    if (isLightBg) {
      priceGrad.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
      priceGrad.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    } else {
      priceGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      priceGrad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
    }
    ctx.fillStyle = priceGrad;
    ctx.fillRect(0, height - 80, width, 80);
    
    // 装飾ライン
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height - 80);
    ctx.lineTo(width, height - 80);
    ctx.stroke();
    
    // 価格テキスト
    const priceFontFamily = options.priceFont || 'Kinkaku';
    ctx.font = `bold 42px "${priceFontFamily}"`;
    ctx.textAlign = 'center';
    
    ctx.fillStyle = '#FFD700';
    ctx.fillText(options.price, width/2, height - 30);
    
    ctx.restore();
  }

  // エレガントなキラキラ
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 4 + 1;
    
    ctx.save();
    ctx.translate(x, y);
    
    const sparkleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    if (isLightBg) {
      sparkleGrad.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
      sparkleGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
    } else {
      sparkleGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      sparkleGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    }
    ctx.fillStyle = sparkleGrad;
    
    // 十字キラキラ
    ctx.fillRect(-size/8, -size, size/4, size*2);
    ctx.fillRect(-size, -size/8, size*2, size/4);
    
    ctx.restore();
  }

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'public', 'images', options.fileName), buffer);
  console.log(`✅ 生成完了: ${options.fileName}`);
}

// メイン実行
async function main() {
  console.log('🎨 プレミアムカラーバナー生成開始\n');
  
  // フォント登録
  registerAllFonts();
  
  // ポケモンカード画像
  const pokemonDir = path.join(__dirname, 'public', 'images', 'pokemon');
  const cardFiles = fs.readdirSync(pokemonDir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .map(f => path.join(pokemonDir, f));
  
  console.log(`\n🃏 使用可能カード: ${cardFiles.length}枚\n`);
  
  // カラーバリエーションバナー
  const banners = [
    // 白プレミアム
    {
      title: '最高級★白銀オリパ',
      subtitle: '選ばれし者だけの特別価格',
      titleFont: 'DelaGothicOne',
      subFont: 'Kinkaku',
      priceFont: 'CraftMincho',
      price: '💎 LIMITED 5,000円 💎',
      bgType: 'white-premium',
      rarity: 'SECRET',
      titlePlate: true,
      fileName: 'premium-white-silver.png'
    },
    // 青海洋
    {
      title: '深海の秘宝オリパ',
      subtitle: '海底に眠るレアカード発掘!!',
      titleFont: 'MOBOFont',
      subFont: 'BananaSlip',
      priceFont: 'DelaGothicOne',
      price: '🌊 OCEAN 2,000円 🌊',
      bgType: 'blue-ocean',
      rarity: 'ULTRA',
      fileName: 'premium-blue-ocean.png'
    },
    // 黒高級
    {
      title: 'BLACK★DIAMOND',
      subtitle: '漆黒の輝き・最上級カード',
      titleFont: 'Kinkaku',
      subFont: 'CraftMincho',
      priceFont: 'Kinkaku2',
      price: '⚫ VIP限定 10,000円 ⚫',
      bgType: 'black-luxury',
      rarity: 'SECRET',
      titleSize: 68,
      fileName: 'premium-black-luxury.png'
    },
    // 紫ロイヤル
    {
      title: '紫電の王者オリパ',
      subtitle: 'ロイヤルパープル限定版',
      titleFont: 'CraftMincho',
      subFont: 'Kinkaku',
      priceFont: 'MOBOFont',
      price: '👑 ROYAL 3,500円 👑',
      bgType: 'purple-royal',
      rarity: 'ULTRA',
      fileName: 'premium-purple-royal.png'
    },
    // 緑エメラルド
    {
      title: 'エメラルド★ガチャ',
      subtitle: '翡翠の輝き・希少カード確定',
      titleFont: 'BananaSlip',
      subFont: 'DelaGothicOne',
      priceFont: 'CraftMincho',
      price: '💚 EMERALD 4,000円 💚',
      bgType: 'green-emerald',
      rarity: 'SECRET',
      titleSize: 70,
      fileName: 'premium-green-emerald.png'
    },
    // 追加：白プレミアム別バージョン
    {
      title: 'ホワイト★プラチナ',
      subtitle: '純白の極上オリパ',
      titleFont: 'MOBOFont2',
      subFont: 'MOBOFont3',
      priceFont: 'MOBOFont4',
      price: '⚪ PLATINUM 7,500円 ⚪',
      bgType: 'white-premium',
      rarity: 'SECRET',
      titlePlate: false,
      fileName: 'premium-white-platinum.png'
    }
  ];
  
  for (const banner of banners) {
    await createPremiumColorBanner({
      ...banner,
      cardImages: cardFiles
    });
  }
  
  console.log('\n💎 プレミアムカラーバナー生成完了！');
  console.log('🌈 高級感あふれる多彩なバナーができました！');
}

// 実行
main().catch(console.error);