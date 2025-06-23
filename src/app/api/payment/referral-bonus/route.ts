import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 決済完了時に呼び出される紹介ボーナス付与処理
export async function POST(request: Request) {
  try {
    const { userId, paymentAmount } = await request.json()

    if (!userId || !paymentAmount) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      )
    }

    // キャンペーン設定を取得
    const { data: campaignSettings, error: settingsError } = await supabase
      .from('referral_campaign_settings')
      .select('*')
      .eq('is_active', true)
      .single()

    if (settingsError || !campaignSettings) {
      console.error('キャンペーン設定取得エラー:', settingsError)
      return NextResponse.json(
        { error: 'キャンペーン設定の取得に失敗しました' },
        { status: 500 }
      )
    }

    // 最小決済金額チェック
    if (paymentAmount < campaignSettings.min_payment_amount) {
      return NextResponse.json({
        success: true,
        message: '最小決済金額に達していないため、ボーナスは付与されません'
      })
    }

    // ユーザーが紹介経由で登録したかチェック
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_id', userId)
      .eq('status', 'pending')
      .single()

    if (!referral) {
      // 紹介経由でない、またはすでに処理済み
      return NextResponse.json({
        success: true,
        message: '紹介ボーナスの対象外です'
      })
    }

    // トランザクション開始
    const updates = []

    // 1. 被紹介者（新規ユーザー）にポイント付与
    const { error: referredUpdateError } = await supabase
      .from('users')
      .update({ 
        points: supabase.raw(`points + ${campaignSettings.referred_bonus_points}`)
      })
      .eq('id', userId)

    if (referredUpdateError) {
      throw new Error('被紹介者のポイント更新エラー')
    }

    // 2. 紹介者にポイント付与
    const { error: referrerUpdateError } = await supabase
      .from('users')
      .update({ 
        points: supabase.raw(`points + ${campaignSettings.referrer_bonus_points}`),
        referral_points_earned: supabase.raw(`referral_points_earned + ${campaignSettings.referrer_bonus_points}`)
      })
      .eq('id', referral.referrer_id)

    if (referrerUpdateError) {
      throw new Error('紹介者のポイント更新エラー')
    }

    // 3. 紹介関係のステータスを更新
    const { error: referralUpdateError } = await supabase
      .from('referrals')
      .update({
        status: 'completed',
        first_payment_at: new Date().toISOString(),
        referrer_points_awarded: campaignSettings.referrer_bonus_points,
        referred_points_awarded: campaignSettings.referred_bonus_points
      })
      .eq('id', referral.id)

    if (referralUpdateError) {
      throw new Error('紹介関係の更新エラー')
    }

    // 4. ポイント履歴を記録
    const pointHistories = [
      {
        user_id: userId,
        amount: campaignSettings.referred_bonus_points,
        type: 'referral_bonus',
        description: '紹介キャンペーン特典（被紹介者）',
        created_at: new Date().toISOString()
      },
      {
        user_id: referral.referrer_id,
        amount: campaignSettings.referrer_bonus_points,
        type: 'referral_bonus',
        description: '紹介キャンペーン特典（紹介者）',
        created_at: new Date().toISOString()
      }
    ]

    const { error: historyError } = await supabase
      .from('point_history')
      .insert(pointHistories)

    if (historyError) {
      console.error('ポイント履歴記録エラー:', historyError)
    }

    // 通知を送信（実装は別途必要）
    // await sendNotification(userId, `紹介特典として${campaignSettings.referred_bonus_points}ポイントが付与されました！`)
    // await sendNotification(referral.referrer_id, `紹介成功！${campaignSettings.referrer_bonus_points}ポイントが付与されました！`)

    return NextResponse.json({
      success: true,
      message: '紹介ボーナスが正常に付与されました',
      bonuses: {
        referrer: campaignSettings.referrer_bonus_points,
        referred: campaignSettings.referred_bonus_points
      }
    })

  } catch (error) {
    console.error('紹介ボーナス付与エラー:', error)
    return NextResponse.json(
      { error: 'ボーナス付与処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}