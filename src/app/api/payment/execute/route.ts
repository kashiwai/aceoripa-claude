import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { FINCODE_CONFIG } from '@/lib/fincode/config'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // ユーザー認証チェック
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, token, amount } = await request.json()

    // GMO fincode APIで決済実行
    const fincodeUrl = FINCODE_CONFIG.environment === 'prod' 
      ? 'https://api.fincode.jp/v1/payments' 
      : 'https://api.test.fincode.jp/v1/payments'

    const paymentResponse = await fetch(fincodeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FINCODE_CONFIG.secretKey}`
      },
      body: JSON.stringify({
        pay_type: 'Card',
        access_id: orderId,
        id: token,
        method: '1', // 一括払い
        amount: amount,
        client_field_1: user.id,
        client_field_2: orderId,
        tds_type: '2', // 3Dセキュア2.0
        tds2_type: '1'
      })
    })

    if (!paymentResponse.ok) {
      const error = await paymentResponse.json()
      console.error('Payment execution error:', error)
      return NextResponse.json(
        { error: '決済処理に失敗しました' },
        { status: 400 }
      )
    }

    const paymentData = await paymentResponse.json()

    // 決済成功をpayment_sessionsに記録（ロールバック判定用）
    await supabase
      .from('payment_sessions')
      .update({
        status: 'payment_completed',
        payment_id: paymentData.id,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)

    // 3Dセキュア認証が必要な場合
    if (paymentData.tds2_status === '1') {
      return NextResponse.json({
        requires3DS: true,
        redirectUrl: paymentData.acs_url,
        md: paymentData.md,
        pareq: paymentData.pa_req
      })
    }

    // 決済成功 - ポイント付与処理へ
    const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/payment/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    })

    if (!confirmResponse.ok) {
      console.error('Point allocation failed for order:', orderId)

      // ポイント付与失敗 - Fincode決済をキャンセル（ロールバック）
      try {
        const cancelResponse = await fetch(`${fincodeUrl}/${orderId}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${FINCODE_CONFIG.secretKey}`
          }
        })

        if (cancelResponse.ok) {
          // ロールバック成功 - セッションを更新
          await supabase
            .from('payment_sessions')
            .update({
              status: 'rollback_completed',
              error_message: 'ポイント付与失敗により決済をキャンセルしました',
              updated_at: new Date().toISOString()
            })
            .eq('order_id', orderId)

          return NextResponse.json({
            error: '処理に失敗しました。決済はキャンセルされましたので、料金は請求されません。',
            rollback: true
          }, { status: 500 })
        } else {
          // ロールバック失敗 - サポート対応が必要
          const cancelError = await cancelResponse.json()
          console.error('Payment cancellation failed:', cancelError)

          await supabase
            .from('payment_sessions')
            .update({
              status: 'rollback_failed',
              error_message: '決済キャンセルに失敗しました。サポートにお問い合わせください。',
              updated_at: new Date().toISOString()
            })
            .eq('order_id', orderId)

          return NextResponse.json({
            error: '決済処理でエラーが発生しました。サポートにお問い合わせください。',
            orderId,
            requiresSupport: true
          }, { status: 500 })
        }
      } catch (rollbackError) {
        console.error('Rollback attempt failed:', rollbackError)

        await supabase
          .from('payment_sessions')
          .update({
            status: 'rollback_error',
            error_message: 'ロールバック処理でエラーが発生しました',
            updated_at: new Date().toISOString()
          })
          .eq('order_id', orderId)

        return NextResponse.json({
          error: '決済処理でエラーが発生しました。サポートにお問い合わせください。',
          orderId,
          requiresSupport: true
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      orderId: orderId,
      transactionId: paymentData.id
    })

  } catch (error) {
    console.error('Payment execution error:', error)

    // 予期しないエラー発生時 - 可能であればロールバック試行
    // Note: orderId, fincodeUrl はtryブロック内で定義されているため、
    // エラー発生タイミングによってはundefinedの可能性がある
    try {
      const body = await request.clone().json()
      const reqOrderId = body.orderId

      if (reqOrderId) {
        const rollbackUrl = FINCODE_CONFIG.environment === 'prod'
          ? `https://api.fincode.jp/v1/payments/${reqOrderId}/cancel`
          : `https://api.test.fincode.jp/v1/payments/${reqOrderId}/cancel`

        await fetch(rollbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${FINCODE_CONFIG.secretKey}`
          }
        })

        console.log('Emergency rollback attempted for order:', reqOrderId)
      }
    } catch (rollbackError) {
      console.error('Emergency rollback failed:', rollbackError)
      // ロールバックに失敗しても、元のエラーを返す
    }

    return NextResponse.json(
      { error: 'Payment execution failed' },
      { status: 500 }
    )
  }
}