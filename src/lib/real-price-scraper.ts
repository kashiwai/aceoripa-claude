import * as cheerio from 'cheerio'

interface PriceData {
  source: string
  price: number
  condition?: string
  listingUrl?: string
  listedAt?: Date
  cardId?: string
  rarity?: string
}

interface ScrapingResult {
  cardName: string
  prices: PriceData[]
  averagePrice: number
  minPrice: number
  maxPrice: number
  scrapedAt: Date
}

// カードラッシュの買取価格を取得
export async function scrapeCardRushPrices(cardName: string, productCode?: string): Promise<PriceData[]> {
  try {
    // カード名と商品コードを組み合わせて検索
    const searchTerms = productCode ? `${cardName} ${productCode}` : cardName
    const searchQuery = encodeURIComponent(searchTerms)
    const url = `https://cardrush.media/pokemon/buying_prices?search=${searchQuery}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    })

    if (!response.ok) {
      throw new Error(`CardRush HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const prices: PriceData[] = []

    // テーブルの行を解析
    $('table tbody tr').each((index, element) => {
      try {
        const $row = $(element)
        const name = $row.find('td:first-child').text().trim()
        const priceText = $row.find('td:last-child').text().trim()
        const rarityText = $row.find('td:nth-child(3)').text().trim()
        
        // カード名が部分一致するかチェック
        if (name.toLowerCase().includes(cardName.toLowerCase()) || 
            cardName.toLowerCase().includes(name.toLowerCase())) {
          
          // 価格をパース（¥を除去して数値に変換）
          const priceMatch = priceText.match(/¥?([\d,]+)/)
          if (priceMatch) {
            const price = parseInt(priceMatch[1].replace(/,/g, ''))
            
            prices.push({
              source: 'cardrush',
              price: price,
              condition: 'buying_price', // 買取価格
              listingUrl: url,
              listedAt: new Date(),
              rarity: rarityText
            })
          }
        }
      } catch (error) {
        console.error('Error parsing CardRush row:', error)
      }
    })

    return prices
  } catch (error) {
    console.error('CardRush scraping error:', error)
    return []
  }
}

// ポケカジラの価格を取得
export async function scrapePokecazillaPrices(cardName: string, productCode?: string): Promise<PriceData[]> {
  try {
    const searchTerms = productCode ? `${cardName} ${productCode}` : cardName
    const searchQuery = encodeURIComponent(searchTerms)
    const url = `https://pokecazilla.com/search?q=${searchQuery}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
      }
    })

    if (!response.ok) {
      throw new Error(`Pokecazilla HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const prices: PriceData[] = []

    // カード検索結果を解析
    $('.card-item, .search-result-item').each((index, element) => {
      try {
        const $item = $(element)
        const name = $item.find('.card-name, .item-name').text().trim()
        const priceText = $item.find('.price, .current-price').text().trim()
        
        if (name.toLowerCase().includes(cardName.toLowerCase()) || 
            cardName.toLowerCase().includes(name.toLowerCase())) {
          
          const priceMatch = priceText.match(/¥?([\d,]+)/)
          if (priceMatch) {
            const price = parseInt(priceMatch[1].replace(/,/g, ''))
            
            prices.push({
              source: 'pokecazilla',
              price: price,
              condition: 'market_price',
              listingUrl: url,
              listedAt: new Date()
            })
          }
        }
      } catch (error) {
        console.error('Error parsing Pokecazilla item:', error)
      }
    })

    return prices
  } catch (error) {
    console.error('Pokecazilla scraping error:', error)
    return []
  }
}

