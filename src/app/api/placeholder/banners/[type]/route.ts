import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  const bannerType = params.type || 'default';
  
  // バナータイプに応じた設定
  const bannerConfigs = {
    'gacha-banner-1': {
      title: 'レジェンドガチャ',
      subtitle: 'SSR確率2倍アップ！',
      gradient: 'from-purple-600 to-pink-600'
    },
    'gacha-banner-2': {
      title: '期間限定イベント',
      subtitle: '新キャラ登場',
      gradient: 'from-blue-600 to-cyan-600'
    },
    'gacha-banner-3': {
      title: 'デイリーガチャ',
      subtitle: '毎日1回無料',
      gradient: 'from-green-600 to-emerald-600'
    },
    'default': {
      title: 'Aceoripa',
      subtitle: 'ガチャゲーム',
      gradient: 'from-gray-600 to-gray-800'
    }
  };
  
  const config = bannerConfigs[bannerType] || bannerConfigs.default;
  
  // SVGバナー画像を生成
  const svg = `
    <svg width="1200" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
        </linearGradient>
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="2" fill="white" opacity="0.1"/>
        </pattern>
      </defs>
      
      <!-- 背景 -->
      <rect width="1200" height="300" fill="url(#bg-gradient)"/>
      <rect width="1200" height="300" fill="url(#dots)"/>
      
      <!-- 装飾的な円 -->
      <circle cx="100" cy="150" r="80" fill="white" opacity="0.1"/>
      <circle cx="1100" cy="150" r="120" fill="white" opacity="0.08"/>
      
      <!-- メインタイトル -->
      <text x="600" y="120" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">
        ${config.title}
      </text>
      
      <!-- サブタイトル -->
      <text x="600" y="180" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="24" fill="white" opacity="0.9">
        ${config.subtitle}
      </text>
      
      <!-- CTA装飾 -->
      <rect x="450" y="210" width="300" height="50" rx="25" 
            fill="white" opacity="0.2" stroke="white" stroke-width="2"/>
      <text x="600" y="240" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white">
        今すぐプレイ！
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}