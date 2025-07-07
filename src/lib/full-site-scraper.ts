import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SitePrice {
  cardName: string
  productCode: string
  price: number
  condition?: string
  rarity?: string
  listingUrl: string
  source: string
  scrapedAt: Date
}

// カードラッシュの全ページから価格データを取得
export async function scrapeAllCardRushPrices(batchRunId: string, onProgress?: (processed: number, total: number) => void): Promise<SitePrice[]> {
  const allPrices: SitePrice[] = []
  let currentPage = 1
  let hasMorePages = true
  let totalPages = 1

  console.log('Starting CardRush full site scraping...')

  try {
    while (hasMorePages && currentPage <= 100) { // 最大100ページまで
      const url = `https://cardrush.media/pokemon/buying_prices?page=${currentPage}`
      console.log(`Scraping CardRush page ${currentPage}/${totalPages}...`)

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
        }
      })

      if (!response.ok) {
        console.error(`CardRush page ${currentPage} failed: ${response.status}`)
        break
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      // ページ数を取得
      if (currentPage === 1) {
        const paginationText = $('.pagination').text()
        const pageMatch = paginationText.match(/(\d+)\s*ページ/)
        if (pageMatch) {
          totalPages = parseInt(pageMatch[1])
          console.log(`Total pages found: ${totalPages}`)
        }
      }

      // カードデータを抽出
      const pageCards: SitePrice[] = []
      
      $('table tbody tr').each((index, element) => {
        try {
          const $row = $(element)
          const cardName = $row.find('td:nth-child(1)').text().trim()
          const productCode = $row.find('td:nth-child(2)').text().trim()
          const rarity = $row.find('td:nth-child(3)').text().trim()
          const priceText = $row.find('td:last-child').text().trim()
          
          const priceMatch = priceText.match(/¥?([\d,]+)/)
          if (priceMatch && cardName) {
            const price = parseInt(priceMatch[1].replace(/,/g, ''))
            
            pageCards.push({
              cardName,
              productCode: productCode || '',
              price,
              condition: 'buying_price',
              rarity,
              listingUrl: url,
              source: 'cardrush',
              scrapedAt: new Date()
            })
          }
        } catch (error) {
          console.error('Error parsing CardRush row:', error)
        }
      })

      allPrices.push(...pageCards)
      console.log(`Found ${pageCards.length} prices on page ${currentPage}`)

      if (onProgress) {
        onProgress(allPrices.length, totalPages * 50) // 推定50件/ページ
      }

      // 次のページがあるかチェック
      const nextButton = $('a.next_page').length > 0
      hasMorePages = nextButton && currentPage < totalPages

      currentPage++
      
      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    console.log(`CardRush scraping completed. Total prices: ${allPrices.length}`)
    return allPrices

  } catch (error) {
    console.error('CardRush full site scraping error:', error)
    throw error
  }
}

// ポケカジラの全ページから価格データを取得
export async function scrapeAllPokecazillaPrices(batchRunId: string, onProgress?: (processed: number, total: number) => void): Promise<SitePrice[]> {
  const allPrices: SitePrice[] = []
  
  // ポケカジラは商品一覧ページの構造による
  // まずカテゴリーページから全商品リンクを取得
  console.log('Starting Pokecazilla full site scraping...')

  try {
    // メインカテゴリページを取得
    const mainUrl = 'https://pokecazilla.com/cards'
    const response = await fetch(mainUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })

    if (!response.ok) {
      throw new Error(`Pokecazilla main page failed: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // 商品リンクを収集
    const cardLinks: string[] = []
    $('.card-link, a[href*="/card/"]').each((index, element) => {
      const href = $(element).attr('href')
      if (href && !cardLinks.includes(href)) {
        cardLinks.push(href.startsWith('http') ? href : `https://pokecazilla.com${href}`)
      }
    })

    console.log(`Found ${cardLinks.length} card links to scrape`)

    // 各カードページから価格を取得
    for (let i = 0; i < cardLinks.length; i++) {
      try {
        const cardResponse = await fetch(cardLinks[i], {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          }
        })

        if (!cardResponse.ok) continue

        const cardHtml = await cardResponse.text()
        const card$ = cheerio.load(cardHtml)

        const cardName = card$('h1, .card-name').first().text().trim()
        const priceText = card$('.price, .current-price').first().text().trim()
        const productCode = card$('.product-code, .card-code').first().text().trim()

        const priceMatch = priceText.match(/¥?([\d,]+)/)
        if (priceMatch && cardName) {
          const price = parseInt(priceMatch[1].replace(/,/g, ''))
          
          allPrices.push({
            cardName,
            productCode: productCode || '',
            price,
            condition: 'market_price',
            listingUrl: cardLinks[i],
            source: 'pokecazilla',
            scrapedAt: new Date()
          })
        }

        if (onProgress) {
          onProgress(i + 1, cardLinks.length)
        }

        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 1500))

      } catch (error) {
        console.error(`Error scraping card ${cardLinks[i]}:`, error)
      }
    }

    console.log(`Pokecazilla scraping completed. Total prices: ${allPrices.length}`)
    return allPrices

  } catch (error) {
    console.error('Pokecazilla full site scraping error:', error)
    throw error
  }
}

