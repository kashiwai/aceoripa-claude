import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initializeFincode, FincodePaymentRequest } from '@/lib/gmo-fincode';

// GMO FINCODE設定
const FINCODE_PUBLIC_KEY = process.env.FINCODE_PUBLIC_KEY || '';
const FINCODE_SECRET_KEY = process.env.FINCODE_SECRET_KEY || '';
const FINCODE_ENVIRONMENT = (process.env.FINCODE_ENVIRONMENT || 'test') as 'production' | 'test';

// Fincodeクライアント初期化
const fincode = initializeFincode({
  publicKey: FINCODE_PUBLIC_KEY,
  environment: FINCODE_ENVIRONMENT,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, points, amount, cardToken, cardData } = body;

    // 注文ID生成（ユーザーID + タイムスタンプ）
    const orderId = `${user.id}-${Date.now()}`;

    // 決済リクエスト作成
    const paymentRequest: FincodePaymentRequest = {
      orderId,
      amount,
      customerId: user.id,
      tokenId: cardToken,
    };

    // カードデータが直接送信された場合（トークン化されていない場合）
    if (!cardToken && cardData) {
      const tokenResult = await fincode.createCardToken(cardData);
      paymentRequest.tokenId = tokenResult.tokenId;
    }

    // 決済実行
    const paymentResult = await fincode.processPayment(paymentRequest);

    if (!paymentResult.success) {
      return NextResponse.json({
        error: paymentResult.error?.message || '決済に失敗しました',
        errorCode: paymentResult.error?.code,
      }, { status: 400 });
    }

    // 3Dセキュア確認
    const threeDSecure = await fincode.verify3DSecure(paymentResult.paymentId!);
    
    if (threeDSecure.required) {
      // 3Dセキュア認証が必要な場合
      return NextResponse.json({
        requires3DSecure: true,
        authUrl: threeDSecure.authUrl,
        paymentId: paymentResult.paymentId,
        orderId,
      });
    }

    // 決済成功時の処理
    // 1. 決済履歴を保存
    const { error: paymentError } = await supabase
      .from('payment_history')
      .insert({
        user_id: user.id,
        order_id: orderId,
        payment_id: paymentResult.paymentId,
        amount,
        points,
        status: 'completed',
        payment_method: 'card',
        created_at: new Date().toISOString(),
      });

    if (paymentError) {
      console.error('Payment history save error:', paymentError);
    }

    // 2. ユーザーのポイントを更新
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('paid_points')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('User fetch error:', userError);
      return NextResponse.json({ error: 'ポイント更新に失敗しました' }, { status: 500 });
    }

    const newPaidPoints = (currentUser.paid_points || 0) + points;

    const { error: updateError } = await supabase
      .from('users')
      .update({ paid_points: newPaidPoints })
      .eq('id', user.id);

    if (updateError) {
      console.error('Point update error:', updateError);
      return NextResponse.json({ error: 'ポイント更新に失敗しました' }, { status: 500 });
    }

    // 3. ポイント履歴を記録
    const { error: historyError } = await supabase
      .from('point_history')
      .insert({
        user_id: user.id,
        type: 'purchase',
        amount: points,
        description: `${points}ポイント購入`,
        created_at: new Date().toISOString(),
      });

    if (historyError) {
      console.error('Point history save error:', historyError);
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentResult.paymentId,
      orderId,
      points,
      newTotalPoints: newPaidPoints + (currentUser.free_points || 0),
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: '決済処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 3Dセキュア認証後のコールバック処理
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId, orderId } = await request.json();

    // 決済状態を確認
    const paymentStatus = await fincode.getPaymentStatus(paymentId);

    if (!paymentStatus.success) {
      return NextResponse.json({
        error: '決済の確認に失敗しました',
      }, { status: 400 });
    }

    // 決済履歴を更新
    const { error: updateError } = await supabase
      .from('payment_history')
      .update({ status: 'completed' })
      .eq('order_id', orderId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Payment history update error:', updateError);
    }

    return NextResponse.json({
      success: true,
      status: paymentStatus.status,
    });

  } catch (error) {
    console.error('3D Secure callback error:', error);
    return NextResponse.json(
      { error: '認証処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}