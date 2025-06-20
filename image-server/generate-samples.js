const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 出力ディレクトリを作成
const outputDir = path.join(__dirname, 'sample-banners');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// オリパサイト風バナー生成
function generateOripaStyleBanners() {
  const banners = [
    {
      name: 'pokemon-151-oripa',
      width: 400,
      height: 600,
      title: 'ポケモンカード151',
      subtitle: '1口100円〜',
      colors: ['#FF6B6B', '#FFE66D', '#4ECDC4'],
      category: 'pokemon'
    },
    {
      name: 'onepiece-summit-war',
      width: 400,
      height: 600,
      title: 'ワンピース頂上決戦',
      subtitle: '1口500円〜',
      colors: ['#FF4757', '#FFA502', '#2F3542'],
      category: 'onepiece'
    },
    {
      name: 'yugioh-rarity',
      width: 400,
      height: 600,
      title: '遊戯王レアコレ',
      subtitle: '1口300円〜',
      colors: ['#5F27CD', '#00D2D3', '#FFD93D'],
      category: 'yugioh'
    },
    {
      name: 'main-campaign',
      width: 375,
      height: 200,
      title: '超豪華オリパ',
      subtitle: 'SSR確率UP中!',
      colors: ['#8B5CF6', '#EC4899', '#F59E0B'],
      category: 'campaign'
    }
  ];

  banners.forEach(banner => {
    const canvas = createCanvas(banner.width, banner.height);
    const ctx = canvas.getContext('2d');

    // グラデーション背景
    const gradient = ctx.createLinearGradient(0, 0, banner.width, banner.height);
    banner.colors.forEach((color, index) => {
      gradient.addColorStop(index / (banner.colors.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, banner.width, banner.height);

    // オーバーレイパターン
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < banner.width; i += 20) {
      ctx.fillRect(i, 0, 1, banner.height);
    }
    for (let i = 0; i < banner.height; i += 20) {
      ctx.fillRect(0, i, banner.width, 1);
    }

    // カードパック風の装飾（縦長バナーの場合）
    if (banner.height > banner.width) {
      // 上部の光沢エフェクト
      const glossGradient = ctx.createLinearGradient(0, 0, 0, banner.height * 0.3);
      glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glossGradient;
      ctx.fillRect(0, 0, banner.width, banner.height * 0.3);

      // カードフレーム
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, banner.width - 40, banner.height - 40);
    }

    // キラキラエフェクト
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * banner.width;
      const y = Math.random() * banner.height;
      const size = Math.random() * 3 + 1;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.5})`;
      ctx.fill();
    }

    // タイトルテキスト
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${banner.height > banner.width ? 40 : 30}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // テキストシャドウ
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    ctx.fillText(banner.title, banner.width / 2, banner.height / 2 - 20);

    // サブタイトル
    ctx.font = `bold ${banner.height > banner.width ? 24 : 18}px sans-serif`;
    ctx.fillStyle = '#FFFF00';
    ctx.fillText(banner.subtitle, banner.width / 2, banner.height / 2 + 20);

    // 残り枚数表示（縦長バナーの場合）
    if (banner.height > banner.width) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(20, banner.height - 80, banner.width - 40, 60);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('残り 45/100 枚', banner.width / 2, banner.height - 50);
      
      // プログレスバー
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(30, banner.height - 30, banner.width - 60, 10);
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(30, banner.height - 30, (banner.width - 60) * 0.45, 10);
    }

    // カテゴリーバッジ
    const badgeColors = {
      pokemon: '#FFD700',
      onepiece: '#FF6347',
      yugioh: '#9370DB',
      campaign: '#FF1493'
    };
    
    ctx.fillStyle = badgeColors[banner.category] || '#666666';
    ctx.beginPath();
    ctx.arc(banner.width - 40, 40, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    const categoryText = {
      pokemon: 'ポケ',
      onepiece: 'OP',
      yugioh: '遊戯',
      campaign: 'HOT'
    };
    ctx.fillText(categoryText[banner.category] || 'NEW', banner.width - 40, 40);

    // ファイル保存
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(outputDir, `${banner.name}.png`), buffer);
    console.log(`Generated: ${banner.name}.png`);
  });
}

// LINE友達登録バナー
function generateLineBanner() {
  const canvas = createCanvas(375, 80);
  const ctx = canvas.getContext('2d');

  // グラデーション背景
  const gradient = ctx.createLinearGradient(0, 0, 375, 0);
  gradient.addColorStop(0, '#00B900');
  gradient.addColorStop(1, '#00E000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 375, 80);

  // 波模様
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.moveTo(0, 60);
  for (let i = 0; i <= 375; i += 10) {
    ctx.lineTo(i, 60 + Math.sin(i * 0.05) * 10);
  }
  ctx.lineTo(375, 80);
  ctx.lineTo(0, 80);
  ctx.fill();

  // LINEロゴ風アイコン
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(40, 40, 25, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#00B900';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('L', 40, 40);

  // テキスト
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('LINE友達登録で', 80, 30);
  
  ctx.fillStyle = '#FFFF00';
  ctx.font = 'bold 24px sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 5;
  ctx.fillText('最大70%OFF', 80, 55);

  // 矢印アニメーション風
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('▶▶', 355, 40);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'line-campaign.png'), buffer);
  console.log('Generated: line-campaign.png');
}

// SNS当選報告セクション
function generateSnsWinnerBanner() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(0, 0, 200, 200);

  // グラデーションオーバーレイ
  const gradient = ctx.createRadialGradient(100, 100, 0, 100, 100, 100);
  gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 200, 200);

  // 枠線
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 196, 196);

  // 紙吹雪
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F', '#BB8FCE'];
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.save();
    ctx.translate(Math.random() * 200, Math.random() * 200);
    ctx.rotate(Math.random() * Math.PI * 2);
    ctx.fillRect(-5, -2, 10, 4);
    ctx.restore();
  }

  // カード画像プレースホルダー
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(50, 30, 100, 100);
  
  // カードテキスト
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('リザードンex', 100, 85);

  // 当選テキスト
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 18px sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 5;
  ctx.fillText('当選！', 100, 150);

  // ユーザー名
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '12px sans-serif';
  ctx.fillText('@user123', 100, 170);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'sns-winner-sample.png'), buffer);
  console.log('Generated: sns-winner-sample.png');
}

// 実行
console.log('Generating ORIPA style banners...');
generateOripaStyleBanners();
generateLineBanner();
generateSnsWinnerBanner();
console.log('All banners generated successfully!');