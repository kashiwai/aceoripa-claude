import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CardRushPrice {
  cardName: string
  productCode: string
  price: number
  rarity: string
  setName?: string
  listingUrl: string
  scrapedAt: Date
}

// カードラッシュの全データを効率的に取得
export async function scrapeAllCardRushData(): Promise<{
  success: boolean
  totalPrices: number
  savedToDb: number
  errors: string[]
}> {
  const allPrices: CardRushPrice[] = []
  const errors: string[] = []
  let savedToDb = 0

  console.log('カードラッシュから全価格データを取得開始...')

  try {
    // まず1ページ目で総ページ数を確認
    const firstPageUrl = 'https://cardrush.media/pokemon/buying_prices?page=1'
    const firstResponse = await fetch(firstPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
      }
    })

    if (!firstResponse.ok) {
      throw new Error(`HTTP error! status: ${firstResponse.status}`)
    }

    const firstHtml = await firstResponse.text()
    const $first = cheerio.load(firstHtml)

    // 総ページ数を取得
    let totalPages = 1
    $first('.pagination a').each((index, element) => {
      const pageText = $first(element).text().trim()
      const pageNum = parseInt(pageText)
      if (!isNaN(pageNum) && pageNum > totalPages) {
        totalPages = pageNum
      }
    })

    console.log(`総ページ数: ${totalPages}`)

    // 各ページをスクレイピング
    for (let page = 1; page <= totalPages; page++) {
      try {
        console.log(`ページ ${page}/${totalPages} を処理中...`)
        
        const url = `https://cardrush.media/pokemon/buying_prices?page=${page}`
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          }
        })

        if (!response.ok) {
          errors.push(`ページ ${page} の取得に失敗: ${response.status}`)
          continue
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // テーブルから価格データを抽出
        $('table.buy-list tbody tr, table tbody tr').each((index, element) => {
          try {
            const $row = $(element)
            const cells = $row.find('td')
            
            if (cells.length >= 4) {
              // カラム構成を確認しながら取得
              const cardName = cells.eq(0).text().trim()
              const setName = cells.eq(1).text().trim()
              const productCode = cells.eq(2).text().trim()
              const rarity = cells.eq(3).text().trim()
              const priceText = cells.eq(cells.length - 1).text().trim() // 最後のカラムが価格
              
              // 価格を抽出
              const priceMatch = priceText.match(/¥?([\d,]+)/)
              if (priceMatch && cardName) {
                const price = parseInt(priceMatch[1].replace(/,/g, ''))
                
                allPrices.push({
                  cardName,
                  productCode: productCode || '',
                  price,
                  rarity: rarity || '',
                  setName: setName || '',
                  listingUrl: url,
                  scrapedAt: new Date()
                })
              }
            }
          } catch (rowError) {
            console.error('行の解析エラー:', rowError)
          }
        })

        console.log(`ページ ${page} から ${allPrices.length} 件の価格データを取得`)

        // レート制限対策（1-2秒待機）
        await new Promise(resolve => setTimeout(resolve, 1500))

      } catch (pageError) {
        errors.push(`ページ ${page} でエラー: ${pageError}`)
      }
    }

    console.log(`取得完了: 合計 ${allPrices.length} 件の価格データ`)

    // データベースに保存
    if (allPrices.length > 0) {
      console.log('データベースに保存中...')
      
      // バッチサイズで分割して保存
      const BATCH_SIZE = 100
      for (let i = 0; i < allPrices.length; i += BATCH_SIZE) {
        const batch = allPrices.slice(i, i + BATCH_SIZE)
        
        // カード名と商品コードでマッチング
        for (const priceData of batch) {
          try {
            // 商品コードで検索
            let cardId = null
            
            if (priceData.productCode) {
              const { data: cardByCode } = await supabaseAdmin
                .from('pokemon_cards')
                .select('id, card_name')
                .eq('product_code', priceData.productCode)
                .single()
              
              if (cardByCode) {
                cardId = cardByCode.id
              }
            }
            
            // 商品コードで見つからない場合はカード名で検索
            if (!cardId) {
              const { data: cardByName } = await supabaseAdmin
                .from('pokemon_cards')
                .select('id, product_code')
                .ilike('card_name', `%${priceData.cardName}%`)
                .limit(1)
                .single()
              
              if (cardByName) {
                cardId = cardByName.id
              }
            }
            
            // カードが見つかった場合は価格履歴を保存
            if (cardId) {
              await supabaseAdmin
                .from('card_price_history')
                .insert({
                  card_id: cardId,
                  source: 'cardrush',
                  price: priceData.price,
                  condition: 'buying_price',
                  listing_url: priceData.listingUrl,
                  fetched_at: priceData.scrapedAt.toISOString()
                })
              
              savedToDb++
              
              // 現在の市場価格も更新
              await supabaseAdmin
                .from('pokemon_cards')
                .update({ market_price: priceData.price })
                .eq('id', cardId)
            }
            
          } catch (saveError) {
            console.error('保存エラー:', saveError)
          }
        }
        
        console.log(`${savedToDb}/${allPrices.length} 件をデータベースに保存済み`)
      }
    }

    return {
      success: true,
      totalPrices: allPrices.length,
      savedToDb,
      errors
    }

  } catch (error) {
    console.error('カードラッシュスクレイピングエラー:', error)
    return {
      success: false,
      totalPrices: 0,
      savedToDb: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}