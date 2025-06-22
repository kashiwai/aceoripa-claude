
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

async function createCompositeB

(aiBackgroundPath, outputName) {
  const width = 800;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // AI生成背景を読み込み
  if (aiBackgroundPath && fs.existsSync(aiBackgroundPath)) {
    const bgImage = await loadImage(aiBackgroundPath);
    ctx.drawImage(bgImage, 0, 0, width, height);
  }
  
  // ここにポケモンカードと文字を追加
  // ... (既存のカード配置とテキスト描画コード)
  
  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join('public/images', outputName), buffer);
  console.log(`✅ コンポジット完成: ${outputName}`);
}
