import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// アラート一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const resolved = searchParams.get('resolved') === 'true'

    const { data: alerts, error } = await supabaseAdmin
      .from('price_alerts')
      .select(`
        *,
        pokemon_cards (
          card_name,
          product_code,
          image_url,
          rarity
        )
      `)
      .eq('is_resolved', resolved)
      .order('triggered_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: alerts
    })
  } catch (error) {
    console.error('Get price alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to get price alerts' },
      { status: 500 }
    )
  }
}

// アラートを解決済みにマーク
export async function PATCH(request: NextRequest) {
  try {
    const { alertId } = await request.json()

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('price_alerts')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString()
      })
      .eq('id', alertId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Alert marked as resolved'
    })
  } catch (error) {
    console.error('Resolve alert error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve alert' },
      { status: 500 }
    )
  }
}

// 複数のアラートを一括解決
export async function POST(request: NextRequest) {
  try {
    const { alertIds } = await request.json()

    if (!alertIds || !Array.isArray(alertIds)) {
      return NextResponse.json({ error: 'Alert IDs array is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('price_alerts')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString()
      })
      .in('id', alertIds)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: `${alertIds.length} alerts marked as resolved`
    })
  } catch (error) {
    console.error('Bulk resolve alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve alerts' },
      { status: 500 }
    )
  }
}