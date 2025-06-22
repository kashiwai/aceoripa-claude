// 追加アセット生成システム
import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

// 追加で必要なアセット
const ADDITIONAL_ASSETS = {
  // ナビゲーションアイコン
  navIcons: {
    home: { icon: '🏠', name: 'ホーム' },
    gacha: { icon: '🎰', name: 'ガチャ' },
    collection: { icon: '📚', name: 'コレクション' },
    mypage: { icon: '👤', name: 'マイページ' },
    cart: { icon: '🛒', name: 'カート' },
    settings: { icon: '⚙️', name: '設定' }
  },

  // ステータスバッジ
  statusBadges: {
    new: { color: '#FF0000', text: 'NEW' },
    hot: { color: '#FF4500', text: 'HOT' },
    limited: { color: '#FFD700', text: '限定' },
    soldout: { color: '#808080', text: '完売' },
    sale: { color: '#00FF00', text: 'SALE' }
  },

  // コイン・ポイントアイコン
  currencyIcons: {
    coin: { color: '#FFD700', symbol: '💰', name: 'コイン' },
    point: { color: '#4169E1', symbol: '💎', name: 'ポイント' },
    ticket: { color: '#FF69B4', symbol: '🎫', name: 'チケット' }
  },

  // アニメーションアイコン
  animationIcons: {
    spinning: { frames: 8, color: '#FFD700' },
    pulsing: { frames: 4, color: '#FF69B4' },
    bouncing: { frames: 6, color: '#00BFFF' }
  },

  // ソーシャルメディアボタン
  socialButtons: {
    twitter: { color: '#1DA1F2', icon: '𝕏' },
    instagram: { color: '#E4405F', icon: '📷' },
    youtube: { color: '#FF0000', icon: '▶️' },
    discord: { color: '#7289DA', icon: '💬' }
  },

  // エラー・成功メッセージ
  messageBoxes: {
    success: { color: '#4CAF50', icon: '✅', title: '成功' },
    error: { color: '#F44336', icon: '❌', title: 'エラー' },
    warning: { color: '#FF9800', icon: '⚠️', title: '警告' },
    info: { color: '#2196F3', icon: 'ℹ️', title: '情報' }
  },

  // ランキングバッジ
  rankingBadges: {
    gold: { color: '#FFD700', rank: 1, icon: '🥇' },
    silver: { color: '#C0C0C0', rank: 2, icon: '🥈' },
    bronze: { color: '#CD7F32', rank: 3, icon: '🥉' }
  },

  // プログレスバー
  progressBars: {
    loading: { colors: ['#4CAF50', '#8BC34A'], width: 400, height: 20 },
    experience: { colors: ['#2196F3', '#03A9F4'], width: 400, height: 20 },
    health: { colors: ['#F44336', '#FF5722'], width: 400, height: 20 }
  },

  // タブメニュー
  tabMenus: {
    active: { color: '#2196F3', borderColor: '#1976D2' },
    inactive: { color: '#9E9E9E', borderColor: '#E0E0E0' }
  }
};

// ナビゲーションアイコン生成
async function generateNavIcon(key, config, outputPath) {
  const size = 80;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 背景（透明）
  ctx.clearRect(0, 0, size, size);

  // アイコン
  ctx.font = '40px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.icon, size/2, size/2 - 10);

  // テキスト
  ctx.font = 'bold 12px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';
  ctx.fillStyle = '#333333';
  ctx.fillText(config.name, size/2, size - 10);

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ ナビアイコン生成: ${outputPath}`);
}

// ステータスバッジ生成
async function generateStatusBadge(key, config, outputPath) {
  const width = 80;
  const height = 30;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // バッジ背景
  ctx.fillStyle = config.color;
  roundRect(ctx, 0, 0, width, height, 5);
  ctx.fill();

  // テキスト
  ctx.font = 'bold 16px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.text, width/2, height/2);

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ ステータスバッジ生成: ${outputPath}`);
}

