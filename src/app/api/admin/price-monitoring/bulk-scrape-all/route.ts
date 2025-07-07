import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scrapeCardRushPrices, scrapePokecazillaPrices, scrapeSerraPrices, scrapePokecaChartPrices } from '@/lib/real-price-scraper'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface BulkScrapeResult {
  cardId: string
  cardName: string
  totalPricesFound: number
  sourceResults: {
    [key: string]: {
      success: boolean
      priceCount: number
      error?: string
    }
  }
  averagePrice: number
  minPrice: number
  maxPrice: number
  processingTime: number
}

export async function POST(request: NextRequest) {
  try {
    const { limit = 50, startAfter = 0 } = await request.json()

    console.log(`Starting bulk scrape for ${limit} cards, starting after ${startAfter}`)

    // データベースからカード一覧を取得
    const { data: cards, error: cardsError } = await supabaseAdmin
      .from('pokemon_cards')
      .select('id, card_name, product_code, market_price')
      .order('created_at')
      .range(startAfter, startAfter + limit - 1)

    if (cardsError) throw cardsError

    if (!cards || cards.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No more cards to process',
        processed: 0,
        results: []
      })
    }

    const results: BulkScrapeResult[] = []
    let totalPricesScraped = 0

    console.log(`Processing ${cards.length} cards...`)

    // 各カードを順次処理
    for (const [index, card] of cards.entries()) {
      const cardStartTime = Date.now()
      console.log(`Processing card ${index + 1}/${cards.length}: ${card.card_name}`)

      const sourceResults: { [key: string]: { success: boolean; priceCount: number; error?: string } } = {}
      const allPrices: number[] = []

      // 各サイトから価格を取得
      const scrapingSources = [
        { name: 'cardrush', func: scrapeCardRushPrices },
        { name: 'pokecazilla', func: scrapePokecazillaPrices },
        { name: 'serra', func: scrapeSerraPrices },
        { name: 'pokeca_chart', func: scrapePokecaChartPrices }
      ]

      for (const source of scrapingSources) {
        try {
          const prices = await source.func(card.card_name)
          
          sourceResults[source.name] = {
            success: true,
            priceCount: prices.length
          }

          // 価格履歴をデータベースに保存
          if (prices.length > 0) {
            const priceHistoryInserts = prices.map(priceData => ({
              card_id: card.id,
              source: source.name,
              price: priceData.price,
              condition: priceData.condition,
              listing_url: priceData.listingUrl,
              listed_at: priceData.listedAt?.toISOString(),
              fetched_at: new Date().toISOString()
            }))

            const { error: insertError } = await supabaseAdmin
              .from('card_price_history')
              .insert(priceHistoryInserts)

            if (insertError) {
              console.error(`Error inserting price history for ${source.name}:`, insertError)
            } else {
              allPrices.push(...prices.map(p => p.price))
              totalPricesScraped += prices.length
            }
          }

          // レート制限対策
          await new Promise(resolve => setTimeout(resolve, 500))

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          sourceResults[source.name] = {
            success: false,
            priceCount: 0,
            error: errorMessage
          }
          console.error(`Error scraping ${source.name} for ${card.card_name}:`, errorMessage)
        }
      }

      // 価格統計を計算
      let averagePrice = 0
      let minPrice = 0
      let maxPrice = 0

      if (allPrices.length > 0) {
        averagePrice = Math.round(allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length)
        minPrice = Math.min(...allPrices)
        maxPrice = Math.max(...allPrices)

        // カードのmarket_priceを更新
        const { error: updateError } = await supabaseAdmin
          .from('pokemon_cards')
          .update({ market_price: averagePrice })
          .eq('id', card.id)

        if (updateError) {
          console.error(`Error updating market price for ${card.card_name}:`, updateError)
        }
      }

      const processingTime = Date.now() - cardStartTime

      results.push({
        cardId: card.id,
        cardName: card.card_name,
        totalPricesFound: allPrices.length,
        sourceResults,
        averagePrice,
        minPrice,
        maxPrice,
        processingTime
      })

      console.log(`Completed ${card.card_name}: ${allPrices.length} prices found in ${processingTime}ms`)

      // カード間で少し待機（サーバー負荷軽減）
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    const successfulCards = results.filter(r => r.totalPricesFound > 0).length

    return NextResponse.json({
      success: true,
      message: `Processed ${cards.length} cards, found prices for ${successfulCards} cards`,
      processed: cards.length,
      totalPricesScraped,
      successfulCards,
      results,
      summary: {
        averageProcessingTime: Math.round(results.reduce((sum, r) => sum + r.processingTime, 0) / results.length),
        totalProcessingTime: results.reduce((sum, r) => sum + r.processingTime, 0),
        pricesPerCard: Math.round(totalPricesScraped / cards.length)
      }
    })
  } catch (error) {
    console.error('Bulk scrape error:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk scraping' },
      { status: 500 }
    )
  }
}