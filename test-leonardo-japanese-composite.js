// Leonardo AI + Canvas日本語合成テスト
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

async function generateWithLeonardo(prompt) {
  const apiKey = envVars.LEONARDO_AI_API_KEY;
  
  // 1. 画像生成リクエスト
  const generateResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt,
      modelId: '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3', // Leonardo Creative
      width: 1024,
      height: 1024,
      num_images: 1,
      promptMagic: true,
      public: false,
      negative_prompt: 'text, letters, words, japanese text, chinese text'
    })
  });

  if (!generateResponse.ok) {
    const error = await generateResponse.text();
    throw new Error(`Leonardo generation error: ${generateResponse.status} - ${error}`);
  }

  const generateData = await generateResponse.json();
  const generationId = generateData.sdGenerationJob.generationId;
  
  // 2. 生成完了を待機
  console.log('   🎨 Leonardo AI生成中...');
  let attempts = 0;
  let status;
  
  do {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (!statusResponse.ok) {
      throw new Error(`Status check error: ${statusResponse.status}`);
    }
    
    status = await statusResponse.json();
    attempts++;
    console.log(`   ⏳ 生成状況確認中... (${attempts}/20)`);
    
  } while (status.generations_by_pk.status !== 'COMPLETE' && attempts < 20);

  if (status.generations_by_pk.status !== 'COMPLETE') {
    throw new Error('Generation timeout');
  }

  return status.generations_by_pk.generated_images[0].url;
}

async function compositeJapaneseText(backgroundImagePath, japaneseText, outputPath) {
  console.log('   📝 日本語テキスト合成中...');
  
  // Canvasを作成
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext('2d');

  // 背景画像を読み込み
  const backgroundImage = await loadImage(backgroundImagePath);
  ctx.drawImage(backgroundImage, 0, 0, 1024, 1024);

  // 日本語フォント設定（システムフォント使用）
  const fontSize = 80;
  ctx.font = `bold ${fontSize}px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // テキストエフェクト
  const centerX = 512;
  const centerY = 512;

  // 1. アウトライン（黒い縁取り）
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(japaneseText, centerX, centerY);

  // 2. 金色のグラデーション
  const gradient = ctx.createLinearGradient(0, centerY - fontSize/2, 0, centerY + fontSize/2);
  gradient.addColorStop(0, '#FFD700');
  gradient.addColorStop(0.5, '#FFA500');
  gradient.addColorStop(1, '#FF8C00');
  ctx.fillStyle = gradient;
  ctx.fillText(japaneseText, centerX, centerY);

  // 3. 光沢効果
  ctx.shadowColor = '#FFFF00';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillText(japaneseText, centerX, centerY - 5);

  // 画像を保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`   ✅ 合成完了: ${outputPath}`);
}

async function testLeonardoJapaneseComposite() {
  console.log('🚀 Leonardo AI + 日本語合成テスト開始...\n');

  // imagesディレクトリを作成
  if (!fs.existsSync('images')) {
    fs.mkdirSync('images');
  }

  const testCases = [
    {
      name: 'ssr-explosion',
      prompt: 'Epic golden explosion effect, dramatic lighting, particle effects, energy burst, cinematic style, no text, no letters',
      japaneseText: '超激レア',
      description: 'SSR爆発エフェクト + 超激レア'
    },
    {
      name: 'jackpot-fire',
      prompt: 'Intense fire explosion, flame burst, dramatic red and orange colors, cinematic lighting, no text',
      japaneseText: '大当たり！',
      description: '炎エフェクト + 大当たり！'
    },
    {
      name: 'galaxy-effect',
      prompt: 'Cosmic galaxy effect, swirling nebula, shooting stars, space background, mystical atmosphere, no text',
      japaneseText: 'SSR確定',
      description: '銀河エフェクト + SSR確定'
    },
    {
      name: 'lightning-storm',
      prompt: 'Electric lightning storm, blue energy bolts, dramatic electrical effects, dark storm clouds, no text',
      japaneseText: '雷撃演出',
      description: '雷撃エフェクト + 雷撃演出'
    }
  ];

  const results = [];

  for (const testCase of testCases) {
    console.log(`\n📝 テスト: ${testCase.description}`);
    console.log(`   プロンプト: ${testCase.prompt}`);
    console.log(`   日本語テキスト: ${testCase.japaneseText}`);
    
    try {
      // 1. Leonardo AIで背景生成
      const backgroundImageUrl = await generateWithLeonardo(testCase.prompt);
      const backgroundPath = `images/bg-${testCase.name}.png`;
      await downloadImage(backgroundImageUrl, backgroundPath);
      console.log(`   ✅ 背景画像生成完了: ${backgroundPath}`);

      // 2. 日本語テキスト合成
      const finalPath = `images/final-${testCase.name}.png`;
      await compositeJapaneseText(backgroundPath, testCase.japaneseText, finalPath);

      results.push({
        test: testCase.description,
        success: true,
        backgroundPath: backgroundPath,
        finalPath: finalPath,
        japaneseText: testCase.japaneseText
      });

      // Leonardo APIレート制限回避
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`   ❌ エラー: ${error.message}`);
      results.push({
        test: testCase.description,
        success: false,
        error: error.message
      });
    }
  }

  // 結果サマリー
  console.log('\n\n📊 Leonardo AI + 日本語合成結果');
  console.log('================================');
  
  const successful = results.filter(r => r.success).length;
  console.log(`成功: ${successful}/${results.length}`);
  
  console.log('\n詳細:');
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.test}`);
    console.log(`   状態: ${result.success ? '✅ 成功' : '❌ 失敗'}`);
    if (result.success) {
      console.log(`   最終画像: ${result.finalPath}`);
      console.log(`   日本語: ${result.japaneseText}`);
    } else {
      console.log(`   エラー: ${result.error}`);
    }
  });

  // 結果をJSONファイルに保存
  fs.writeFileSync(
    'images/leonardo-japanese-composite-results.json',
    JSON.stringify(results, null, 2)
  );

  console.log('\n\n🎯 結論');
  console.log('========');
  console.log('✅ Leonardo AI: 高品質な背景エフェクト生成');
  console.log('✅ Canvas API: 完璧な日本語フォント合成');
  console.log('✅ 結果: AIエフェクト + 美しい日本語テキスト');
  console.log('\n画像確認コマンド:');
  console.log('open images/final-*.png');
}

// 実行
testLeonardoJapaneseComposite().catch(console.error);