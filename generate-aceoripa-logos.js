const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// カスタムフォントの登録
const fontDir = path.join(__dirname, 'public/images/font');
const fontFiles = [
  { file: 'Dela_Gothic_One/DelaGothicOne-Regular.ttf', family: 'DelaGothicOne' },
  { file: 'MOBO-Font11/MOBO-Bold.otf', family: 'MOBOFont' },
  { file: 'YDW_bananaslip_plus_240809/YDWbananaslipplus.otf', family: 'BananaSlip' },
  { file: 'craftmincho/craftmincho.otf', family: 'CraftMincho' },
  { file: 'kinkaku/Kinkakuji-Normal.otf', family: 'Kinkaku' }
];

// フォント登録
fontFiles.forEach(font => {
  try {
    const fontPath = path.join(fontDir, font.file);
    if (fs.existsSync(fontPath)) {
      registerFont(fontPath, { family: font.family });
      console.log(`✓ フォント登録成功: ${font.family}`);
    }
  } catch (err) {
    console.warn(`フォント登録エラー: ${font.family}`, err.message);
  }
});

// ディレクトリ作成
const createDirectories = () => {
  const dirs = [
    'public/images/logos'
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// パターン1: プレミアムゴールド（DOPA風）
const generatePremiumGoldLogo = () => {
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // 背景グラデーション（ダークゴールド）
  const bgGradient = ctx.createLinearGradient(0, 0, 800, 300);
  bgGradient.addColorStop(0, '#1a1a1a');
  bgGradient.addColorStop(0.5, '#2d2d2d');
  bgGradient.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 800, 300);

  // ゴールドフレーム
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(20, 20, 760, 260, 30);
  ctx.stroke();

  // インナーフレーム
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(35, 35, 730, 230, 20);
  ctx.stroke();

  // 中央ダイヤモンド
  ctx.save();
  ctx.translate(400, 150);
  ctx.rotate(Math.PI / 4);
  
  const diamondGradient = ctx.createLinearGradient(-40, -40, 40, 40);
  diamondGradient.addColorStop(0, '#FFD700');
  diamondGradient.addColorStop(0.5, '#FFFFFF');
  diamondGradient.addColorStop(1, '#FFD700');
  
  ctx.fillStyle = diamondGradient;
  ctx.fillRect(-40, -40, 80, 80);
  
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth = 3;
  ctx.strokeRect(-40, -40, 80, 80);
  ctx.restore();

  // ACEORIPAテキスト
  ctx.font = 'bold 72px "Kinkaku"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // テキストアウトライン（黒）
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.strokeText('ACEORIPA', 400, 150);

  // テキストグラデーション
  const textGradient = ctx.createLinearGradient(0, 100, 0, 200);
  textGradient.addColorStop(0, '#FFD700');
  textGradient.addColorStop(0.5, '#FFFFFF');
  textGradient.addColorStop(1, '#FFD700');
  
  ctx.fillStyle = textGradient;
  ctx.fillText('ACEORIPA', 400, 150);

  // サブタイトル
  ctx.font = 'bold 24px "MOBOFont"';
  ctx.fillStyle = '#FFFF00';
  ctx.fillText('Premium Oripa Experience', 400, 220);

  // キラキラエフェクト
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 300;
    const size = Math.random() * 3 + 1;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(0, -size * 2);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size * 2);
    ctx.lineTo(-size, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  return canvas.toBuffer('image/png');
};

// パターン2: モダンネオン（未来的）
const generateModernNeonLogo = () => {
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // 背景（ダークブルー）
  const bgGradient = ctx.createRadialGradient(400, 150, 0, 400, 150, 400);
  bgGradient.addColorStop(0, '#0a0a1a');
  bgGradient.addColorStop(1, '#000000');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 800, 300);

  // ネオングリッド背景
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 800; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 300);
    ctx.stroke();
  }
  for (let i = 0; i < 300; i += 50) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(800, i);
    ctx.stroke();
  }

  // ACEORIPAテキスト（ネオンエフェクト）
  ctx.font = 'bold 68px "BananaSlip"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // ネオングロー（外側）
  ctx.shadowColor = '#00FFFF';
  ctx.shadowBlur = 30;
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = 6;
  ctx.strokeText('ACEORIPA', 400, 150);

  // ネオングロー（中間）
  ctx.shadowBlur = 15;
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 4;
  ctx.strokeText('ACEORIPA', 400, 150);

  // テキスト本体
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('ACEORIPA', 400, 150);

  // サブタイトル（ネオンピンク）
  ctx.font = 'bold 20px "MOBOFont"';
  ctx.shadowColor = '#FF00FF';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#FF69B4';
  ctx.fillText('Next Generation Oripa Platform', 400, 210);

  // 回路パターン
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 80);
  ctx.lineTo(200, 80);
  ctx.lineTo(220, 100);
  ctx.lineTo(300, 100);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(500, 80);
  ctx.lineTo(600, 80);
  ctx.lineTo(620, 100);
  ctx.lineTo(700, 100);
  ctx.stroke();

  // ネオンドット
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 300;
    const size = Math.random() * 2 + 1;
    
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#00FFFF';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toBuffer('image/png');
};

