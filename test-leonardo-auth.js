// Leonardo AI認証テスト
import fs from 'fs';

// 環境変数読み込み
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key] = valueParts.join('=');
  }
});

async function testLeonardoAuth() {
  console.log('🎨 Leonardo AI認証テスト開始...\n');
  
  const apiKey = envVars.LEONARDO_AI_API_KEY;
  console.log(`APIキー: ${apiKey ? apiKey.substring(0, 8) + '...' : '未設定'}`);

  try {
    // 1. ユーザー情報取得
    console.log('\n1. ユーザー情報取得中...');
    const userResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/me', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      const error = await userResponse.text();
      throw new Error(`User info error: ${userResponse.status} - ${error}`);
    }

    const userData = await userResponse.json();
    console.log('✅ ユーザー情報取得成功');
    console.log(`   ユーザーID: ${userData.user_details[0].user.id}`);
    console.log(`   残りトークン: ${userData.user_details[0].subscriptionTokens}`);

    // 2. モデル一覧取得
    console.log('\n2. 利用可能モデル取得中...');
    const modelsResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!modelsResponse.ok) {
      throw new Error(`Models error: ${modelsResponse.status}`);
    }

    const modelsData = await modelsResponse.json();
    console.log('✅ モデル一覧取得成功');
    console.log(`   利用可能モデル数: ${modelsData.models?.length || 0}`);
    
    // 推奨モデルを表示
    const recommendedModels = modelsData.models?.filter(m => 
      m.name.includes('Leonardo') || m.name.includes('Creative')
    ).slice(0, 3);
    
    console.log('\n   推奨モデル:');
    recommendedModels?.forEach(model => {
      console.log(`   - ${model.name} (${model.id})`);
    });

    // 3. 簡単な画像生成テスト
    console.log('\n3. 画像生成テスト中...');
    const generateResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'simple golden explosion effect, no text, cinematic lighting',
        modelId: '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3', // Leonardo Creative
        width: 512,
        height: 512,
        num_images: 1,
        promptMagic: true,
        public: false
      })
    });

    if (!generateResponse.ok) {
      const error = await generateResponse.text();
      throw new Error(`Generation error: ${generateResponse.status} - ${error}`);
    }

    const generateData = await generateResponse.json();
    console.log('✅ 画像生成リクエスト成功');
    console.log(`   生成ID: ${generateData.sdGenerationJob.generationId}`);

    return {
      success: true,
      userData: userData,
      modelsCount: modelsData.models?.length || 0,
      generationId: generateData.sdGenerationJob.generationId
    };

  } catch (error) {
    console.error('❌ Leonardo AI認証エラー:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 実行
testLeonardoAuth().then(result => {
  console.log('\n📊 Leonardo AI認証結果:');
  console.log('========================');
  if (result.success) {
    console.log('✅ 認証成功 - Leonardo AI使用可能');
    console.log(`   利用可能モデル: ${result.modelsCount}個`);
  } else {
    console.log('❌ 認証失敗');
    console.log(`   エラー: ${result.error}`);
    console.log('\n解決方法:');
    console.log('1. Leonardo AIアカウントでAPIキーを再確認');
    console.log('2. https://leonardo.ai/developer でAPIアクセスを有効化');
    console.log('3. サブスクリプション状態を確認');
  }
}).catch(console.error);