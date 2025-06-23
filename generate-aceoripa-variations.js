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

// バリエーション1: カードゲーム風（Yu-Gi-Oh/Pokemon風）
const generateCardGameLogo = () => {
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // 背景（カードゲーム風）
  const bgGradient = ctx.createRadialGradient(400, 150, 0, 400, 150, 400);
  bgGradient.addColorStop(0, '#4A90E2');
  bgGradient.addColorStop(0.5, '#1C3A5B');
  bgGradient.addColorStop(1, '#0A1A2A');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 800, 300);

  // エネルギーカードフレーム
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(40, 40, 720, 220, 25);
  ctx.stroke();

  // インナーフレーム
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(55, 55, 690, 190, 20);
  ctx.stroke();

  // カードパック要素（左右に配置）
  for (let side = 0; side < 2; side++) {
    const x = side === 0 ? 120 : 680;
    
    // カードパック
    ctx.save();
    ctx.translate(x, 150);
    
    const packGradient = ctx.createLinearGradient(-30, -60, 30, 60);
    packGradient.addColorStop(0, '#FF6B6B');
    packGradient.addColorStop(0.5, '#FFD93D');
    packGradient.addColorStop(1, '#4ECDC4');
    
    ctx.fillStyle = packGradient;
    ctx.fillRect(-30, -60, 60, 120);
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(-30, -60, 60, 120);
    
    // カードが飛び出すエフェクト
    for (let i = 0; i < 3; i++) {
      const cardX = -10 + i * 5;
      const cardY = -40 + i * 10;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(cardX, cardY, 20, 30);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(cardX, cardY, 20, 30);
    }
    
    ctx.restore();
  }

  // ACEORIPAテキスト
  ctx.font = 'bold 68px "DelaGothicOne"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // テキスト影
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillText('ACEORIPA', 403, 153);

  // メインテキスト
  const textGradient = ctx.createLinearGradient(0, 120, 0, 180);
  textGradient.addColorStop(0, '#FFD700');
  textGradient.addColorStop(0.5, '#FFFFFF');
  textGradient.addColorStop(1, '#4ECDC4');
  
  ctx.fillStyle = textGradient;
  ctx.fillText('ACEORIPA', 400, 150);

  // アウトライン
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeText('ACEORIPA', 400, 150);

  // サブタイトル
  ctx.font = 'bold 24px "MOBOFont"';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('Trading Card Collection', 400, 200);

  // きらめきエフェクト
  for (let i = 0; i < 20; i++) {
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

// バリエーション2: ガチャ風（アイドル・ソシャゲ風）
const generateGachaIdolLogo = () => {
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // 背景（アイドル風グラデーション）
  const bgGradient = ctx.createLinearGradient(0, 0, 800, 300);
  bgGradient.addColorStop(0, '#FF69B4');
  bgGradient.addColorStop(0.25, '#FF1493');
  bgGradient.addColorStop(0.5, '#DA70D6');
  bgGradient.addColorStop(0.75, '#9370DB');
  bgGradient.addColorStop(1, '#4B0082');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 800, 300);

  // ハート背景パターン
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 300;
    const size = Math.random() * 20 + 10;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    
    // ハート形
    ctx.beginPath();
    ctx.moveTo(0, size * 0.3);
    ctx.bezierCurveTo(-size * 0.5, -size * 0.2, -size, size * 0.2, 0, size);
    ctx.bezierCurveTo(size, size * 0.2, size * 0.5, -size * 0.2, 0, size * 0.3);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  // リボンフレーム
  ctx.save();
  ctx.translate(400, 150);
  
  // リボン背景
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 350, 80, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // リボンの結び目
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(-320, 0, 40, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(320, 0, 40, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();

  // ACEORIPAテキスト（キュート風）
  ctx.font = 'bold 58px "BananaSlip"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // テキスト影
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillText('ACEORIPA', 402, 152);

  // メインテキスト
  const cuteGradient = ctx.createLinearGradient(0, 120, 0, 180);
  cuteGradient.addColorStop(0, '#FF1493');
  cuteGradient.addColorStop(0.5, '#FFB6C1');
  cuteGradient.addColorStop(1, '#FF69B4');
  
  ctx.fillStyle = cuteGradient;
  ctx.fillText('ACEORIPA', 400, 150);

  // キラキラアウトライン
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.strokeText('ACEORIPA', 400, 150);

  // サブタイトル
  ctx.font = 'bold 20px "MOBOFont"';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Kawaii Card Collection ♪', 400, 200);

  // キラキラエフェクト
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 300;
    const size = Math.random() * 4 + 2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.3, -size * 0.3);
    ctx.lineTo(size, 0);
    ctx.lineTo(size * 0.3, size * 0.3);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.3, size * 0.3);
    ctx.lineTo(-size, 0);
    ctx.lineTo(-size * 0.3, -size * 0.3);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  return canvas.toBuffer('image/png');
};

