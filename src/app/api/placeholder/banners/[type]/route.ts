import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const resolvedParams = await params
  const bannerType = resolvedParams.type

  // バナータイプに応じた画像生成
  const bannerConfigs: Record<string, any> = {
    'pokemon-151': {
      title: 'ポケモンカード151',
      subtitle: 'リザードンex確率UP!',
      color: '#FF4500',
      bgColor: '#FF6B47'
    },
    'shiny-treasure': {
      title: 'シャイニートレジャー',
      subtitle: 'SSR確定オリパ',
      color: '#FFD700',
      bgColor: '#FFA500'
    },
    'limited-time': {
      title: '期間限定',
      subtitle: '20% OFF',
      color: '#FF1493',
      bgColor: '#FF6B6B'
    }
  }

  const config = bannerConfigs[bannerType] || bannerConfigs['pokemon-151']

  // SVGバナー画像生成
  const svg = `
    <svg width="1200" height="500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${config.color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${config.bgColor};stop-opacity:1" />
        </linearGradient>
        <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,0.3);stop-opacity:1" />
          <stop offset="50%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgba(255,255,255,0.3);stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>
      
      <!-- 背景 -->
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- 光の効果 -->
      <rect width="100%" height="100%" fill="url(#shine)" opacity="0.7"/>
      
      <!-- 装飾的な要素 -->
      <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.1)" />
      <circle cx="1100" cy="400" r="60" fill="rgba(255,255,255,0.1)" />
      <polygon points="200,50 250,150 150,150" fill="rgba(255,255,255,0.2)" />
      <polygon points="1000,350 1050,450 950,450" fill="rgba(255,255,255,0.2)" />
      
      <!-- メインタイトル -->
      <text x="600" y="200" 
            font-family="Arial, sans-serif" 
            font-size="72" 
            font-weight="bold" 
            text-anchor="middle" 
            fill="white" 
            filter="url(#glow)">
        ${config.title}
      </text>
      
      <!-- サブタイトル -->
      <text x="600" y="280" 
            font-family="Arial, sans-serif" 
            font-size="36" 
            font-weight="bold" 
            text-anchor="middle" 
            fill="white" 
            opacity="0.9">
        ${config.subtitle}
      </text>
      
      <!-- ACEORIPA ロゴ -->
      <text x="600" y="400" 
            font-family="Arial, sans-serif" 
            font-size="24" 
            font-weight="bold" 
            text-anchor="middle" 
            fill="white" 
            opacity="0.8">
        ACEORIPA ONLINE
      </text>
      
      <!-- キラキラエフェクト -->
      <g opacity="0.8">
        <circle cx="300" cy="150" r="3" fill="white">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="900" cy="200" r="4" fill="white">
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="400" cy="350" r="2" fill="white">
          <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="800" cy="300" r="3" fill="white">
          <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite"/>
        </circle>
      </g>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}