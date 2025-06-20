const express = require('express');
const cors = require('cors');
const { createCanvas, registerFont } = require('canvas');
const path = require('path');

const app = express();
const PORT = 9015;

app.use(cors());
app.use(express.json());

// バナー生成エンドポイント
app.post('/generate-banner', async (req, res) => {
  try {
    const { type, text, width = 375, height = 200 } = req.body;
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // バナータイプ別のデザイン
    switch (type) {
      case 'line-campaign':
        // LINE友達登録バナー
        drawLineCampaignBanner(ctx, width, height, text);
        break;
      
      case 'gacha-main':
        // メインガチャバナー
        drawMainGachaBanner(ctx, width, height, text);
        break;
      
      case 'campaign':
        // キャンペーンバナー
        drawCampaignBanner(ctx, width, height, text);
        break;
      
      case 'sns-winner':
        // SNS当選報告バナー
        drawSnsWinnerBanner(ctx, width, height, text);
        break;
      
      case 'card-pack':
        // カードパックバナー
        drawCardPackBanner(ctx, width, height, text);
        break;
      
      default:
        drawDefaultBanner(ctx, width, height, text);
    }
    
    // Base64エンコード
    const buffer = canvas.toBuffer('image/png');
    const base64 = buffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    res.json({
      success: true,
      imageUrl: dataUrl,
      width,
      height
    });
    
  } catch (error) {
    console.error('Banner generation error:', error);
    res.status(500).json({ error: 'Failed to generate banner' });
  }
});

// LINE友達登録バナー
function drawLineCampaignBanner(ctx, width, height, text) {
  // グラデーション背景
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#00B900');
  gradient.addColorStop(1, '#00E000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // LINEロゴ風の円
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(40, height/2, 25, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#00B900';
  ctx.font = 'bold 30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('L', 40, height/2 + 10);
  
  // メインテキスト
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('LINE友達登録で', 80, height/2 - 10);
  
  // 割引テキスト
  ctx.fillStyle = '#FFFF00';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('最大70%OFF', 80, height/2 + 15);
  
  // 矢印
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '20px Arial';
  ctx.textAlign = 'right';
  ctx.fillText('▶', width - 20, height/2);
}

// メインガチャバナー
function drawMainGachaBanner(ctx, width, height, text) {
  // グラデーション背景
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#8B5CF6');
  gradient.addColorStop(0.5, '#EC4899');
  gradient.addColorStop(1, '#F59E0B');
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
  
  // メインテキスト
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // テキストの影
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  
  ctx.fillText(text || '超絶ガチャ', width/2, height/2 - 20);
  
  // サブテキスト
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#FFFF00';
  ctx.fillText('爆誕！', width/2, height/2 + 30);
}

// キャンペーンバナー
function drawCampaignBanner(ctx, width, height, text) {
  // グラデーション背景
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#F59E0B');
  gradient.addColorStop(1, '#DC2626');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // 炎エフェクト風の装飾
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(i * width/4, height);
    ctx.quadraticCurveTo(i * width/4 + 20, height/2, i * width/4, 0);
    ctx.quadraticCurveTo(i * width/4 + 40, height/2, i * width/4 + 60, height);
    ctx.fill();
  }
  
  // メインテキスト
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text || '期間限定キャンペーン', width/2, height/2);
  
  // 炎アイコン
  ctx.font = '32px Arial';
  ctx.fillText('🔥', 30, height/2);
  ctx.fillText('🔥', width - 30, height/2);
}

// SNS当選報告バナー
function drawSnsWinnerBanner(ctx, width, height, text) {
  // 背景
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(0, 0, width, height);
  
  // 枠線
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, width - 4, height - 4);
  
  // 紙吹雪効果
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F', '#BB8FCE'];
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.save();
    ctx.translate(Math.random() * width, Math.random() * height);
    ctx.rotate(Math.random() * Math.PI * 2);
    ctx.fillRect(-5, -2, 10, 4);
    ctx.restore();
  }
  
  // トロフィーアイコン
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🏆', width/2, height/2 - 20);
  
  // テキスト
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(text || '当選おめでとう！', width/2, height/2 + 30);
}

// カードパックバナー
function drawCardPackBanner(ctx, width, height, text) {
  // グラデーション背景（ホログラフィック風）
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#667EEA');
  gradient.addColorStop(0.25, '#764BA2');
  gradient.addColorStop(0.5, '#F093FB');
  gradient.addColorStop(0.75, '#4FACFE');
  gradient.addColorStop(1, '#00F2FE');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // カードパック風の形状
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.moveTo(width * 0.2, height * 0.1);
  ctx.lineTo(width * 0.8, height * 0.1);
  ctx.lineTo(width * 0.85, height * 0.3);
  ctx.lineTo(width * 0.85, height * 0.9);
  ctx.lineTo(width * 0.15, height * 0.9);
  ctx.lineTo(width * 0.15, height * 0.3);
  ctx.closePath();
  ctx.fill();
  
  // パックのディテール
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // テキスト
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text || 'カードパック', width/2, height/2);
  
  // キラキラエフェクト
  ctx.fillStyle = '#FFD700';
  ctx.font = '20px Arial';
  ctx.fillText('✨', width * 0.2, height * 0.2);
  ctx.fillText('✨', width * 0.8, height * 0.2);
  ctx.fillText('✨', width * 0.5, height * 0.8);
}

// デフォルトバナー
function drawDefaultBanner(ctx, width, height, text) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#667EEA');
  gradient.addColorStop(1, '#764BA2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text || 'ACEORIPA', width/2, height/2);
}

// サンプル画像一覧エンドポイント
app.get('/sample-banners', async (req, res) => {
  const samples = [
    { type: 'line-campaign', text: 'LINE友達登録で最大70%OFF', width: 375, height: 80 },
    { type: 'gacha-main', text: '超絶ガチャ爆誕', width: 375, height: 200 },
    { type: 'campaign', text: '期間限定キャンペーン', width: 375, height: 100 },
    { type: 'sns-winner', text: '当選おめでとう！', width: 200, height: 200 },
    { type: 'card-pack', text: 'ポケモンカード151', width: 300, height: 400 },
  ];
  
  const results = [];
  
  for (const sample of samples) {
    const canvas = createCanvas(sample.width, sample.height);
    const ctx = canvas.getContext('2d');
    
    switch (sample.type) {
      case 'line-campaign':
        drawLineCampaignBanner(ctx, sample.width, sample.height, sample.text);
        break;
      case 'gacha-main':
        drawMainGachaBanner(ctx, sample.width, sample.height, sample.text);
        break;
      case 'campaign':
        drawCampaignBanner(ctx, sample.width, sample.height, sample.text);
        break;
      case 'sns-winner':
        drawSnsWinnerBanner(ctx, sample.width, sample.height, sample.text);
        break;
      case 'card-pack':
        drawCardPackBanner(ctx, sample.width, sample.height, sample.text);
        break;
    }
    
    const buffer = canvas.toBuffer('image/png');
    const base64 = buffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    results.push({
      ...sample,
      imageUrl: dataUrl
    });
  }
  
  res.json({ samples: results });
});

app.listen(PORT, () => {
  console.log(`Image generation server running on http://localhost:${PORT}`);
});