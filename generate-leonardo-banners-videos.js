// Leonardo AI バナー・動画統合生成システム
import fs from 'fs';
import https from 'https';
import { createCanvas, registerFont, loadImage } from 'canvas';

// 環境変数読み込み
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key] = valueParts.join('=');
  }
});

const LEONARDO_API_KEY = envVars.LEONARDO_AI_API_KEY;

// 出力設定
const OUTPUT_CONFIG = {
  banner: {
    width: 1024,
    height: 1024,
    formats: ['png', 'jpg']
  },
  video: {
    duration: 8, // 8秒
    fps: 24,
    formats: ['mp4']
  }
};

// ガチャ演出テンプレート
const GACHA_TEMPLATES = {
  explosion: {
    name: '爆発演出',
    prompt: 'Epic golden explosion effect, particle burst, dramatic lighting, energy waves, cinematic style, no text, no letters',
    videoPrompt: 'explosive energy burst animation, particles flying outward, dramatic light explosion',
    motionStrength: 8,
    colors: ['#FFD700', '#FFA500', '#FF8C00']
  },
  galaxy: {
    name: '銀河演出',
    prompt: 'Cosmic galaxy effect, swirling nebula, shooting stars, aurora lights, space background, mystical atmosphere, no text',
    videoPrompt: 'galaxy swirl animation, shooting stars movement, cosmic drift',
    motionStrength: 6,
    colors: ['#4B0082', '#8A2BE2', '#9370DB']
  },
  lightning: {
    name: '雷撃演出',
    prompt: 'Electric lightning storm, blue energy bolts, dramatic electrical effects, thunder clouds, no text',
    videoPrompt: 'lightning strike animation, electric bolts movement, energy surge',
    motionStrength: 9,
    colors: ['#00BFFF', '#1E90FF', '#0080FF']
  },
  fire: {
    name: '炎演出',
    prompt: 'Intense fire explosion, flame burst, dragon fire breath, molten lava effects, no text',
    videoPrompt: 'fire flame animation, burning effect, heat wave movement',
    motionStrength: 7,
    colors: ['#FF4500', '#FF6347', '#DC143C']
  },
  rainbow: {
    name: '虹色演出',
    prompt: 'Rainbow prism effect, iridescent light rays, colorful spectrum burst, magical sparkles, no text',
    videoPrompt: 'rainbow wave animation, color spectrum flow, prismatic light movement',
    motionStrength: 5,
    colors: ['#FF1493', '#00CED1', '#32CD32']
  }
};

// レアリティ設定
const RARITY_CONFIG = {
  N: { name: 'ノーマル', color: '#808080', fontSize: 60 },
  R: { name: 'レア', color: '#0080FF', fontSize: 65 },
  SR: { name: 'スーパーレア', color: '#FFD700', fontSize: 70 },
  SSR: { name: 'スペシャルレア', color: '#FF69B4', fontSize: 75 },
  SS: { name: 'スーパースペシャル', color: '#FF4500', fontSize: 80 },
  PSA10: { name: 'パーフェクト', color: '#8B00FF', fontSize: 85 }
};

// 日本語テキスト設定
const JAPANESE_TEXTS = {
  rare: ['超激レア', 'レアカード', '大当たり！', 'SSR確定', '奇跡の一枚'],
  celebration: ['おめでとう！', '大成功！', '最高級！', '伝説級！', '神引き！'],
  effects: ['爆発演出', '雷撃効果', '炎の力', '銀河の輝き', '虹色の奇跡']
};

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