// バリエーション3: エスポーツ風
const generateEsportsLogo = () => {
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // 背景（エスポーツ風）
  const bgGradient = ctx.createLinearGradient(0, 0, 800, 300);
  bgGradient.addColorStop(0, '#000428');
  bgGradient.addColorStop(1, '#004e92');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 800, 300);

  // テック背景パターン
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  
  // 回路パターン
  for (let i = 0; i < 10; i++) {
    const startX = Math.random() * 800;
    const startY = Math.random() * 300;
    const endX = Math.random() * 800;
    const endY = Math.random() * 300;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  // エンブレムフレーム
  ctx.save();
  ctx.translate(400, 150);
  
  // 六角形フレーム
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * 120;
    const y = Math.sin(angle) * 120;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
  
  // 内側の円
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 90, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.restore();

  // ACEORIPAテキスト（エスポーツ風）
  ctx.font = 'bold 62px "DelaGothicOne"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // ネオングロー効果
  ctx.shadowColor = '#00FFFF';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = 4;
  ctx.strokeText('ACEORIPA', 400, 150);

  ctx.shadowBlur = 10;
  ctx.strokeStyle = '#0080FF';
  ctx.lineWidth = 2;
  ctx.strokeText('ACEORIPA', 400, 150);

  // メインテキスト
  ctx.shadowBlur = 0;
  const esportsGradient = ctx.createLinearGradient(0, 120, 0, 180);
  esportsGradient.addColorStop(0, '#FFFFFF');
  esportsGradient.addColorStop(0.5, '#00FFFF');
  esportsGradient.addColorStop(1, '#0080FF');
  
  ctx.fillStyle = esportsGradient;
  ctx.fillText('ACEORIPA', 400, 150);

  // サブタイトル
  ctx.font = 'bold 22px "MOBOFont"';
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 5;
  ctx.fillStyle = '#FFD700';
  ctx.fillText('COMPETITIVE CARD ARENA', 400, 200);

  // エネルギーパーティクル
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 300;
    const size = Math.random() * 2 + 1;
    
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 3;
    ctx.fillStyle = '#00FFFF';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toBuffer('image/png');
};

// バリエーション4: シンプルモダン風
const generateSimpleModernLogo = () => {
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // 背景（シンプルグラデーション）
  const bgGradient = ctx.createLinearGradient(0, 0, 800, 0);
  bgGradient.addColorStop(0, '#667eea');
  bgGradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 800, 300);

  // 幾何学パターン
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(150 + i * 125, 150, 40 + i * 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  // モダンフレーム
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(100, 80, 600, 140, 10);
  ctx.stroke();

  // ACEORIPAテキスト（モダン風）
  ctx.font = 'bold 64px "MOBOFont"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // テキスト影
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillText('ACEORIPA', 402, 152);

  // メインテキスト
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('ACEORIPA', 400, 150);

  // サブタイトル
  ctx.font = 'bold 18px "MOBOFont"';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('Premium Digital Card Experience', 400, 190);

  // ミニマルアクセント
  const accentPositions = [
    {x: 120, y: 120}, {x: 680, y: 120},
    {x: 120, y: 180}, {x: 680, y: 180}
  ];

  accentPositions.forEach(pos => {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  return canvas.toBuffer('image/png');
};

// メイン実行
const main = async () => {
  const logoDir = 'public/images/logos';
  if (!fs.existsSync(logoDir)) {
    fs.mkdirSync(logoDir, { recursive: true });
  }

  console.log('aceoripaロゴバリエーションを4パターン生成中...');

  // バリエーション1: カードゲーム風
  console.log('1. カードゲーム風ロゴを生成中...');
  fs.writeFileSync(
    'public/images/logos/aceoripa-card-game.png',
    generateCardGameLogo()
  );

  // バリエーション2: ガチャアイドル風
  console.log('2. ガチャアイドル風ロゴを生成中...');
  fs.writeFileSync(
    'public/images/logos/aceoripa-gacha-idol.png',
    generateGachaIdolLogo()
  );

  // バリエーション3: エスポーツ風
  console.log('3. エスポーツ風ロゴを生成中...');
  fs.writeFileSync(
    'public/images/logos/aceoripa-esports.png',
    generateEsportsLogo()
  );

  // バリエーション4: シンプルモダン風
  console.log('4. シンプルモダン風ロゴを生成中...');
  fs.writeFileSync(
    'public/images/logos/aceoripa-simple-modern.png',
    generateSimpleModernLogo()
  );

  console.log('\n✅ aceoripaロゴバリエーション4パターンの生成が完了しました！');
  console.log('生成されたファイル:');
  console.log('- public/images/logos/aceoripa-card-game.png (カードゲーム風)');
  console.log('- public/images/logos/aceoripa-gacha-idol.png (ガチャアイドル風)');
  console.log('- public/images/logos/aceoripa-esports.png (エスポーツ風)');
  console.log('- public/images/logos/aceoripa-simple-modern.png (シンプルモダン風)');
};

main().catch(console.error);