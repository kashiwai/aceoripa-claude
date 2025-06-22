// Google Vertex AI認証テスト（サービスアカウント使用）
import fs from 'fs';
import { GoogleAuth } from 'google-auth-library';

async function testGoogleVertexAuth() {
  console.log('🔐 Google Vertex AI認証テスト開始...\n');

  try {
    // 1. サービスアカウントキーの確認
    const keyFile = 'google-service-account.json';
    if (!fs.existsSync(keyFile)) {
      throw new Error(`サービスアカウントキーが見つかりません: ${keyFile}`);
    }

    console.log('✅ サービスアカウントキーを確認');

    // 2. Google Auth初期化
    const auth = new GoogleAuth({
      keyFile: keyFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    console.log('🔄 認証トークン取得中...');
    const client = await auth.getClient();
    const projectId = await auth.getProjectId();
    const accessTokenResponse = await client.getAccessToken();
    
    if (!accessTokenResponse.token) {
      throw new Error('アクセストークンの取得に失敗');
    }

    console.log('✅ 認証成功');
    console.log(`   プロジェクトID: ${projectId}`);
    console.log(`   トークン: ${accessTokenResponse.token.substring(0, 20)}...`);

    // 3. Vertex AI APIテスト
    console.log('\n🎨 Imagen 3テスト中...');
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3:predict`;
    
    const testPrompt = '美しい金色の爆発エフェクト、映画的なライティング、テキスト無し';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessTokenResponse.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instances: [{
          prompt: testPrompt
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
          safetyFilterLevel: 'block_some',
          personGeneration: 'dont_allow'
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Imagen API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('✅ Imagen 3テスト成功');
    
    if (data.predictions && data.predictions[0]) {
      const prediction = data.predictions[0];
      if (prediction.bytesBase64Encoded) {
        // Base64画像を保存
        const imageBuffer = Buffer.from(prediction.bytesBase64Encoded, 'base64');
        if (!fs.existsSync('images')) fs.mkdirSync('images');
        fs.writeFileSync('images/google-test-success.png', imageBuffer);
        console.log('   💾 テスト画像を保存: images/google-test-success.png');
      }
    }

    return {
      success: true,
      projectId: projectId,
      hasImageGeneration: true
    };

  } catch (error) {
    console.error('❌ Google Vertex AI認証エラー:', error.message);
    
    // エラー別の解決策提示
    if (error.message.includes('サービスアカウントキー')) {
      console.log('\n解決方法:');
      console.log('1. Google Cloud Consoleでサービスアカウントを作成');
      console.log('2. JSONキーをダウンロード');
      console.log('3. google-service-account.json として保存');
    } else if (error.message.includes('403')) {
      console.log('\n解決方法:');
      console.log('1. サービスアカウントにVertex AI User権限を追加');
      console.log('2. Vertex AIを有効化');
    }

    return {
      success: false,
      error: error.message
    };
  }
}

// 実行
testGoogleVertexAuth().then(result => {
  console.log('\n📊 Google Vertex AI認証結果:');
  console.log('================================');
  if (result.success) {
    console.log('✅ 認証成功 - Google Vertex AI使用可能');
    console.log(`   プロジェクト: ${result.projectId}`);
    console.log('   Imagen 3での画像生成が可能です');
  } else {
    console.log('❌ 認証失敗');
    console.log(`   エラー: ${result.error}`);
  }
}).catch(console.error);