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
    const { orderId, token, cardholderName, saveCard, last4, expiryMonth, expiryYear } = body;

    // トークンの検証
    if (!token) {
      return NextResponse.json({ error: 'カードトークンが必要です' }, { status: 400 });
    }

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
    // 本番環境の判定を改善
    const isProduction = process.env.NODE_ENV === 'production' || FINCODE_CONFIG.environment === 'prod';
    const paymentUrl = isProduction
      ? 'https://api.fincode.jp' 
      : 'https://api.test.fincode.jp';
    
    console.log('====== Fincode Configuration ======');
    console.log('Environment:', FINCODE_CONFIG.environment);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Is Production:', isProduction);
    console.log('API URL:', paymentUrl);
    console.log('Shop ID:', FINCODE_CONFIG.shopId);
    console.log('Order ID:', orderId);
    console.log('Amount:', session.amount);
    console.log('===================================');

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
      const errorText = await createPaymentResponse.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText };
      }
      console.error('FINCODE payment creation error:', error);
      console.error('Response status:', createPaymentResponse.status);
      console.error('Request body:', {
        pay_type: 'Card',
        job_code: 'CAPTURE',
        amount: session.amount.toString(),
        id: orderId,
      });
      return NextResponse.json({ 
        error: error.errors?.[0]?.message || error.message || '決済作成に失敗しました',
        details: error,
        status: createPaymentResponse.status
      }, { status: 400 });
    }

    const paymentData = await createPaymentResponse.json();

    // トークンを使用して決済を実行（PCI DSS準拠）
    // カード情報はサーバーを経由せず、トークンのみ使用
    const paymentResponse = await fetch(`${paymentUrl}/v1/payments/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FINCODE_CONFIG.secretKey}`,
      },
      body: JSON.stringify({
        pay_type: 'Card',
        access_id: paymentData.access_id,
        token: token, // トークンを使用（生のカード情報は不要）
        method: '1', // 1回払い
      }),
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText };
      }
      console.error('FINCODE payment execution error:', error);
      console.error('Response status:', paymentResponse.status);
      console.error('Payment request data (token-based):', {
        token: token.substring(0, 10) + '...',
        last4: last4,
        holder_name: cardholderName
      });
      
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

    // ユーザーにポイントを原子的に付与（競合状態を回避）
    const { data: pointsResult, error: pointsError } = await supabase
      .rpc('increment_paid_points', {
        p_user_id: user.id,
        p_points_to_add: session.points
      });

    if (pointsError || !pointsResult || pointsResult.length === 0) {
      console.error('Points allocation error:', pointsError);

      // 決済は成功したがポイント付与に失敗 - セッションを更新してエラー記録
      await supabase
        .from('payment_sessions')
        .update({
          status: 'points_failed',
          error_message: 'ポイント付与に失敗しました。サポートにお問い合わせください。',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      return NextResponse.json(
        {
          error: 'ポイント付与に失敗しました。決済は完了していますが、ポイントが反映されていない可能性があります。サポートにお問い合わせください。',
          orderId,
          requiresSupport: true
        },
        { status: 500 }
      );
    }

    const newPoints = pointsResult[0].new_points;

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