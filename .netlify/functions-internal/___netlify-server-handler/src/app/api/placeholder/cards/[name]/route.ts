import { NextRequest, NextResponse } from 'next/server';

// カード画像のプレースホルダーを生成
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const cardName = name || 'card';
  
  // レアリティに基づいた色を決定
  const rarityColors = {
    'mewtwo-ex': { bg: '#FFD700', border: '#FFA500' }, // SSR - ゴールド
    'rayquaza-vmax': { bg: '#FFD700', border: '#FFA500' }, // SSR
    'pikachu-v': { bg: '#C0C0C0', border: '#808080' }, // SR - シルバー
    'charizard-v': { bg: '#C0C0C0', border: '#808080' }, // SR
    'venusaur-v': { bg: '#C0C0C0', border: '#808080' }, // SR
    'eevee': { bg: '#4A90E2', border: '#2E5C8A' }, // R - ブルー
    'garchomp': { bg: '#4A90E2', border: '#2E5C8A' }, // R
    'lucario': { bg: '#4A90E2', border: '#2E5C8A' }, // R
    'gengar': { bg: '#4A90E2', border: '#2E5C8A' }, // R
    'pidgey': { bg: '#6B7280', border: '#4B5563' }, // N - グレー
    'rattata': { bg: '#6B7280', border: '#4B5563' }, // N
    'caterpie': { bg: '#6B7280', border: '#4B5563' }, // N
    'weedle': { bg: '#6B7280', border: '#4B5563' }, // N
    'magikarp': { bg: '#6B7280', border: '#4B5563' } // N
  };
  
  const colors = rarityColors[cardName] || { bg: '#6B7280', border: '#4B5563' };
  const displayName = cardName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  // SVGカード画像を生成
  const svg = `
    <svg width="300" height="420" xmlns="http://www.w3.org/2000/svg">
      <!-- カード背景 -->
      <rect width="300" height="420" rx="20" fill="${colors.bg}" stroke="${colors.border}" stroke-width="4"/>
      
      <!-- カードフレーム -->
      <rect x="20" y="20" width="260" height="380" rx="10" fill="white" opacity="0.9"/>
      
      <!-- カード画像エリア -->
      <rect x="30" y="30" width="240" height="180" rx="5" fill="#E5E7EB"/>
      
      <!-- カード名 -->
      <text x="150" y="240" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1F2937">
        ${displayName}
      </text>
      
      <!-- レアリティ表示 -->
      <text x="150" y="270" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="16" fill="#6B7280">
        ${cardName.includes('ex') || cardName.includes('vmax') ? 'SSR' : 
          cardName.includes('-v') ? 'SR' : 
          ['eevee', 'garchomp', 'lucario', 'gengar'].includes(cardName) ? 'R' : 'N'}
      </text>
      
      <!-- カード効果テキストエリア -->
      <rect x="30" y="290" width="240" height="80" rx="5" fill="#F3F4F6"/>
      
      <!-- カード番号 -->
      <text x="150" y="390" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="12" fill="#9CA3AF">
        #001/${cardName}
      </text>
      
      <!-- レアリティに応じたキラキラエフェクト -->
      ${(cardName.includes('ex') || cardName.includes('vmax')) ? `
        <defs>
          <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:white;stop-opacity:0" />
            <stop offset="50%" style="stop-color:white;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:white;stop-opacity:0" />
          </linearGradient>
        </defs>
        <rect width="300" height="420" rx="20" fill="url(#shine)" opacity="0.5"/>
      ` : ''}
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}