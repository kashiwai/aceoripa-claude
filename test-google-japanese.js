// Google Vertex AI 日本語テスト
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

// Google Vertex AIクライアント（簡易版）
class GoogleVertexClient {
  constructor(apiKey, projectId) {
    this.apiKey = apiKey;
    this.projectId = projectId;
    this.location = 'us-central1';
    this.baseURL = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${this.location}`;
  }

  async generateImage(prompt, options = {}) {
    const endpoint = `${this.baseURL}/publishers/google/models/imagen-3:predict`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Goog-User-Project': this.projectId
      },
      body: JSON.stringify({
        instances: [{ prompt: prompt }],
        parameters: {
          sampleCount: options.sampleCount || 1,
          aspectRatio: options.aspectRatio || '1:1',
          safetyFilterLevel: options.safetyFilterLevel || 'block_some',
          personGeneration: options.personGeneration || 'dont_allow',
          negativePrompt: options.negativePrompt || '',
          language: 'ja'
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vertex AI API error: ${response.status} - ${error}`);
    }

    return await response.json();
  }
}

const googleVertex = new GoogleVertexClient(
  envVars.VERTEX_AI_API_KEY,
  envVars.GOOGLE_CLOUD_PROJECT
);

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    if (url.startsWith('data:')) {
      // Base64データの場合
      const base64Data = url.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filepath, buffer);
      resolve();
    } else {
      // URLの場合
      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', reject);
    }
  });
}

async function testJapaneseGeneration() {
  console.log('🚀 Google Vertex AI 日本語テスト開始...\n');

  const testPrompts = [
    {
      name: 'japanese-text-1',
      prompt: '「超激レア」という金色の日本語テキストが中央に大きく表示されている、豪華な爆発エフェクト背景、キラキラ効果',
      description: '日本語テキスト表示テスト1'
    },
    {
      name: 'japanese-text-2',
      prompt: '「大当たり！」の赤い文字が燃え上がる炎のエフェクトとともに表示、ドラマチックな演出、映画的照明',
      description: '日本語テキスト表示テスト2'
    },
    {
      name: 'japanese-gacha-1',
      prompt: '日本のガチャガチャマシン、カプセルが飛び出す瞬間、虹色の光、「SSR確定」の文字付き',
      description: 'ガチャ演出テスト'
    },
    {
      name: 'japanese-pokemon-style',
      prompt: 'ポケモンカード風のレアカード演出、キラキラホログラム効果、「伝説のカード」という日本語タイトル、金色の枠',
      description: 'ポケカ風演出テスト'
    },
    {
      name: 'no-text-effect',
      prompt: '壮大な虹色の爆発エフェクト、宇宙空間、流れ星、神秘的な光の粒子、テキスト無し、文字無し',
      description: 'テキスト無し演出テスト'
    }
  ];

  const results = [];

  for (const test of testPrompts) {
    console.log(`\n📝 テスト: ${test.description}`);
    console.log(`   プロンプト: ${test.prompt}`);
    
    try {
      console.log('   生成中...');
      const response = await googleVertex.generateImage(test.prompt, {
        sampleCount: 1,
        aspectRatio: '1:1',
        safetyFilterLevel: 'block_some',
        personGeneration: 'dont_allow'
      });

      if (response.predictions && response.predictions[0]) {
        const imageData = response.predictions[0];
        const filename = `images/test-google-${test.name}.png`;
        
        if (imageData.bytesBase64Encoded) {
          const imageUrl = `data:image/png;base64,${imageData.bytesBase64Encoded}`;
          await downloadImage(imageUrl, filename);
          console.log(`   ✅ 成功！画像を保存: ${filename}`);
          
          results.push({
            test: test.description,
            prompt: test.prompt,
            success: true,
            filename: filename,
            hasBase64: true
          });
        } else if (imageData.gcsUri) {
          console.log(`   ✅ GCS URI取得: ${imageData.gcsUri}`);
          results.push({
            test: test.description,
            prompt: test.prompt,
            success: true,
            gcsUri: imageData.gcsUri,
            hasBase64: false
          });
        }
      } else {
        throw new Error('予期しないレスポンス形式');
      }
      
      // レート制限回避のため待機
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      if (result.filename) {
        console.log(`   ファイル: ${result.filename}`);
      }
      if (result.gcsUri) {
        console.log(`   GCS URI: ${result.gcsUri}`);
      }
    } else {
      console.log(`   エラー: ${result.error}`);
    }
  });

  // 結果をJSONファイルに保存
  fs.writeFileSync(
    'images/google-japanese-test-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('\n\n💾 詳細な結果を保存: images/google-japanese-test-results.json');

  // 日本語表示に関する分析
  console.log('\n\n🔍 日本語表示分析');
  console.log('================');
  console.log('1. 生成された画像を確認して、日本語テキストが正しく表示されているか確認してください');
  console.log('2. 文字化けや表示されない場合は、プロンプトの調整が必要です');
  console.log('3. 「テキスト無し」指定の画像には文字が含まれていないことを確認してください');
  console.log('\n画像確認コマンド:');
  console.log('open images/test-google-japanese-*.png');
}

// 実行
testJapaneseGeneration().catch(console.error);