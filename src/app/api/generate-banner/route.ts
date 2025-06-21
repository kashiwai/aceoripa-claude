import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { type, text, style, title, subtitle } = await request.json();
    
    // バナータイプ別のプロンプト生成
    const prompts: Record<string, string> = {
      'line-campaign': `
        Create a vibrant banner for LINE friend registration campaign in Japanese mobile game style.
        Text: "${text || 'LINE友達登録で最大70%OFFクーポン!'}"
        Style: Green gradient background, LINE app logo, discount coupon visual, mobile-first design,
        bright yellow accent for discount percentage, professional game banner quality.
        Size: 375x80px mobile banner format.
      `,
      'gacha-main': `
        Create an exciting gacha game banner with Japanese text.
        Main text: "${text || '超絶ガチャ爆誕'}"
        Style: Purple to pink gradient, sparkles and stars, golden accents, epic game feel,
        Japanese mobile game aesthetic, premium quality, exciting atmosphere.
        Size: 375x200px hero banner.
      `,
      'campaign': `
        Create a limited-time campaign banner for Japanese mobile game.
        Text: "${text || '期間限定キャンペーン'}"
        Style: Yellow to orange gradient, fire effects, urgency feeling, "LIMITED TIME" vibe,
        Japanese text prominent, mobile game UI style.
        Size: 375x100px.
      `,
      'new': `
        Create a "NEW" banner for new products or features.
        Title: "${title || '新商品入荷'}"
        Subtitle: "${subtitle || '最新ガチャ登場'}"
        Style: Modern, clean, eye-catching design with Japanese text.
      `,
      'sns-winner': `
        Create a social media winner announcement banner.
        Text: "${text || 'SNS当選報告'}"
        Style: Celebration theme, confetti, trophy or prize visual, social media icons,
        exciting winner announcement feel, Japanese text.
        Size: 200x200px square format.
      `,
      'card-pack': `
        Create a trading card pack banner for online gacha.
        Text: "${text || 'ポケモンカード151'}"
        Style: Holographic effect, trading card aesthetic, pack opening excitement,
        premium shiny finish, Japanese TCG style.
        Size: 400x600px vertical card format.
      `
    };

    const prompt = prompts[type] || prompts['gacha-main'];

    // OpenAI APIキー確認
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    // APIキーが設定されていない場合はプレースホルダーを返す
    if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('xxx') || OPENAI_API_KEY.includes('...')) {
      console.warn('OpenAI API key not configured, returning placeholder');
      return NextResponse.json({
        success: true,
        imageUrl: `/api/placeholder/400/400?text=${encodeURIComponent(title || text || 'Banner')}`,
        revised_prompt: prompt,
        placeholder: true
      });
    }

    // OpenAI API呼び出し（タイムアウト設定）
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8秒タイムアウト

    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt + " High quality, professional game asset, no watermarks.",
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          style: style || 'vivid'
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json();
        console.error('OpenAI API error:', errorData);
        throw new Error('Failed to generate image');
      }

      const data = await openaiResponse.json();
      
      return NextResponse.json({
        success: true,
        imageUrl: data.data[0].url,
        revised_prompt: data.data[0].revised_prompt
      });
    } catch (error: any) {
      clearTimeout(timeout);
      
      if (error.name === 'AbortError') {
        console.error('Banner generation timeout');
      } else {
        console.error('Banner generation error:', error);
      }
      
      // エラー時はプレースホルダーを返す
      return NextResponse.json({
        success: true,
        imageUrl: `/api/placeholder/400/400?text=${encodeURIComponent(type || 'Banner')}`,
        revised_prompt: prompt,
        error: true
      });
    }
  } catch (error) {
    console.error('Banner generation error:', error);
    return NextResponse.json({
      success: true,
      imageUrl: '/api/placeholder/400/400?text=Error',
      error: true
    });
  }
}