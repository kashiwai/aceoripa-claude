// Leonardo AI Motion 動画生成システム
import fs from 'fs';
import https from 'https';
import { createCanvas, loadImage } from 'canvas';

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

// 動画設定
const VIDEO_CONFIG = {
  duration: 8, // 8秒
  motionStrength: 7, // 1-10の範囲
  fps: 24
};

// 動画テンプレート
const VIDEO_TEMPLATES = {
  explosion: {
    name: '爆発演出',
    motionStrength: 8,
    prompt: 'Epic golden explosion with particle burst, energy waves radiating outward, dramatic cinematic lighting'
  },
  galaxy: {
    name: '銀河演出', 
    motionStrength: 6,
    prompt: 'Cosmic galaxy swirling motion, shooting stars movement, nebula drift animation'
  },
  lightning: {
    name: '雷撃演出',
    motionStrength: 9,
    prompt: 'Electric lightning bolts striking, energy surge animation, thunder storm effects'
  },
  fire: {
    name: '炎演出',
    motionStrength: 7,
    prompt: 'Intense fire flames dancing, heat wave distortion, burning particle effects'
  }
};

async function downloadVideo(url, filepath) {
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

// 既存画像から動画生成
async function generateVideoFromImage(imagePath, template, outputName) {
  console.log(`🎬 ${template.name}動画生成開始: ${outputName}`);
  
  try {
    // 1. 画像をLeonardo AIにアップロード
    console.log('   📤 画像アップロード中...');
    
    const imageBuffer = fs.readFileSync(imagePath);
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('files', blob, 'background.png');

    const uploadResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/init-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LEONARDO_API_KEY}`
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload error: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    const imageId = uploadData.uploadInitImageId;
    console.log(`   ✅ アップロード完了: ${imageId}`);

    // 2. Motion SVD で動画生成
    console.log('   🎥 Motion SVD動画生成中...');
    
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
      const errorText = await motionResponse.text();
      throw new Error(`Motion generation error: ${motionResponse.status} - ${errorText}`);
    }

    const motionData = await motionResponse.json();
    const motionId = motionData.motionSvdGenerationJob.id;
    
    console.log(`   ⏳ 動画生成処理中... (ID: ${motionId})`);

    // 3. 生成完了を待機
    let attempts = 0;
    let motionStatus;
    
    do {
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10秒待機
      
      const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations-motion-svd/${motionId}`, {
        headers: {
          'Authorization': `Bearer ${LEONARDO_API_KEY}`
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error(`Status check error: ${statusResponse.status}`);
      }
      
      motionStatus = await statusResponse.json();
      attempts++;
      
      console.log(`   📊 生成状況: ${motionStatus.motion_svd_generation_by_pk.status} (${attempts}/60)`);
      
    } while (motionStatus.motion_svd_generation_by_pk.status !== 'COMPLETE' && attempts < 60);

    if (motionStatus.motion_svd_generation_by_pk.status !== 'COMPLETE') {
      throw new Error('Video generation timeout after 10 minutes');
    }

    // 4. 動画ダウンロード
    const videoUrl = motionStatus.motion_svd_generation_by_pk.motionMP4URL;
    const outputPath = `images/videos/${outputName}.mp4`;
    
    console.log(`   💾 動画ダウンロード中...`);
    await downloadVideo(videoUrl, outputPath);
    
    console.log(`   ✅ 動画生成完了: ${outputPath}`);
    
    return {
      success: true,
      outputPath: outputPath,
      videoUrl: videoUrl,
      motionId: motionId,
      duration: VIDEO_CONFIG.duration
    };

  } catch (error) {
    console.error(`   ❌ エラー: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// メイン動画生成関数
async function generateProductionVideos() {
  console.log('🚀 Leonardo AI Motion 動画生成開始...\n');

  // 出力ディレクトリ作成
  if (!fs.existsSync('images/videos')) {
    fs.mkdirSync('images/videos', { recursive: true });
  }

  // 既存の背景画像を使用
  const sourceImages = [
    { path: 'images/bg-ssr-explosion.png', template: VIDEO_TEMPLATES.explosion, name: 'ssr-explosion' },
    { path: 'images/bg-jackpot-fire.png', template: VIDEO_TEMPLATES.fire, name: 'jackpot-fire' },
    { path: 'images/bg-galaxy-effect.png', template: VIDEO_TEMPLATES.galaxy, name: 'galaxy-effect' },
    { path: 'images/bg-lightning-storm.png', template: VIDEO_TEMPLATES.lightning, name: 'lightning-storm' }
  ];

  const results = [];

  for (const [index, source] of sourceImages.entries()) {
    if (!fs.existsSync(source.path)) {
      console.log(`⚠️ スキップ: ${source.path} が見つかりません`);
      continue;
    }

    console.log(`\n📹 動画生成 ${index + 1}/${sourceImages.length}`);
    console.log(`   ソース: ${source.path}`);
    console.log(`   テンプレート: ${source.template.name}`);

    const result = await generateVideoFromImage(source.path, source.template, source.name);
    
    results.push({
      sourcePath: source.path,
      template: source.template.name,
      outputName: source.name,
      ...result
    });

    // Leonardo AIのレート制限対策
    if (index < sourceImages.length - 1) {
      console.log('   ⏸️ レート制限回避のため30秒待機...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }

  // 結果サマリー
  console.log('\n\n📊 動画生成結果');
  console.log('===============');
  
  const successful = results.filter(r => r.success).length;
  console.log(`✅ 成功: ${successful}/${results.length}`);
  
  console.log('\n🎬 生成された動画:');
  results.filter(r => r.success).forEach((result, index) => {
    console.log(`${index + 1}. ${result.template}`);
    console.log(`   ファイル: ${result.outputPath}`);
    console.log(`   時間: ${result.duration}秒`);
  });

  if (results.some(r => !r.success)) {
    console.log('\n❌ エラーが発生した動画:');
    results.filter(r => !r.success).forEach((result, index) => {
      console.log(`${index + 1}. ${result.template}`);
      console.log(`   エラー: ${result.error}`);
    });
  }

  // 結果をJSONで保存
  fs.writeFileSync(
    'images/video-generation-results.json',
    JSON.stringify(results, null, 2)
  );

  console.log('\n📂 出力フォルダ:');
  console.log('- images/videos/ (生成された動画)');
  
  console.log('\n🎥 動画確認:');
  console.log('open images/videos/');

  // 次のステップの提案
  console.log('\n🔄 次のステップ:');
  console.log('1. 動画 + 日本語テキスト合成');
  console.log('2. BGM・効果音の追加');
  console.log('3. カード出現演出の合成');
  console.log('4. 最終動画の出力');

  return results;
}

// 実行
generateProductionVideos().catch(console.error);