import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // 管理者認証をチェック
    const cookieStore = cookies()
    const adminSession = cookieStore.get('admin_session')
    
    if (!adminSession) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 401 }
      )
    }

    // テーブルの存在確認
    const tables = [
      'gacha_products',
      'gacha_pokemon_pools', 
      'pokemon_cards',
      'gacha_results_pokemon'
    ]

    const results: Record<string, any> = {}

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
          .single()

        results[table] = error ? { error: error.message } : { success: true, hasData: !!data }
      } catch (e) {
        results[table] = { error: 'Table access failed' }
      }
    }

    // サンプルガチャデータを取得
    const { data: sampleGacha, error: gachaError } = await supabase
      .from('gacha_products')
      .select('id, name, price, is_active')
      .limit(1)
      .single()

    if (sampleGacha) {
      // そのガチャのプールを確認
      const { data: poolData, error: poolError } = await supabase
        .from('gacha_pokemon_pools')
        .select('count')
        .eq('gacha_product_id', sampleGacha.id)

      results.sampleGacha = {
        ...sampleGacha,
        poolCount: poolData?.length || 0,
        poolError: poolError?.message
      }
    }

    return NextResponse.json({
      success: true,
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      tables: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test connection error:', error)
    return NextResponse.json(
      { 
        error: '接続テストに失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}