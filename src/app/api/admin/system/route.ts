import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase-admin'

// 管理画面(/admin/system)向けのシステム情報API
// 重要: 秘密鍵・トークンなどの値そのものは絶対に返さない。
// 「設定済みかどうか」のみを返す。

export async function GET(request: NextRequest) {
  const adminSession = request.cookies.get('admin_session')
  if (!adminSession) {
    return NextResponse.json({ error: '管理者認証が必要です' }, { status: 401 })
  }

  try {
    const supabase = getServiceClient()

    const [usersResult, cardsResult, transactionsResult, gachaResult, adminResult] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('pokemon_cards').select('*', { count: 'exact', head: true }),
      supabase.from('transactions').select('*', { count: 'exact', head: true }),
      supabase.from('gacha_products').select('*', { count: 'exact', head: true }),
      supabase.from('admin_credentials').select('*', { count: 'exact', head: true }),
    ])

    // ヘルスチェック(DB接続・必須テーブルの存在確認のみ。外部APIへの実接続は行わない)
    const errors: string[] = []
    let dbConnection = false
    try {
      const { error } = await supabase.from('gacha_products').select('id').limit(1)
      if (error) {
        errors.push(`DB接続エラー: ${error.message}`)
      } else {
        dbConnection = true
      }
    } catch (e: any) {
      errors.push(`DB接続エラー: ${e.message}`)
    }

    let storageConnection = false
    try {
      const { error } = await supabase.storage.from('pokemon-cards').list('', { limit: 1 })
      if (error) {
        errors.push(`ストレージ接続エラー: ${error.message}`)
      } else {
        storageConnection = true
      }
    } catch (e: any) {
      errors.push(`ストレージ接続エラー: ${e.message}`)
    }

    const requiredTables = ['users', 'pokemon_cards', 'gacha_products', 'gacha_pokemon_pools', 'transactions']
    for (const table of requiredTables) {
      const { error } = await supabase.from(table).select('*', { count: 'exact', head: true })
      if (error) {
        errors.push(`テーブル '${table}' が見つかりません`)
      }
    }

    const info = {
      nextJs: {
        version: '14.2.30',
        environment: process.env.NODE_ENV || 'development',
      },
      deployment: {
        vercelUrl: process.env.VERCEL_URL || null,
        environment: process.env.VERCEL_ENV || 'development',
      },
      database: {
        totalUsers: usersResult.count || 0,
        totalCards: cardsResult.count || 0,
        totalTransactions: transactionsResult.count || 0,
        totalGachaProducts: gachaResult.count || 0,
        totalAdmins: adminResult.count || 0,
      },
      systemHealth: {
        dbConnection,
        apiConnection: !!process.env.OPENAI_API_KEY,
        storageConnection,
        errors,
      },
      // 秘密の値は一切返さず、設定有無のみ返す
      integrations: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
        openai: !!process.env.OPENAI_API_KEY,
        fincode: !!(process.env.FINCODE_TEST_SECRET_KEY || process.env.FINCODE_PROD_SECRET_KEY),
        vapid: !!process.env.VAPID_PRIVATE_KEY,
        line: !!process.env.LINE_CHANNEL_SECRET,
        googleOAuth: !!process.env.GOOGLE_CLIENT_SECRET,
      },
    }

    return NextResponse.json({ success: true, info })
  } catch (error: any) {
    console.error('Error fetching system info:', error)
    return NextResponse.json({ error: 'システム情報の取得に失敗しました' }, { status: 500 })
  }
}
