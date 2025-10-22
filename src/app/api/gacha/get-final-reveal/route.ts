import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * カードのfinal_reveal動画を取得するAPI
 * GET /api/gacha/get-final-reveal?cardId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cardId = searchParams.get('cardId')

    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // カード情報を取得してレアリティを確認
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('rarity')
      .eq('id', cardId)
      .single()

    if (cardError || !card) {
      console.warn(`[FinalReveal] Card not found: ${cardId}`)
      return NextResponse.json({ videoUrl: null })
    }

    // 該当カードのfinal_reveal動画をcard_final_reveal_videosテーブルから取得
    const { data: cardVideo, error: cardVideoError } = await supabase
      .from('card_final_reveal_videos')
      .select('video_url, thumbnail_url')
      .eq('card_id', cardId)
      .eq('is_active', true)
      .single()

    if (!cardVideoError && cardVideo?.video_url) {
      // カード固有の動画がある場合
      console.log(`[FinalReveal] Found card-specific video for ${cardId}`)
      return NextResponse.json({
        videoUrl: cardVideo.video_url,
        thumbnailUrl: cardVideo.thumbnail_url,
        source: 'card_specific',
      })
    }

    // カード固有の動画がない場合は、レアリティ別の汎用動画を使用
    const { data: rarityVideo, error: rarityVideoError } = await supabase
      .from('gacha_animation_library')
      .select('video_url, thumbnail_url')
      .eq('rarity', card.rarity)
      .eq('phase', 'final_reveal')
      .eq('is_active', true)
      .single()

    if (!rarityVideoError && rarityVideo?.video_url) {
      console.log(`[FinalReveal] Using rarity-based video for ${card.rarity} rarity`)
      return NextResponse.json({
        videoUrl: rarityVideo.video_url,
        thumbnailUrl: rarityVideo.thumbnail_url,
        source: 'rarity_generic',
      })
    }

    // どちらの動画もない場合
    console.warn(`[FinalReveal] No final_reveal video found for card ${cardId} (${card.rarity} rarity)`)
    return NextResponse.json({
      videoUrl: null,
      message: 'No final_reveal video found, will use fallback animation',
    })
  } catch (error: any) {
    console.error('[FinalReveal] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
