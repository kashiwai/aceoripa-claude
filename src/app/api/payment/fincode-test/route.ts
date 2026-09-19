import { NextRequest, NextResponse } from 'next/server';
import { FINCODE_CONFIG } from '@/lib/fincode/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, amount, orderId } = body;

    console.log('====== Fincode Payment Test ======');
    console.log('Token:', token);
    console.log('Amount:', amount);
    console.log('Order ID:', orderId);
    console.log('Environment:', FINCODE_CONFIG.environment);
    console.log('===================================');

    // Fincode APIエンドポイント
    const isProduction = FINCODE_CONFIG.environment === 'prod';
    const apiUrl = isProduction
      ? 'https://api.fincode.jp'
      : 'https://api.test.fincode.jp';

    // 決済作成
    const paymentData = {
      pay_type: 'Card',
      access_id: token,
      job_code: 'CAPTURE',
      amount: amount.toString(),
      tax: '0',
      client_field_1: orderId,
      tds2_type: '0', // 3Dセキュア2.0無効
      tds_type: '0'   // 3Dセキュア1.0無効
    };

    console.log('Payment request to:', `${apiUrl}/v1/payments`);
    console.log('Payment data:', paymentData);
    console.log('Auth header:', `Bearer ${FINCODE_CONFIG.secretKey?.substring(0, 10)}...`);

    const response = await fetch(`${apiUrl}/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FINCODE_CONFIG.secretKey}`,
        'Shop-ID': FINCODE_CONFIG.shopId
      },
      body: JSON.stringify(paymentData)
    });

    const responseText = await response.text();
    let result;
    
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText };
    }

    console.log('Fincode response status:', response.status);
    console.log('Fincode response:', result);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: result.errors?.[0]?.message || result.message || '決済処理に失敗しました',
          details: result,
          status: response.status
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: result.id,
      status: result.status,
      amount: result.amount,
      orderId: orderId,
      message: '決済が正常に処理されました'
    });

  } catch (error: any) {
    console.error('Payment test error:', error);
    return NextResponse.json(
      {
        error: 'サーバーエラー',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}