// カードショップセラの買取価格を取得
export async function scrapeSerraPrices(cardName: string, productCode?: string): Promise<PriceData[]> {
  try {
    const prices: PriceData[] = []
    
    // 複数ページを検索
    for (let page = 1; page <= 5; page++) {
      const url = `https://cardshop-serra.com/poke/buy_product?category_id=10508&pageno=${page}`
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
        }
      })

      if (!response.ok) continue

      const html = await response.text()
      const $ = cheerio.load(html)

      $('.product-item, .card-item').each((index, element) => {
        try {
          const $item = $(element)
          const name = $item.find('.product-name, .card-name, h3, h4').text().trim()
          const priceText = $item.find('.price, .buy-price').text().trim()
          
          // 商品コードも含めて検索
          const searchTerms = productCode ? `${cardName} ${productCode}` : cardName
          const nameMatch = name.toLowerCase().includes(cardName.toLowerCase()) || 
                           cardName.toLowerCase().includes(name.toLowerCase())
          const codeMatch = productCode ? name.includes(productCode) : true
          
          if (nameMatch && codeMatch) {
            
            const priceMatch = priceText.match(/買取価格\s*¥?([\d,]+)|¥?([\d,]+)円/)
            if (priceMatch) {
              const price = parseInt((priceMatch[1] || priceMatch[2]).replace(/,/g, ''))
              
              prices.push({
                source: 'serra',
                price: price,
                condition: 'buying_price',
                listingUrl: url,
                listedAt: new Date()
              })
            }
          }
        } catch (error) {
          console.error('Error parsing Serra item:', error)
        }
      })

      // レート制限のため少し待機
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return prices
  } catch (error) {
    console.error('Serra scraping error:', error)
    return []
  }
}

// ポケカチャートの価格を取得（実装はサイト構造による）
export async function scrapePokecaChartPrices(cardName: string, productCode?: string): Promise<PriceData[]> {
  try {
    const searchTerms = productCode ? `${cardName} ${productCode}` : cardName
    const searchQuery = encodeURIComponent(searchTerms)
    const url = `https://pokeca-chart.com/?s=${searchQuery}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
      }
    })

    if (!response.ok) {
      throw new Error(`PokecaChart HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const prices: PriceData[] = []

    // サイト構造に応じて調整が必要
    $('.price-item, .chart-item, .card-entry').each((index, element) => {
      try {
        const $item = $(element)
        const name = $item.find('.card-name, .item-title, h3').text().trim()
        const priceText = $item.find('.price, .market-price').text().trim()
        
        if (name.toLowerCase().includes(cardName.toLowerCase()) || 
            cardName.toLowerCase().includes(name.toLowerCase())) {
          
          const priceMatch = priceText.match(/¥?([\d,]+)/)
          if (priceMatch) {
            const price = parseInt(priceMatch[1].replace(/,/g, ''))
            
            prices.push({
              source: 'pokeca_chart',
              price: price,
              condition: 'market_price',
              listingUrl: url,
              listedAt: new Date()
            })
          }
        }
      } catch (error) {
        console.error('Error parsing PokecaChart item:', error)
      }
    })

    return prices
  } catch (error) {
    console.error('PokecaChart scraping error:', error)
    return []
  }
}

// 全サイトから価格を取得（実際のスクレイピング版）
export async function scrapeRealPrices(cardName: string, productCode?: string): Promise<ScrapingResult> {
  const scrapingPromises = [
    scrapeCardRushPrices(cardName, productCode),
    scrapePokecazillaPrices(cardName, productCode),
    scrapeSerraPrices(cardName, productCode),
    scrapePokecaChartPrices(cardName, productCode)
  ]

  try {
    const results = await Promise.allSettled(scrapingPromises)
    const allPrices: PriceData[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allPrices.push(...result.value)
      } else {
        console.error(`Scraping failed for source ${index}:`, result.reason)
      }
    })

    if (allPrices.length === 0) {
      throw new Error('No prices found from any source')
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
    console.error('Real price scraping error:', error)
    throw error
  }
}

// レート制限とリトライ機能
export async function scrapeWithRetry(cardName: string, productCode?: string, maxRetries: number = 3): Promise<ScrapingResult> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await scrapeRealPrices(cardName, productCode)
      return result
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) {
        throw error
      }
      
      // 指数バックオフで待機
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw new Error('All retry attempts failed')
}