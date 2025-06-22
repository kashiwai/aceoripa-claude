import LeonardoAIClient from '../../src/lib/api/leonardo-ai-client';
import GoogleVertexClient from '../../src/lib/api/google-vertex-client';
import OpenAI from 'openai';

// API初期化
const leonardo = new LeonardoAIClient(process.env.LEONARDO_AI_API_KEY);
const googleVertex = new GoogleVertexClient(
  process.env.VERTEX_AI_API_KEY,
  process.env.GOOGLE_CLOUD_PROJECT
);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { template, rarity, useAI = 'leonardo' } = req.body;

  try {
    let result;

    switch (useAI) {
      case 'leonardo':
        result = await generateWithLeonardo(template, rarity);
        break;
      
      case 'openai':
        result = await generateWithOpenAI(template, rarity);
        break;
      
      case 'google':
        // Google Imagen実装予定
        result = await generateWithGoogle(template, rarity);
        break;
      
      default:
        throw new Error('Invalid AI provider');
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Leonardo AI使用
async function generateWithLeonardo(template, rarity) {
  // 1. プロンプト生成
  const prompt = leonardo.generateGachaPrompt(template, rarity);
  
  // 2. 画像生成
  const generation = await leonardo.generateImage(prompt, {
    width: 1024,
    height: 1024,
    modelId: '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3', // Leonardo Creative
    promptMagic: true,
    guidanceScale: 7
  });

  // 3. 生成完了待機
  let status;
  let attempts = 0;
  do {
    await new Promise(resolve => setTimeout(resolve, 2000));
    status = await leonardo.getGenerationStatus(generation.id);
    attempts++;
  } while (status.status !== 'COMPLETE' && attempts < 30);

  if (status.status !== 'COMPLETE') {
    throw new Error('Generation timeout');
  }

  // 4. モーション生成
  const imageId = status.generated_images[0].id;
  const motion = await leonardo.generateVideo(imageId, {
    motionStrength: 5
  });

  // 5. モーション完了待機
  let motionStatus;
  attempts = 0;
  do {
    await new Promise(resolve => setTimeout(resolve, 3000));
    motionStatus = await leonardo.getMotionStatus(motion.id);
    attempts++;
  } while (motionStatus.status !== 'COMPLETE' && attempts < 40);

  return {
    provider: 'leonardo',
    imageUrl: status.generated_images[0].url,
    videoUrl: motionStatus.url,
    prompt: prompt,
    generationId: generation.id,
    motionId: motion.id
  };
}

// OpenAI DALL-E 3使用
async function generateWithOpenAI(template, rarity) {
  // プロンプト作成
  const prompts = {
    explosion: {
      N: 'Simple sparkle effect with soft glow particles',
      R: 'Blue energy explosion with moderate intensity',
      SR: 'Golden explosion with lightning effects',
      SSR: 'Massive rainbow explosion with prismatic colors',
      SS: 'Cosmic explosion with galaxy background',
      PSA10: 'Legendary crimson explosion with reality-breaking effects'
    }
  };

  const basePrompt = prompts[template]?.[rarity] || prompts.explosion[rarity];
  const fullPrompt = `${basePrompt}, cinematic lighting, ultra detailed, 8k quality, no text, no watermarks`;

  // DALL-E 3で画像生成
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: fullPrompt,
    n: 1,
    size: "1024x1024",
    quality: "hd",
    style: "vivid"
  });

  // 注: OpenAIは動画生成がないため、画像のみ返す
  // 動画はCanvas/WebGLで後処理する必要がある
  return {
    provider: 'openai',
    imageUrl: response.data[0].url,
    videoUrl: null, // 別途アニメーション処理が必要
    prompt: fullPrompt,
    requiresAnimation: true
  };
}

// Google Vertex AI（Imagen）実装
async function generateWithGoogle(template, rarity) {
  try {
    // プロンプト生成（日本語対応）
    const prompt = googleVertex.generateGachaPrompt(template, rarity);
    
    // Imagen 3で画像生成
    const response = await googleVertex.generateImage(prompt, {
      sampleCount: 1,
      aspectRatio: '1:1',
      negativePrompt: 'text, watermark, low quality, blurry'
    });

    // 画像データの取得
    const imageData = response.predictions[0];
    const imageUrl = imageData.bytesBase64Encoded 
      ? `data:image/png;base64,${imageData.bytesBase64Encoded}`
      : imageData.gcsUri; // GCSのURLが返される場合

    // 動画生成の代替案（クライアントサイドアニメーション）
    const animationInfo = await googleVertex.imageToVideo(imageUrl, 'explosive_reveal');

    return {
      provider: 'google',
      imageUrl: imageUrl,
      videoUrl: null, // クライアントサイドで処理
      prompt: prompt,
      requiresAnimation: true,
      animationInfo: animationInfo,
      metadata: {
        model: 'imagen-3',
        language: 'ja',
        aspectRatio: '1:1'
      }
    };
  } catch (error) {
    console.error('Google Vertex AI error:', error);
    // エラーの詳細を返す
    return {
      provider: 'google',
      error: error.message,
      status: 'failed',
      suggestion: 'APIキーとプロジェクトIDを確認してください'
    };
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};