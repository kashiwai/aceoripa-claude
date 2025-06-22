// 本格バナー・動画生成システム（既存画像+新規生成）
import fs from 'fs';
import { createCanvas, registerFont, loadImage } from 'canvas';

// レアリティ設定
const RARITY_CONFIG = {
  N: { name: 'ノーマル', color: '#808080', fontSize: 60, bgColor: 'rgba(128,128,128,0.2)' },
  R: { name: 'レア', color: '#0080FF', fontSize: 65, bgColor: 'rgba(0,128,255,0.2)' },
  SR: { name: 'スーパーレア', color: '#FFD700', fontSize: 70, bgColor: 'rgba(255,215,0,0.2)' },
  SSR: { name: 'スペシャルレア', color: '#FF69B4', fontSize: 75, bgColor: 'rgba(255,105,180,0.2)' },
  SS: { name: 'スーパースペシャル', color: '#FF4500', fontSize: 80, bgColor: 'rgba(255,69,0,0.2)' },
  PSA10: { name: 'パーフェクト', color: '#8B00FF', fontSize: 85, bgColor: 'rgba(139,0,255,0.2)' }
};

// 日本語テキストバリエーション
const JAPANESE_TEXTS = {
  ultra_rare: ['超激レア', 'ウルトラレア', '超絶レア'],
  jackpot: ['大当たり！', '大成功！', 'ジャックポット！'],
  guaranteed: ['SSR確定', 'レア確定', '激レア確定'],
  legendary: ['伝説のカード', '神カード', '奇跡の一枚'],
  celebration: ['おめでとう！', 'やったね！', '最高だ！'],
  effects: ['爆発演出', '雷撃効果', '炎の力', '銀河の輝き', '虹色の奇跡']
};

// バナーサイズ設定
const BANNER_SIZES = {
  square: { width: 1024, height: 1024, name: 'スクエア' },
  gacha_button: { width: 600, height: 100, name: 'ガチャボタン' },
  wide_banner: { width: 1200, height: 400, name: 'ワイドバナー' },
  mobile_banner: { width: 750, height: 300, name: 'モバイルバナー' }
};

