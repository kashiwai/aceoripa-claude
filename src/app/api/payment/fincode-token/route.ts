import { NextRequest, NextResponse } from 'next/server';
import { FINCODE_CONFIG } from '@/lib/fincode/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, amount, orderId } = body;

    console.log('====== Fincode Token Payment ======');
    console.log('Token:', token);
    console.log('Amount:', amount);
    console.log('Order ID:', orderId);
    console.log('Environment:', FINCODE_CONFIG.environment);
    console.log('===================================');

    // APIエンドポイント
    const apiUrl = FINCODE_CONFIG.apiUrl;

    // 決済IDを生成
    const paymentId = orderId || `pay_${Date.now()}`;

    // Step 1: 決済を作成
    const createPaymentData = {
      id: paymentId,
      pay_type: 'Card',
      job_code: 'CAPTURE',
      amount: amount.toString(),
      tds_type: '2',   // 3Dセキュア1.0を利用
      tds2_type: '2'   // 3Dセキュア2.0を利用
    };

    console.log('Creating payment:', createPaymentData);

    const createResponse = await fetch(`${apiUrl}/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FINCODE_CONFIG.secretKey}`
      },
      body: JSON.stringify(createPaymentData)
    });

    const createResult = await createResponse.json();
    console.log('Create payment response:', { status: createResponse.status, result: createResult });

    if (!createResponse.ok) {
      return NextResponse.json(
        {
          error: '決済作成エラー',
          details: createResult,
          status: createResponse.status
        },
        { status: 400 }
      );
    }

    // Step 2: トークンを使用して決済を実行
    const executePaymentData = {
      pay_type: 'Card',
      access_id: createResult.access_id,
      id: paymentId,
      token: token,  // トークンを使用
      method: '1',   // 1回払い
      tds_type: '2',
      tds2_type: '2',
      ret_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ace-oripa.com'}/payment/3ds-complete`
    };

    console.log('Executing payment with token');
    console.log('Access ID:', createResult.access_id);
    console.log('Payment ID:', paymentId);

    const executeResponse = await fetch(`${apiUrl}/v1/payments/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FINCODE_CONFIG.secretKey}`
      },
      body: JSON.stringify(executePaymentData)
    });

    const executeResult = await executeResponse.json();
    console.log('Execute payment response:', { status: executeResponse.status, result: executeResult });

    if (!executeResponse.ok) {
      // エラーの詳細を確認
      console.error('Payment execution failed:', executeResult);
      
      // トークンが無効な場合のエラーハンドリング
      if (executeResult.errors?.some((e: any) => e.error_code === 'E0190001001')) {
        return NextResponse.json(
          {
            error: 'トークンが無効です。新しいトークンを生成してください。',
            details: executeResult,
            status: executeResponse.status
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        {
          error: '決済実行エラー',
          details: executeResult,
          status: executeResponse.status
        },
        { status: 400 }
      );
    }

    // 3Dセキュア認証が必要な場合
    if (executeResult.acs_url || executeResult.tds2_return_url || executeResult.challenge_url) {
      console.log('3D Secure authentication required');
      return NextResponse.json({
        success: true,
        requires3DSecure: true,
        authUrl: executeResult.acs_url || executeResult.tds2_return_url || executeResult.challenge_url,
        paReq: executeResult.pa_req,
        termUrl: executeResult.ret_url,
        md: paymentId,
        paymentId: paymentId,
        message: '3Dセキュア認証が必要です'
      });
    }

    // 決済成功
    console.log('Payment successful');
    return NextResponse.json({
      success: true,
      paymentId: paymentId,
      status: executeResult.status,
      amount: executeResult.amount,
      orderId: orderId,
      message: '決済が正常に処理されました'
    });

  } catch (error: any) {
    console.error('Payment token error:', error);
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