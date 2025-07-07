import { NextRequest, NextResponse } from 'next/server'
import { scrapeCardRushPrices, scrapePokecazillaPrices, scrapeSerraPrices, scrapePokecaChartPrices } from '@/lib/real-price-scraper'

interface ScrapingTestResult {
  source: string
  success: boolean
  priceCount: number
  prices: Array<{
    price: number
    condition: string
    rarity?: string
  }>
  error?: string
  responseTime: number
}

export async function POST(request: NextRequest) {
  try {
    const { cardName } = await request.json()

    if (!cardName) {
      return NextResponse.json({ error: 'Card name is required' }, { status: 400 })
    }

    const results: ScrapingTestResult[] = []

    // 各サイトを個別にテスト
    const scrapingTests = [
      { name: 'cardrush', func: scrapeCardRushPrices },
      { name: 'pokecazilla', func: scrapePokecazillaPrices },
      { name: 'serra', func: scrapeSerraPrices },
      { name: 'pokeca_chart', func: scrapePokecaChartPrices }
    ]

    for (const test of scrapingTests) {
      const startTime = Date.now()
      
      try {
        console.log(`Testing ${test.name} for card: ${cardName}`)
        const prices = await test.func(cardName)
        const responseTime = Date.now() - startTime

        results.push({
          source: test.name,
          success: true,
          priceCount: prices.length,
          prices: prices.map(p => ({
            price: p.price,
            condition: p.condition || 'unknown',
            rarity: p.rarity
          })),
          responseTime
        })

        console.log(`${test.name} success: ${prices.length} prices found`)
      } catch (error) {
        const responseTime = Date.now() - startTime
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        results.push({
          source: test.name,
          success: false,
          priceCount: 0,
          prices: [],
          error: errorMessage,
          responseTime
        })

        console.error(`${test.name} failed:`, errorMessage)
      }

      // レート制限対策で少し待機
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return NextResponse.json({
      success: true,
      cardName,
      results,
      summary: {
        totalSites: results.length,
        successfulSites: results.filter(r => r.success).length,
        totalPrices: results.reduce((sum, r) => sum + r.priceCount, 0),
        averageResponseTime: Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length)
      }
    })
  } catch (error) {
    console.error('Test scraping error:', error)
    return NextResponse.json(
      { error: 'Failed to test scraping' },
      { status: 500 }
    )
  }
}