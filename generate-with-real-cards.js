const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// リアルカード画像を使ったDOPAバナー生成
async function createDOPABannerWithRealCards(title, subtitle, fileName, options = {}) {
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景（既存のゴテゴテ背景）
  const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
  bgGradient.addColorStop(0, '#FF6B6B');
  bgGradient.addColorStop(0.3, '#FF3366');
  bgGradient.addColorStop(0.6, '#FF0033');
  bgGradient.addColorStop(1, '#CC0033');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 爆発エフェクト
  ctx.save();
  ctx.translate(width / 2, height / 2);
  for (let i = 0; i < 36; i++) {
    ctx.rotate((Math.PI * 2) / 36);
    const gradient = ctx.createLinearGradient(0, 0, 300, 0);
    gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, -3, 300, 6);
  }
  ctx.restore();

  // リアルカード画像を配置
  if (options.cardImages && options.cardImages.length > 0) {
    for (let i = 0; i < options.cardImages.length && i < 3; i++) {
      try {
        const cardImage = await loadImage(options.cardImages[i]);
        
        ctx.save();
        // カードの配置位置を計算
        const positions = [
          { x: width * 0.7, y: height * 0.5, rotation: -0.2, scale: 0.8 },
          { x: width * 0.75, y: height * 0.45, rotation: 0.1, scale: 0.7 },
          { x: width * 0.65, y: height * 0.55, rotation: -0.1, scale: 0.6 }
        ];
        
        const pos = positions[i];
        ctx.translate(pos.x, pos.y);
        ctx.rotate(pos.rotation);
        ctx.scale(pos.scale, pos.scale);
        
        // カード影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;
        
        // カード画像を描画
        const cardWidth = 200;
        const cardHeight = 280;
        ctx.drawImage(cardImage, -cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // カード枠のキラキラ効果
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.strokeRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // ホログラム効果
        const holoGrad = ctx.createLinearGradient(-cardWidth/2, -cardHeight/2, cardWidth/2, cardHeight/2);
        holoGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        holoGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        holoGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = holoGrad;
        ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        ctx.restore();
      } catch (err) {
        console.error(`カード画像読み込みエラー: ${options.cardImages[i]}`, err);
      }
    }
  }

  // キャラクター画像を配置
  if (options.characterImage) {
    try {
      const charImage = await loadImage(options.characterImage);
      
      ctx.save();
      ctx.translate(width * 0.25, height * 0.5);
      
      // キャラクター画像を描画
      const charHeight = height * 0.8;
      const charWidth = (charImage.width / charImage.height) * charHeight;
      
      // グロー効果
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 30;
      ctx.drawImage(charImage, -charWidth/2, -charHeight/2, charWidth, charHeight);
      
      ctx.restore();
    } catch (err) {
      console.error(`キャラクター画像読み込みエラー: ${options.characterImage}`, err);
    }
  }

  // テキスト（既存のスタイル）
  ctx.font = 'bold 72px "Hiragino Sans", "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // テキスト配置を調整（画像と重ならないように）
  const textY = options.characterImage ? height * 0.2 : height * 0.4;
  
  // 多重影
  for (let i = 8; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.5 - i * 0.05})`;
    ctx.fillText(title, width / 2 + i * 2, textY + i * 2);
  }
  
  // 縁取り
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 8;
  ctx.strokeText(title, width / 2, textY);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(title, width / 2, textY);

  // サブタイトル
  ctx.font = 'bold 48px "Hiragino Sans", sans-serif';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 6;
  ctx.strokeText(subtitle, width / 2, textY + 80);
  
  ctx.fillStyle = '#FFD700';
  ctx.fillText(subtitle, width / 2, textY + 80);

  // 画像保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'public', 'images', fileName), buffer);
  console.log(`✅ 生成完了: ${fileName}`);
}

// 使用例
async function generateExamples() {
  console.log('🎨 リアルカード画像を使ったバナー生成例\n');

  // 例1: カード画像3枚を使用
  await createDOPABannerWithRealCards(
    'ポケモンカード151',
    'リザードンex確率UP!',
    'example-with-cards.png',
    {
      cardImages: [
        '/path/to/charizard-card.png',  // ここにリアルカード画像のパスを指定
        '/path/to/pikachu-card.png',
        '/path/to/mewtwo-card.png'
      ]
    }
  );

  // 例2: キャラクター画像も追加
  await createDOPABannerWithRealCards(
    'ワンピース頂上決戦',
    'ルフィSEC確定!?',
    'example-with-character.png',
    {
      cardImages: [
        '/path/to/luffy-card.png',
        '/path/to/zoro-card.png'
      ],
      characterImage: '/path/to/luffy-character.png'  // キャラクター画像
    }
  );

  console.log('\n💡 使い方:');
  console.log('1. cardImages配列にカード画像のパスを指定');
  console.log('2. characterImageにキャラクター画像のパスを指定');
  console.log('3. 画像は自動的に配置・サイズ調整されます');
}

// カード画像フォルダから自動読み込みする例
async function generateFromCardFolder() {
  const cardsDir = path.join(__dirname, 'public', 'images', 'cards');
  
  if (fs.existsSync(cardsDir)) {
    const cardFiles = fs.readdirSync(cardsDir)
      .filter(file => file.endsWith('.png') || file.endsWith('.jpg'))
      .map(file => path.join(cardsDir, file));
    
    if (cardFiles.length > 0) {
      await createDOPABannerWithRealCards(
        'SSR確定オリパ',
        '豪華カード大放出!',
        'auto-generated-banner.png',
        {
          cardImages: cardFiles.slice(0, 3)  // 最初の3枚を使用
        }
      );
    }
  }
}

// 実行
generateExamples().catch(console.error);