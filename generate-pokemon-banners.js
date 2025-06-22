const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// ポケモンカードを使ったDOPAバナー生成
async function createPokemonDOPABanner(title, subtitle, fileName, options = {}) {
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // DOPA風背景
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

  // キラキラ効果
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 4 + 2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI * 2);
    
    const starGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    starGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    starGrad.addColorStop(0.3, 'rgba(255, 255, 0, 0.8)');
    starGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = starGrad;
    
    // 星型
    ctx.beginPath();
    for (let j = 0; j < 5; j++) {
      const angle = (j * Math.PI * 2) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      
      const innerAngle = angle + Math.PI / 5;
      const innerX = Math.cos(innerAngle) * (size * 0.5);
      const innerY = Math.sin(innerAngle) * (size * 0.5);
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ポケモンカード画像を配置
  if (options.cardImages && options.cardImages.length > 0) {
    // 最大3枚のカードを表示
    const cardsToShow = options.cardImages.slice(0, 3);
    
    for (let i = 0; i < cardsToShow.length; i++) {
      try {
        const cardImage = await loadImage(cardsToShow[i]);
        
        ctx.save();
        
        // カード配置パターン
        const positions = [
          { x: width * 0.7, y: height * 0.5, rotation: -0.15, scale: 0.85 },  // メインカード
          { x: width * 0.78, y: height * 0.45, rotation: 0.1, scale: 0.75 },   // 右上
          { x: width * 0.62, y: height * 0.55, rotation: -0.2, scale: 0.7 }    // 左下
        ];
        
        const pos = positions[i];
        ctx.translate(pos.x, pos.y);
        ctx.rotate(pos.rotation);
        
        // カード影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;
        
        // カードサイズ（ポケモンカードの比率）
        const cardHeight = 280 * pos.scale;
        const cardWidth = 200 * pos.scale;
        
        // カード描画
        ctx.drawImage(cardImage, -cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // ホログラム効果
        ctx.shadowColor = 'transparent';
        const holoGrad = ctx.createLinearGradient(-cardWidth/2, -cardHeight/2, cardWidth/2, cardHeight/2);
        holoGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        holoGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.4)');
        holoGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.2)');
        holoGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.3)');
        holoGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = holoGrad;
        ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // 金枠
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        ctx.restore();
      } catch (err) {
        console.error(`カード画像読み込みエラー: ${cardsToShow[i]}`, err);
      }
    }
  }

  // テキストエリア背景
  ctx.save();
  const textBg = ctx.createLinearGradient(0, 0, width * 0.5, 0);
  textBg.addColorStop(0, 'rgba(0, 0, 0, 0)');
  textBg.addColorStop(0.3, 'rgba(0, 0, 0, 0.7)');
  textBg.addColorStop(0.7, 'rgba(0, 0, 0, 0.7)');
  textBg.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = textBg;
  ctx.fillRect(0, height * 0.3, width * 0.5, height * 0.4);
  ctx.restore();

  // メインタイトル
  ctx.font = 'bold 64px "Hiragino Sans", "Arial Black", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  
  const textX = width * 0.05;
  const textY = height * 0.45;
  
  // 多重影
  for (let i = 8; i > 0; i--) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.6 - i * 0.05})`;
    ctx.fillText(title, textX + i * 2, textY + i * 2);
  }
  
  // 金縁取り
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 8;
  ctx.strokeText(title, textX, textY);
  
  // 黒縁取り
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeText(title, textX, textY);
  
  // 白文字
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(title, textX, textY);

  // サブタイトル
  ctx.font = 'bold 42px "Hiragino Sans", sans-serif';
  
  // ネオングロー
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#FFD700';
  ctx.fillText(subtitle, textX, textY + 60);
  ctx.shadowColor = 'transparent';

  // バッジ
  if (options.badge) {
    ctx.save();
    ctx.translate(width - 100, 70);
    ctx.rotate(0.1);
    
    // バッジ背景
    const badgeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
    badgeGrad.addColorStop(0, '#FFD700');
    badgeGrad.addColorStop(0.5, '#FFA500');
    badgeGrad.addColorStop(1, '#FF6347');
    
    ctx.fillStyle = badgeGrad;
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      const radius = i % 2 === 0 ? 45 : 35;
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#FF0033';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // バッジテキスト
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#FF0033';
    ctx.lineWidth = 4;
    ctx.strokeText(options.badge, 0, 0);
    ctx.fillText(options.badge, 0, 0);
    
    ctx.restore();
  }

  // ボトムバー
  const bottomGrad = ctx.createLinearGradient(0, height - 70, 0, height);
  bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
  bottomGrad.addColorStop(1, '#000000');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, height - 70, width, 70);
  
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height - 70);
  ctx.lineTo(width, height - 70);
  ctx.stroke();
  
  if (options.price) {
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(options.price, width / 2, height - 25);
  }

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'public', 'images', fileName), buffer);
  console.log(`✅ 生成完了: ${fileName}`);
}

// ポケモンフォルダから画像を読み込んでバナー生成
async function generatePokemonBanners() {
  console.log('🎨 ポケモンカード画像を使ったバナー生成開始...\n');
  
  const pokemonDir = path.join(__dirname, 'public', 'images', 'pokemon');
  
  // pokemonフォルダの存在確認
  if (!fs.existsSync(pokemonDir)) {
    console.log('⚠️  public/images/pokemon フォルダが見つかりません');
    console.log('📁 フォルダを作成しました:', pokemonDir);
    fs.mkdirSync(pokemonDir, { recursive: true });
    console.log('\n💡 使い方:');
    console.log('1. public/images/pokemon/ フォルダにポケモンカード画像を入れてください');
    console.log('2. 対応形式: .png, .jpg, .jpeg');
    console.log('3. このスクリプトを再実行してください\n');
    return;
  }
  
  // 画像ファイルを取得
  const cardFiles = fs.readdirSync(pokemonDir)
    .filter(file => /\.(png|jpg|jpeg)$/i.test(file))
    .map(file => path.join(pokemonDir, file));
  
  if (cardFiles.length === 0) {
    console.log('⚠️  public/images/pokemon フォルダに画像がありません');
    console.log('\n💡 使い方:');
    console.log('1. public/images/pokemon/ フォルダにポケモンカード画像を入れてください');
    console.log('2. 対応形式: .png, .jpg, .jpeg');
    console.log('3. このスクリプトを再実行してください\n');
    return;
  }
  
  console.log(`📷 ${cardFiles.length}枚のカード画像を検出しました\n`);
  
  // バナー1: ポケモンカード151
  await createPokemonDOPABanner(
    'ポケモンカード151',
    'リザードンex確率UP!',
    'pokemon-151-real.png',
    {
      cardImages: cardFiles,
      badge: '激アツ',
      price: '⚡ 1回 800円 ⚡'
    }
  );
  
  // バナー2: シャイニートレジャー
  await createPokemonDOPABanner(
    'シャイニートレジャー',
    'SSR確定オリパ',
    'shiny-treasure-real.png',
    {
      cardImages: cardFiles.reverse(), // 逆順で別の組み合わせ
      badge: 'SSR確定',
      price: '★ 1回 1,200円 ★'
    }
  );
  
  // バナー3: スペシャルBOX
  await createPokemonDOPABanner(
    'スペシャルBOX',
    '限定カード封入!',
    'special-box-real.png',
    {
      cardImages: cardFiles.sort(() => Math.random() - 0.5), // ランダム
      badge: 'NEW',
      price: '🎁 1回 2,000円 🎁'
    }
  );
  
  console.log('\n🎉 ポケモンカードバナー生成完了！');
  console.log('📁 保存先: public/images/');
}

// 実行
generatePokemonBanners().catch(console.error);