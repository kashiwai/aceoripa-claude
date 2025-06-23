const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Leonardo AI APIキー
const LEONARDO_API_KEY = 'c80b4e94-44bb-487d-8829-1725bf5ca714';

// Leonardo AIで画像生成
const generateLeonardoImage = async (prompt, filename) => {
  try {
    console.log(`🎨 ${filename} を生成中...`);
    
    // Step 1: 画像生成リクエスト
    const generateResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${LEONARDO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        modelId: '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3', // Leonardo Creative
        width: 1024,
        height: 512,
        num_images: 1,
        num_inference_steps: 30,
        guidance_scale: 7,
        scheduler: 'LEONARDO',
        public: false,
        tiling: false,
        negative_prompt: 'blurry, low quality, text artifacts, watermark'
      })
    });

    if (!generateResponse.ok) {
      const error = await generateResponse.text();
      console.error('Leonardo AI generation error:', error);
      return null;
    }

    const generateData = await generateResponse.json();
    const generationId = generateData.sdGenerationJob.generationId;
    
    console.log(`⏳ 生成ID: ${generationId} - 画像生成中...`);
    
    // Step 2: 生成完了を待つ（ポーリング）
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!imageUrl && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒待機
      
      const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${LEONARDO_API_KEY}`
        }
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.generations_by_pk && statusData.generations_by_pk.status === 'COMPLETE') {
          if (statusData.generations_by_pk.generated_images && statusData.generations_by_pk.generated_images.length > 0) {
            imageUrl = statusData.generations_by_pk.generated_images[0].url;
            break;
          }
        }
      }
      
      attempts++;
      console.log(`⏳ 生成状況確認中... (${attempts}/${maxAttempts})`);
    }
    
    if (!imageUrl) {
      console.error('❌ 画像生成タイムアウト');
      return null;
    }
    
    // Step 3: 画像をダウンロード
    console.log('📥 画像をダウンロード中...');
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.buffer();
    
    // ファイルに保存
    const filepath = path.join('public/images/logos', filename);
    fs.writeFileSync(filepath, imageBuffer);
    
    console.log(`✅ ${filename} 生成完了！`);
    return filepath;
    
  } catch (error) {
    console.error(`❌ ${filename} 生成エラー:`, error.message);
    return null;
  }
};

// ロゴプロンプト定義
const logoPrompts = [
  {
    filename: 'aceoripa-leonardo-gaming.png',
    prompt: `Professional gaming logo design for "ACEORIPA" text, vibrant neon colors with purple and gold accents, 
    trading card pack elements, dice and treasure chest motifs, sparkle and glow effects, 
    exciting Japanese gacha game aesthetic, high contrast dark background, 
    clean modern typography, premium quality logo design, digital art style`
  },
  {
    filename: 'aceoripa-leonardo-fantasy.png',
    prompt: `Fantasy RPG style logo for "ACEORIPA" text, magical crystal elements, 
    mystical card pack with glowing aura, treasure and gem decorations, 
    gold and purple color scheme, ornate fantasy typography, 
    sparkles and magical particles, epic game logo design, 
    dark mystical background, professional logo artwork`
  },
  {
    filename: 'aceoripa-leonardo-cyberpunk.png',
    prompt: `Cyberpunk futuristic logo design "ACEORIPA" text, neon holographic effects, 
    digital card pack with data streams, high-tech UI elements, 
    cyan and magenta color palette, glitch effects, circuit patterns, 
    futuristic typography, dark tech background, 
    professional esports logo style, crisp digital design`
  },
  {
    filename: 'aceoripa-leonardo-premium.png',
    prompt: `Luxury premium logo design "ACEORIPA" text, golden metallic finish, 
    diamond and crown elements, elegant card pack design, 
    black and gold color scheme, sophisticated typography, 
    premium foil effects, VIP exclusive feeling, 
    high-end brand logo, professional corporate design`
  }
];

// メイン実行関数
const main = async () => {
  // ディレクトリ作成
  const logoDir = 'public/images/logos';
  if (!fs.existsSync(logoDir)) {
    fs.mkdirSync(logoDir, { recursive: true });
  }

  console.log('🎮 Leonardo AIでaceoripaロゴを4パターン生成開始！\n');

  for (const logoConfig of logoPrompts) {
    await generateLeonardoImage(logoConfig.prompt, logoConfig.filename);
    
    // API制限回避のため少し待機
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\n✨ Leonardo AI生成ロゴの作成が完了しました！');
  console.log('生成されたファイル:');
  logoPrompts.forEach(config => {
    console.log(`- public/images/logos/${config.filename}`);
  });
};

// 実行
main().catch(console.error);