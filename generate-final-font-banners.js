const { createCanvas, registerFont, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// フォント登録を確実に行う
function registerAllFonts() {
  console.log('📝 フォント登録開始...\n');
  
  const registeredFonts = [];
  
  // カスタムフォント（public/fonts/内）
  const fontsDir = path.join(__dirname, 'public', 'fonts');
  const fontFiles = [
    { file: 'Dela_Gothic_One.ttf', family: 'DelaGothicOne' },
    { file: 'MOBO-Font11.otf', family: 'MOBOFont' },
    { file: 'MOBO-Font11_2.otf', family: 'MOBOFont2' },
    { file: 'MOBO-Font11_3.otf', family: 'MOBOFont3' },
    { file: 'MOBO-Font11_4.otf', family: 'MOBOFont4' },
    { file: 'YDW_bananaslip_plus_240809.otf', family: 'BananaSlip' },
    { file: 'craftmincho.otf', family: 'CraftMincho' },
    { file: 'craftmincho_2.otf', family: 'CraftMincho2' },
    { file: 'kinkaku.otf', family: 'Kinkaku' },
    { file: 'kinkaku_2.ttf', family: 'Kinkaku2' }
  ];
  
  // カスタムフォント登録
  fontFiles.forEach(({ file, family }) => {
    const fontPath = path.join(fontsDir, file);
    if (fs.existsSync(fontPath)) {
      try {
        registerFont(fontPath, { family: family });
        registeredFonts.push(family);
        console.log(`✅ 登録成功: ${family} (${file})`);
      } catch (err) {
        console.error(`❌ 登録失敗: ${family}`, err.message);
      }
    } else {
      console.warn(`⚠️  ファイルなし: ${file}`);
    }
  });
  
  // システムフォント
  const systemFonts = [
    { path: '/System/Library/Fonts/ヒラギノ角ゴシック W9.ttc', family: 'HiraKakuW9' },
    { path: '/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc', family: 'HiraKakuW6' },
    { path: '/Library/Fonts/Arial Black.ttf', family: 'ArialBlack' }
  ];
  
  systemFonts.forEach(({ path, family }) => {
    if (fs.existsSync(path)) {
      try {
        registerFont(path, { family: family });
        registeredFonts.push(family);
        console.log(`✅ システムフォント: ${family}`);
      } catch (err) {
        console.error(`❌ システムフォント失敗: ${family}`);
      }
    }
  });
  
  console.log(`\n📊 登録完了: ${registeredFonts.length}個のフォント`);
  return registeredFonts;
}

// フォントテストバナー生成
async function createFontTestBanner() {
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // 背景
  ctx.fillStyle = '#222222';
  ctx.fillRect(0, 0, width, height);
  
  // タイトル
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '24px Arial';
  ctx.fillText('フォントテスト - Font Test', 20, 40);
  
  // フォントテスト
  const testFonts = [
    { name: 'DelaGothicOne', text: 'デラゴシック', color: '#FF6B6B' },
    { name: 'MOBOFont', text: 'MOBOフォント', color: '#FFD700' },
    { name: 'BananaSlip', text: 'バナナスリップ', color: '#00FF00' },
    { name: 'CraftMincho', text: 'クラフト明朝', color: '#FF69B4' },
    { name: 'Kinkaku', text: '金閣フォント', color: '#FFA500' },
    { name: 'HiraKakuW9', text: 'ヒラギノ角ゴ', color: '#00CED1' },
    { name: 'ArialBlack', text: 'Arial Black', color: '#9370DB' }
  ];
  
  let y = 100;
  testFonts.forEach(({ name, text, color }) => {
    try {
      ctx.font = `bold 48px "${name}"`;
      ctx.fillStyle = color;
      ctx.fillText(`${name}: ${text}`, 40, y);
      y += 70;
    } catch (err) {
      console.error(`フォント描画エラー: ${name}`);
    }
  });
  
  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'public', 'images', 'font-test-final.png'), buffer);
  console.log('✅ フォントテスト画像生成: font-test-final.png');
}

