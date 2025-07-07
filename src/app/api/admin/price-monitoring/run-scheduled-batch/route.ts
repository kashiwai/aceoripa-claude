import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scrapeAndSaveAllSitePrices } from '@/lib/full-site-scraper'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { batchRunId } = await request.json()

    if (!batchRunId) {
      return NextResponse.json({ error: 'Batch run ID is required' }, { status: 400 })
    }

    console.log(`Starting scheduled batch run: ${batchRunId}`)

    // バッチ実行レコードを更新
    await supabaseAdmin
      .from('price_batch_runs')
      .update({
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', batchRunId)

    // 総カード数を取得
    const { count: totalCards } = await supabaseAdmin
      .from('pokemon_cards')
      .select('*', { count: 'exact', head: true })

    await supabaseAdmin
      .from('price_batch_runs')
      .update({ total_cards: totalCards || 0 })
      .eq('id', batchRunId)

    // 全サイトから価格データを取得
    try {
      const result = await scrapeAndSaveAllSitePrices(batchRunId)

      // 成功したカード数を計算（重複を除く推定値）
      const estimatedSuccessfulCards = Math.floor(result.totalPrices / 3) // 3サイト平均

      // バッチ実行レコードを完了に更新
      await supabaseAdmin
        .from('price_batch_runs')
        .update({
          status: 'completed',
          processed_cards: totalCards || 0,
          successful_cards: estimatedSuccessfulCards,
          failed_cards: (totalCards || 0) - estimatedSuccessfulCards,
          total_prices_found: result.totalPrices,
          completed_at: new Date().toISOString(),
          metadata: {
            cardRushPrices: result.cardRushPrices,
            pokecazillaPrices: result.pokecazillaPrices,
            serraPrices: result.serraPrices,
            errors: result.errors
          }
        })
        .eq('id', batchRunId)

      // 全カードの最終更新日時を記録
      const cardIds = await supabaseAdmin
        .from('pokemon_cards')
        .select('id')

      if (cardIds.data) {
        const updatePromises = cardIds.data.map(card => 
          supabaseAdmin
            .from('card_last_price_update')
            .upsert({
              card_id: card.id,
              last_updated_at: new Date().toISOString(),
              last_batch_run_id: batchRunId,
              update_count: 1
            }, {
              onConflict: 'card_id'
            })
        )

        await Promise.all(updatePromises)
      }

      console.log(`Batch run ${batchRunId} completed successfully`)

      return NextResponse.json({
        success: true,
        batchRunId,
        result: {
          totalPrices: result.totalPrices,
          cardRushPrices: result.cardRushPrices,
          pokecazillaPrices: result.pokecazillaPrices,
          serraPrices: result.serraPrices,
          errors: result.errors
        }
      })

    } catch (scrapeError) {
      console.error('Scraping error:', scrapeError)

      // エラー時もバッチレコードを更新
      await supabaseAdmin
        .from('price_batch_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: scrapeError instanceof Error ? scrapeError.message : 'Unknown error'
        })
        .eq('id', batchRunId)

      throw scrapeError
    }

  } catch (error) {
    console.error('Batch run error:', error)
    return NextResponse.json(
      { error: 'Failed to run batch' },
      { status: 500 }
    )
  }
}

// スケジュールチェック用のGETエンドポイント
export async function GET(request: NextRequest) {
  try {
    // アクティブなスケジュールを確認
    const { data: schedules } = await supabaseAdmin
      .from('price_batch_schedule')
      .select('*')
      .eq('is_active', true)
      .single()

    if (!schedules) {
      return NextResponse.json({
        shouldRun: false,
        message: 'No active schedule found'
      })
    }

    const today = new Date()
    const nextRunDate = new Date(schedules.next_run_date)

    // 実行日かチェック
    if (today >= nextRunDate) {
      // 新しいバッチ実行レコードを作成
      const { data: batchRun, error } = await supabaseAdmin
        .from('price_batch_runs')
        .insert({
          batch_name: `定期実行 - ${today.toLocaleDateString('ja-JP')}`,
          status: 'pending',
          metadata: {
            scheduled: true,
            scheduleId: schedules.id
          }
        })
        .select()
        .single()

      if (error) throw error

      // 次回実行日を計算
      const currentDay = today.getDate()
      const dayOfMonth = schedules.day_of_month as number[]
      let nextDay = dayOfMonth.find(d => d > currentDay) || dayOfMonth[0]
      let nextDate = new Date(today)
      
      if (nextDay <= currentDay) {
        nextDate.setMonth(nextDate.getMonth() + 1)
      }
      nextDate.setDate(nextDay)

      // スケジュールを更新
      await supabaseAdmin
        .from('price_batch_schedule')
        .update({
          last_run_id: batchRun.id,
          next_run_date: nextDate.toISOString().split('T')[0]
        })
        .eq('id', schedules.id)

      return NextResponse.json({
        shouldRun: true,
        batchRunId: batchRun.id,
        message: 'Batch run created and ready to execute'
      })
    }

    return NextResponse.json({
      shouldRun: false,
      message: `Next run scheduled for ${nextRunDate.toLocaleDateString('ja-JP')}`
    })

  } catch (error) {
    console.error('Schedule check error:', error)
    return NextResponse.json(
      { error: 'Failed to check schedule' },
      { status: 500 }
    )
  }
}