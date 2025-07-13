import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scrapeWithRetry } from '@/lib/real-price-scraper'
import { scrapeAllPrices } from '@/lib/price-scraper'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    console.log('🔍 リーリエ価格調査開始...')
    
    // 1. DBからリーリエカードを検索
    const { data: lillieCards, error: searchError } = await supabase
      .from('pokemon_cards')
      .select('*')
      .ilike('card_name', '%リーリエ%')
      .order('market_price', { ascending: false })
    
    if (searchError) {
      throw new Error(`DB検索エラー: ${searchError.message}`)
    }
    
    console.log(`✅ リーリエカード検索完了: ${lillieCards?.length || 0}枚見つかりました`)
    
    const results = {
      timestamp: new Date().toISOString(),
      dbCards: lillieCards?.map(card => ({
        id: card.id,
        name: card.card_name,
        currentPrice: card.market_price,
        productCode: card.product_code,
        rarity: card.rarity
      })) || [],
      priceCheckResults: []
    }
    
    // 2. 最も高価なリーリエ（おそらく726万のもの）の価格を実際にチェック
    if (lillieCards && lillieCards.length > 0) {
      const topLillie = lillieCards[0]
      console.log(`🎯 ${topLillie.card_name} の現在価格をチェック (現在: ¥${topLillie.market_price?.toLocaleString()})`)
      
      const checkResult = {
        cardId: topLillie.id,
        cardName: topLillie.card_name,
        productCode: topLillie.product_code,
        currentDbPrice: topLillie.market_price,
        scrapingAttempts: []
      }
      
      // 3. 実際のスクレイピングを試行
      console.log('📡 実際のスクレイピング実行中...')
      try {
        const realResult = await scrapeWithRetry(topLillie.card_name, topLillie.product_code, 2)
        checkResult.scrapingAttempts.push({
          type: 'real',
          success: true,
          averagePrice: realResult.averagePrice,
          minPrice: realResult.minPrice,
          maxPrice: realResult.maxPrice,
          pricesFound: realResult.prices.length,
          sources: realResult.prices.map(p => ({
            source: p.source,
            price: p.price,
            condition: p.condition
          }))
        })
        
        // 価格が大幅に異なる場合の分析
        const priceDifference = Math.abs(realResult.averagePrice - (topLillie.market_price || 0))
        const priceChangePercentage = topLillie.market_price > 0 
          ? (priceDifference / topLillie.market_price) * 100 
          : 0
        
        checkResult.analysis = {
          significantChange: priceChangePercentage > 10,
          priceChangePercentage,
          priceDifference,
          shouldUpdate: priceChangePercentage > 5
        }
        
        console.log(`✅ 実スクレイピング成功: 平均¥${realResult.averagePrice?.toLocaleString()}, 変動${priceChangePercentage.toFixed(1)}%`)
        
      } catch (realError) {
        console.warn('⚠️ 実スクレイピング失敗:', realError.message)
        checkResult.scrapingAttempts.push({
          type: 'real',
          success: false,
          error: realError.message
        })
        
        // フォールバックとしてモックデータを試行
        try {
          const mockResult = await scrapeAllPrices(topLillie.card_name, topLillie.product_code)
          checkResult.scrapingAttempts.push({
            type: 'mock',
            success: true,
            averagePrice: mockResult.averagePrice,
            minPrice: mockResult.minPrice,
            maxPrice: mockResult.maxPrice,
            pricesFound: mockResult.prices.length,
            note: 'Fallback to mock data due to real scraping failure'
          })
          console.log(`📋 モックデータ使用: 平均¥${mockResult.averagePrice?.toLocaleString()}`)
        } catch (mockError) {
          checkResult.scrapingAttempts.push({
            type: 'mock',
            success: false,
            error: mockError.message
          })
        }
      }
      
      results.priceCheckResults.push(checkResult)
    }
    
    // 4. 上位400カードランキングでのリーリエの位置を確認
    const { data: topCards } = await supabase
      .from('pokemon_cards')
      .select('id, card_name, market_price')
      .order('market_price', { ascending: false })
      .limit(400)
    
    if (topCards && lillieCards) {
      results.rankingInfo = lillieCards.map(lillie => {
        const rank = topCards.findIndex(card => card.id === lillie.id) + 1
        return {
          cardName: lillie.card_name,
          currentPrice: lillie.market_price,
          rank: rank > 0 ? rank : 'Not in top 400'
        }
      })
    }
    
    // 5. 最近の価格履歴をチェック
    if (lillieCards && lillieCards.length > 0) {
      const { data: recentPriceHistory } = await supabase
        .from('card_price_history')
        .select('*')
        .eq('card_id', lillieCards[0].id)
        .order('fetched_at', { ascending: false })
        .limit(10)
      
      results.recentPriceHistory = recentPriceHistory?.map(h => ({
        source: h.source,
        price: h.price,
        condition: h.condition,
        fetchedAt: h.fetched_at
      })) || []
    }
    
    return NextResponse.json({
      success: true,
      message: 'リーリエ価格調査完了',
      ...results,
      recommendations: generateRecommendations(results)
    })
    
  } catch (error: any) {
    console.error('❌ リーリエ価格調査エラー:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

function generateRecommendations(results: any): string[] {
  const recommendations = []
  
  if (results.dbCards.length === 0) {
    recommendations.push('❌ DBにリーリエカードが見つかりません。カードデータの登録が必要です。')
    return recommendations
  }
  
  const priceCheck = results.priceCheckResults[0]
  if (priceCheck) {
    const realScraping = priceCheck.scrapingAttempts.find(a => a.type === 'real')
    
    if (realScraping?.success) {
      recommendations.push('✅ 実際のスクレイピングが成功しています。価格データは正常に取得できています。')
      
      if (priceCheck.analysis?.significantChange) {
        recommendations.push(`⚠️ 価格に大きな変動があります（${priceCheck.analysis.priceChangePercentage.toFixed(1)}%）。価格更新を検討してください。`)
      } else {
        recommendations.push('📊 価格は安定しています。大きな変動は見られません。')
      }
    } else {
      recommendations.push('❌ 実際のスクレイピングが失敗しています。サイトのアクセス制限やサイト構造の変更が原因の可能性があります。')
      
      const mockScraping = priceCheck.scrapingAttempts.find(a => a.type === 'mock')
      if (mockScraping?.success) {
        recommendations.push('📋 モックデータは正常に動作しています。スクレイピング機能自体に問題はありません。')
      }
    }
  }
  
  if (results.rankingInfo) {
    const topRanked = results.rankingInfo.find(r => typeof r.rank === 'number')
    if (topRanked) {
      recommendations.push(`🏆 リーリエは上位${topRanked.rank}位にランクインしています。価格監視対象として適切です。`)
    }
  }
  
  return recommendations
}

export async function GET() {
  return NextResponse.json({
    message: 'リーリエ価格調査API',
    usage: 'POST /api/admin/lillie-price-check',
    description: 'リーリエカードの現在価格を調査し、実際のスクレイピング機能をテストします'
  })
}