// パターン3: レトロゲーム風
const generateRetroGameLogo = () => {
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // 背景（8bit風グラデーション）
  const colors = ['#FF0080', '#8000FF', '#0080FF', '#00FF80', '#FF8000'];
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(i * 160, 0, 160, 300);
  }

  // オーバーレイ
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, 800, 300);

  // ピクセルボーダー
  ctx.fillStyle = '#FFFFFF';
  for (let x = 0; x < 800; x += 20) {
    ctx.fillRect(x, 0, 10, 10);
    ctx.fillRect(x, 290, 10, 10);
  }
  for (let y = 0; y < 300; y += 20) {
    ctx.fillRect(0, y, 10, 10);
    ctx.fillRect(790, y, 10, 10);
  }

  // ACEORIPAテキスト（ピクセル風）
  ctx.font = 'bold 64px "DelaGothicOne"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 影効果（8bit風）
  ctx.fillStyle = '#000000';
  ctx.fillText('ACEORIPA', 405, 155);

  // メインテキスト
  const pixelGradient = ctx.createLinearGradient(0, 100, 0, 200);
  pixelGradient.addColorStop(0, '#FFFF00');
  pixelGradient.addColorStop(0.5, '#FF8000');
  pixelGradient.addColorStop(1, '#FF0000');
  
  ctx.fillStyle = pixelGradient;
  ctx.fillText('ACEORIPA', 400, 150);

  // アウトライン
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.strokeText('ACEORIPA', 400, 150);

  // サブタイトル
  ctx.font = 'bold 18px "MOBOFont"';
  ctx.fillStyle = '#FFFF00';
  ctx.fillText('RETRO GAMING ORIPA', 400, 210);

  // 8bitスター
  const starPositions = [
    {x: 150, y: 100}, {x: 650, y: 100}, 
    {x: 120, y: 200}, {x: 680, y: 200},
    {x: 200, y: 250}, {x: 600, y: 250}
  ];

  starPositions.forEach(pos => {
    ctx.fillStyle = '#FFFF00';
    // 8bit星の形
    ctx.fillRect(pos.x - 2, pos.y - 8, 4, 16);
    ctx.fillRect(pos.x - 8, pos.y - 2, 16, 4);
    ctx.fillRect(pos.x - 6, pos.y - 6, 4, 4);
    ctx.fillRect(pos.x + 2, pos.y - 6, 4, 4);
    ctx.fillRect(pos.x - 6, pos.y + 2, 4, 4);
    ctx.fillRect(pos.x + 2, pos.y + 2, 4, 4);
  });

  return canvas.toBuffer('image/png');
};