// カードショップセラの全ページから価格データを取得
export async function scrapeAllSerraPrices(batchRunId: string, onProgress?: (processed: number, total: number) => void): Promise<SitePrice[]> {
  const allPrices: SitePrice[] = []
  let currentPage = 1
  const maxPages = 50 // セラは約42ページ

  console.log('Starting Serra full site scraping...')

  try {
    // まず総ページ数を確認
    const firstUrl = 'https://cardshop-serra.com/poke/buy_product?category_id=10508&pageno=1'
    const firstResponse = await fetch(firstUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      }
    })

    if (!firstResponse.ok) {
      throw new Error(`Serra first page failed: ${firstResponse.status}`)
    }

    const firstHtml = await firstResponse.text()
    const first$ = cheerio.load(firstHtml)
    
    // 総ページ数を取得
    let totalPages = 42 // デフォルト値
    const paginationLinks = first$('.pagination a')
    paginationLinks.each((index, element) => {
      const pageText = first$(element).text()
      const pageNum = parseInt(pageText)
      if (!isNaN(pageNum) && pageNum > totalPages) {
        totalPages = pageNum
      }
    })

    console.log(`Serra total pages: ${totalPages}`)

    // 各ページをスクレイピング
    for (let page = 1; page <= Math.min(totalPages, maxPages); page++) {
      const url = `https://cardshop-serra.com/poke/buy_product?category_id=10508&pageno=${page}`
      console.log(`Scraping Serra page ${page}/${totalPages}...`)

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        }
      })

      if (!response.ok) {
        console.error(`Serra page ${page} failed: ${response.status}`)
        continue
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      const pageCards: SitePrice[] = []

      $('.product-item, .card-item, .buy-item').each((index, element) => {
        try {
          const $item = $(element)
          const nameElement = $item.find('.product-name, .card-name, h3, h4').first()
          const cardName = nameElement.text().trim()
          
          // 商品コードを抽出（カード名に含まれることが多い）
          const codeMatch = cardName.match(/\(([\w\-\/]+)\)/)
          const productCode = codeMatch ? codeMatch[1] : ''
          
          const priceText = $item.find('.price, .buy-price').text().trim()
          const priceMatch = priceText.match(/買取価格\s*¥?([\d,]+)|¥?([\d,]+)円/)
          
          if (priceMatch && cardName) {
            const price = parseInt((priceMatch[1] || priceMatch[2]).replace(/,/g, ''))
            
            pageCards.push({
              cardName: cardName.replace(/\([^)]+\)/, '').trim(), // コード部分を除去
              productCode,
              price,
              condition: 'buying_price',
              listingUrl: url,
              source: 'serra',
              scrapedAt: new Date()
            })
          }
        } catch (error) {
          console.error('Error parsing Serra item:', error)
        }
      })

      allPrices.push(...pageCards)
      console.log(`Found ${pageCards.length} prices on page ${page}`)

      if (onProgress) {
        onProgress(page, totalPages)
      }

      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    console.log(`Serra scraping completed. Total prices: ${allPrices.length}`)
    return allPrices

  } catch (error) {
    console.error('Serra full site scraping error:', error)
    throw error
  }
}

