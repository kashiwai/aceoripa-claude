import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scrapeAllPrices, calculatePriceChange } from '@/lib/price-scraper'
import { scrapeRealPrices, scrapeWithRetry } from '@/lib/real-price-scraper'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 価格データを取得して保存
export async function POST(request: NextRequest) {
  try {
    const { cardId, cardName, productCode } = await request.json()

    if (!cardId || !cardName) {
      return NextResponse.json({ error: 'Card ID and name are required' }, { status: 400 })
    }

    // 現在の価格情報をスクレイピング（実際のサイトから取得）
    let scrapingResult
    try {
      scrapingResult = await scrapeWithRetry(cardName, productCode)
      console.log(`Real scraping successful for ${cardName} (${productCode}):`, scrapingResult.prices.length, 'prices found')
    } catch (realError) {
      console.warn('Real scraping failed, falling back to mock data:', realError)
      // 実際のスクレイピングが失敗した場合、ダミーデータにフォールバック
      scrapingResult = await scrapeAllPrices(cardName, productCode)
    }

    // 価格履歴をデータベースに保存
    const priceHistoryPromises = scrapingResult.prices.map(priceData => 
      supabaseAdmin
        .from('card_price_history')
        .insert({
          card_id: cardId,
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
      .eq('card_id', cardId)
      .lt('fetched_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24時間前
      .order('fetched_at', { ascending: false })
      .limit(10)

    let previousAvgPrice = 0
    if (previousData && previousData.length > 0) {
      const totalPrice = previousData.reduce((sum, record) => sum + Number(record.price), 0)
      previousAvgPrice = totalPrice / previousData.length
    }

    // 価格変動を計算
    const priceChange = calculatePriceChange(previousAvgPrice, scrapingResult.averagePrice)

    // 監視設定を確認
    const { data: monitoringSettings } = await supabaseAdmin
      .from('price_monitoring_settings')
      .select('*')
      .eq('card_id', cardId)
      .single()

    const alertThreshold = monitoringSettings?.alert_threshold_percentage || 5.0

    // 価格変動がしきい値を超えた場合、アラートを作成
    if (Math.abs(priceChange.changePercentage) >= alertThreshold) {
      await supabaseAdmin
        .from('price_alerts')
        .insert({
          card_id: cardId,
          alert_type: priceChange.changeType,
          threshold_percentage: alertThreshold,
          previous_avg_price: previousAvgPrice,
          current_avg_price: scrapingResult.averagePrice,
          price_change_percentage: priceChange.changePercentage,
          triggered_at: new Date().toISOString()
        })
    }

    // カードのmarket_priceを更新
    await supabaseAdmin
      .from('pokemon_cards')
      .update({ market_price: scrapingResult.averagePrice })
      .eq('id', cardId)

    // 監視設定のlast_checked_atを更新
    if (monitoringSettings) {
      await supabaseAdmin
        .from('price_monitoring_settings')
        .update({ last_checked_at: new Date().toISOString() })
        .eq('card_id', cardId)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...scrapingResult,
        priceChange,
        alertTriggered: Math.abs(priceChange.changePercentage) >= alertThreshold
      }
    })
  } catch (error) {
    console.error('Price monitoring error:', error)
    return NextResponse.json(
      { error: 'Failed to monitor price' },
      { status: 500 }
    )
  }
}

// 価格履歴を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cardId = searchParams.get('cardId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 })
    }

    const { data: priceHistory, error } = await supabaseAdmin
      .from('card_price_history')
      .select('*')
      .eq('card_id', cardId)
      .order('fetched_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    // 日別の平均価格を計算
    const dailyPrices = new Map<string, { prices: number[], date: string }>()
    
    priceHistory?.forEach(record => {
      const date = new Date(record.fetched_at).toISOString().split('T')[0]
      if (!dailyPrices.has(date)) {
        dailyPrices.set(date, { prices: [], date })
      }
      dailyPrices.get(date)?.prices.push(Number(record.price))
    })

    const chartData = Array.from(dailyPrices.values()).map(dayData => ({
      date: dayData.date,
      averagePrice: Math.round(dayData.prices.reduce((sum, price) => sum + price, 0) / dayData.prices.length),
      minPrice: Math.min(...dayData.prices),
      maxPrice: Math.max(...dayData.prices),
      count: dayData.prices.length
    })).sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      success: true,
      data: {
        priceHistory,
        chartData
      }
    })
  } catch (error) {
    console.error('Get price history error:', error)
    return NextResponse.json(
      { error: 'Failed to get price history' },
      { status: 500 }
    )
  }
}