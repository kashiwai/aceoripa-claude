import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'

const POKECA_DIR = '/Users/kousuke/Downloads/pokeca'
const IMAGES_DIR = path.join(POKECA_DIR, 'images')
const MANUAL_IMAGES_DIR = path.join(POKECA_DIR, '手動画像')
const STORAGE_BUCKET = 'card-images'

function getContentType(ext: string): string {
  const types: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  }
  return types[ext.toLowerCase()] || 'application/octet-stream'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cardId, imageFileName } = body

    if (!cardId || !imageFileName) {
      return NextResponse.json(
        { error: 'Missing cardId or imageFileName' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // 手動画像かどうかを判定
    const isManual = imageFileName.startsWith('手動/')
    const actualFileName = isManual ? imageFileName.substring(3) : imageFileName
    const baseDir = isManual ? MANUAL_IMAGES_DIR : IMAGES_DIR

    // 画像ファイルを読み込み
    const imagePath = path.join(baseDir, actualFileName)
    const fileBuffer = await fs.readFile(imagePath)
    const ext = path.extname(imageFileName)
    const fileName = `${cardId}${ext}`

    // Supabase Storageにアップロード
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: getContentType(ext),
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Upload failed', details: uploadError.message },
        { status: 500 }
      )
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)

    // DBのimage_urlを更新
    const { error: updateError } = await supabase
      .from('pokemon_cards')
      .update({ image_url: publicUrl })
      .eq('id', cardId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Database update failed', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      publicUrl
    })

  } catch (error) {
    console.error('Error in manual-match API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
