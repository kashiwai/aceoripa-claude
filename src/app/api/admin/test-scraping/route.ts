import { NextRequest, NextResponse } from 'next/server'
import { scrapeWithRetry, scrapeRealPrices } from '@/lib/real-price-scraper'
import { scrapeAllPrices } from '@/lib/price-scraper'

export async function POST(request: NextRequest) {
  try {
    const { cardName, productCode } = await request.json()
    
    if (!cardName) {
      return NextResponse.json({ error: 'Card name is required' }, { status: 400 })
    }
    
    console.log(`🔍 Testing price scraping for: ${cardName} (${productCode || 'no code'})`)
    
    const results = {
      cardName,
      productCode,
      timestamp: new Date().toISOString(),
      realScraping: null,
      mockScraping: null,
      errors: []
    }
    
    // 1. 実際のスクレイピングをテスト
    try {
      console.log('📡 Attempting real scraping...')
      const realResult = await scrapeWithRetry(cardName, productCode, 2)
      results.realScraping = {
        success: true,
        averagePrice: realResult.averagePrice,
        minPrice: realResult.minPrice,
        maxPrice: realResult.maxPrice,
        pricesFound: realResult.prices.length,
        sources: realResult.prices.map(p => ({
          source: p.source,
          price: p.price,
          condition: p.condition,
          url: p.listingUrl
        })),
        scrapedAt: realResult.scrapedAt
      }
      console.log(`✅ Real scraping successful: ${realResult.prices.length} prices found`)
    } catch (realError) {
      console.error('❌ Real scraping failed:', realError)
      results.errors.push(`Real scraping error: ${realError.message}`)
      results.realScraping = { success: false, error: realError.message }
    }
    
    // 2. モックデータもテスト（比較用）
    try {
      console.log('🎭 Testing mock scraping for comparison...')
      const mockResult = await scrapeAllPrices(cardName, productCode)
      results.mockScraping = {
        success: true,
        averagePrice: mockResult.averagePrice,
        minPrice: mockResult.minPrice,
        maxPrice: mockResult.maxPrice,
        pricesFound: mockResult.prices.length,
        sources: mockResult.prices.map(p => ({
          source: p.source,
          price: p.price,
          condition: p.condition
        }))
      }
      console.log(`✅ Mock scraping successful: ${mockResult.prices.length} prices found`)
    } catch (mockError) {
      console.error('❌ Mock scraping failed:', mockError)
      results.errors.push(`Mock scraping error: ${mockError.message}`)
      results.mockScraping = { success: false, error: mockError.message }
    }
    
    // 3. 結果分析
    const analysis = {
      realScrapingWorking: results.realScraping?.success || false,
      mockScrapingWorking: results.mockScraping?.success || false,
      priceComparison: null
    }
    
    if (results.realScraping?.success && results.mockScraping?.success) {
      analysis.priceComparison = {
        realAverage: results.realScraping.averagePrice,
        mockAverage: results.mockScraping.averagePrice,
        difference: Math.abs(results.realScraping.averagePrice - results.mockScraping.averagePrice),
        differencePercentage: Math.round(
          (Math.abs(results.realScraping.averagePrice - results.mockScraping.averagePrice) / 
           results.mockScraping.averagePrice) * 100 * 100
        ) / 100
      }
    }
    
    return NextResponse.json({
      success: true,
      ...results,
      analysis,
      recommendation: getRecommendation(results, analysis)
    })
    
  } catch (error: any) {
    console.error('❌ Test scraping error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

function getRecommendation(results: any, analysis: any): string {
  if (analysis.realScrapingWorking) {
    return "✅ リアルスクレイピングが正常に動作しています。実際の価格データが取得できています。"
  } else if (analysis.mockScrapingWorking) {
    return "⚠️ リアルスクレイピングは失敗しましたが、モックデータは動作しています。実際のサイトへのアクセスに問題がある可能性があります。"
  } else {
    return "❌ 両方のスクレイピング機能に問題があります。コードやネットワーク接続を確認してください。"
  }
}

// GET: テスト用の簡単なカード名リスト
export async function GET() {
  return NextResponse.json({
    testCards: [
      { name: "リーリエ", code: "PROMO" },
      { name: "マリオピカチュウ", code: "PROMO" },
      { name: "ポンチョを着たピカチュウ", code: null },
      { name: "アセロラ", code: null }
    ],
    usage: "POST /api/admin/test-scraping with { cardName: string, productCode?: string }"
  })
}