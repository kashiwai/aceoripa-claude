import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 管理者権限チェック（Cookieベース）
    const adminSessionCookie = request.cookies.get('admin_session')
    if (!adminSessionCookie) {
      return NextResponse.json({
        success: false,
        error: '管理者認証が必要です'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const perPage = Number(searchParams.get('perPage')) || 20
    const offset = (page - 1) * perPage

    const { data: items, error, count } = await supabase
      .from('point_exchange_items')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1)

    if (error) {
      console.error('Admin point exchange items fetch error:', error)
      return NextResponse.json({
        success: false,
        error: 'アイテムの取得に失敗しました'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      items: items || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / perPage),
      currentPage: page
    })

  } catch (error: any) {
    console.error('Admin point exchange API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'アイテムの取得に失敗しました'
    }, { status: 500 })
  }
}

// アイテム追加
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 管理者権限チェック（Cookieベース）
    const adminSessionCookie = request.cookies.get('admin_session')
    if (!adminSessionCookie) {
      return NextResponse.json({
        success: false,
        error: '管理者認証が必要です'
      }, { status: 401 })
    }

    const {
      name,
      description,
      point_cost,
      stock_quantity,
      category,
      image_url,
      rarity,
      is_available = true
    } = await request.json()

    if (!name || !point_cost || !stock_quantity || !category) {
      return NextResponse.json({
        success: false,
        error: '必要な項目が不足しています'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('point_exchange_items')
      .insert({
        name,
        description: description || '',
        point_cost,
        stock_quantity,
        category,
        image_url: image_url || '',
        rarity: rarity || 'C',
        is_available,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Add item error:', error)
      return NextResponse.json({
        success: false,
        error: 'アイテムの追加に失敗しました'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'アイテムを追加しました',
      item: data
    })

  } catch (error: any) {
    console.error('Admin point exchange POST error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'アイテムの追加に失敗しました'
    }, { status: 500 })
  }
}

// アイテム更新
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 管理者権限チェック（Cookieベース）
    const adminSessionCookie = request.cookies.get('admin_session')
    if (!adminSessionCookie) {
      return NextResponse.json({
        success: false,
        error: '管理者認証が必要です'
      }, { status: 401 })
    }

    const {
      id,
      name,
      description,
      point_cost,
      stock_quantity,
      category,
      image_url,
      rarity,
      is_available
    } = await request.json()

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'アイテムIDが必要です'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('point_exchange_items')
      .update({
        name,
        description,
        point_cost,
        stock_quantity,
        category,
        image_url,
        rarity,
        is_available,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update item error:', error)
      return NextResponse.json({
        success: false,
        error: 'アイテムの更新に失敗しました'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'アイテムを更新しました',
      item: data
    })

  } catch (error: any) {
    console.error('Admin point exchange PUT error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'アイテムの更新に失敗しました'
    }, { status: 500 })
  }
}

// アイテム削除
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 管理者権限チェック（Cookieベース）
    const adminSessionCookie = request.cookies.get('admin_session')
    if (!adminSessionCookie) {
      return NextResponse.json({
        success: false,
        error: '管理者認証が必要です'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json({
        success: false,
        error: 'アイテムIDが必要です'
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('point_exchange_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      console.error('Delete item error:', error)
      return NextResponse.json({
        success: false,
        error: 'アイテムの削除に失敗しました'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'アイテムを削除しました'
    })

  } catch (error: any) {
    console.error('Admin point exchange DELETE error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'アイテムの削除に失敗しました'
    }, { status: 500 })
  }
}