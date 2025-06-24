import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FINCODE_CONFIG } from '@/lib/fincode/config';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, cardNumber, cardholderName, expiryMonth, expiryYear, cvv, saveCard } = body;

    // 注文情報を取得
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: '注文が見つかりません' }, { status: 404 });
    }

    // FINCODE APIで決済を実行
    const paymentUrl = FINCODE_CONFIG.environment === 'prod' 
      ? 'https://api.fincode.jp' 
      : 'https://api.test.fincode.jp';

    // 決済を作成
    const createPaymentResponse = await fetch(`${paymentUrl}/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FINCODE_CONFIG.secretKey}`,
      },
      body: JSON.stringify({
        pay_type: 'Card',
        job_code: 'CAPTURE',
        amount: session.amount.toString(),
        id: orderId,
      }),
    });

    if (!createPaymentResponse.ok) {
      const error = await createPaymentResponse.json();
      console.error('FINCODE payment creation error:', error);
      return NextResponse.json({ 
        error: error.errors?.[0]?.message || '決済作成に失敗しました',
        details: error 
      }, { status: 400 });
    }

    const paymentData = await createPaymentResponse.json();

    // カード情報を使用して決済を実行
    const paymentResponse = await fetch(`${paymentUrl}/v1/payments/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',  
        'Authorization': `Bearer ${FINCODE_CONFIG.secretKey}`,
      },
      body: JSON.stringify({
        pay_type: 'Card',
        access_id: paymentData.access_id,
        card_no: cardNumber,
        expire: `${expiryYear}${expiryMonth}`,
        security_code: cvv,
        holder_name: cardholderName,
        method: '1', // 1回払い
      }),
    });

    if (!paymentResponse.ok) {
      const error = await paymentResponse.json();
      console.error('FINCODE payment execution error:', error);
      
      // エラーを保存
      await supabase
        .from('payment_sessions')
        .update({
          status: 'failed',
          error_message: error.errors?.[0]?.message || 'Payment failed',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);
      
      return NextResponse.json({ 
        error: error.errors?.[0]?.message || '決済処理に失敗しました',
        details: error 
      }, { status: 400 });
    }

    const paymentResult = await paymentResponse.json();

    // 3Dセキュア認証が必要な場合
    if (paymentResult.tds_type === '2') {
      // セッション情報を更新
      await supabase
        .from('payment_sessions')
        .update({
          status: 'pending_3ds',
          payment_id: paymentResult.id,
          access_id: paymentResult.access_id,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      return NextResponse.json({
        requires3DSecure: true,
        authUrl: paymentResult.acs_url,
        paReq: paymentResult.pa_req,
        termUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ace-oripa.com'}/api/payment/3ds-callback`,
      });
    }

    // 決済成功
    await supabase
      .from('payment_sessions')
      .update({
        status: 'completed',
        payment_id: paymentResult.id,
        completed_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    // ユーザーにポイントを付与
    const { data: userData } = await supabase
      .from('users')
      .select('paid_points')
      .eq('id', user.id)
      .single();

    const newPoints = (userData?.paid_points || 0) + session.points;

    await supabase
      .from('users')
      .update({ paid_points: newPoints })
      .eq('id', user.id);

    // トランザクション履歴に記録
    await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'purchase',
        amount: session.points,
        description: `ポイント購入: ${session.points}ポイント`,
        order_id: orderId,
        payment_id: paymentResult.id,
      });

    return NextResponse.json({
      success: true,
      orderId,
      points: session.points,
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: '決済処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}