// 通貨アイコン生成
async function generateCurrencyIcon(key, config, outputPath) {
  const size = 100;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 背景円
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, config.color);
  gradient.addColorStop(1, adjustColor(config.color, -50));
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 5, 0, Math.PI * 2);
  ctx.fill();

  // 外枠
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.stroke();

  // シンボル
  ctx.font = '50px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.symbol, size/2, size/2);

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ 通貨アイコン生成: ${outputPath}`);
}

// アニメーションアイコン生成（スプライトシート）
async function generateAnimationSprite(key, config, outputPath) {
  const frameSize = 100;
  const canvas = createCanvas(frameSize * config.frames, frameSize);
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < config.frames; i++) {
    const x = i * frameSize;
    const progress = i / (config.frames - 1);

    // フレームごとのアニメーション
    ctx.save();
    ctx.translate(x + frameSize/2, frameSize/2);

    if (key === 'spinning') {
      ctx.rotate(progress * Math.PI * 2);
    } else if (key === 'pulsing') {
      const scale = 1 + Math.sin(progress * Math.PI) * 0.3;
      ctx.scale(scale, scale);
    } else if (key === 'bouncing') {
      const bounce = Math.abs(Math.sin(progress * Math.PI)) * 20;
      ctx.translate(0, -bounce);
    }

    // 星型の描画
    ctx.fillStyle = config.color;
    drawStar(ctx, 0, 0, 30, 15, 5);
    ctx.fill();

    ctx.restore();
  }

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ アニメーションスプライト生成: ${outputPath}`);
}

// ソーシャルボタン生成
async function generateSocialButton(key, config, outputPath) {
  const size = 60;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // ボタン背景
  ctx.fillStyle = config.color;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
  ctx.fill();

  // アイコン
  ctx.font = 'bold 30px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.icon, size/2, size/2);

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ ソーシャルボタン生成: ${outputPath}`);
}

// メッセージボックス生成
async function generateMessageBox(key, config, outputPath) {
  const width = 400;
  const height = 100;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = adjustColor(config.color, 200);
  roundRect(ctx, 0, 0, width, height, 10);
  ctx.fill();

  // 左側のカラーバー
  ctx.fillStyle = config.color;
  roundRect(ctx, 0, 0, 10, height, [10, 0, 0, 10]);
  ctx.fill();

  // アイコン
  ctx.font = '40px sans-serif';
  ctx.fillText(config.icon, 30, height/2 + 5);

  // タイトル
  ctx.font = 'bold 20px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';
  ctx.fillStyle = config.color;
  ctx.textAlign = 'left';
  ctx.fillText(config.title, 80, 35);

  // メッセージプレースホルダー
  ctx.font = '16px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';
  ctx.fillStyle = '#666666';
  ctx.fillText('メッセージがここに表示されます', 80, 65);

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ メッセージボックス生成: ${outputPath}`);
}

// ランキングバッジ生成
async function generateRankingBadge(key, config, outputPath) {
  const size = 120;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // メダル背景
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, adjustColor(config.color, 50));
  gradient.addColorStop(0.7, config.color);
  gradient.addColorStop(1, adjustColor(config.color, -50));
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 10, 0, Math.PI * 2);
  ctx.fill();

  // 外枠
  ctx.strokeStyle = adjustColor(config.color, -100);
  ctx.lineWidth = 5;
  ctx.stroke();

  // 内側の円
  ctx.strokeStyle = adjustColor(config.color, 100);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 20, 0, Math.PI * 2);
  ctx.stroke();

  // ランク番号
  ctx.font = 'bold 60px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = adjustColor(config.color, -100);
  ctx.lineWidth = 3;
  ctx.strokeText(config.rank.toString(), size/2, size/2);
  ctx.fillText(config.rank.toString(), size/2, size/2);

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ ランキングバッジ生成: ${outputPath}`);
}

// プログレスバー生成
async function generateProgressBar(key, config, outputPath) {
  const canvas = createCanvas(config.width, config.height);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = '#E0E0E0';
  roundRect(ctx, 0, 0, config.width, config.height, config.height/2);
  ctx.fill();

  // プログレス部分（75%の例）
  const progress = 0.75;
  const gradient = ctx.createLinearGradient(0, 0, config.width * progress, 0);
  gradient.addColorStop(0, config.colors[0]);
  gradient.addColorStop(1, config.colors[1]);
  
  ctx.fillStyle = gradient;
  roundRect(ctx, 0, 0, config.width * progress, config.height, config.height/2);
  ctx.fill();

  // 光沢効果
  const glossGradient = ctx.createLinearGradient(0, 0, 0, config.height);
  glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  glossGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = glossGradient;
  roundRect(ctx, 0, 0, config.width * progress, config.height, config.height/2);
  ctx.fill();

  // 保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ プログレスバー生成: ${outputPath}`);
}

