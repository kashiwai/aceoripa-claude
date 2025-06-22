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

// オンラインゲーム風ロゴ（MMO/RPG風）
const generateOnlineGameLogo = () => {
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // 背景（ファンタジー風グラデーション）
  const bgGradient = ctx.createRadialGradient(400, 150, 0, 400, 150, 400);
  bgGradient.addColorStop(0, '#1a1a2e');
  bgGradient.addColorStop(0.5, '#16213e');
  bgGradient.addColorStop(1, '#0f1419');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 800, 300);

  // 魔法陣背景
  ctx.save();
  ctx.translate(400, 150);
  ctx.strokeStyle = 'rgba(138, 43, 226, 0.3)';
  ctx.lineWidth = 2;
  
  // 外側の魔法陣
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, 80 + i * 30, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // 魔法陣の星形
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((i / 6) * Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(0, -120);
    ctx.lineTo(0, 120);
    ctx.stroke();
    ctx.restore();
  }
  
  ctx.restore();

  // タイトル背景プレート
  const plateGradient = ctx.createLinearGradient(0, 100, 0, 200);
  plateGradient.addColorStop(0, 'rgba(255, 215, 0, 0.2)');
  plateGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
  plateGradient.addColorStop(1, 'rgba(255, 215, 0, 0.2)');
  
  ctx.fillStyle = plateGradient;
  ctx.beginPath();
  ctx.roundRect(50, 110, 700, 80, 20);
  ctx.fill();

  // プレート枠
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(50, 110, 700, 80, 20);
  ctx.stroke();

  // ACEORIPAテキスト（RPG風）
  ctx.font = 'bold 58px "Kinkaku"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 多重影効果
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillText('ACEORIPA', 405, 155);
  ctx.fillText('ACEORIPA', 402, 152);

  // メタリック効果
  const metalGradient = ctx.createLinearGradient(0, 120, 0, 180);
  metalGradient.addColorStop(0, '#FFD700');
  metalGradient.addColorStop(0.3, '#FFFFFF');
  metalGradient.addColorStop(0.7, '#FFD700');
  metalGradient.addColorStop(1, '#B8860B');
  
  ctx.fillStyle = metalGradient;
  ctx.fillText('ACEORIPA', 400, 150);

  // エンボス効果
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeText('ACEORIPA', 400, 150);

  // サブタイトル
  ctx.font = 'bold 22px "MOBOFont"';
  ctx.fillStyle = '#87CEEB';
  ctx.fillText('Fantasy Card Adventure', 400, 210);

  // 宝石エフェクト（四隅）
  const gemPositions = [
    {x: 100, y: 60}, {x: 700, y: 60}, 
    {x: 100, y: 240}, {x: 700, y: 240}
  ];

  gemPositions.forEach(pos => {
    // 宝石
    ctx.save();
    ctx.translate(pos.x, pos.y);
    
    const gemGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
    gemGradient.addColorStop(0, '#FF69B4');
    gemGradient.addColorStop(0.5, '#8A2BE2');
    gemGradient.addColorStop(1, '#4B0082');
    
    ctx.fillStyle = gemGradient;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(15, -5);
    ctx.lineTo(15, 5);
    ctx.lineTo(0, 20);
    ctx.lineTo(-15, 5);
    ctx.lineTo(-15, -5);
    ctx.closePath();
    ctx.fill();
    
    // 宝石の光
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  });

  // パーティクルエフェクト
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 300;
    const size = Math.random() * 2 + 1;
    const color = ['#FFD700', '#87CEEB', '#FF69B4', '#9370DB'][Math.floor(Math.random() * 4)];
    
    ctx.save();
    ctx.globalAlpha = Math.random() * 0.8 + 0.2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // レベルアップ風装飾
  ctx.font = 'bold 14px "MOBOFont"';
  ctx.fillStyle = '#32CD32';
  ctx.textAlign = 'left';
  ctx.fillText('LV.MAX', 60, 40);
  
  ctx.textAlign = 'right';
  ctx.fillText('PREMIUM', 740, 40);

  return canvas.toBuffer('image/png');
};

