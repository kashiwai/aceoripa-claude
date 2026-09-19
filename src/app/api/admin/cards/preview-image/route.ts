import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

const POKECA_DIR = '/Users/kousuke/Downloads/pokeca'
const IMAGES_DIR = path.join(POKECA_DIR, 'images')
const MANUAL_IMAGES_DIR = path.join(POKECA_DIR, '手動画像')

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fileName = searchParams.get('fileName')

    if (!fileName) {
      return NextResponse.json(
        { error: 'Missing fileName parameter' },
        { status: 400 }
      )
    }

    // 手動画像かどうかを判定
    const isManual = fileName.startsWith('手動/')
    const actualFileName = isManual ? fileName.substring(3) : fileName

    // パストラバーサル対策
    const sanitizedFileName = path.basename(actualFileName)
    const baseDir = isManual ? MANUAL_IMAGES_DIR : IMAGES_DIR
    const imagePath = path.join(baseDir, sanitizedFileName)

    // ファイルが存在するか確認
    try {
      await fs.access(imagePath)
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // ファイルを読み込み
    const fileBuffer = await fs.readFile(imagePath)
    const ext = path.extname(sanitizedFileName).toLowerCase()

    // Content-Typeを設定
    const contentType = ext === '.webp' ? 'image/webp' :
                       ext === '.png' ? 'image/png' :
                       'image/jpeg'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000'
      }
    })

  } catch (error) {
    console.error('Error in preview-image API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