// ヘルパー関数
function roundRect(ctx, x, y, width, height, radius) {
  if (typeof radius === 'number') {
    radius = [radius, radius, radius, radius];
  }
  
  ctx.beginPath();
  ctx.moveTo(x + radius[0], y);
  ctx.lineTo(x + width - radius[1], y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius[1]);
  ctx.lineTo(x + width, y + height - radius[2]);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius[2], y + height);
  ctx.lineTo(x + radius[3], y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius[3]);
  ctx.lineTo(x, y + radius[0]);
  ctx.quadraticCurveTo(x, y, x + radius[0], y);
  ctx.closePath();
}

function drawStar(ctx, x, y, outerRadius, innerRadius, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function adjustColor(color, amount) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// メイン実行関数
async function generateAdditionalAssets() {
  console.log('🎨 追加アセット生成開始...\n');

  // 出力ディレクトリ作成
  const dirs = [
    'public/images/nav-icons',
    'public/images/status-badges',
    'public/images/currency-icons',
    'public/images/animation-sprites',
    'public/images/social-buttons',
    'public/images/message-boxes',
    'public/images/ranking-badges',
    'public/images/progress-bars'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // 1. ナビゲーションアイコン
  console.log('\n🧭 ナビゲーションアイコン生成中...');
  for (const [key, config] of Object.entries(ADDITIONAL_ASSETS.navIcons)) {
    await generateNavIcon(key, config, `public/images/nav-icons/${key}-icon.png`);
  }

  // 2. ステータスバッジ
  console.log('\n🏷️ ステータスバッジ生成中...');
  for (const [key, config] of Object.entries(ADDITIONAL_ASSETS.statusBadges)) {
    await generateStatusBadge(key, config, `public/images/status-badges/${key}-badge.png`);
  }

  // 3. 通貨アイコン
  console.log('\n💰 通貨アイコン生成中...');
  for (const [key, config] of Object.entries(ADDITIONAL_ASSETS.currencyIcons)) {
    await generateCurrencyIcon(key, config, `public/images/currency-icons/${key}-icon.png`);
  }

  // 4. アニメーションスプライト
  console.log('\n✨ アニメーションスプライト生成中...');
  for (const [key, config] of Object.entries(ADDITIONAL_ASSETS.animationIcons)) {
    await generateAnimationSprite(key, config, `public/images/animation-sprites/${key}-sprite.png`);
  }

  // 5. ソーシャルボタン
  console.log('\n📱 ソーシャルボタン生成中...');
  for (const [key, config] of Object.entries(ADDITIONAL_ASSETS.socialButtons)) {
    await generateSocialButton(key, config, `public/images/social-buttons/${key}-button.png`);
  }

  // 6. メッセージボックス
  console.log('\n💬 メッセージボックス生成中...');
  for (const [key, config] of Object.entries(ADDITIONAL_ASSETS.messageBoxes)) {
    await generateMessageBox(key, config, `public/images/message-boxes/${key}-message.png`);
  }

  // 7. ランキングバッジ
  console.log('\n🏆 ランキングバッジ生成中...');
  for (const [key, config] of Object.entries(ADDITIONAL_ASSETS.rankingBadges)) {
    await generateRankingBadge(key, config, `public/images/ranking-badges/${key}-badge.png`);
  }

  // 8. プログレスバー
  console.log('\n📊 プログレスバー生成中...');
  for (const [key, config] of Object.entries(ADDITIONAL_ASSETS.progressBars)) {
    await generateProgressBar(key, config, `public/images/progress-bars/${key}-progress.png`);
  }

  console.log('\n\n✅ 追加アセット生成完了！');
  console.log('===========================');
  console.log('\n📂 生成されたアセット:');
  console.log('- ナビゲーションアイコン: 6種類');
  console.log('- ステータスバッジ: 5種類');
  console.log('- 通貨アイコン: 3種類');
  console.log('- アニメーションスプライト: 3種類');
  console.log('- ソーシャルボタン: 4種類');
  console.log('- メッセージボックス: 4種類');
  console.log('- ランキングバッジ: 3種類');
  console.log('- プログレスバー: 3種類');
  console.log('\n合計: 31個の追加アセット');
}

// 実行
generateAdditionalAssets().catch(console.error);