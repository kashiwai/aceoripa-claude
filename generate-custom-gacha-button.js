const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// 太字フォント登録
function registerBoldFonts() {
  const fontsDir = path.join(__dirname, 'public', 'fonts');
  
  const boldFonts = [
    { file: 'Dela_Gothic_One.ttf', family: 'DelaGothicOne' },
    { file: 'MOBO-Font11.otf', family: 'MOBOFont' },
    { file: 'kinkaku.otf', family: 'Kinkaku' },
  ];
  
  boldFonts.forEach(({ file, family }) => {
    const fontPath = path.join(fontsDir, file);
    if (fs.existsSync(fontPath)) {
      try {
        registerFont(fontPath, { family: family });
        console.log(`✅ Font: ${family}`);
      } catch (err) {
        console.error(`❌ ${family}:`, err.message);
      }
    }
  });
  
  const systemBoldFonts = [
    { path: '/System/Library/Fonts/ヒラギノ角ゴシック W9.ttc', family: 'HiraKakuW9' },
  ];
  
  systemBoldFonts.forEach(({ path, family }) => {
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

// 600x100の指定数ガチャボタン生成
function createCustomGachaButton() {
  const canvas = createCanvas(600, 100);
  const ctx = canvas.getContext('2d');
  
  // ボタン背景（グラデーション）
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 100);
  bgGrad.addColorStop(0, '#9370DB');
  bgGrad.addColorStop(0.3, '#8B008B');
  bgGrad.addColorStop(0.7, '#6B008B');
  bgGrad.addColorStop(1, '#4B0082');
  ctx.fillStyle = bgGrad;
  ctx.roundRect(10, 10, 580, 80, 25);
  ctx.fill();
  
  // インナーグロー効果
  const innerGlow = ctx.createRadialGradient(300, 50, 0, 300, 50, 300);
  innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  innerGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = innerGlow;
  ctx.roundRect(10, 10, 580, 80, 25);
  ctx.fill();
  
  // ボタン枠（ゴールド）
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 5;
  ctx.roundRect(10, 10, 580, 80, 25);
  ctx.stroke();
  
  // 内側の細い枠
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.roundRect(15, 15, 570, 70, 22);
  ctx.stroke();
  
  // ダイヤモンドパターン（装飾）
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  for (let x = -50; x < 650; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 10);
    ctx.lineTo(x + 50, 90);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + 50, 10);
    ctx.lineTo(x, 90);
    ctx.stroke();
  }
  ctx.restore();
  
  // キラキラエフェクト
  for (let i = 0; i < 25; i++) {
    const x = 20 + Math.random() * 560;
    const y = 20 + Math.random() * 60;
    const size = Math.random() * 3 + 1;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI * 2);
    
    const sparkleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    sparkleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    sparkleGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.6)');
    sparkleGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sparkleGrad;
    
    // 星型
    ctx.beginPath();
    for (let j = 0; j < 4; j++) {
      const angle = (j * Math.PI * 2) / 4;
      ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  
  // テキスト影（複数層）
  for (let i = 5; i > 0; i--) {
    ctx.font = 'bold 36px "DelaGothicOne"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(0, 0, 0, ${0.3 - i * 0.05})`;
    ctx.fillText('指定数ガチャ', 200 + i, 35 + i);
  }
  
  // メインテキスト「指定数ガチャ」
  ctx.font = 'bold 36px "DelaGothicOne"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 文字の縁取り（黒）
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeText('指定数ガチャ', 200, 35);
  
  // 文字本体（白）
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('指定数ガチャ', 200, 35);
  
  // サブテキスト「(何回でもOK)」の影
  for (let i = 3; i > 0; i--) {
    ctx.font = 'bold 24px "DelaGothicOne"';
    ctx.fillStyle = `rgba(0, 0, 0, ${0.3 - i * 0.08})`;
    ctx.fillText('(何回でもOK)', 420 + i, 65 + i * 0.5);
  }
  
  // サブテキスト「(何回でもOK)」
  ctx.font = 'bold 24px "DelaGothicOne"';
  
  // 縁取り
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeText('(何回でもOK)', 420, 65);
  
  // テキスト本体（黄色）
  ctx.fillStyle = '#FFFF00';
  ctx.fillText('(何回でもOK)', 420, 65);
  
  // 光沢効果
  const glossGrad = ctx.createLinearGradient(0, 10, 0, 50);
  glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  glossGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glossGrad;
  ctx.roundRect(10, 10, 580, 35, 25);
  ctx.fill();
  
  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'public', 'images', 'gacha-button-custom-600.png'), buffer);
  console.log('✅ 600x100 指定数ガチャボタン生成完了');
}

// メイン実行
function main() {
  console.log('🎮 600x100 指定数ガチャボタン生成開始\n');
  
  // フォント登録
  registerBoldFonts();
  
  // ボタン生成
  createCustomGachaButton();
  
  console.log('\n🎉 完成しました！');
}

// 実行
main();