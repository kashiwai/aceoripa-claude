import { NextRequest, NextResponse } from 'next/server'
import { scrapeAllCardRushData } from '@/lib/cardrush-only-scraper'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting CardRush import...')
    
    const result = await scrapeAllCardRushData()
    
    console.log('CardRush import completed:', result)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('CardRush import error:', error)
    return NextResponse.json(
      { 
        success: false,
        totalPrices: 0,
        savedToDb: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      },
      { status: 500 }
    )
  }
}