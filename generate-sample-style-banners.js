const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// サンプルスタイルのバナー生成（大量のカード散りばめスタイル）
async function createSampleStyleBanner(options = {}) {
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景グラデーション（サンプルのような派手な配色）
  const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
  if (options.bgType === 'gold') {
    bgGradient.addColorStop(0, '#FFD700');
    bgGradient.addColorStop(0.3, '#FFA500');
    bgGradient.addColorStop(0.6, '#FF6347');
    bgGradient.addColorStop(1, '#8B0000');
  } else if (options.bgType === 'purple') {
    bgGradient.addColorStop(0, '#FF69B4');
    bgGradient.addColorStop(0.3, '#DA70D6');
    bgGradient.addColorStop(0.6, '#9370DB');
    bgGradient.addColorStop(1, '#4B0082');
  } else {
    // デフォルト：赤系
    bgGradient.addColorStop(0, '#FF1493');
    bgGradient.addColorStop(0.3, '#FF0000');
    bgGradient.addColorStop(0.6, '#DC143C');
    bgGradient.addColorStop(1, '#8B0000');
  }
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 放射状の光線エフェクト
  ctx.save();
  ctx.translate(width/2, height/2);
  for (let i = 0; i < 24; i++) {
    ctx.rotate((Math.PI * 2) / 24);
    const rayGrad = ctx.createLinearGradient(0, 0, width, 0);
    rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    rayGrad.addColorStop(0.5, 'rgba(255, 255, 0, 0.2)');
    rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = rayGrad;
    ctx.fillRect(0, -8, width, 16);
  }
  ctx.restore();

  // 稲妻エフェクト
  if (options.lightning) {
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#FFFF00';
    ctx.shadowBlur = 20;
    
    // 稲妻パス
    ctx.beginPath();
    ctx.moveTo(width * 0.2, 0);
    ctx.lineTo(width * 0.25, height * 0.3);
    ctx.lineTo(width * 0.15, height * 0.35);
    ctx.lineTo(width * 0.22, height * 0.6);
    ctx.lineTo(width * 0.18, height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width * 0.8, 0);
    ctx.lineTo(width * 0.75, height * 0.4);
    ctx.lineTo(width * 0.82, height * 0.45);
    ctx.lineTo(width * 0.78, height);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
  }

  // カード画像を大量に配置
  if (options.cardImages && options.cardImages.length > 0) {
    const cardPositions = [
      // 背景のカード（小さめ、傾き大きめ）
      { x: 0.1, y: 0.2, scale: 0.3, rotation: -0.5, opacity: 0.7 },
      { x: 0.15, y: 0.7, scale: 0.25, rotation: 0.3, opacity: 0.6 },
      { x: 0.85, y: 0.3, scale: 0.3, rotation: 0.4, opacity: 0.7 },
      { x: 0.9, y: 0.8, scale: 0.25, rotation: -0.3, opacity: 0.6 },
      { x: 0.05, y: 0.5, scale: 0.25, rotation: 0.2, opacity: 0.5 },
      { x: 0.95, y: 0.6, scale: 0.3, rotation: -0.4, opacity: 0.6 },
      
      // 中間のカード
      { x: 0.25, y: 0.4, scale: 0.4, rotation: -0.2, opacity: 0.8 },
      { x: 0.75, y: 0.5, scale: 0.4, rotation: 0.15, opacity: 0.8 },
      { x: 0.3, y: 0.8, scale: 0.35, rotation: -0.1, opacity: 0.85 },
      { x: 0.7, y: 0.2, scale: 0.35, rotation: 0.25, opacity: 0.85 },
      
      // メインカード（大きめ、中央寄り）
      { x: 0.5, y: 0.5, scale: 0.6, rotation: 0, opacity: 1 },
      { x: 0.4, y: 0.6, scale: 0.5, rotation: -0.1, opacity: 1 },
      { x: 0.6, y: 0.4, scale: 0.5, rotation: 0.1, opacity: 1 }
    ];

    // カードを配置
    for (let i = 0; i < Math.min(cardPositions.length, options.cardImages.length); i++) {
      const pos = cardPositions[i];
      const cardPath = options.cardImages[i % options.cardImages.length];
      
      try {
        const cardImage = await loadImage(cardPath);
        
        ctx.save();
        ctx.globalAlpha = pos.opacity;
        ctx.translate(width * pos.x, height * pos.y);
        ctx.rotate(pos.rotation);
        
        // カードサイズ
        const cardHeight = 280 * pos.scale;
        const cardWidth = 200 * pos.scale;
        
        // 光る枠
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        
        // カード描画
        ctx.drawImage(cardImage, -cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // キラキラオーバーレイ
        const shineGrad = ctx.createLinearGradient(-cardWidth/2, -cardHeight/2, cardWidth/2, cardHeight/2);
        shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        shineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shineGrad;
        ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        ctx.restore();
      } catch (err) {
        console.error(`カード画像読み込みエラー: ${cardPath}`, err);
      }
    }
  }

  // PSA10ラベル
  if (options.psa10) {
    ctx.save();
    // PSA10ラベル背景
    const psaGrad = ctx.createLinearGradient(0, 0, 120, 40);
    psaGrad.addColorStop(0, '#FF0000');
    psaGrad.addColorStop(1, '#8B0000');
    
    ctx.fillStyle = psaGrad;
    ctx.fillRect(width - 140, 20, 120, 40);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(width - 140, 20, 120, 40);
    
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('PSA10', width - 80, 48);
    ctx.restore();
  }

  // メインテキストエリア
  ctx.save();
  
  // テキスト背景パネル
  const textPanelGrad = ctx.createLinearGradient(0, height * 0.1, 0, height * 0.4);
  textPanelGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  textPanelGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.7)');
  textPanelGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.7)');
  textPanelGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = textPanelGrad;
  ctx.fillRect(0, height * 0.1, width, height * 0.3);
  
  // メインタイトル（極太ゴシック体風）
  ctx.font = `bold ${options.titleSize || 72}px "Arial Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 黒縁取り（太め）
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 12;
  ctx.strokeText(options.mainTitle || '激アツオリパ', width/2, height * 0.25);
  
  // 金色グラデーション文字
  const titleGrad = ctx.createLinearGradient(0, height * 0.15, 0, height * 0.35);
  titleGrad.addColorStop(0, '#FFFF00');
  titleGrad.addColorStop(0.5, '#FFD700');
  titleGrad.addColorStop(1, '#FFA500');
  ctx.fillStyle = titleGrad;
  ctx.fillText(options.mainTitle || '激アツオリパ', width/2, height * 0.25);
  
  ctx.restore();

  // サブテキスト
  if (options.subTitle) {
    ctx.save();
    ctx.font = 'bold 48px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    
    // 赤い背景ボックス
    const subTextWidth = ctx.measureText(options.subTitle).width + 40;
    const subTextX = width/2 - subTextWidth/2;
    const subTextY = height * 0.65;
    
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(subTextX, subTextY, subTextWidth, 60);
    
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 3;
    ctx.strokeRect(subTextX, subTextY, subTextWidth, 60);
    
    // テキスト
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(options.subTitle, width/2, subTextY + 35);
    ctx.restore();
  }

  // 確率表示
  if (options.percentage) {
    ctx.save();
    ctx.translate(100, 100);
    ctx.rotate(-0.1);
    
    // 背景円
    const circleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
    circleGrad.addColorStop(0, '#FFD700');
    circleGrad.addColorStop(0.7, '#FF6347');
    circleGrad.addColorStop(1, '#8B0000');
    ctx.fillStyle = circleGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // パーセント表示
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(options.percentage, 0, -5);
    ctx.fillText(options.percentage, 0, -5);
    
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('還元率', 0, 20);
    
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
    
    // 装飾ライン
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height - 80);
    ctx.lineTo(width, height - 80);
    ctx.stroke();
    
    // 価格テキスト
    ctx.font = 'bold 48px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(options.price, width/2, height - 30);
    
    ctx.restore();
  }

  // キラキラエフェクト（最前面）
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 3 + 1;
    
    ctx.save();
    ctx.translate(x, y);
    
    const sparkleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
    sparkleGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sparkleGrad.addColorStop(0.5, 'rgba(255, 255, 0, 0.5)');
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

// バナー生成実行
async function generateAllBanners() {
  console.log('🎨 サンプルスタイルバナー生成開始...\n');
  
  const pokemonDir = path.join(__dirname, 'public', 'images', 'pokemon');
  const cardFiles = fs.readdirSync(pokemonDir)
    .filter(file => /\.(png|jpg|jpeg)$/i.test(file))
    .map(file => path.join(pokemonDir, file));
  
  // バナー1: プチュンの日スタイル（大量カード）
  await createSampleStyleBanner({
    cardImages: cardFiles,
    bgType: 'gold',
    mainTitle: 'プチュンの日',
    subTitle: '爆アド発生オリパ!!',
    percentage: '97%',
    price: '10連で14,000pt以上のセットが1枚確定!!',
    lightning: true,
    fileName: 'puchun-style.png'
  });
  
  // バナー2: PSA10確定スタイル
  await createSampleStyleBanner({
    cardImages: cardFiles.slice(0, 10),
    bgType: 'purple',
    mainTitle: '総還元率99%!!',
    subTitle: 'プチュン演出発生でA賞以上確定!!',
    psa10: true,
    price: '1/1.7の確率で1,500pt以上確定!!',
    fileName: 'psa10-style.png'
  });
  
  // バナー3: BOX確定スタイル
  await createSampleStyleBanner({
    cardImages: cardFiles,
    mainTitle: 'PSA10&BOX!!',
    subTitle: 'プチュン演出発生&PSA10orBOXが排出!!',
    percentage: '98%',
    price: '1/22の確率でプチュン演出発生!!',
    psa10: true,
    fileName: 'box-style.png'
  });
  
  // バナー4: 激熱オリパスタイル
  await createSampleStyleBanner({
    cardImages: cardFiles.reverse(),
    mainTitle: '激熱オリパ',
    subTitle: '還元率驚異の97%',
    titleSize: 80,
    lightning: true,
    price: '1回 1,000円',
    fileName: 'gekiatsu-style.png'
  });
  
  // バナー5: ルガルガン確定スタイル
  await createSampleStyleBanner({
    cardImages: cardFiles,
    bgType: 'red',
    mainTitle: 'ルガルガンオリパ',
    subTitle: '一気にキメろ!!10連セット',
    percentage: '97%',
    price: '4枚セット×10連 = 10,000pt',
    fileName: 'lugarugan-style.png'
  });
  
  console.log('\n🎉 全てのサンプルスタイルバナー生成完了！');
}

// 実行
generateAllBanners().catch(console.error);