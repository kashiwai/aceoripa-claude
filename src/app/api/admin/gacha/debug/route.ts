import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    console.log('=== Database Debug Check ===')
    
    // 1. データベース接続テスト
    const { data: testData, error: testError } = await supabase
      .from('gacha_products')
      .select('count', { count: 'exact', head: true })

    if (testError) {
      console.error('Database connection error:', testError)
      return NextResponse.json({
        success: false,
        error: 'データベース接続エラー',
        details: testError
      })
    }

    // 2. テーブル構造確認
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'gacha_products' })
      .single()

    // 3. 既存データ確認
    const { data: existingData, error: existingError } = await supabase
      .from('gacha_products')
      .select('*')

    if (existingError) {
      console.error('Existing data fetch error:', existingError)
    }

    // 4. 最小限のテスト挿入
    const testGacha = {
      name: 'テストガチャ',
      description: 'テスト用',
      price: 100,
      card_count: 1,
      is_active: true
    }

    const { data: insertTest, error: insertError } = await supabase
      .from('gacha_products')
      .insert([testGacha])
      .select()

    if (insertError) {
      console.error('Insert test error:', insertError)
    } else {
      // テストデータを削除
      await supabase
        .from('gacha_products')
        .delete()
        .eq('name', 'テストガチャ')
    }

    return NextResponse.json({
      success: true,
      debug: {
        connection: testError ? 'Failed' : 'OK',
        tableExists: !testError,
        existingCount: existingData?.length || 0,
        existingData: existingData || [],
        insertTest: insertError ? 'Failed' : 'OK',
        insertError: insertError,
        tableInfo: tableInfo
      }
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug API エラー',
      details: error
    })
  }
}

// テーブル情報取得関数を作成
export async function POST() {
  try {
    const supabase = await createClient()
    
    // 最も基本的なガチャデータで挿入テスト
    const basicGacha = {
      name: 'シンプルテストガチャ',
      description: 'テスト',
      price: 150,
      card_count: 1,
      is_active: true
    }

    console.log('Attempting to insert:', basicGacha)

    const { data, error } = await supabase
      .from('gacha_products')
      .insert([basicGacha])
      .select()

    if (error) {
      console.error('Simple insert failed:', error)
      return NextResponse.json({
        success: false,
        error: 'シンプル挿入失敗',
        details: error,
        sqlError: error.message,
        code: error.code
      })
    }

    return NextResponse.json({
      success: true,
      message: 'シンプル挿入成功',
      data: data
    })

  } catch (error) {
    console.error('POST debug error:', error)
    return NextResponse.json({
      success: false,
      error: 'POST エラー',
      details: error
    })
  }
}