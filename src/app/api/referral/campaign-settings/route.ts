import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // キャンペーン設定を取得
    const { data, error } = await supabase
      .from('referral_campaign_settings')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('キャンペーン設定取得エラー:', error)
      // デフォルト値を返す
      return NextResponse.json({
        referrerBonusPoints: 1000,
        referredBonusPoints: 500,
        minPaymentAmount: 100
      })
    }

    return NextResponse.json({
      referrerBonusPoints: data.referrer_bonus_points,
      referredBonusPoints: data.referred_bonus_points,
      minPaymentAmount: data.min_payment_amount
    })
  } catch (error) {
    console.error('エラー:', error)
    // デフォルト値を返す
    return NextResponse.json({
      referrerBonusPoints: 1000,
      referredBonusPoints: 500,
      minPaymentAmount: 100
    })
  }
}