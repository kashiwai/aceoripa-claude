import { NextResponse } from 'next/server'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const jpgPath = path.join(process.cwd(), 'public', 'images', 'ngcard.jpg')
    const pngPath = path.join(process.cwd(), 'public', 'images', 'ngcard.png')
    
    // JPGファイルの存在確認
    if (!fs.existsSync(jpgPath)) {
      return NextResponse.json({ 
        error: 'Source JPG file not found',
        path: jpgPath
      }, { status: 404 })
    }

    // JPGをPNGに変換
    await sharp(jpgPath)
      .png()
      .toFile(pngPath)
    
    return NextResponse.json({ 
      success: true,
      message: 'Converted ngcard.jpg to ngcard.png',
      jpgPath,
      pngPath
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Conversion failed',
      message: error.message 
    }, { status: 500 })
  }
}