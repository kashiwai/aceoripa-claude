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
        height: 1024,
        num_images: 1,
        num_inference_steps: 30,
        guidance_scale: 7,
        scheduler: 'LEONARDO',
        public: false,
        tiling: false,
        negative_prompt: 'low quality, blurry, text errors, watermark, signature'
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
    const filepath = path.join('public/images/banners/ai-campaign', filename);
    fs.writeFileSync(filepath, imageBuffer);
    
    console.log(`✅ ${filename} 生成完了！`);
    return filepath;
    
  } catch (error) {
    console.error(`❌ ${filename} 生成エラー:`, error.message);
    return null;
  }
};

// バナープロンプト定義（既存スタイルに合わせる）
const bannerPrompts = [
  {
    filename: 'pokemon-151-ultra-rare.png',
    prompt: `Japanese gacha campaign banner design, vibrant radial sunburst background transitioning from hot pink to orange to yellow, 
    multiple Pokemon trading cards floating dynamically with holographic effects, 
    large bold Japanese text "ポケモン151" with metallic gold finish, sparkles and star particles everywhere, 
    "SSR確定" badge in corner, premium campaign style, festive celebration mood, 
    price tag showing "1回 800円", professional mobile game banner quality, 1024x1024 square format`
  },
  {
    filename: 'shiny-treasure-premium.png',
    prompt: `Luxurious Pokemon gacha banner, gradient background from deep purple to gold, 
    shining treasure chest overflowing with rare holographic Pokemon cards, 
    Japanese text "シャイニートレジャー" in bold metallic letters, 
    "PSA10確率UP!" campaign text, radiating light beams from center, 
    floating diamond and gem effects, sparkles and glitter particles, 
    "限定" (limited) red stamp, price "1回 1,200円", 
    premium gacha game banner style, 1024x1024 format`
  },
  {
    filename: 'mega-campaign-special.png',
    prompt: `Epic Japanese gacha campaign banner, explosive radial burst background in rainbow colors, 
    "超激レアガチャ" text in massive golden 3D letters, 
    multiple rare Pokemon cards spiraling outward with motion blur, 
    "10連ガチャ20%OFF" discount badge, confetti and celebration effects, 
    lightning bolts and energy effects, stars and sparkles filling the space, 
    "今だけ!" (now only) urgent text, festive party atmosphere, 
    professional mobile game promotional banner, 1024x1024 square`
  },
  {
    filename: 'pikachu-festival-banner.png',
    prompt: `Pikachu special event banner, bright yellow electric background with lightning effects, 
    multiple Pikachu cards including special editions floating with glow effects, 
    "ピカチュウ祭り" in playful bold Japanese text with electric aura, 
    "出現率2倍!" (appearance rate 2x) campaign text in red, 
    electric sparks and thunder effects, star bursts, 
    cheerful festival atmosphere, "期間限定" limited time stamp, 
    Pokemon gacha game style, vibrant and exciting design, 1024x1024 format`
  }
];

// メイン実行関数
const main = async () => {
  // ディレクトリ作成
  const bannerDir = 'public/images/banners/ai-campaign';
  if (!fs.existsSync(bannerDir)) {
    fs.mkdirSync(bannerDir, { recursive: true });
  }

  console.log('🎮 Leonardo AIで既存クオリティのキャンペーンバナーを生成開始！\n');

  for (const bannerConfig of bannerPrompts) {
    await generateLeonardoImage(bannerConfig.prompt, bannerConfig.filename);
    
    // API制限回避のため少し待機
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\n✨ Leonardo AIキャンペーンバナーの生成が完了しました！');
  console.log('生成されたファイル:');
  bannerPrompts.forEach(config => {
    console.log(`- public/images/banners/ai-campaign/${config.filename}`);
  });
};

// 実行
main().catch(console.error);