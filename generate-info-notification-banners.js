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
    'public/images/banners/info-notification'
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// バナーサイズ設定（スライダー用の横長バナー）
const BANNER_WIDTH = 400;
const BANNER_HEIGHT = 200;

// パターン1: メンテナンス告知バナー
const generateMaintenanceBanner = async () => {
  const canvas = createCanvas(BANNER_WIDTH, BANNER_HEIGHT);
  const ctx = canvas.getContext('2d');

  // 背景（警告色のグラデーション）
  const bgGradient = ctx.createLinearGradient(0, 0, BANNER_WIDTH, 0);
  bgGradient.addColorStop(0, '#FF6B6B');
  bgGradient.addColorStop(0.5, '#FF0033');
  bgGradient.addColorStop(1, '#CC0000');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);

  // 斜線パターン
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 20;
  for (let i = -BANNER_HEIGHT; i < BANNER_WIDTH + BANNER_HEIGHT; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + BANNER_HEIGHT, BANNER_HEIGHT);
    ctx.stroke();
  }

  // アイコン（⚠️）
  ctx.font = 'bold 60px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('⚠️', 60, 110);

  // メインテキスト
  ctx.font = 'bold 28px "MOBOFont"';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText('メンテナンスのお知らせ', 100, 80);

  // サブテキスト
  ctx.font = '18px "DelaGothicOne"';
  ctx.fillStyle = '#FFCCCC';
  ctx.fillText('12/25 2:00-6:00', 100, 110);
  ctx.fillText('サービス一時停止', 100, 135);

  // 右矢印
  ctx.font = 'bold 30px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('›', 360, 105);

  return canvas.toBuffer('image/png');
};

// パターン2: 新機能リリースバナー
const generateNewFeatureBanner = async () => {
  const canvas = createCanvas(BANNER_WIDTH, BANNER_HEIGHT);
  const ctx = canvas.getContext('2d');

  // 背景（新機能を表す青系グラデーション）
  const bgGradient = ctx.createLinearGradient(0, 0, BANNER_WIDTH, BANNER_HEIGHT);
  bgGradient.addColorStop(0, '#00BFFF');
  bgGradient.addColorStop(0.5, '#1E90FF');
  bgGradient.addColorStop(1, '#0080FF');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);

  // キラキラエフェクト
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * BANNER_WIDTH;
    const y = Math.random() * BANNER_HEIGHT;
    const size = Math.random() * 3 + 1;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, -size * 2);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size * 2);
    ctx.lineTo(-size, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  // NEW!バッジ
  ctx.save();
  ctx.translate(50, 50);
  ctx.rotate(-15 * Math.PI / 180);
  
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(-30, -20, 60, 40);
  
  ctx.font = 'bold 16px "MOBOFont"';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.fillText('NEW!', 0, 5);
  ctx.restore();

  // メインテキスト
  ctx.font = 'bold 26px "BananaSlip"';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText('連携機能リリース！', 100, 80);

  // サブテキスト
  ctx.font = '16px "DelaGothicOne"';
  ctx.fillStyle = '#E0FFFF';
  ctx.fillText('SNSアカウントと連携して', 100, 110);
  ctx.fillText('限定報酬をGET！', 100, 135);

  // CTAボタン風デザイン
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(280, 130, 100, 35);
  ctx.font = 'bold 14px "MOBOFont"';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.fillText('詳細はこちら', 330, 152);

  return canvas.toBuffer('image/png');
};

