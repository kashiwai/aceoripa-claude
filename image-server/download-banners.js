const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// ダウンロード用ディレクトリを作成
const downloadDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// オリパサイト風バナー生成とダウンロード
function generateAndDownloadBanners() {
  const banners = [
    {
      name: 'pokemon-151-oripa',
      filename: 'ポケモンカード151オリパ.png',
      width: 400,
      height: 600,
      title: 'ポケモンカード151',
      subtitle: '1口100円〜',
      colors: ['#FF6B6B', '#FFE66D', '#4ECDC4'],
      category: 'pokemon'
    },
    {
      name: 'onepiece-summit-war',
      filename: 'ワンピース頂上決戦オリパ.png',
      width: 400,
      height: 600,
      title: 'ワンピース頂上決戦',
      subtitle: '1口500円〜',
      colors: ['#FF4757', '#FFA502', '#2F3542'],
      category: 'onepiece'
    },
    {
      name: 'yugioh-rarity',
      filename: '遊戯王レアコレオリパ.png',
      width: 400,
      height: 600,
      title: '遊戯王レアコレ',
      subtitle: '1口300円〜',
      colors: ['#5F27CD', '#00D2D3', '#FFD93D'],
      category: 'yugioh'
    },
    {
      name: 'main-campaign',
      filename: 'メインキャンペーンバナー.png',
      width: 375,
      height: 200,
      title: '超豪華オリパ',
      subtitle: 'SSR確率UP中!',
      colors: ['#8B5CF6', '#EC4899', '#F59E0B'],
      category: 'campaign'
    },
    {
      name: 'line-campaign',
      filename: 'LINE友達登録バナー.png',
      width: 375,
      height: 80,
      title: 'LINE友達登録で最大70%OFF',
      subtitle: 'クーポンGET!',
      colors: ['#00B900', '#00E000'],
      category: 'line'
    },
    {
      name: 'sns-winner-sample',
      filename: 'SNS当選報告サンプル.png',
      width: 200,
      height: 200,
      title: 'リザードンex',
      subtitle: '当選おめでとう！',
      colors: ['#1F2937', '#FFD700'],
      category: 'sns'
    }
  ];

  console.log('🎨 バナー画像生成開始...\n');

  banners.forEach((banner, index) => {
    console.log(`📸 ${index + 1}/${banners.length}: ${banner.filename} 生成中...`);
    
    const canvas = createCanvas(banner.width, banner.height);
    const ctx = canvas.getContext('2d');

    // カテゴリー別デザイン生成
    switch (banner.category) {
      case 'pokemon':
      case 'onepiece':
      case 'yugioh':
        generateCardPackBanner(ctx, banner);
        break;
      case 'campaign':
        generateCampaignBanner(ctx, banner);
        break;
      case 'line':
        generateLineBanner(ctx, banner);
        break;
      case 'sns':
        generateSNSBanner(ctx, banner);
        break;
    }

    // PNG形式で保存
    const buffer = canvas.toBuffer('image/png');
    const filePath = path.join(downloadDir, banner.filename);
    fs.writeFileSync(filePath, buffer);
    
    console.log(`✅ 保存完了: ${filePath}`);
  });

  // JPEG版も生成
  console.log('\n📷 JPEG版生成中...');
  
  banners.forEach((banner) => {
    const canvas = createCanvas(banner.width, banner.height);
    const ctx = canvas.getContext('2d');

    switch (banner.category) {
      case 'pokemon':
      case 'onepiece':
      case 'yugioh':
        generateCardPackBanner(ctx, banner);
        break;
      case 'campaign':
        generateCampaignBanner(ctx, banner);
        break;
      case 'line':
        generateLineBanner(ctx, banner);
        break;
      case 'sns':
        generateSNSBanner(ctx, banner);
        break;
    }

    const jpegFilename = banner.filename.replace('.png', '.jpg');
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
    const filePath = path.join(downloadDir, jpegFilename);
    fs.writeFileSync(filePath, buffer);
    
    console.log(`✅ JPEG保存: ${jpegFilename}`);
  });

  console.log('\n🎉 全てのバナー画像生成完了！');
  console.log(`📁 保存先: ${downloadDir}`);
  
  // ファイル一覧表示
  const files = fs.readdirSync(downloadDir);
  console.log('\n📋 生成されたファイル:');
  files.forEach(file => {
    const filePath = path.join(downloadDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`   ${file} (${sizeKB}KB)`);
  });
}

