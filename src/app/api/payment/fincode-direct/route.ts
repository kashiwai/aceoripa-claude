import { NextRequest, NextResponse } from 'next/server';
import { FINCODE_CONFIG } from '@/lib/fincode/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, amount, orderId } = body;

    console.log('====== Fincode Direct Payment ======');
    console.log('Token:', token);
    console.log('Amount:', amount);
    console.log('Order ID:', orderId);
    console.log('Environment:', FINCODE_CONFIG.environment);
    console.log('Shop ID:', FINCODE_CONFIG.shopId);
    console.log('===================================');

    // APIエンドポイント
    const apiUrl = FINCODE_CONFIG.apiUrl;

    // Step 1: 決済を作成（カード決済の登録）
    const paymentId = `pay_${Date.now()}`;
    const createPaymentData = {
      id: paymentId,
      pay_type: 'Card',
      job_code: 'CAPTURE',
      amount: amount.toString(),
      tds_type: '2',  // 3Dセキュア1.0: 2=利用する
      tds2_type: '2'  // 3Dセキュア2.0: 2=利用する
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
    console.log('Create payment response:', createResult);

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
    // Fincodeではトークンを使う場合、tokenフィールドを使用
    const executePaymentData = {
      pay_type: 'Card',
      access_id: createResult.access_id,
      method: '1', // 1回払い
      token: token,  // card_tokenではなくtoken
      tds_type: '2', // 3Dセキュア1.0: 2=利用する
      tds2_type: '2', // 3Dセキュア2.0: 2=利用する
      ret_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ace-oripa.com'}/api/payment/3ds-callback` // 3Dセキュア認証後の戻りURL
    };

    console.log('Executing payment:', executePaymentData);

    const executeResponse = await fetch(`${apiUrl}/v1/payments/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FINCODE_CONFIG.secretKey}`
      },
      body: JSON.stringify(executePaymentData)
    });

    const executeResult = await executeResponse.json();
    console.log('Execute payment response:', executeResult);

    if (!executeResponse.ok) {
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
      return NextResponse.json({
        success: true,
        requires3DSecure: true,
        authUrl: executeResult.acs_url || executeResult.tds2_return_url || executeResult.challenge_url,
        paReq: executeResult.pa_req,
        termUrl: executeResult.ret_url,
        md: paymentId,
        paymentId: paymentId,
        message: '3Dセキュア認証が必要です。リダイレクトしてください。'
      });
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentId,
      status: executeResult.status,
      amount: executeResult.amount,
      orderId: orderId,
      message: '決済が正常に処理されました'
    });

  } catch (error: any) {
    console.error('Payment direct error:', error);
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