// バトルロワイヤル/FPS風ロゴ
const generateBattleRoyaleLogo = () => {
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // 背景（戦場風）
  const bgGradient = ctx.createLinearGradient(0, 0, 800, 300);
  bgGradient.addColorStop(0, '#2F4F4F');
  bgGradient.addColorStop(0.5, '#1C1C1C');
  bgGradient.addColorStop(1, '#2F4F4F');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 800, 300);

  // ヘックス背景パターン
  ctx.strokeStyle = 'rgba(255, 140, 0, 0.2)';
  ctx.lineWidth = 1;
  
  for (let x = -50; x < 850; x += 60) {
    for (let y = -50; y < 350; y += 52) {
      ctx.save();
      ctx.translate(x + (y % 104 === 0 ? 30 : 0), y);
      
      // ヘキサゴン
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const hx = Math.cos(angle) * 25;
        const hy = Math.sin(angle) * 25;
        if (i === 0) {
          ctx.moveTo(hx, hy);
        } else {
          ctx.lineTo(hx, hy);
        }
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  // タクティカルHUD風フレーム
  ctx.strokeStyle = '#FF8C00';
  ctx.lineWidth = 4;
  
  // 左上角
  ctx.beginPath();
  ctx.moveTo(50, 80);
  ctx.lineTo(50, 50);
  ctx.lineTo(80, 50);
  ctx.stroke();
  
  // 右上角
  ctx.beginPath();
  ctx.moveTo(720, 50);
  ctx.lineTo(750, 50);
  ctx.lineTo(750, 80);
  ctx.stroke();
  
  // 左下角
  ctx.beginPath();
  ctx.moveTo(50, 220);
  ctx.lineTo(50, 250);
  ctx.lineTo(80, 250);
  ctx.stroke();
  
  // 右下角
  ctx.beginPath();
  ctx.moveTo(720, 250);
  ctx.lineTo(750, 250);
  ctx.lineTo(750, 220);
  ctx.stroke();

  // ACEORIPAテキスト（ミリタリー風）
  ctx.font = 'bold 64px "DelaGothicOne"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // グリッチ効果
  ctx.fillStyle = '#FF0000';
  ctx.fillText('ACEORIPA', 402, 148);
  ctx.fillStyle = '#00FF00';
  ctx.fillText('ACEORIPA', 398, 152);

  // メインテキスト
  const tacticalGradient = ctx.createLinearGradient(0, 120, 0, 180);
  tacticalGradient.addColorStop(0, '#FFD700');
  tacticalGradient.addColorStop(0.5, '#FF8C00');
  tacticalGradient.addColorStop(1, '#FF4500');
  
  ctx.fillStyle = tacticalGradient;
  ctx.fillText('ACEORIPA', 400, 150);

  // アウトライン
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeText('ACEORIPA', 400, 150);

  // サブタイトル
  ctx.font = 'bold 18px "BananaSlip"';
  ctx.fillStyle = '#00FF00';
  ctx.fillText('TACTICAL CARD WARFARE', 400, 200);

  // HUD要素
  ctx.font = 'bold 12px "MOBOFont"';
  ctx.fillStyle = '#00FF00';
  ctx.textAlign = 'left';
  
  // 左側HUD
  ctx.fillText('HP: 100%', 60, 70);
  ctx.fillText('AMMO: ∞', 60, 85);
  ctx.fillText('STATUS: READY', 60, 230);
  
  // 右側HUD
  ctx.textAlign = 'right';
  ctx.fillText('SCORE: 999999', 740, 70);
  ctx.fillText('RANK: #1', 740, 85);
  ctx.fillText('ONLINE', 740, 230);

  // ターゲットサイト
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(400, 150, 80, 0, Math.PI * 2);
  ctx.stroke();
  
  // 十字線
  ctx.beginPath();
  ctx.moveTo(320, 150);
  ctx.lineTo(340, 150);
  ctx.moveTo(460, 150);
  ctx.lineTo(480, 150);
  ctx.moveTo(400, 70);
  ctx.lineTo(400, 90);
  ctx.moveTo(400, 210);
  ctx.lineTo(400, 230);
  ctx.stroke();

  // エフェクト点
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 300;
    const color = ['#FF8C00', '#00FF00', '#FF0000'][Math.floor(Math.random() * 3)];
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 2, 2);
  }

  return canvas.toBuffer('image/png');
};

