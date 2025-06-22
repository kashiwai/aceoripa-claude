// OpenAI DALL-E 3 日本語テスト
import fs from 'fs';
import https from 'https';

// 環境変数を直接読み込み
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

async function generateWithOpenAI(prompt) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${envVars.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid"
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

async function testJapaneseGeneration() {
  console.log('🚀 OpenAI DALL-E 3 日本語テスト開始...\n');

  // imagesディレクトリを作成
  if (!fs.existsSync('images')) {
    fs.mkdirSync('images');
  }

  const testPrompts = [
    {
      name: 'japanese-text-1',
      prompt: 'A spectacular golden explosion effect with Japanese text "超激レア" (Ultra Rare) prominently displayed in the center, sparkling effects, dramatic lighting, cinematic style, 8K quality',
      description: '日本語テキスト表示テスト1'
    },
    {
      name: 'japanese-text-2',
      prompt: 'A dramatic fire effect with Japanese text "大当たり！" (Jackpot!) in burning red letters, flame effects, movie-style lighting, epic presentation',
      description: '日本語テキスト表示テスト2'
    },
    {
      name: 'japanese-gacha-1',
      prompt: 'Japanese gacha machine with capsule bursting out, rainbow light effects, Japanese text "SSR確定" (SSR Guaranteed), colorful and exciting',
      description: 'ガチャ演出テスト'
    },
    {
      name: 'japanese-pokemon-style',
      prompt: 'Pokemon card style rare card presentation with holographic effects, Japanese text "伝説のカード" (Legendary Card), golden frame, sparkling background',
      description: 'ポケカ風演出テスト'
    },
    {
      name: 'no-text-effect',
      prompt: 'Spectacular rainbow explosion effect in space, shooting stars, mystical light particles, no text, no letters, pure visual effect',
      description: 'テキスト無し演出テスト'
    }
  ];

  const results = [];

  for (const test of testPrompts) {
    console.log(`\n📝 テスト: ${test.description}`);
    console.log(`   プロンプト: ${test.prompt}`);
    
    try {
      console.log('   生成中...');
      const response = await generateWithOpenAI(test.prompt);
      
      if (response.data && response.data[0]) {
        const imageUrl = response.data[0].url;
        const filename = `images/test-openai-${test.name}.png`;
        
        await downloadImage(imageUrl, filename);
        console.log(`   ✅ 成功！画像を保存: ${filename}`);
        
        results.push({
          test: test.description,
          prompt: test.prompt,
          success: true,
          filename: filename,
          imageUrl: imageUrl
        });
      } else {
        throw new Error('予期しないレスポンス形式');
      }
      
      // レート制限回避のため待機
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`   ❌ エラー: ${error.message}`);
      results.push({
        test: test.description,
        prompt: test.prompt,
        success: false,
        error: error.message
      });
    }
  }

  // 結果サマリー
  console.log('\n\n📊 テスト結果サマリー');
  console.log('========================');
  
  const successful = results.filter(r => r.success).length;
  console.log(`成功: ${successful}/${results.length}`);
  
  console.log('\n詳細:');
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.test}`);
    console.log(`   状態: ${result.success ? '✅ 成功' : '❌ 失敗'}`);
    if (result.success) {
      console.log(`   ファイル: ${result.filename}`);
    } else {
      console.log(`   エラー: ${result.error}`);
    }
  });

  // 結果をJSONファイルに保存
  fs.writeFileSync(
    'images/openai-japanese-test-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('\n\n💾 詳細な結果を保存: images/openai-japanese-test-results.json');

  // 日本語表示に関する分析
  console.log('\n\n🔍 日本語表示分析');
  console.log('================');
  console.log('1. 生成された画像を確認して、日本語テキストが正しく表示されているか確認してください');
  console.log('2. DALL-E 3は英語プロンプトから日本語テキストを生成できますが、正確性に注意が必要です');
  console.log('3. 「テキスト無し」指定の画像には文字が含まれていないことを確認してください');
  console.log('\n画像確認コマンド:');
  console.log('open images/test-openai-*.png');
}

// 実行
testJapaneseGeneration().catch(console.error);