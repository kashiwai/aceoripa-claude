interface PriceData {
  source: string
  price: number
  condition?: string
  listingUrl?: string
  listedAt?: Date
}

interface ScrapingResult {
  cardName: string
  prices: PriceData[]
  averagePrice: number
  minPrice: number
  maxPrice: number
  scrapedAt: Date
}

// メルカリ価格スクレイピング（模擬実装）
export async function scrapeMercariPrices(cardName: string, productCode?: string): Promise<PriceData[]> {
  // 実際の実装では、メルカリAPIやスクレイピングライブラリを使用
  // ここでは模擬データを返す
  const mockPrices: PriceData[] = [
    {
      source: 'mercari',
      price: Math.floor(Math.random() * 50000) + 1000,
      condition: 'near_mint',
      listingUrl: `https://jp.mercari.com/item/m${Math.random().toString().slice(2, 12)}`,
      listedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    },
    {
      source: 'mercari',
      price: Math.floor(Math.random() * 45000) + 1200,
      condition: 'excellent',
      listingUrl: `https://jp.mercari.com/item/m${Math.random().toString().slice(2, 12)}`,
      listedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)
    },
    {
      source: 'mercari',
      price: Math.floor(Math.random() * 55000) + 800,
      condition: 'mint',
      listingUrl: `https://jp.mercari.com/item/m${Math.random().toString().slice(2, 12)}`,
      listedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
    }
  ]

  // 実際の実装例（コメントアウト）:
  /*
  try {
    const searchQuery = encodeURIComponent(`${cardName} ${productCode || ''}`.trim())
    const response = await fetch(`https://api.mercari.com/v2/entities:search?q=${searchQuery}&category_id=1658`)
    const data = await response.json()
    
    return data.items?.map((item: any) => ({
      source: 'mercari',
      price: item.price,
      condition: item.condition,
      listingUrl: `https://jp.mercari.com/item/${item.id}`,
      listedAt: new Date(item.created_time * 1000)
    })) || []
  } catch (error) {
    console.error('Mercari scraping error:', error)
    return []
  }
  */

  return mockPrices
}

// Yahoo!オークション価格スクレイピング（模擬実装）
export async function scrapeYahooAuctionPrices(cardName: string, productCode?: string): Promise<PriceData[]> {
  const mockPrices: PriceData[] = [
    {
      source: 'yahoo_auction',
      price: Math.floor(Math.random() * 60000) + 1500,
      condition: 'near_mint',
      listingUrl: `https://page.auctions.yahoo.co.jp/jp/auction/${Math.random().toString().slice(2, 12)}`,
      listedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000)
    },
    {
      source: 'yahoo_auction',
      price: Math.floor(Math.random() * 40000) + 2000,
      condition: 'excellent',
      listingUrl: `https://page.auctions.yahoo.co.jp/jp/auction/${Math.random().toString().slice(2, 12)}`,
      listedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000)
    }
  ]

  return mockPrices
}

// マギ価格スクレイピング（模擬実装）
export async function scrapeMagiPrices(cardName: string, productCode?: string): Promise<PriceData[]> {
  const mockPrices: PriceData[] = [
    {
      source: 'magi',
      price: Math.floor(Math.random() * 45000) + 1800,
      condition: 'mint',
      listingUrl: `https://magi.camp/cards/${Math.random().toString().slice(2, 8)}`,
      listedAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000)
    }
  ]

  return mockPrices
}

// ポケモンカードステーション価格スクレイピング（模擬実装）
export async function scrapePokemonCardStationPrices(cardName: string, productCode?: string): Promise<PriceData[]> {
  const mockPrices: PriceData[] = [
    {
      source: 'pokemon_card_station',
      price: Math.floor(Math.random() * 50000) + 1600,
      condition: 'near_mint',
      listingUrl: `https://www.pokemon-card.com/card-search/details.php?cardno=${Math.random().toString().slice(2, 8)}`,
      listedAt: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000)
    }
  ]

  return mockPrices
}

// 全サイトから価格を取得
export async function scrapeAllPrices(cardName: string, productCode?: string): Promise<ScrapingResult> {
  const scrapingPromises = [
    scrapeMercariPrices(cardName, productCode),
    scrapeYahooAuctionPrices(cardName, productCode),
    scrapeMagiPrices(cardName, productCode),
    scrapePokemonCardStationPrices(cardName, productCode)
  ]

  try {
    const results = await Promise.allSettled(scrapingPromises)
    const allPrices: PriceData[] = []

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allPrices.push(...result.value)
      }
    })

    if (allPrices.length === 0) {
      throw new Error('No prices found')
    }

    const prices = allPrices.map(p => p.price)
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    return {
      cardName,
      prices: allPrices,
      averagePrice: Math.round(averagePrice),
      minPrice,
      maxPrice,
      scrapedAt: new Date()
    }
  } catch (error) {
    console.error('Price scraping error:', error)
    throw error
  }
}

// 価格変動を計算
export function calculatePriceChange(previousPrice: number, currentPrice: number): {
  changeAmount: number
  changePercentage: number
  changeType: 'increase' | 'decrease' | 'stable'
} {
  const changeAmount = currentPrice - previousPrice
  const changePercentage = previousPrice > 0 ? (changeAmount / previousPrice) * 100 : 0
  
  let changeType: 'increase' | 'decrease' | 'stable' = 'stable'
  if (Math.abs(changePercentage) > 0.1) {
    changeType = changePercentage > 0 ? 'increase' : 'decrease'
  }

  return {
    changeAmount: Math.round(changeAmount),
    changePercentage: Math.round(changePercentage * 100) / 100,
    changeType
  }
}