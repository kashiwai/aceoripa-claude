import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const rarity = searchParams.get('rarity')
    
    let query = supabase.from('cards').select('*')
    
    if (rarity) {
      query = query.eq('rarity', rarity)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching cards:', error)
      return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
    }
    
    return NextResponse.json({ cards: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}