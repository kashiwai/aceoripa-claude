import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 互換性のためのパラメータ処理
    let prompt = body.prompt;
    
    // 旧形式のパラメータをサポート
    if (!prompt && body.type && body.name) {
      if (body.type === 'card') {
        prompt = `Create a high-quality trading card image for "${body.name}" with rarity "${body.rarity || 'normal'}". Japanese TCG style, holographic effects, premium quality.`;
      }
    }
    
    const { size = '1024x1024', quality = 'hd' } = body;

    // APIキーチェックを一時的にスキップ（ダミーレスポンス返却）
    if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('xxx')) {
      console.warn('OpenAI API key not configured, returning dummy response');
      return NextResponse.json({
        url: `/api/placeholder/1024/1024?text=${encodeURIComponent(body.name || 'Generated Image')}`,
        revised_prompt: prompt || 'Dummy image generated'
      });
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'プロンプトが必要です' },
        { status: 400 }
      );
    }

    // DALL-E 3 API呼び出し（タイムアウト設定付き）
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8秒タイムアウト

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size,
        quality: quality,
        response_format: 'url'
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      
      // フォールバック: プレースホルダー画像を返す
      return NextResponse.json({
        url: `/api/placeholder/1024/1024?text=${encodeURIComponent('AI Generated')}`,
        revised_prompt: prompt,
        fallback: true
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      url: data.data[0].url,
      revised_prompt: data.data[0].revised_prompt
    });

  } catch (error: any) {
    console.error('画像生成エラー:', error);
    
    // タイムアウトエラーの場合
    if (error.name === 'AbortError') {
      console.log('AI generation timeout - returning placeholder');
      return NextResponse.json({
        url: `/api/placeholder/1024/1024?text=${encodeURIComponent('Generated Card')}`,
        revised_prompt: 'Timeout - returning placeholder',
        timeout: true
      });
    }
    
    // その他のエラー時もプレースホルダーを返す
    return NextResponse.json({
      url: '/api/placeholder/1024/1024?text=Error',
      revised_prompt: 'Error generating image',
      error: true
    });
  }
}