// パターン4: エレガント和風
const generateElegantWaLogo = () => {
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // 背景（和紙風グラデーション）
  const bgGradient = ctx.createLinearGradient(0, 0, 800, 300);
  bgGradient.addColorStop(0, '#f8f5f0');
  bgGradient.addColorStop(0.5, '#ffffff');
  bgGradient.addColorStop(1, '#f8f5f0');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 800, 300);

  // 桜の花びら模様
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 300;
    const size = Math.random() * 20 + 10;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI * 2);
    
    // 桜の花びら
    ctx.fillStyle = 'rgba(255, 182, 193, 0.3)';
    ctx.beginPath();
    for (let j = 0; j < 5; j++) {
      const angle = (j / 5) * Math.PI * 2;
      const petalX = Math.cos(angle) * size;
      const petalY = Math.sin(angle) * size;
      
      if (j === 0) {
        ctx.moveTo(petalX, petalY);
      } else {
        ctx.quadraticCurveTo(0, 0, petalX, petalY);
      }
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  // 円形フレーム（朱色）
  ctx.strokeStyle = '#CC0000';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(400, 150, 120, 0, Math.PI * 2);
  ctx.stroke();

  // 内側の円
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(400, 150, 100, 0, Math.PI * 2);
  ctx.stroke();

  // ACEORIPAテキスト（書道風）
  ctx.font = 'bold 54px "CraftMincho"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // テキスト影
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillText('ACEORIPA', 403, 153);

  // メインテキスト
  const waGradient = ctx.createLinearGradient(0, 120, 0, 180);
  waGradient.addColorStop(0, '#8B0000');
  waGradient.addColorStop(0.5, '#CC0000');
  waGradient.addColorStop(1, '#8B0000');
  
  ctx.fillStyle = waGradient;
  ctx.fillText('ACEORIPA', 400, 150);

  // サブタイトル（漢字）
  ctx.font = 'bold 24px "CraftMincho"';
  ctx.fillStyle = '#8B0000';
  ctx.fillText('極上オリパ体験', 400, 210);

  // 英語サブタイトル
  ctx.font = 'bold 16px "MOBOFont"';
  ctx.fillStyle = '#666666';
  ctx.fillText('Authentic Japanese Oripa', 400, 240);

  // 和風装飾線
  ctx.strokeStyle = '#CC0000';
  ctx.lineWidth = 2;
  
  // 左側装飾
  ctx.beginPath();
  ctx.moveTo(50, 140);
  ctx.quadraticCurveTo(100, 120, 150, 140);
  ctx.quadraticCurveTo(100, 160, 50, 140);
  ctx.stroke();

  // 右側装飾
  ctx.beginPath();
  ctx.moveTo(650, 140);
  ctx.quadraticCurveTo(700, 120, 750, 140);
  ctx.quadraticCurveTo(700, 160, 650, 140);
  ctx.stroke();

  // 印鑑風マーク
  ctx.save();
  ctx.translate(700, 80);
  ctx.fillStyle = '#CC0000';
  ctx.beginPath();
  ctx.arc(0, 0, 25, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.font = 'bold 16px "CraftMincho"';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('極', 0, 6);
  ctx.restore();

  return canvas.toBuffer('image/png');
};

// メイン実行
const main = async () => {
  createDirectories();

  console.log('aceoripaロゴを4パターン生成中...');

  // パターン1: プレミアムゴールド
  console.log('1. プレミアムゴールドロゴを生成中...');
  fs.writeFileSync(
    'public/images/logos/aceoripa-premium-gold.png',
    generatePremiumGoldLogo()
  );

  // パターン2: モダンネオン
  console.log('2. モダンネオンロゴを生成中...');
  fs.writeFileSync(
    'public/images/logos/aceoripa-modern-neon.png',
    generateModernNeonLogo()
  );

  // パターン3: レトロゲーム
  console.log('3. レトロゲームロゴを生成中...');
  fs.writeFileSync(
    'public/images/logos/aceoripa-retro-game.png',
    generateRetroGameLogo()
  );

  // パターン4: エレガント和風
  console.log('4. エレガント和風ロゴを生成中...');
  fs.writeFileSync(
    'public/images/logos/aceoripa-elegant-wa.png',
    generateElegantWaLogo()
  );

  console.log('\n✅ aceoripaロゴ4パターンの生成が完了しました！');
  console.log('生成されたファイル:');
  console.log('- public/images/logos/aceoripa-premium-gold.png (DOPA風プレミアムゴールド)');
  console.log('- public/images/logos/aceoripa-modern-neon.png (未来的ネオン)');
  console.log('- public/images/logos/aceoripa-retro-game.png (レトロゲーム風)');
  console.log('- public/images/logos/aceoripa-elegant-wa.png (エレガント和風)');
};

main().catch(console.error);