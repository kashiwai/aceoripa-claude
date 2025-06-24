import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/')
    const fullPath = path.join(process.cwd(), 'public', 'images', imagePath)
    
    // ファイルの存在確認
    if (!fs.existsSync(fullPath)) {
      return new NextResponse('File not found', { status: 404 })
    }
    
    // ファイルを読み込む
    const fileBuffer = fs.readFileSync(fullPath)
    
    // 拡張子からMIMEタイプを判定
    const ext = path.extname(fullPath).toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
      case '.png':
        contentType = 'image/png'
        break
      case '.gif':
        contentType = 'image/gif'
        break
      case '.webp':
        contentType = 'image/webp'
        break
    }
    
    // レスポンスを返す
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Image serving error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}