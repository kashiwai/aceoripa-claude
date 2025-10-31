import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // カウント取得
    const { count, error: countError } = await supabase
      .from('pokemon_cards')
      .select('*', { count: 'exact', head: true })
      .not('image_url', 'like', '%supabase.co%')

    if (countError) {
      throw countError
    }

    // データ取得
    const { data, error } = await supabase
      .from('pokemon_cards')
      .select('id, card_name, product_code, image_url, rarity')
      .not('image_url', 'like', '%supabase.co%')
      .order('card_name')
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      cards: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Error fetching cards without images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    )
  }
}
