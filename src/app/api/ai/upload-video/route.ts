import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Service role client for bypassing RLS
const getServiceRoleClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

/**
 * 動画アップロードAPI
 * POST /api/ai/upload-video
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック（管理者のみ） - admin_sessionクッキーをチェック
    const cookieStore = cookies()
    const adminSessionCookie = cookieStore.get('admin_session')

    if (!adminSessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const session = JSON.parse(adminSessionCookie.value)
      const loginTime = new Date(session.loginTime)
      const now = new Date()
      const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

      if (hoursDiff > 24) {
        return NextResponse.json({ error: 'Session expired' }, { status: 401 })
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Service role client for database operations
    const supabaseAdmin = getServiceRoleClient()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const rarity = formData.get('rarity') as string
    const phase = formData.get('phase') as string
    const provider = formData.get('provider') as string || 'manual'

    // バリデーション
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (!rarity || !phase) {
      return NextResponse.json(
        { error: 'rarity and phase are required' },
        { status: 400 }
      )
    }

    const validRarities = ['SS', 'S', 'A', 'B', 'C']
    const validPhases = ['intro', 'reveal', 'final_reveal']

    if (!validRarities.includes(rarity)) {
      return NextResponse.json({ error: 'Invalid rarity' }, { status: 400 })
    }

    if (!validPhases.includes(phase)) {
      return NextResponse.json({ error: 'Invalid phase' }, { status: 400 })
    }

    // ファイル名生成（タイムスタンプ + レアリティ + フェーズ）
    const timestamp = new Date().getTime()
    const fileExt = file.name.split('.').pop()
    const fileName = `gacha_${rarity.toLowerCase()}_${phase}_${timestamp}.${fileExt}`
    const storagePath = `gacha-animations/${fileName}`

    console.log(`[Upload] Uploading ${fileName} to Supabase Storage...`)

    // Supabase Storageにアップロード (service role client)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('videos')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[Upload] Storage upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // 公開URLを取得
    const { data: urlData } = supabaseAdmin.storage
      .from('videos')
      .getPublicUrl(storagePath)

    const videoUrl = urlData.publicUrl

    console.log(`[Upload] Video uploaded successfully: ${videoUrl}`)

    // 既存のアクティブな動画を非アクティブ化 (service role client)
    const { error: deactivateError } = await supabaseAdmin
      .from('gacha_animation_library')
      .update({ is_active: false })
      .eq('rarity', rarity)
      .eq('phase', phase)
      .eq('is_active', true)

    if (deactivateError) {
      console.warn('[Upload] Failed to deactivate existing videos:', deactivateError)
    }

    // gacha_animation_libraryに登録 (service role client)
    const { data: libraryEntry, error: libraryError } = await supabaseAdmin
      .from('gacha_animation_library')
      .insert({
        rarity: rarity,
        phase: phase,
        video_url: videoUrl,
        storage_path: storagePath,
        provider: provider,
        is_active: true,
        duration: 5, // デフォルト5秒（後で更新可能）
        quality: '1080p',
        file_size: file.size,
      })
      .select()
      .single()

    if (libraryError) {
      console.error('[Upload] Failed to save to library:', libraryError)
      // アップロードしたファイルを削除
      await supabaseAdmin.storage.from('videos').remove([storagePath])
      return NextResponse.json(
        { error: `Failed to save to library: ${libraryError.message}` },
        { status: 500 }
      )
    }

    console.log(`[Upload] Registered to library:`, libraryEntry)

    return NextResponse.json({
      success: true,
      videoUrl: videoUrl,
      storagePath: storagePath,
      libraryId: libraryEntry.id,
      rarity: rarity,
      phase: phase,
    })
  } catch (error: any) {
    console.error('[Upload] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}

/**
 * 動画ライブラリ一覧取得API
 * GET /api/ai/upload-video
 */