// パターン3: キャンペーン告知バナー
const generateCampaignBanner = async () => {
  const canvas = createCanvas(BANNER_WIDTH, BANNER_HEIGHT);
  const ctx = canvas.getContext('2d');

  // 背景（お祭り感のあるグラデーション）
  const bgGradient = ctx.createRadialGradient(200, 100, 0, 200, 100, 200);
  bgGradient.addColorStop(0, '#FFD700');
  bgGradient.addColorStop(0.5, '#FFA500');
  bgGradient.addColorStop(1, '#FF6347');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);

  // 紙吹雪エフェクト
  const colors = ['#FF69B4', '#00CED1', '#98FB98', '#FFB6C1'];
  for (let i = 0; i < 20; i++) {
    ctx.save();
    ctx.translate(Math.random() * BANNER_WIDTH, Math.random() * BANNER_HEIGHT);
    ctx.rotate(Math.random() * Math.PI * 2);
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillRect(-3, -8, 6, 16);
    ctx.restore();
  }

  // 爆発的な背景エフェクト
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 12; i++) {
    ctx.save();
    ctx.translate(BANNER_WIDTH / 2, BANNER_HEIGHT / 2);
    ctx.rotate(i * 30 * Math.PI / 180);
    
    const rayGradient = ctx.createLinearGradient(0, 0, 0, -BANNER_HEIGHT);
    rayGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    rayGradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
    
    ctx.fillStyle = rayGradient;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.lineTo(5, -BANNER_HEIGHT);
    ctx.lineTo(-5, -BANNER_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // キャンペーンロゴ
  ctx.font = 'bold 60px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('🎉', 60, 110);

  // メインテキスト
  ctx.font = 'bold 24px "Kinkaku"';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.strokeText('冬の大感謝祭', 220, 70);
  ctx.fillStyle = '#FF0033';
  ctx.fillText('冬の大感謝祭', 220, 70);

  // サブテキスト
  ctx.font = 'bold 18px "MOBOFont"';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('全商品ポイント2倍！', 220, 105);
  
  ctx.font = '16px "DelaGothicOne"';
  ctx.fillStyle = '#FFFF00';
  ctx.fillText('12/20～12/31限定', 220, 135);

  // 点滅効果を表現する円
  ctx.beginPath();
  ctx.arc(350, 50, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#FF0000';
  ctx.fill();
  ctx.font = 'bold 12px "MOBOFont"';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('HOT', 350, 55);

  return canvas.toBuffer('image/png');
};

// パターン4: セキュリティ・アカウント連携バナー
const generateSecurityBanner = async () => {
  const canvas = createCanvas(BANNER_WIDTH, BANNER_HEIGHT);
  const ctx = canvas.getContext('2d');

  // 背景（信頼感のある緑系グラデーション）
  const bgGradient = ctx.createLinearGradient(0, 0, 0, BANNER_HEIGHT);
  bgGradient.addColorStop(0, '#228B22');
  bgGradient.addColorStop(0.5, '#32CD32');
  bgGradient.addColorStop(1, '#00FF00');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);

  // セキュリティパターン（ドット）
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let x = 0; x < BANNER_WIDTH; x += 20) {
    for (let y = 0; y < BANNER_HEIGHT; y += 20) {
      ctx.beginPath();
      ctx.arc(x + 10, y + 10, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // シールドアイコン
  ctx.save();
  ctx.translate(60, 100);
  
  // シールドの形
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.quadraticCurveTo(-25, -30, -25, -10);
  ctx.quadraticCurveTo(-25, 20, 0, 35);
  ctx.quadraticCurveTo(25, 20, 25, -10);
  ctx.quadraticCurveTo(25, -30, 0, -30);
  ctx.closePath();
  ctx.fill();
  
  // チェックマーク
  ctx.strokeStyle = '#228B22';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(-3, 10);
  ctx.lineTo(10, -10);
  ctx.stroke();
  ctx.restore();

  // メインテキスト
  ctx.font = 'bold 24px "MOBOFont"';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText('アカウント連携で', 110, 70);
  ctx.fillText('セキュリティ強化', 110, 100);

  // サブテキスト
  ctx.font = '14px "DelaGothicOne"';
  ctx.fillStyle = '#E0FFE0';
  ctx.fillText('2段階認証でより安全に！', 110, 130);

  // 連携済みバッジ
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(300, 145, 80, 25);
  ctx.font = 'bold 12px "MOBOFont"';
  ctx.fillStyle = '#228B22';
  ctx.textAlign = 'center';
  ctx.fillText('今すぐ設定', 340, 162);

  return canvas.toBuffer('image/png');
};

// メイン実行
const main = async () => {
  createDirectories();

  console.log('情報連携通知バナーを生成中...');

  // バナー1: メンテナンス告知
  console.log('1. メンテナンス告知バナーを生成中...');
  fs.writeFileSync(
    'public/images/banners/info-notification/maintenance-banner.png',
    await generateMaintenanceBanner()
  );

  // バナー2: 新機能リリース
  console.log('2. 新機能リリースバナーを生成中...');
  fs.writeFileSync(
    'public/images/banners/info-notification/new-feature-banner.png',
    await generateNewFeatureBanner()
  );

  // バナー3: キャンペーン告知
  console.log('3. キャンペーン告知バナーを生成中...');
  fs.writeFileSync(
    'public/images/banners/info-notification/campaign-banner.png',
    await generateCampaignBanner()
  );

  // バナー4: セキュリティ・アカウント連携
  console.log('4. セキュリティ・アカウント連携バナーを生成中...');
  fs.writeFileSync(
    'public/images/banners/info-notification/security-banner.png',
    await generateSecurityBanner()
  );

  console.log('\n✅ 情報連携通知バナーの生成が完了しました！');
  console.log('生成されたファイル:');
  console.log('- public/images/banners/info-notification/maintenance-banner.png');
  console.log('- public/images/banners/info-notification/new-feature-banner.png');
  console.log('- public/images/banners/info-notification/campaign-banner.png');
  console.log('- public/images/banners/info-notification/security-banner.png');
  console.log('\nサイズ: 400x200px（スライダー表示用）');
};

main().catch(console.error);