// MOBA風ロゴ
const generateMOBALogo = () => {
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // 背景（マップ風）
  const bgGradient = ctx.createRadialGradient(400, 150, 0, 400, 150, 400);
  bgGradient.addColorStop(0, '#0D1B2A');
  bgGradient.addColorStop(0.5, '#1B263B');
  bgGradient.addColorStop(1, '#415A77');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 800, 300);

  // エネルギーオーラ
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.translate(400, 150);
    ctx.rotate((Date.now() / 1000 + i) * 0.5);
    
    const auraGradient = ctx.createRadialGradient(0, 0, 50 + i * 20, 0, 0, 100 + i * 30);
    auraGradient.addColorStop(0, `rgba(138, 43, 226, ${0.3 - i * 0.05})`);
    auraGradient.addColorStop(1, 'rgba(138, 43, 226, 0)');
    
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 100 + i * 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // チャンピオンアイコン風装飾
  const championPos = [
    {x: 120, y: 100, color: '#4169E1'},
    {x: 680, y: 100, color: '#DC143C'},
    {x: 120, y: 200, color: '#32CD32'},
    {x: 680, y: 200, color: '#FFD700'}
  ];

  championPos.forEach(champ => {
    ctx.save();
    ctx.translate(champ.x, champ.y);
    
    // チャンピオンアイコン背景
    const champGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
    champGradient.addColorStop(0, champ.color);
    champGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    
    ctx.fillStyle = champGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // 枠
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 内側のシンボル
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "MOBOFont"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, 0);
    
    ctx.restore();
  });

  // ACEORIPAテキスト（MOBA風）
  ctx.font = 'bold 62px "BananaSlip"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 電気エフェクト風影
  ctx.strokeStyle = '#00BFFF';
  ctx.lineWidth = 8;
  ctx.strokeText('ACEORIPA', 400, 150);

  ctx.strokeStyle = '#1E90FF';
  ctx.lineWidth = 6;
  ctx.strokeText('ACEORIPA', 400, 150);

  // メインテキスト
  const mobaGradient = ctx.createLinearGradient(0, 120, 0, 180);
  mobaGradient.addColorStop(0, '#FFFFFF');
  mobaGradient.addColorStop(0.5, '#87CEEB');
  mobaGradient.addColorStop(1, '#4169E1');
  
  ctx.fillStyle = mobaGradient;
  ctx.fillText('ACEORIPA', 400, 150);

  // サブタイトル
  ctx.font = 'bold 20px "MOBOFont"';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('LEGENDARY CARD ARENA', 400, 200);

  // スキルエフェクト
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 300;
    const size = Math.random() * 3 + 1;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI * 2);
    
    ctx.fillStyle = 'rgba(0, 191, 255, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, -size * 3);
    ctx.lineTo(size, size);
    ctx.lineTo(-size, size);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  // レーン表示
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 5]);
  
  ctx.beginPath();
  ctx.moveTo(0, 100);
  ctx.lineTo(800, 100);
  ctx.moveTo(0, 200);
  ctx.lineTo(800, 200);
  ctx.stroke();
  
  ctx.setLineDash([]);

  return canvas.toBuffer('image/png');
};

// メイン実行
const main = async () => {
  console.log('オンラインゲーム風ロゴを3パターン生成中...');

  // パターン1: RPG/MMO風
  console.log('1. RPG/MMO風ロゴを生成中...');
  fs.writeFileSync(
    'public/images/logos/aceoripa-online-rpg.png',
    generateOnlineGameLogo()
  );

  // パターン2: バトルロワイヤル/FPS風
  console.log('2. バトルロワイヤル/FPS風ロゴを生成中...');
  fs.writeFileSync(
    'public/images/logos/aceoripa-battle-royale.png',
    generateBattleRoyaleLogo()
  );

  // パターン3: MOBA風
  console.log('3. MOBA風ロゴを生成中...');
  fs.writeFileSync(
    'public/images/logos/aceoripa-moba.png',
    generateMOBALogo()
  );

  console.log('\n✅ オンラインゲーム風ロゴ3パターンの生成が完了しました！');
  console.log('生成されたファイル:');
  console.log('- public/images/logos/aceoripa-online-rpg.png (RPG/MMO風)');
  console.log('- public/images/logos/aceoripa-battle-royale.png (バトルロワイヤル/FPS風)');
  console.log('- public/images/logos/aceoripa-moba.png (MOBA風)');
};

main().catch(console.error);