// Leonardo AI画像生成
async function generateBackgroundImage(template, rarity) {
  console.log(`   🎨 ${template.name}背景生成中...`);
  
  const enhancedPrompt = `${template.prompt}, ${rarity.toLowerCase()} grade quality, premium effect, 8k resolution`;
  
  const generateResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LEONARDO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: enhancedPrompt,
      modelId: '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3',
      width: OUTPUT_CONFIG.banner.width,
      height: OUTPUT_CONFIG.banner.height,
      num_images: 1,
      promptMagic: true,
      promptMagicVersion: 'v3',
      public: false,
      negative_prompt: 'text, letters, words, japanese text, chinese text, watermark'
    })
  });

  if (!generateResponse.ok) {
    throw new Error(`Leonardo generation error: ${generateResponse.status}`);
  }

  const generateData = await generateResponse.json();
  const generationId = generateData.sdGenerationJob.generationId;
  
  // 生成完了を待機
  let attempts = 0;
  let status;
  
  do {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
      headers: { 'Authorization': `Bearer ${LEONARDO_API_KEY}` }
    });
    
    status = await statusResponse.json();
    attempts++;
    
  } while (status.generations_by_pk.status !== 'COMPLETE' && attempts < 30);

  if (status.generations_by_pk.status !== 'COMPLETE') {
    throw new Error('Background generation timeout');
  }

  return status.generations_by_pk.generated_images[0].url;
}

