import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createAdminClient, getAuthenticatedAdminClient, getServiceClient } from '@/lib/supabase-admin'

// 一括インポート処理
async function handleBulkImport(cards: any[], adminClient: any) {
  try {
    // console.log('Bulk import started with', cards.length, 'cards')
    // console.log('Sample card data:', cards[0])
    
    // 既存の商品コードをチェック
    const { data: existingCards, error: selectError } = await adminClient
      .from('pokemon_cards')
      .select('product_code')
      .in('product_code', cards.map(c => c.product_code))

    if (selectError) {
      console.error('Select error:', selectError)
      console.error('Error details:', {
        code: selectError.code,
        message: selectError.message,
        details: selectError.details,
        hint: selectError.hint
      })
      return NextResponse.json(
        { error: 'データベースの読み取りに失敗しました: ' + selectError.message },
        { status: 500 }
      )
    }

    const existingCodesSet = new Set(
      existingCards?.map(c => c.product_code) || []
    )

    // 重複していないデータのみフィルタリング
    const newCards = cards.filter(
      card => !existingCodesSet.has(card.product_code)
    )

    if (newCards.length === 0) {
      return NextResponse.json({
        imported: 0,
        skipped: cards.length,
        message: 'すべてのカードが既に登録済みです'
      })
    }

    // バッチでインサート（一度に最大500件まで）
    const batchSize = 500
    let totalImported = 0

    for (let i = 0; i < newCards.length; i += batchSize) {
      const batch = newCards.slice(i, i + batchSize)
      
      const { data, error: insertError } = await adminClient
        .from('pokemon_cards')
        .insert(batch)
        .select()

      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json(
          { 
            error: 'データベースへの挿入に失敗しました: ' + insertError.message,
            imported: totalImported,
            skipped: cards.length - newCards.length
          },
          { status: 500 }
        )
      }

      totalImported += batch.length
    }

    return NextResponse.json({
      imported: totalImported,
      skipped: cards.length - newCards.length,
      total: cards.length
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    throw error
  }
}

// カード一覧取得
export async function GET(request: NextRequest) {
  try {
    // 認証をスキップしてサービスクライアントを使用
    const serviceClient = getServiceClient()

    // クエリパラメータ取得
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''
    const rarity = searchParams.get('rarity') || ''

    // クエリ構築
    let query = serviceClient
      .from('pokemon_cards')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 検索条件追加
    if (search) {
      query = query.or(`card_name.ilike.%${search}%,product_code.ilike.%${search}%`)
    }
    if (rarity) {
      query = query.eq('rarity', rarity)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      cards: data || [],
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    )
  }
}

// カード作成
export async function POST(request: NextRequest) {
  try {
    // リクエストボディ取得
    const body = await request.json()
    
    // 一括インポートの場合は認証をスキップしてサービスクライアントを使用
    if (body.cards && Array.isArray(body.cards)) {
      try {
        const serviceClient = getServiceClient()
        return handleBulkImport(body.cards, serviceClient)
      } catch (error) {
        console.error('Service client error:', error)
        // フォールバック: 通常のクライアントを試す
        const supabase = createRouteHandlerClient({ cookies })
        return handleBulkImport(body.cards, supabase)
      }
    }
    
    // 単一カード作成の場合は認証が必要
    const { user, adminClient } = await getAuthenticatedAdminClient()
    // console.log('Creating card as user:', user.email)
    
    // 単一カード作成の場合
    const { card_name, product_code, rarity, image_url, market_price, description } = body

    // console.log('Card data:', body)

    // バリデーション
    if (!card_name || !product_code || !rarity) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    // カード作成（管理者クライアントを使用）
    const { data, error } = await adminClient
      .from('pokemon_cards')
      .insert([{
        card_name,
        product_code,
        rarity,
        image_url: image_url || '/images/ngcard.jpg',
        market_price: market_price || 0,
        description
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Product code already exists' },
          { status: 409 }
        )
      }
      
      if (error.code === '42501') {
        return NextResponse.json(
          { error: 'Permission denied. Check RLS policies.' },
          { status: 403 }
        )
      }
      
      throw error
    }

    // console.log('Card created successfully:', data)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error creating card:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create card' },
      { status: 500 }
    )
  }
}

// カード更新
export async function PUT(request: NextRequest) {
  try {
    // 認証チェックと管理者クライアント取得
    const { user, adminClient } = await getAuthenticatedAdminClient()

    // リクエストボディ取得
    const body = await request.json()
    const { id, card_name, product_code, rarity, image_url, market_price, description } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      )
    }

    // カード更新（管理者クライアントを使用）
    const { data, error } = await adminClient
      .from('pokemon_cards')
      .update({
        card_name,
        product_code,
        rarity,
        image_url,
        market_price,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating card:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update card' },
      { status: 500 }
    )
  }
}

// カード削除
export async function DELETE(request: NextRequest) {
  try {
    // 認証チェックと管理者クライアント取得
    const { user, adminClient } = await getAuthenticatedAdminClient()

    // クエリパラメータからIDを取得
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      )
    }

    // カード削除（管理者クライアントを使用）
    const { error } = await adminClient
      .from('pokemon_cards')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting card:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete card' },
      { status: 500 }
    )
  }
}