export async function GET(request: NextRequest) {
  try {
    // 認証チェック（管理者のみ） - admin_sessionクッキーをチェック
    const cookieStore = cookies()
    const adminSessionCookie = cookieStore.get('admin_session')

    if (!adminSessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const session = JSON.parse(adminSessionCookie.value)
      const loginTime = new Date(session.loginTime)
      const now = new Date()
      const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

      if (hoursDiff > 24) {
        return NextResponse.json({ error: 'Session expired' }, { status: 401 })
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Service role client for database operations
    const supabaseAdmin = getServiceRoleClient()

    const { searchParams } = new URL(request.url)
    const rarity = searchParams.get('rarity')
    const phase = searchParams.get('phase')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    let query = supabaseAdmin
      .from('gacha_animation_library')
      .select('*')
      .order('created_at', { ascending: false })

    if (rarity) {
      query = query.eq('rarity', rarity)
    }

    if (phase) {
      query = query.eq('phase', phase)
    }

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: videos, error: fetchError } = await query

    if (fetchError) {
      console.error('[Upload] Failed to fetch videos:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch videos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ videos })
  } catch (error: any) {
    console.error('[Upload] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

/**
 * 動画の有効化/無効化API
 * PATCH /api/ai/upload-video
 */
export async function PATCH(request: NextRequest) {
  try {
    // 認証チェック（管理者のみ） - admin_sessionクッキーをチェック
    const cookieStore = cookies()
    const adminSessionCookie = cookieStore.get('admin_session')

    if (!adminSessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const session = JSON.parse(adminSessionCookie.value)
      const loginTime = new Date(session.loginTime)
      const now = new Date()
      const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

      if (hoursDiff > 24) {
        return NextResponse.json({ error: 'Session expired' }, { status: 401 })
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Service role client for database operations
    const supabaseAdmin = getServiceRoleClient()

    const body = await request.json()
    const { videoId, isActive } = body

    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 })
    }

    // 動画情報を取得 (service role client)
    const { data: video, error: videoError } = await supabaseAdmin
      .from('gacha_animation_library')
      .select('*')
      .eq('id', videoId)
      .single()

    if (videoError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // アクティブにする場合、同じrarity/phaseの他の動画を非アクティブ化 (service role client)
    if (isActive) {
      await supabaseAdmin
        .from('gacha_animation_library')
        .update({ is_active: false })
        .eq('rarity', video.rarity)
        .eq('phase', video.phase)
        .eq('is_active', true)
        .neq('id', videoId)
    }

    // 動画のステータスを更新 (service role client)
    const { data: updatedVideo, error: updateError } = await supabaseAdmin
      .from('gacha_animation_library')
      .update({ is_active: isActive })
      .eq('id', videoId)
      .select()
      .single()

    if (updateError) {
      console.error('[Upload] Failed to update video:', updateError)
      return NextResponse.json(
        { error: 'Failed to update video' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, video: updatedVideo })
  } catch (error: any) {
    console.error('[Upload] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update video' },
      { status: 500 }
    )
  }
}

/**
 * 動画削除API
 * DELETE /api/ai/upload-video
 */
export async function DELETE(request: NextRequest) {
  try {
    // 認証チェック（管理者のみ） - admin_sessionクッキーをチェック
    const cookieStore = cookies()
    const adminSessionCookie = cookieStore.get('admin_session')

    if (!adminSessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const session = JSON.parse(adminSessionCookie.value)
      const loginTime = new Date(session.loginTime)
      const now = new Date()
      const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

      if (hoursDiff > 24) {
        return NextResponse.json({ error: 'Session expired' }, { status: 401 })
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Service role client for database operations
    const supabaseAdmin = getServiceRoleClient()

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 })
    }

    // 動画情報を取得 (service role client)
    const { data: video, error: videoError } = await supabaseAdmin
      .from('gacha_animation_library')
      .select('*')
      .eq('id', videoId)
      .single()

    if (videoError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Storageから削除 (service role client)
    const { error: storageError } = await supabaseAdmin.storage
      .from('videos')
      .remove([video.storage_path])

    if (storageError) {
      console.warn('[Upload] Failed to delete from storage:', storageError)
    }

    // DBから削除 (service role client)
    const { error: deleteError } = await supabaseAdmin
      .from('gacha_animation_library')
      .delete()
      .eq('id', videoId)

    if (deleteError) {
      console.error('[Upload] Failed to delete from DB:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete video' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Upload] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete video' },
      { status: 500 }
    )
  }
}
