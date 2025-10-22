import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { videoGenerationService } from '@/lib/ai-video/video-generation-service'
import { VideoProvider, Rarity } from '@/lib/ai-video/types'

/**
 * AI動画生成API（VEO3/SORA2統合版）
 * POST /api/ai/generate-video
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // 認証チェック（管理者のみ）
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      rarity,
      phase,
      cardName,
      provider = 'veo3', // デフォルトはVEO3
      customPrompt,
      settings = {},
    } = body

    // バリデーション
    if (!rarity || !phase) {
      return NextResponse.json(
        { error: 'rarity and phase are required' },
        { status: 400 }
      )
    }

    const validRarities = ['SS', 'S', 'A', 'B', 'C']
    const validPhases = ['intro', 'reveal', 'final_reveal']
    const validProviders = ['veo3', 'sora2']

    if (!validRarities.includes(rarity)) {
      return NextResponse.json({ error: 'Invalid rarity' }, { status: 400 })
    }

    if (!validPhases.includes(phase)) {
      return NextResponse.json({ error: 'Invalid phase' }, { status: 400 })
    }

    if (!validProviders.includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    console.log(`[API] Generating ${rarity} ${phase} video with ${provider}`)

    // ジョブレコード作成（pending状態）
    const { data: jobRecord, error: jobError } = await supabase
      .from('ai_video_generation_jobs')
      .insert({
        user_id: user.id,
        provider: provider,
        rarity: rarity,
        phase: phase,
        card_name: cardName || `${rarity} Card`,
        prompt: customPrompt || '',
        status: 'pending',
        ...settings,
      })
      .select()
      .single()

    if (jobError) {
      console.error('[API] Failed to create job record:', jobError)
      return NextResponse.json(
        { error: 'Failed to create generation job' },
        { status: 500 }
      )
    }

    // 動画生成開始（非同期）
    const generationResponse = await videoGenerationService.generateGachaAnimation(
      rarity as Rarity,
      phase as 'intro' | 'reveal' | 'final_reveal',
      cardName || `${rarity} Card`,
      provider as VideoProvider,
      customPrompt,
      settings.cardImageUrl // final_reveal用のカード画像URL（オプション）
    )

    // ジョブステータス更新
    const updateData: any = {
      provider_job_id: generationResponse.id,
      status: generationResponse.status,
      updated_at: new Date().toISOString(),
    }

    if (generationResponse.videoUrl) {
      updateData.video_url = generationResponse.videoUrl
    }

    if (generationResponse.thumbnailUrl) {
      updateData.thumbnail_url = generationResponse.thumbnailUrl
    }

    if (generationResponse.status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    if (generationResponse.error) {
      updateData.error = generationResponse.error
    }

    await supabase
      .from('ai_video_generation_jobs')
      .update(updateData)
      .eq('id', jobRecord.id)

    return NextResponse.json({
      jobId: jobRecord.id,
      providerJobId: generationResponse.id,
      status: generationResponse.status,
      videoUrl: generationResponse.videoUrl,
      thumbnailUrl: generationResponse.thumbnailUrl,
      provider: provider,
      rarity: rarity,
      phase: phase,
      createdAt: generationResponse.createdAt,
    })
  } catch (error: any) {
    console.error('[API] Error generating video:', error)
    return NextResponse.json(
      { error: error.message || '動画生成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * ジョブステータス確認API
 * GET /api/ai/generate-video?jobId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    // ジョブレコード取得
    const { data: job, error: jobError } = await supabase
      .from('ai_video_generation_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // processing状態の場合はプロバイダーにステータス確認
    if (job.status === 'processing' && job.provider_job_id) {
      const statusResponse = await videoGenerationService.getJobStatus(
        job.provider_job_id,
        job.provider as VideoProvider
      )

      // ステータス更新
      const updateData: any = {
        status: statusResponse.status,
        updated_at: new Date().toISOString(),
      }

      if (statusResponse.videoUrl) {
        updateData.video_url = statusResponse.videoUrl
      }

      if (statusResponse.thumbnailUrl) {
        updateData.thumbnail_url = statusResponse.thumbnailUrl
      }

      if (statusResponse.status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      if (statusResponse.error) {
        updateData.error = statusResponse.error
      }

      await supabase
        .from('ai_video_generation_jobs')
        .update(updateData)
        .eq('id', jobId)

      return NextResponse.json({
        jobId: job.id,
        status: statusResponse.status,
        videoUrl: statusResponse.videoUrl,
        thumbnailUrl: statusResponse.thumbnailUrl,
        error: statusResponse.error,
      })
    }

    // 既に完了/失敗している場合はDBのデータを返す
    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      videoUrl: job.video_url,
      thumbnailUrl: job.thumbnail_url,
      error: job.error,
    })
  } catch (error: any) {
    console.error('[API] Error checking job status:', error)
    return NextResponse.json(
      { error: error.message || 'ジョブステータス確認中にエラーが発生しました' },
      { status: 500 }
    )
  }
}