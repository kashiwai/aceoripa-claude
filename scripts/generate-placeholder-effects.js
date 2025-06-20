const fs = require('fs');
const path = require('path');

// プレースホルダーHTMLを生成
function generatePlaceholderHTML() {
  const effects = {
    'ssr-rainbow': {
      colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
      count: 3,
      text: 'SSR'
    },
    'sr-fire': {
      colors: ['#ff4500', '#ff6347', '#ff8c00', '#ffa500'],
      count: 3,
      text: 'SR'
    },
    'r-water': {
      colors: ['#00bfff', '#87ceeb', '#4682b4', '#1e90ff'],
      count: 3,
      text: 'R'
    },
    'n-light': {
      colors: ['#ffd700', '#ffffe0', '#fffacd'],
      count: 2,
      text: 'N'
    }
  };

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Effect Placeholder Generator</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .effect-container { display: inline-block; margin: 10px; text-align: center; }
    canvas { border: 1px solid #ccc; }
    .download-btn { 
      display: block; 
      margin: 10px auto; 
      padding: 5px 10px; 
      background: #007bff; 
      color: white; 
      text-decoration: none; 
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <h1>ガチャエフェクト プレースホルダー画像</h1>
  <p>各画像を右クリックして「名前を付けて画像を保存」してください。</p>
`;

  let htmlContent = html;

  for (const [type, config] of Object.entries(effects)) {
    for (let i = 1; i <= config.count; i++) {
      htmlContent += `
  <div class="effect-container">
    <h3>${type}-${i}.png</h3>
    <canvas id="${type}-${i}" width="1024" height="1024"></canvas>
  </div>`;
    }
  }

  htmlContent += `
  <script>
    ${Object.entries(effects).map(([type, config]) => {
      return Array.from({length: config.count}, (_, i) => {
        const num = i + 1;
        return `
    // ${type}-${num}
    {
      const canvas = document.getElementById('${type}-${num}');
      const ctx = canvas.getContext('2d');
      
      // グラデーション背景
      const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
      ${config.colors.map((color, idx) => 
        `gradient.addColorStop(${idx / (config.colors.length - 1)}, '${color}');`
      ).join('\n      ')}
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 1024);
      
      // 中央のテキスト
      ctx.fillStyle = 'white';
      ctx.font = 'bold 200px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 20;
      ctx.fillText('${config.text}', 512, 512);
      
      // 装飾的な円
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 5;
      for (let r = 100; r < 500; r += 100) {
        ctx.beginPath();
        ctx.arc(512, 512, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // ダウンロード用のデータURL
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '${type}-${num}.png';
        a.className = 'download-btn';
        a.textContent = 'ダウンロード';
        canvas.parentElement.appendChild(a);
      });
    }`;
      }).join('\n');
    }).join('\n')}
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, '..', 'public', 'placeholder-effects.html'), htmlContent);
  console.log('プレースホルダー生成用HTMLを作成しました: public/placeholder-effects.html');
  console.log('ブラウザで開いて画像をダウンロードしてください。');
}

// バナー用プレースホルダーも生成
function generateBannerPlaceholders() {
  const banners = [
    { name: 'gacha-banner-1', bg: '#1a1a2e', accent: '#16213e', text: 'GACHA\nBANNER 1' },
    { name: 'gacha-banner-2', bg: '#0f3460', accent: '#16213e', text: 'GACHA\nBANNER 2' },
    { name: 'gacha-banner-3', bg: '#533483', accent: '#16213e', text: 'GACHA\nBANNER 3' },
    { name: 'event-banner-1', bg: '#e94560', accent: '#16213e', text: 'EVENT\nBANNER' },
    { name: 'special-banner-1', bg: '#ff6b6b', accent: '#ee6c4d', text: 'SPECIAL\nOFFER' },
  ];

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Banner Placeholder Generator</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .banner-container { margin: 20px 0; }
    canvas { border: 1px solid #ccc; display: block; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>バナー プレースホルダー画像</h1>
  ${banners.map(banner => `
  <div class="banner-container">
    <h3>${banner.name}.png</h3>
    <canvas id="${banner.name}" width="1024" height="1024"></canvas>
  </div>`).join('')}
  
  <script>
    ${banners.map(banner => `
    {
      const canvas = document.getElementById('${banner.name}');
      const ctx = canvas.getContext('2d');
      
      // 背景
      const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
      gradient.addColorStop(0, '${banner.bg}');
      gradient.addColorStop(1, '${banner.accent}');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 1024);
      
      // 装飾パターン
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 50);
        ctx.lineTo(1024, i * 50);
        ctx.stroke();
      }
      
      // テキスト
      ctx.fillStyle = 'white';
      ctx.font = 'bold 120px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 20;
      const lines = '${banner.text}'.split('\\n');
      lines.forEach((line, idx) => {
        ctx.fillText(line, 512, 400 + idx * 150);
      });
      
      // ダウンロードリンク
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '${banner.name}.png';
        a.textContent = 'ダウンロード';
        a.style = 'display: block; margin: 10px 0; color: blue;';
        canvas.parentElement.appendChild(a);
      });
    }`).join('\n')}
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, '..', 'public', 'placeholder-banners.html'), html);
  console.log('バナープレースホルダー生成用HTMLを作成しました: public/placeholder-banners.html');
}

// 実行
generatePlaceholderHTML();
generateBannerPlaceholders();