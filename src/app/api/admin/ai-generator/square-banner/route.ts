import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const { prompt, size = '1024x1024' } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'プロンプトが必要です' },
        { status: 400 }
      )
    }

    const openaiApiKey = process.env.OPENAI_API_KEY
    
    if (!openaiApiKey) {
      // OpenAI APIキーがない場合はプレースホルダー画像を返す
      const placeholderUrl = `https://via.placeholder.com/300x300/667eea/ffffff?text=Square+Banner`
      return NextResponse.json({ imageUrl: placeholderUrl })
    }

    // DALL-E 3で画像生成
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size,
        quality: 'standard',
        style: 'vivid'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      throw new Error('画像生成に失敗しました')
    }

    const data = await response.json()
    const imageUrl = data.data[0].url

    // 画像をダウンロードして300x300にリサイズ
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    
    const resizedBuffer = await sharp(Buffer.from(imageBuffer))
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer()

    // Base64エンコード
    const base64Image = resizedBuffer.toString('base64')
    const dataUrl = `data:image/jpeg;base64,${base64Image}`

    return NextResponse.json({ 
      imageUrl: dataUrl,
      originalUrl: imageUrl,
      message: '300×300にリサイズしました'
    })
  } catch (error) {
    console.error('Banner generation error:', error)
    
    // エラー時はプレースホルダー画像を返す
    const placeholderUrl = `https://via.placeholder.com/300x300/667eea/ffffff?text=Square+Banner`
    return NextResponse.json({ 
      imageUrl: placeholderUrl,
      error: 'プレースホルダー画像を使用しています'
    })
  }
}