import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const imagePath = path.join(process.cwd(), 'public', 'images', 'ngcard.jpg')
    
    // ファイルの存在確認
    const exists = fs.existsSync(imagePath)
    
    if (!exists) {
      return NextResponse.json({ 
        error: 'File not found',
        path: imagePath,
        cwd: process.cwd()
      }, { status: 404 })
    }

    // ファイルを読み込んで返す
    const imageBuffer = fs.readFileSync(imagePath)
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 })
  }
}