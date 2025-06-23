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
      throw new Error('Point allocation failed')
    }

    return NextResponse.json({
      success: true,
      orderId: orderId,
      transactionId: paymentData.id
    })

  } catch (error) {
    console.error('Payment execution error:', error)
    return NextResponse.json(
      { error: 'Payment execution failed' },
      { status: 500 }
    )
  }
}