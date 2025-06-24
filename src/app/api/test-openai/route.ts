import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'OpenAI API key not found',
        hasKey: false 
      }, { status: 400 });
    }

    // APIキーの最初と最後の4文字だけ表示
    const maskedKey = `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`;

    // シンプルなAPI接続テスト
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: 'OpenAI API connection failed',
        status: response.status,
        message: data.error?.message || 'Unknown error',
        hasKey: true,
        maskedKey
      }, { status: response.status });
    }

    // 利用可能なモデルを確認
    const availableModels = data.data?.filter((model: any) => 
      model.id.includes('dall-e') || model.id.includes('gpt')
    ).map((model: any) => model.id) || [];

    return NextResponse.json({
      success: true,
      hasKey: true,
      maskedKey,
      modelsCount: data.data?.length || 0,
      availableModels: availableModels.slice(0, 10), // 最初の10個だけ表示
      connection: 'OK'
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Connection test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      hasKey: !!process.env.OPENAI_API_KEY
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 400 });
    }

    // console.log('Testing DALL-E 3 with prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt || 'A cute Pokemon Pikachu with electric effects, anime style, vertical 9:16 composition',
        size: '1024x1792',
        quality: 'hd',
        style: 'natural',
        n: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('DALL-E API error:', data);
      return NextResponse.json({
        error: 'DALL-E API error',
        status: response.status,
        message: data.error?.message || 'Unknown error',
        details: data
      }, { status: response.status });
    }

    // console.log('DALL-E 3 generation successful:', data);

    return NextResponse.json({
      success: true,
      imageUrl: data.data[0].url,
      revisedPrompt: data.data[0].revised_prompt
    });

  } catch (error) {
    console.error('DALL-E test failed:', error);
    return NextResponse.json({
      error: 'DALL-E test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}