import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  const [width, height] = params.params;
  const w = parseInt(width) || 400;
  const h = parseInt(height) || 400;
  
  // SVGプレースホルダー画像を生成
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#374151"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="sans-serif" font-size="20" fill="#9CA3AF">
        ${w} × ${h}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}