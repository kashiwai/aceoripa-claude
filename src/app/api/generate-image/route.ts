import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { prompt, size = '1024x1024', quality = 'hd' } = await request.json();

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません' },
        { status: 500 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'プロンプトが必要です' },
        { status: 400 }
      );
    }

    // DALL-E 3 API呼び出し
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
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || '画像生成に失敗しました' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      url: data.data[0].url,
      revised_prompt: data.data[0].revised_prompt
    });

  } catch (error) {
    console.error('画像生成エラー:', error);
    return NextResponse.json(
      { error: '画像生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}