// 高品質日本語テキスト合成
async function createPremiumBanner(backgroundPath, config) {
  const { width, height } = config.size;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  try {
    // 背景画像を読み込み
    const backgroundImage = await loadImage(backgroundPath);
    
    // 背景を中央クロップして描画
    const bgAspect = backgroundImage.width / backgroundImage.height;
    const canvasAspect = width / height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (bgAspect > canvasAspect) {
      // 背景が横長の場合
      drawHeight = height;
      drawWidth = height * bgAspect;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    } else {
      // 背景が縦長の場合
      drawWidth = width;
      drawHeight = width / bgAspect;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    }
    
    ctx.drawImage(backgroundImage, offsetX, offsetY, drawWidth, drawHeight);

    // オーバーレイ効果
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.7, 'rgba(0,0,0,0.1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

  } catch (error) {
    // 背景画像が読み込めない場合はグラデーション背景
    console.log(`   ⚠️ 背景画像読み込み失敗、グラデーション背景を使用`);
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, config.rarity.bgColor);
    bgGradient.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
  }

  // メインテキスト配置計算
  const centerX = width / 2;
  const centerY = height / 2;
  const fontSize = Math.min(config.rarity.fontSize * (width / 1024), width / 8);
  
  // フォント設定
  ctx.font = `bold ${fontSize}px "Hiragino Sans", "Yu Gothic", "Meiryo", "Arial Unicode MS", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // テキストエフェクト（多層レンダリング）
  const text = config.japaneseText;
  
  // 1. 最外側の影（黒）
  ctx.lineWidth = Math.max(fontSize / 8, 8);
  ctx.strokeStyle = '#000000';
  ctx.strokeText(text, centerX, centerY);
  
  // 2. 中間の縁取り（白）
  ctx.lineWidth = Math.max(fontSize / 12, 4);
  ctx.strokeStyle = '#FFFFFF';
  ctx.strokeText(text, centerX, centerY);
  
  // 3. メインカラーグラデーション
  const textGradient = ctx.createLinearGradient(0, centerY - fontSize/2, 0, centerY + fontSize/2);
  textGradient.addColorStop(0, config.rarity.color);
  textGradient.addColorStop(0.3, '#FFFFFF');
  textGradient.addColorStop(0.7, '#FFFFFF');
  textGradient.addColorStop(1, config.rarity.color);
  ctx.fillStyle = textGradient;
  ctx.fillText(text, centerX, centerY);
  
  // 4. ハイライト効果
  ctx.shadowColor = config.rarity.color;
  ctx.shadowBlur = fontSize / 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText(text, centerX, centerY - fontSize/20);
  
  // 影をリセット
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // レアリティバッジ（右上）
  if (width >= 600) {
    const badgeSize = Math.min(width / 8, 100);
    const badgeX = width - badgeSize - 20;
    const badgeY = badgeSize + 20;
    
    // バッジ背景
    ctx.fillStyle = config.rarity.color;
    ctx.beginPath();
    ctx.roundRect(badgeX - badgeSize/2, badgeY - badgeSize/2, badgeSize, badgeSize/2, badgeSize/8);
    ctx.fill();
    
    // バッジテキスト
    ctx.font = `bold ${badgeSize/4}px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(config.rarity.name, badgeX, badgeY);
  }

  // サブテキスト（下部）
  if (config.subText && height >= 400) {
    const subFontSize = fontSize / 3;
    ctx.font = `bold ${subFontSize}px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;
    ctx.fillStyle = config.rarity.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    
    const subY = centerY + fontSize/2 + subFontSize + 20;
    ctx.strokeText(config.subText, centerX, subY);
    ctx.fillText(config.subText, centerX, subY);
  }

  return canvas.toBuffer('image/png');
}

// バナー生成メイン関数
async function generateProductionBanners() {
  console.log('🚀 本格バナー生成システム開始...\n');

  // 出力ディレクトリ作成
  const outputDirs = ['images/production-banners', 'images/gacha-buttons', 'images/wide-banners'];
  outputDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // 既存の成功画像を使用
  const existingBackgrounds = [
    'images/bg-ssr-explosion.png',
    'images/bg-jackpot-fire.png', 
    'images/bg-galaxy-effect.png',
    'images/bg-lightning-storm.png'
  ];

  const results = [];
  let bannerCount = 0;

  // 各レアリティ×サイズ×テキストの組み合わせでバナー生成
  for (const [rarityKey, rarityInfo] of Object.entries(RARITY_CONFIG)) {
    for (const [sizeKey, sizeInfo] of Object.entries(BANNER_SIZES)) {
      for (const [textCategory, textArray] of Object.entries(JAPANESE_TEXTS)) {
        
        // ランダムに背景とテキストを選択
        const backgroundPath = existingBackgrounds[bannerCount % existingBackgrounds.length];
        const japaneseText = textArray[bannerCount % textArray.length];
        const subText = rarityKey === 'PSA10' ? '最高グレード認定' : 
                       rarityKey === 'SSR' ? 'スペシャルレア' : 
                       rarityKey === 'SS' ? 'スーパースペシャル' : null;

        const config = {
          size: sizeInfo,
          rarity: rarityInfo,
          japaneseText: japaneseText,
          subText: subText
        };

        const filename = `${sizeKey}-${rarityKey.toLowerCase()}-${textCategory}-${bannerCount % textArray.length + 1}.png`;
        const outputPath = sizeKey === 'gacha_button' ? `images/gacha-buttons/${filename}` :
                          sizeKey === 'wide_banner' ? `images/wide-banners/${filename}` :
                          `images/production-banners/${filename}`;

        console.log(`📝 生成中: ${sizeInfo.name} × ${rarityInfo.name} × ${japaneseText}`);
        
        try {
          const bannerBuffer = await createPremiumBanner(backgroundPath, config);
          fs.writeFileSync(outputPath, bannerBuffer);
          
          console.log(`   ✅ 完成: ${outputPath}`);
          
          results.push({
            filename: filename,
            size: sizeInfo.name,
            rarity: rarityInfo.name,
            text: japaneseText,
            subText: subText,
            path: outputPath,
            success: true
          });

          bannerCount++;

          // 各カテゴリで2つずつ生成したら次へ
          if (bannerCount % 2 === 0) break;

        } catch (error) {
          console.error(`   ❌ エラー: ${error.message}`);
          results.push({
            filename: filename,
            success: false,
            error: error.message
          });
        }
      }
    }
  }

  // 結果サマリー
  console.log('\n\n📊 バナー生成結果');
  console.log('================');
  
  const successful = results.filter(r => r.success).length;
  console.log(`✅ 成功: ${successful}/${results.length}`);
  
  // サイズ別統計
  console.log('\n📏 サイズ別生成数:');
  Object.values(BANNER_SIZES).forEach(size => {
    const count = results.filter(r => r.success && r.size === size.name).length;
    console.log(`   ${size.name}: ${count}個 (${size.width}×${size.height})`);
  });

  // 生成されたバナーリスト
  console.log('\n🎨 生成されたバナー:');
  results.filter(r => r.success).forEach((result, index) => {
    console.log(`${index + 1}. ${result.text} (${result.rarity})`);
    console.log(`   ファイル: ${result.path}`);
  });

  // 結果保存
  fs.writeFileSync(
    'images/production-banner-results.json',
    JSON.stringify(results, null, 2)
  );

  console.log('\n📂 出力フォルダ:');
  console.log('- images/production-banners/ (1024×1024バナー)');
  console.log('- images/gacha-buttons/ (600×100ボタン)');
  console.log('- images/wide-banners/ (1200×400バナー)');
  
  console.log('\n🖼️ バナー確認:');
  console.log('open images/production-banners/');
  console.log('open images/gacha-buttons/');

  return results;
}

// 実行
generateProductionBanners().catch(console.error);