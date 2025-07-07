import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

// Google Fontsの日本語フォントURLマッピング
const FONT_URLS: Record<string, string> = {
  'Noto Sans JP': 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap',
  'M PLUS Rounded 1c': 'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@700&display=swap',
  'Kosugi Maru': 'https://fonts.googleapis.com/css2?family=Kosugi+Maru&display=swap',
  'Zen Maru Gothic': 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@700&display=swap',
  'BIZ UDPGothic': 'https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@700&display=swap'
}

export async function POST(request: NextRequest) {
  try {
    const {
      imageUrl,
      text,
      font = 'Noto Sans JP',
      size = 48,
      color = '#FFFFFF',
      positionY = 50,
      shadow = true,
      stroke = true,
      strokeColor = '#000000'
    } = await request.json()

    if (!imageUrl || !text) {
      return NextResponse.json(
        { error: '画像URLとテキストが必要です' },
        { status: 400 }
      )
    }

    // Base64画像の場合はそのまま使用、URLの場合はダウンロード
    let imageBuffer: Buffer
    
    if (imageUrl.startsWith('data:')) {
      // Base64データから画像を取得
      const base64Data = imageUrl.split(',')[1]
      imageBuffer = Buffer.from(base64Data, 'base64')
    } else {
      // URLから画像をダウンロード
      const response = await fetch(imageUrl)
      const arrayBuffer = await response.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
    }

    // SVGでテキストを作成
    const textSvg = `
      <svg width="300" height="300">
        <style>
          @import url('${FONT_URLS[font] || FONT_URLS['Noto Sans JP']}');
          .text {
            font-family: '${font}', sans-serif;
            font-size: ${size}px;
            font-weight: bold;
            fill: ${color};
            text-anchor: middle;
            dominant-baseline: middle;
          }
        </style>
        <defs>
          ${shadow ? `
          <filter id="shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.5"/>
          </filter>
          ` : ''}
        </defs>
        ${stroke ? `
        <text
          x="150"
          y="${positionY * 3}"
          class="text"
          stroke="${strokeColor}"
          stroke-width="4"
          stroke-linejoin="round"
          paint-order="stroke"
        >${text}</text>
        ` : ''}
        <text
          x="150"
          y="${positionY * 3}"
          class="text"
          ${shadow ? 'filter="url(#shadow)"' : ''}
        >${text}</text>
      </svg>
    `

    // テキストSVGをバッファに変換
    const textBuffer = Buffer.from(textSvg)

    // 元の画像とテキストを合成
    const compositeImage = await sharp(imageBuffer)
      .resize(300, 300, { fit: 'cover' })
      .composite([
        {
          input: textBuffer,
          top: 0,
          left: 0
        }
      ])
      .jpeg({ quality: 90 })
      .toBuffer()

    // Base64エンコード
    const base64Image = compositeImage.toString('base64')
    const dataUrl = `data:image/jpeg;base64,${base64Image}`

    return NextResponse.json({
      imageUrl: dataUrl,
      message: 'テキストを追加しました'
    })
  } catch (error) {
    console.error('Text addition error:', error)
    return NextResponse.json(
      { error: 'テキスト追加に失敗しました' },
      { status: 500 }
    )
  }
}