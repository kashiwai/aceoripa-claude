import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Admin認証チェック
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { cards } = await request.json()
    
    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: 'Invalid cards data' }, { status: 400 })
    }
    
    // 画像URL処理関数
    const getImageUrl = (card: any) => {
      // Google Driveリンクを処理
      const processGoogleDriveUrl = (url: string) => {
        if (url.includes('drive.google.com')) {
          const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
          if (fileId) {
            return `https://drive.google.com/uc?id=${fileId}`
          }
        }
        return url
      }

      // 日本語ヘッダー対応
      const imageUrl = card['カード画像URL'] || card.card_image_url
      const localPath = card['ローカル画像パス'] || card.card_image_filename
      
      // URLが指定されている場合はそれを使用
      if (imageUrl && imageUrl.trim()) {
        return processGoogleDriveUrl(imageUrl.trim())
      }
      // ローカルパスが指定されている場合は、ファイル名のみ抽出
      if (localPath && localPath.trim()) {
        const filename = localPath.split('/').pop()
        return `/images/cards/${filename}`
      }
      // どちらも指定されていない場合は空文字
      return ''
    }

    // レアリティマッピング
    const mapRarity = (rarity: string) => {
      const rarityMap: { [key: string]: string } = {
        'プロモカード': 'SSR',
        'その他': 'SR',
        'SSR': 'SSR',
        'SR': 'SR', 
        'R': 'R',
        'N': 'N'
      }
      return rarityMap[rarity] || 'N'
    }

    // データ変換とバリデーション（日本語ヘッダー対応）
    const validCards = cards
      .filter(card => {
        const cardName = card['カード名'] || card.card_name
        const productCode = card['商品コード'] || card.product_code
        const rarity = card['レアリティ'] || card.rarity
        return cardName && productCode && rarity
      })
      .map(card => {
        const cardName = card['カード名'] || card.card_name
        const productCode = card['商品コード'] || card.product_code
        const rarity = card['レアリティ'] || card.rarity
        const points = card['還元pt'] || card.product_points || card['商品PT']
        
        return {
          card_name: cardName.trim(),
          product_code: productCode.trim(),
          rarity: mapRarity(rarity.trim()),
          market_price: Math.floor(parseFloat(points) || 0),
          image_url: getImageUrl(card),
          // 互換性のための追加フィールド
          set_name: '',
          card_number: '',
          card_type: 'ポケモン',
          condition_rating: 'NEAR_MINT',
          description: `${cardName} - ${rarity}`,
          is_available: true,
          last_price_update: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      })
    
    // レアリティ検証
    const validRarities = ['SSR', 'SR', 'R', 'N']
    const invalidCards = validCards.filter(card => !validRarities.includes(card.rarity))
    
    if (invalidCards.length > 0) {
      return NextResponse.json({ 
        error: `Invalid rarity found. Valid values: ${validRarities.join(', ')}`,
        invalidCards: invalidCards.map(c => `${c.card_name}: ${c.rarity}`)
      }, { status: 400 })
    }
    
    // バッチでデータベースに挿入（大容量対応）
    const batchSize = 50  // バッチサイズを小さくして安定性向上
    let imported = 0
    let errors = []
    
    for (let i = 0; i < validCards.length; i += batchSize) {
      const batch = validCards.slice(i, i + batchSize)
      
      try {
        const { data, error } = await supabase
          .from('pokemon_cards')
          .upsert(batch, { 
            onConflict: 'product_code',
            ignoreDuplicates: false 
          })
          .select('id')
        
        if (error) {
          console.error(`Batch ${i}-${i + batchSize} error:`, error)
          errors.push(`Batch ${i}-${i + batchSize}: ${error.message}`)
          
          // 個別に処理を試行
          for (const card of batch) {
            try {
              const { data: singleData, error: singleError } = await supabase
                .from('pokemon_cards')
                .upsert([card], { 
                  onConflict: 'product_code',
                  ignoreDuplicates: false 
                })
                .select('id')
              
              if (!singleError) {
                imported += 1
              }
            } catch (singleErr) {
              console.error(`Individual card error for ${card.card_name}:`, singleErr)
            }
          }
        } else {
          imported += data?.length || 0
        }
        
        // プログレス表示用（大容量ファイル処理時）
        if (i % 200 === 0) {
          console.log(`Processed ${i} / ${validCards.length} cards`)
        }
        
      } catch (batchError) {
        console.error(`Batch processing error:`, batchError)
        errors.push(`Batch ${i}: ${batchError}`)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      imported,
      total: validCards.length,
      skipped: validCards.length - imported,
      errors: errors.length > 0 ? errors : undefined
    })
    
  } catch (error) {
    console.error('Card import error:', error)
    return NextResponse.json({ 
      error: 'Failed to import cards',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}