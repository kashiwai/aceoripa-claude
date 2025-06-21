import { NextRequest, NextResponse } from 'next/server';

// Google Imagen 3 API を使用したバナー生成
export async function POST(request: NextRequest) {
  try {
    const { type, text, title, subtitle, style } = await request.json();
    
    // DOPA風バナーのプロンプト生成
    const dopaPrompts: Record<string, string> = {
      'dopa-main': `
        Create a DOPA-style online gacha banner with Japanese text.
        Title: "${title || '激レア確定オリパ'}"
        Subtitle: "${subtitle || 'SSR確率大幅UP中'}"
        Style: Bold red gradient (#FF0033 to #FF6B6B), white text with black outline, 
        gold accents, dynamic diagonal composition, explosive effect background,
        professional Japanese online gacha site design, mobile-optimized.
        Resolution: Ultra high quality, 4K
      `,
      'dopa-pokemon': `
        Create a Pokemon card gacha banner in DOPA style.
        Title: "${title || 'ポケモンカード151'}"
        Subtitle: "${subtitle || 'リザードンex確率UP！'}"
        Style: Vibrant red-orange gradient with Pokemon elements, 
        holographic card effects, Japanese trading card game aesthetic,
        bold typography with shadow effects, mobile-first design.
        Include: Sparkles, card pack visual, excitement feel
      `,
      'dopa-campaign': `
        Create a limited-time campaign banner in DOPA online gacha style.
        Title: "${title || '期間限定キャンペーン'}"
        Subtitle: "${subtitle || '10連ガチャ20%OFF'}"
        Style: Urgent red-yellow gradient, countdown timer visual,
        Japanese mobile game campaign style, fire effects,
        bold discount percentage display, eye-catching design.
        Include: Sale tags, limited time urgency
      `,
      'dopa-new': `
        Create a "NEW ARRIVAL" banner for DOPA-style gacha site.
        Title: "${title || '新商品入荷'}"
        Subtitle: "${subtitle || '最新オリパ登場'}"
        Style: Modern gradient design with NEW badge, Japanese text emphasis,
        clean but exciting composition, mobile game banner aesthetic.
        Colors: Red primary (#FF0033), white text, gold accents
      `,
      'dopa-winner': `
        Create a winner announcement banner for DOPA-style site.
        Title: "${title || '大当たり続出！'}"
        Subtitle: "${subtitle || 'SSRカード当選報告'}"
        Style: Celebration theme with confetti, trophy icons,
        social proof design, Japanese gacha winner showcase.
        Include: Winner avatars, rare card visuals, excitement
      `,
      'dopa-line': `
        Create a LINE registration campaign banner in DOPA style.
        Title: "${title || 'LINE友達登録キャンペーン'}"
        Subtitle: "${subtitle || '今なら500円クーポンGET'}"
        Style: LINE green integrated with DOPA red, modern Japanese design,
        QR code placeholder, mobile-optimized layout.
        Include: LINE logo style, coupon visual, call-to-action
      `
    };

    const prompt = dopaPrompts[type] || dopaPrompts['dopa-main'];
    
    // Google Cloud Vertex AI (Imagen 3) の設定
    const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
    const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    // 認証情報が設定されていない場合は高品質プレースホルダーを返す
    if (!GOOGLE_CLOUD_PROJECT || !GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn('Google Cloud credentials not configured, returning enhanced placeholder');
      
      // プレースホルダー画像URLを生成
      const placeholderUrl = `/api/generate-dopa-placeholder?type=${type}&title=${encodeURIComponent(title || '')}&subtitle=${encodeURIComponent(subtitle || '')}`;
      
      return NextResponse.json({
        success: true,
        imageUrl: placeholderUrl,
        revised_prompt: prompt,
        placeholder: true,
        engine: 'canvas-placeholder'
      });
    }

    try {
      // Google Imagen 3 API エンドポイント
      const endpoint = `https://${GOOGLE_CLOUD_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT}/locations/${GOOGLE_CLOUD_LOCATION}/publishers/google/models/imagen-3.0-generate-001:predict`;

      // Imagen 3 リクエストボディ
      const imagenRequest = {
        instances: [{
          prompt: prompt,
          // Imagen 3 特有のパラメータ
          image_size: "1024x1024",
          language: "ja", // 日本語対応
          safety_filter_level: "block_some",
          person_generation: "allow_adult",
          aspect_ratio: type.includes('banner') ? "16:9" : "1:1",
          number_of_images: 1
        }],
        parameters: {
          sample_count: 1,
          // 高品質設定
          quality_preset: "hd",
          style_preset: style || "digital_art"
        }
      };

      // アクセストークンの取得（サービスアカウント認証）
      const accessToken = await getGoogleAccessToken();

      const imagenResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imagenRequest),
      });

      if (!imagenResponse.ok) {
        const errorData = await imagenResponse.json();
        console.error('Imagen 3 API error:', errorData);
        throw new Error('Failed to generate image with Imagen 3');
      }

      const data = await imagenResponse.json();
      const imageData = data.predictions[0];
      
      // Imagen 3 は base64 画像を返すので、データURLに変換
      const imageUrl = `data:image/png;base64,${imageData.bytesBase64Encoded}`;
      
      // 画像を保存してURLを返す（オプション）
      const savedUrl = await saveGeneratedImage(imageUrl, type);

      return NextResponse.json({
        success: true,
        imageUrl: savedUrl || imageUrl,
        revised_prompt: prompt,
        engine: 'imagen-3',
        metadata: {
          resolution: '1024x1024',
          style: style || 'digital_art',
          model: 'imagen-3.0-generate-001'
        }
      });
      
    } catch (error: any) {
      console.error('Imagen 3 generation error:', error);
      
      // エラー時は高品質なCanvas生成プレースホルダーを返す
      const fallbackUrl = `/api/generate-dopa-placeholder?type=${type}&title=${encodeURIComponent(title || '')}&subtitle=${encodeURIComponent(subtitle || '')}`;
      
      return NextResponse.json({
        success: true,
        imageUrl: fallbackUrl,
        revised_prompt: prompt,
        error: true,
        engine: 'canvas-fallback'
      });
    }
    
  } catch (error) {
    console.error('Banner generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate banner',
      imageUrl: '/api/placeholder/400/400?text=Error'
    });
  }
}

// Google Cloud アクセストークン取得（サービスアカウント認証）
async function getGoogleAccessToken(): Promise<string> {
  // 実際の実装では、Google Auth Libraryを使用
  // ここではプレースホルダー
  const { GoogleAuth } = require('google-auth-library');
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token || '';
}

// 生成された画像を保存
async function saveGeneratedImage(base64Data: string, type: string): Promise<string> {
  // 実際の実装では、Cloud StorageやSupabase Storageに保存
  // ここではプレースホルダー
  const timestamp = Date.now();
  const filename = `dopa-banner-${type}-${timestamp}.png`;
  
  // TODO: 実際のストレージ保存処理
  
  return `/images/generated/${filename}`;
}