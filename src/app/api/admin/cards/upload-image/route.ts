import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const STORAGE_BUCKET = 'card-images'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const cardId = formData.get('cardId') as string

    if (!image || !cardId) {
      return NextResponse.json(
        { error: 'Missing image or cardId' },
        { status: 400 }
      )
    }

    // ファイルをバッファに変換
    const arrayBuffer = await image.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // ファイル拡張子を取得
    const ext = image.name.split('.').pop() || 'jpg'
    const fileName = `${cardId}.${ext}`

    // Content-Typeを設定
    const contentType = image.type || 'image/jpeg'

    console.log(`Uploading image for card ${cardId}: ${fileName}`)

    // Supabase Storageにアップロード
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)

    console.log(`Public URL: ${publicUrl}`)

    // DBのimage_urlを更新
    const { error: updateError } = await supabase
      .from('pokemon_cards')
      .update({ image_url: publicUrl })
      .eq('id', cardId)

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    console.log(`Successfully uploaded image for card ${cardId}`)

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl
    })

  } catch (error) {
    console.error('Error in upload-image API:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