// 最終バナー生成
async function createFinalBanner(options = {}) {
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // 背景
  const bgGrad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
  bgGrad.addColorStop(0, options.bgColor1 || '#FF6B6B');
  bgGrad.addColorStop(0.5, options.bgColor2 || '#FF3366');
  bgGrad.addColorStop(1, options.bgColor3 || '#8B0000');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);
  
  // 放射光
  ctx.save();
  ctx.translate(width/2, height/2);
  for (let i = 0; i < 24; i++) {
    ctx.rotate(Math.PI / 12);
    const rayGrad = ctx.createLinearGradient(0, 0, 400, 0);
    rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = rayGrad;
    ctx.fillRect(0, -10, 400, 20);
  }
  ctx.restore();
  
  // ポケモンカード配置
  if (options.cardImages) {
    for (let i = 0; i < Math.min(5, options.cardImages.length); i++) {
      try {
        const card = await loadImage(options.cardImages[i]);
        const positions = [
          { x: 100, y: 100, rot: -0.2, scale: 0.3 },
          { x: 650, y: 120, rot: 0.15, scale: 0.35 },
          { x: 150, y: 300, rot: -0.1, scale: 0.25 },
          { x: 600, y: 280, rot: 0.2, scale: 0.3 },
          { x: 400, y: 200, rot: 0, scale: 0.4 }
        ];
        
        const pos = positions[i % positions.length];
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(pos.rot);
        
        const w = 200 * pos.scale;
        const h = 280 * pos.scale;
        
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.drawImage(card, -w/2, -h/2, w, h);
        ctx.restore();
      } catch (err) {
        console.error('カード画像エラー:', err);
      }
    }
  }
  
  // メインタイトル（カスタムフォント使用）
  ctx.save();
  
  // フォント設定（ダブルクォートで囲む）
  const fontSize = options.titleSize || 64;
  const fontFamily = options.titleFont || 'DelaGothicOne';
  ctx.font = `bold ${fontSize}px "${fontFamily}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const titleY = options.titleY || height * 0.3;
  
  // 影効果
  for (let i = 5; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.3 - i * 0.05})`;
    ctx.fillText(options.title || 'テスト', width/2 + i*2, titleY + i*2);
  }
  
  // 縁取り
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 8;
  ctx.strokeText(options.title || 'テスト', width/2, titleY);
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeText(options.title || 'テスト', width/2, titleY);
  
  // 本文
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(options.title || 'テスト', width/2, titleY);
  
  ctx.restore();
  
  // サブタイトル
  if (options.subtitle) {
    ctx.save();
    const subFontSize = options.subSize || 36;
    const subFontFamily = options.subFont || 'MOBOFont';
    ctx.font = `bold ${subFontSize}px "${subFontFamily}"`;
    ctx.textAlign = 'center';
    
    const subY = titleY + 70;
    
    // 赤背景
    const textWidth = ctx.measureText(options.subtitle).width;
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(width/2 - textWidth/2 - 20, subY - 25, textWidth + 40, 50);
    
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 2;
    ctx.strokeRect(width/2 - textWidth/2 - 20, subY - 25, textWidth + 40, 50);
    
    // サブタイトル文字
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(options.subtitle, width/2, subY);
    
    ctx.restore();
  }
  
  // 価格
  if (options.price) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, height - 70, width, 70);
    
    const priceFontFamily = options.priceFont || 'CraftMincho';
    ctx.font = `bold 40px "${priceFontFamily}"`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(options.price, width/2, height - 25);
    ctx.restore();
  }
  
  // キラキラ
  for (let i = 0; i < 50; i++) {
    ctx.save();
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 3 + 1;
    
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI * 2);
    
    const sparkle = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    sparkle.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sparkle.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sparkle;
    ctx.fillRect(-size, -size, size*2, size*2);
    ctx.restore();
  }
  
  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'public', 'images', options.fileName), buffer);
  console.log(`✅ 生成完了: ${options.fileName}`);
}

// メイン実行
async function main() {
  console.log('🚀 最終フォントバナー生成開始\n');
  
  // 1. フォント登録
  const registeredFonts = registerAllFonts();
  
  // 2. フォントテスト画像生成
  await createFontTestBanner();
  
  // 3. ポケモンカード画像取得
  const pokemonDir = path.join(__dirname, 'public', 'images', 'pokemon');
  const cardFiles = fs.readdirSync(pokemonDir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .map(f => path.join(pokemonDir, f))
    .slice(0, 10);
  
  console.log(`\n🃏 カード画像: ${cardFiles.length}枚\n`);
  
  // 4. 各フォントでバナー生成
  const banners = [
    {
      title: 'デラゴシック激アツ',
      subtitle: 'PSA10確率UP!!',
      titleFont: 'DelaGothicOne',
      subFont: 'HiraKakuW9',
      priceFont: 'DelaGothicOne',
      price: '1回 1,500円',
      fileName: 'final-dela-gothic.png',
      bgColor1: '#FF0033',
      bgColor2: '#FF6B6B',
      bgColor3: '#8B0000'
    },
    {
      title: 'MOBOモダンオリパ',
      subtitle: 'スタイリッシュなレアカード',
      titleFont: 'MOBOFont',
      subFont: 'MOBOFont2',
      priceFont: 'MOBOFont3',
      price: '特価 2,000円',
      fileName: 'final-mobo-font.png',
      bgColor1: '#9370DB',
      bgColor2: '#FF69B4',
      bgColor3: '#4B0082'
    },
    {
      title: 'バナナ★ポップ',
      subtitle: 'かわいいレアカード満載♪',
      titleFont: 'BananaSlip',
      subFont: 'DelaGothicOne',
      priceFont: 'BananaSlip',
      price: '♪ 800円 ♪',
      fileName: 'final-banana-slip.png',
      bgColor1: '#FFD700',
      bgColor2: '#FFA500',
      bgColor3: '#FF6347'
    },
    {
      title: '匠の明朝オリパ',
      subtitle: '職人が選ぶ至高の一枚',
      titleFont: 'CraftMincho',
      subFont: 'CraftMincho2',
      priceFont: 'Kinkaku',
      price: '極上 3,000円',
      fileName: 'final-craft-mincho.png',
      bgColor1: '#8B0000',
      bgColor2: '#DC143C',
      bgColor3: '#2F4F4F'
    },
    {
      title: '金閣寺オリパ',
      subtitle: '和の心を込めた逸品',
      titleFont: 'Kinkaku',
      subFont: 'Kinkaku2',
      priceFont: 'CraftMincho',
      price: '雅 2,500円',
      titleSize: 56,
      fileName: 'final-kinkaku.png',
      bgColor1: '#FFD700',
      bgColor2: '#FF8C00',
      bgColor3: '#8B4513'
    }
  ];
  
  // バナー生成
  for (const banner of banners) {
    await createFinalBanner({
      ...banner,
      cardImages: cardFiles
    });
  }
  
  console.log('\n🎉 最終フォントバナー生成完了！');
  console.log('📁 保存先: public/images/');
  console.log('🔍 font-test-final.png でフォント確認可能');
}

// 実行
main().catch(console.error);