// 全サイトから全データを取得してDBに保存
export async function scrapeAndSaveAllSitePrices(batchRunId: string): Promise<{
  totalPrices: number
  cardRushPrices: number
  pokecazillaPrices: number
  serraPrices: number
  errors: string[]
}> {
  const errors: string[] = []
  let cardRushPrices = 0
  let pokecazillaPrices = 0
  let serraPrices = 0

  try {
    // CardRush
    console.log('Starting CardRush scraping...')
    try {
      const cardRushData = await scrapeAllCardRushPrices(batchRunId, (processed, total) => {
        console.log(`CardRush progress: ${processed}/${total}`)
      })
      
      if (cardRushData.length > 0) {
        // バッチでDBに保存
        await saveScrapedPricesToDB(cardRushData, batchRunId)
        cardRushPrices = cardRushData.length
      }
    } catch (error) {
      const errorMsg = `CardRush scraping failed: ${error}`
      console.error(errorMsg)
      errors.push(errorMsg)
    }

    // Pokecazilla
    console.log('Starting Pokecazilla scraping...')
    try {
      const pokecazillaData = await scrapeAllPokecazillaPrices(batchRunId, (processed, total) => {
        console.log(`Pokecazilla progress: ${processed}/${total}`)
      })
      
      if (pokecazillaData.length > 0) {
        await saveScrapedPricesToDB(pokecazillaData, batchRunId)
        pokecazillaPrices = pokecazillaData.length
      }
    } catch (error) {
      const errorMsg = `Pokecazilla scraping failed: ${error}`
      console.error(errorMsg)
      errors.push(errorMsg)
    }

    // Serra
    console.log('Starting Serra scraping...')
    try {
      const serraData = await scrapeAllSerraPrices(batchRunId, (processed, total) => {
        console.log(`Serra progress: ${processed}/${total}`)
      })
      
      if (serraData.length > 0) {
        await saveScrapedPricesToDB(serraData, batchRunId)
        serraPrices = serraData.length
      }
    } catch (error) {
      const errorMsg = `Serra scraping failed: ${error}`
      console.error(errorMsg)
      errors.push(errorMsg)
    }

    const totalPrices = cardRushPrices + pokecazillaPrices + serraPrices

    return {
      totalPrices,
      cardRushPrices,
      pokecazillaPrices,
      serraPrices,
      errors
    }

  } catch (error) {
    console.error('Full site scraping error:', error)
    throw error
  }
}

// スクレイピングしたデータをDBに保存
async function saveScrapedPricesToDB(prices: SitePrice[], batchRunId: string): Promise<void> {
  const BATCH_SIZE = 100

  for (let i = 0; i < prices.length; i += BATCH_SIZE) {
    const batch = prices.slice(i, i + BATCH_SIZE)
    
    try {
      // まず、カード名と商品コードでDBのカードを検索
      const cardMatches = await Promise.all(
        batch.map(async (price) => {
          // 商品コードで検索
          if (price.productCode) {
            const { data } = await supabaseAdmin
              .from('pokemon_cards')
              .select('id')
              .eq('product_code', price.productCode)
              .single()
            
            if (data) return { priceData: price, cardId: data.id }
          }

          // カード名で検索（部分一致）
          const { data } = await supabaseAdmin
            .from('pokemon_cards')
            .select('id')
            .ilike('card_name', `%${price.cardName}%`)
            .limit(1)
            .single()

          return data ? { priceData: price, cardId: data.id } : null
        })
      )

      // マッチしたカードの価格履歴を保存
      const priceHistoryInserts = cardMatches
        .filter(match => match !== null)
        .map(match => ({
          card_id: match!.cardId,
          source: match!.priceData.source,
          price: match!.priceData.price,
          condition: match!.priceData.condition,
          listing_url: match!.priceData.listingUrl,
          fetched_at: match!.priceData.scrapedAt.toISOString()
        }))

      if (priceHistoryInserts.length > 0) {
        const { error } = await supabaseAdmin
          .from('card_price_history')
          .insert(priceHistoryInserts)

        if (error) {
          console.error('Error inserting price history batch:', error)
        } else {
          console.log(`Saved ${priceHistoryInserts.length} price records`)
        }
      }

    } catch (error) {
      console.error('Error processing price batch:', error)
    }
  }
}