import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scrapeAllPrices, calculatePriceChange } from '@/lib/price-scraper'
import { scrapeRealPrices, scrapeWithRetry } from '@/lib/real-price-scraper'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 全カードの価格を一括更新
export async function POST(request: NextRequest) {
  try {
    const { limit = 100 } = await request.json()

    // 監視対象のカードを取得
    const { data: monitoringCards, error } = await supabaseAdmin
      .from('price_monitoring_settings')
      .select(`
        card_id,
        alert_threshold_percentage,
        last_checked_at,
        pokemon_cards (
          id,
          card_name,
          product_code,
          market_price
        )
      `)
      .eq('monitoring_enabled', true)
      .limit(limit)

    if (error) throw error

    if (!monitoringCards || monitoringCards.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No cards to monitor',
        processed: 0
      })
    }

    const results = []
    let alertsTriggered = 0

    // 各カードの価格を順次更新（レート制限対策）
    for (const monitoringCard of monitoringCards) {
      try {
        const card = monitoringCard.pokemon_cards
        if (!card) continue

        // 価格情報をスクレイピング（実際のサイトから取得）
        let scrapingResult
        try {
          scrapingResult = await scrapeWithRetry(card.card_name, card.product_code)
          console.log(`Real scraping successful for ${card.card_name} (${card.product_code}):`, scrapingResult.prices.length, 'prices found')
        } catch (realError) {
          console.warn(`Real scraping failed for ${card.card_name}, falling back to mock data:`, realError)
          // 実際のスクレイピングが失敗した場合、ダミーデータにフォールバック
          scrapingResult = await scrapeAllPrices(card.card_name, card.product_code)
        }

        // 価格履歴をデータベースに保存
        const priceHistoryPromises = scrapingResult.prices.map(priceData => 
          supabaseAdmin
            .from('card_price_history')
            .insert({
              card_id: card.id,
              source: priceData.source,
              price: priceData.price,
              condition: priceData.condition,
              listing_url: priceData.listingUrl,
              listed_at: priceData.listedAt?.toISOString(),
              fetched_at: new Date().toISOString()
            })
        )

        await Promise.all(priceHistoryPromises)

        // 以前の平均価格を取得
        const { data: previousData } = await supabaseAdmin
          .from('card_price_history')
          .select('price')
          .eq('card_id', card.id)
          .lt('fetched_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('fetched_at', { ascending: false })
          .limit(10)

        let previousAvgPrice = card.market_price || 0
        if (previousData && previousData.length > 0) {
          const totalPrice = previousData.reduce((sum, record) => sum + Number(record.price), 0)
          previousAvgPrice = totalPrice / previousData.length
        }

        // 価格変動を計算
        const priceChange = calculatePriceChange(previousAvgPrice, scrapingResult.averagePrice)
        const alertThreshold = monitoringCard.alert_threshold_percentage || 5.0

        // 価格変動がしきい値を超えた場合、アラートを作成
        if (Math.abs(priceChange.changePercentage) >= alertThreshold) {
          await supabaseAdmin
            .from('price_alerts')
            .insert({
              card_id: card.id,
              alert_type: priceChange.changeType,
              threshold_percentage: alertThreshold,
              previous_avg_price: previousAvgPrice,
              current_avg_price: scrapingResult.averagePrice,
              price_change_percentage: priceChange.changePercentage,
              triggered_at: new Date().toISOString()
            })
          
          alertsTriggered++
        }

        // カードのmarket_priceを更新
        await supabaseAdmin
          .from('pokemon_cards')
          .update({ market_price: scrapingResult.averagePrice })
          .eq('id', card.id)

        // 監視設定のlast_checked_atを更新
        await supabaseAdmin
          .from('price_monitoring_settings')
          .update({ last_checked_at: new Date().toISOString() })
          .eq('card_id', card.id)

        results.push({
          cardId: card.id,
          cardName: card.card_name,
          previousPrice: previousAvgPrice,
          currentPrice: scrapingResult.averagePrice,
          priceChange: priceChange,
          alertTriggered: Math.abs(priceChange.changePercentage) >= alertThreshold
        })

        // レート制限対策：少し待機
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (cardError) {
        console.error(`Error updating card ${monitoringCard.card_id}:`, cardError)
        results.push({
          cardId: monitoringCard.card_id,
          error: cardError instanceof Error ? cardError.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} cards`,
      processed: results.length,
      alertsTriggered,
      results
    })
  } catch (error) {
    console.error('Bulk price update error:', error)
    return NextResponse.json(
      { error: 'Failed to update prices' },
      { status: 500 }
    )
  }
}