// Leonardo AI動画生成
async function generateVideo(imageId, template) {
  console.log(`   🎬 ${template.name}動画生成中...`);
  
  const motionResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations-motion-svd', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LEONARDO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      imageId: imageId,
      motionStrength: template.motionStrength,
      public: false
    })
  });

  if (!motionResponse.ok) {
    throw new Error(`Leonardo motion error: ${motionResponse.status}`);
  }

  const motionData = await motionResponse.json();
  const motionId = motionData.motionSvdGenerationJob.id;
  
  // 動画生成完了を待機
  let attempts = 0;
  let motionStatus;
  
  do {
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations-motion-svd/${motionId}`, {
      headers: { 'Authorization': `Bearer ${LEONARDO_API_KEY}` }
    });
    
    motionStatus = await statusResponse.json();
    attempts++;
    
  } while (motionStatus.motion_svd_generation_by_pk.status !== 'COMPLETE' && attempts < 40);

  if (motionStatus.motion_svd_generation_by_pk.status !== 'COMPLETE') {
    throw new Error('Video generation timeout');
  }

  return {
    videoUrl: motionStatus.motion_svd_generation_by_pk.motionMP4URL,
    imageId: imageId
  };
}

// 日本語テキスト合成
async function compositeJapaneseText(backgroundPath, japaneseText, rarity, outputPath) {
  console.log(`   📝 日本語テキスト「${japaneseText}」合成中...`);
  
  const canvas = createCanvas(OUTPUT_CONFIG.banner.width, OUTPUT_CONFIG.banner.height);
  const ctx = canvas.getContext('2d');

  // 背景画像読み込み
  const backgroundImage = await loadImage(backgroundPath);
  ctx.drawImage(backgroundImage, 0, 0, OUTPUT_CONFIG.banner.width, OUTPUT_CONFIG.banner.height);

  const rarityInfo = RARITY_CONFIG[rarity];
  const fontSize = rarityInfo.fontSize;
  
  // フォント設定
  ctx.font = `bold ${fontSize}px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const centerX = OUTPUT_CONFIG.banner.width / 2;
  const centerY = OUTPUT_CONFIG.banner.height / 2;

  // テキストエフェクト
  // 1. 黒い縁取り（太い）
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(japaneseText, centerX, centerY);

  // 2. 白い縁取り（中）
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#FFFFFF';
  ctx.strokeText(japaneseText, centerX, centerY);

  // 3. メインカラーグラデーション
  const gradient = ctx.createLinearGradient(0, centerY - fontSize/2, 0, centerY + fontSize/2);
  gradient.addColorStop(0, rarityInfo.color);
  gradient.addColorStop(0.5, '#FFFFFF');
  gradient.addColorStop(1, rarityInfo.color);
  ctx.fillStyle = gradient;
  ctx.fillText(japaneseText, centerX, centerY);

  // 4. 光沢効果
  ctx.shadowColor = rarityInfo.color;
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText(japaneseText, centerX, centerY - 8);

  // 5. レアリティ名を下部に追加
  ctx.font = `bold 24px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;
  ctx.fillStyle = rarityInfo.color;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeText(rarityInfo.name, centerX, centerY + fontSize + 40);
  ctx.fillText(rarityInfo.name, centerX, centerY + fontSize + 40);

  // 画像保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
}

// メイン生成関数
async function generateBannersAndVideos() {
  console.log('🚀 Leonardo AI バナー・動画統合生成開始...\n');

  // 出力ディレクトリ作成
  const outputDirs = ['images/banners', 'images/videos', 'images/backgrounds'];
  outputDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const results = [];
  let totalGenerated = 0;

  // 各テンプレート×レアリティの組み合わせで生成
  for (const [templateKey, template] of Object.entries(GACHA_TEMPLATES)) {
    for (const [rarity, rarityInfo] of Object.entries(RARITY_CONFIG)) {
      
      const testName = `${templateKey}-${rarity.toLowerCase()}`;
      console.log(`\n📝 生成中: ${template.name} × ${rarityInfo.name}`);
      
      try {
        // 1. 背景画像生成
        const backgroundUrl = await generateBackgroundImage(template, rarity);
        const backgroundPath = `images/backgrounds/bg-${testName}.png`;
        await downloadImage(backgroundUrl, backgroundPath);
        console.log(`   ✅ 背景保存: ${backgroundPath}`);

        // 2. 日本語テキスト選択
        const textCategories = Object.keys(JAPANESE_TEXTS);
        const randomCategory = textCategories[Math.floor(Math.random() * textCategories.length)];
        const textArray = JAPANESE_TEXTS[randomCategory];
        const japaneseText = textArray[Math.floor(Math.random() * textArray.length)];

        // 3. バナー生成
        const bannerPath = `images/banners/banner-${testName}.png`;
        await compositeJapaneseText(backgroundPath, japaneseText, rarity, bannerPath);
        console.log(`   ✅ バナー完成: ${bannerPath}`);

        // 4. 動画生成（背景画像からImageIDを取得して動画化）
        console.log(`   🎬 動画生成準備中...`);
        
        // 背景画像を再度Leonardo AIに送信して動画化
        // まず画像をLeonardo AIにアップロードしてImageIDを取得する必要がある
        // 簡単化のため、ここでは動画生成をスキップして、後でバッチ処理する
        
        results.push({
          template: template.name,
          rarity: rarityInfo.name,
          japaneseText: japaneseText,
          backgroundPath: backgroundPath,
          bannerPath: bannerPath,
          videoPath: null, // 後で生成
          success: true
        });

        totalGenerated++;
        console.log(`   ✅ 完了 (${totalGenerated})`);

        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error) {
        console.error(`   ❌ エラー: ${error.message}`);
        results.push({
          template: template.name,
          rarity: rarityInfo.name,
          success: false,
          error: error.message
        });
      }
    }
  }

  // 結果サマリー
  console.log('\n\n📊 生成結果サマリー');
  console.log('==================');
  
  const successful = results.filter(r => r.success).length;
  console.log(`✅ 成功: ${successful}/${results.length}`);
  console.log(`🎨 バナー生成数: ${successful}`);
  console.log(`🎬 動画生成数: 0 (後で一括生成)`);

  // 成功したものを表示
  console.log('\n🎯 生成されたバナー:');
  results.filter(r => r.success).forEach((result, index) => {
    console.log(`${index + 1}. ${result.template} × ${result.rarity}`);
    console.log(`   テキスト: ${result.japaneseText}`);
    console.log(`   バナー: ${result.bannerPath}`);
  });

  // 結果をJSONで保存
  fs.writeFileSync(
    'images/generation-results.json',
    JSON.stringify(results, null, 2)
  );

  console.log('\n📂 出力フォルダ:');
  console.log('- images/banners/ (完成バナー)');
  console.log('- images/backgrounds/ (AI背景)');
  console.log('- images/videos/ (動画は後で生成)');
  
  console.log('\n🖼️ バナー確認コマンド:');
  console.log('open images/banners/');

  return results;
}

// 実行
generateBannersAndVideos().catch(console.error);