// カードパック風バナー生成
function generateCardPackBanner(ctx, banner) {
  const { width, height, colors, title, subtitle } = banner;

  // グラデーション背景
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // パターンオーバーレイ
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < width; i += 30) {
    ctx.fillRect(i, 0, 2, height);
  }
  for (let i = 0; i < height; i += 30) {
    ctx.fillRect(0, i, width, 2);
  }

  // 光沢エフェクト
  const glossGradient = ctx.createLinearGradient(0, 0, 0, height * 0.4);
  glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glossGradient;
  ctx.fillRect(0, 0, width, height * 0.4);

  // カードフレーム
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // 内側フレーム
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // キラキラエフェクト
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 4 + 1;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.7})`;
    ctx.fill();
  }

  // タイトル
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  ctx.fillText(title, width / 2, height / 2 - 30);

  // サブタイトル
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#FFFF00';
  ctx.fillText(subtitle, width / 2, height / 2 + 20);

  // 残り枚数表示
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(30, height - 80, width - 60, 50);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('残り 45/100 枚', width / 2, height - 55);
  
  // プログレスバー
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(40, height - 35, width - 80, 10);
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(40, height - 35, (width - 80) * 0.45, 10);

  // カテゴリーバッジ
  const badgeColors = {
    pokemon: '#FFD700',
    onepiece: '#FF6347',
    yugioh: '#9370DB'
  };
  
  ctx.fillStyle = badgeColors[banner.category] || '#666666';
  ctx.beginPath();
  ctx.arc(width - 50, 50, 30, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px sans-serif';
  const categoryText = {
    pokemon: 'ポケ',
    onepiece: 'OP',
    yugioh: '遊戯'
  };
  ctx.fillText(categoryText[banner.category] || 'NEW', width - 50, 50);
}

// キャンペーンバナー生成
function generateCampaignBanner(ctx, banner) {
  const { width, height, colors, title, subtitle } = banner;

  // グラデーション背景
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // キラキラエフェクト
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 3 + 1;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  }

  // タイトル
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  ctx.fillText(title, width / 2, height / 2 - 20);

  // サブタイトル
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#FFFF00';
  ctx.fillText(subtitle, width / 2, height / 2 + 30);
}

// LINE友達登録バナー生成
function generateLineBanner(ctx, banner) {
  const { width, height, colors } = banner;

  // グラデーション背景
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 波模様
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.7);
  for (let i = 0; i <= width; i += 10) {
    ctx.lineTo(i, height * 0.7 + Math.sin(i * 0.05) * 8);
  }
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fill();

  // LINEロゴ風アイコン
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(50, height / 2, 25, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = colors[0];
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('L', 50, height / 2);

  // テキスト
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('LINE友達登録で', 90, height / 2 - 12);
  
  ctx.fillStyle = '#FFFF00';
  ctx.font = 'bold 24px sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 5;
  ctx.fillText('最大70%OFF', 90, height / 2 + 15);

  // 矢印
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('▶▶', width - 20, height / 2);
}

// SNSバナー生成
function generateSNSBanner(ctx, banner) {
  const { width, height, title } = banner;

  // 背景
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(0, 0, width, height);

  // グラデーションオーバーレイ
  const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
  gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 枠線
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, width - 8, height - 8);

  // 紙吹雪
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F', '#BB8FCE'];
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.save();
    ctx.translate(Math.random() * width, Math.random() * height);
    ctx.rotate(Math.random() * Math.PI * 2);
    ctx.fillRect(-5, -2, 10, 4);
    ctx.restore();
  }

  // カード画像プレースホルダー
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(width/2 - 40, 30, 80, 80);
  
  // カードテキスト
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, width/2, 70);

  // 当選テキスト
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 18px sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 5;
  ctx.fillText('当選！', width/2, 130);

  // ユーザー名
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '12px sans-serif';
  ctx.fillText('@user123', width/2, 150);

  // タイムスタンプ
  ctx.fillStyle = '#999999';
  ctx.font = '10px sans-serif';
  ctx.fillText('5分前', width/2, 170);
}

// 実行
if (require.main === module) {
  generateAndDownloadBanners();
}

module.exports = { generateAndDownloadBanners };