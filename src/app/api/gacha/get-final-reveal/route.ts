import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cardId = searchParams.get('cardId')

    if (!cardId) {
      return NextResponse.json(
        { error: 'cardId is required' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // カード固有のfinal_reveal動画を取得
    const { data, error } = await supabase
      .from('card_final_reveal_videos')
      .select('video_url, thumbnail_url, duration, provider')
      .eq('card_id', cardId)
      .eq('is_active', true)
      .single()

    if (error) {
      // データが見つからない場合は空のレスポンスを返す（エラーではない）
      if (error.code === 'PGRST116') {
        console.log(`[get-final-reveal] No video found for card ${cardId}`)
        return NextResponse.json({
          videoUrl: null,
          message: 'No final reveal video found for this card'
        })
      }

      console.error('[get-final-reveal] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch video' },
        { status: 500 }
      )
    }

    // 使用カウントを増やす
    // Note: Supabase client doesn't support .raw() directly
    // Using RPC or direct SQL increment would be better
    await supabase.rpc('increment_video_usage', {
      p_card_id: cardId
    }).catch(err => {
      // Fallback: ignore increment errors for now
      console.warn('Failed to increment usage count:', err)
    })

    console.log(`[get-final-reveal] Video found for card ${cardId}: ${data.video_url}`)

    return NextResponse.json({
      videoUrl: data.video_url,
      thumbnailUrl: data.thumbnail_url,
      duration: data.duration,
      provider: data.provider
    })
  } catch (error: any) {
    console.error('[get-final-reveal] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
