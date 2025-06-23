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

    const { orderId, cardId, packageId, amount, points } = await request.json();

    // 保存されたカード情報を取得
    const { data: card, error: cardError } = await supabase
      .from('user_payment_methods')
      .select('*')
      .eq('id', cardId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (cardError || !card) {
      return NextResponse.json({ error: 'カード情報が見つかりません' }, { status: 404 });
    }

    // セッション情報を取得
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'セッション情報が見つかりません' }, { status: 404 });
    }

    // GMO FINCODE APIで決済実行
    const fincodeResponse = await fetch(
      `${FINCODE_CONFIG.environment === 'prod' ? 'https://api.fincode.jp' : 'https://api.test.fincode.jp'}/v1/payments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FINCODE_CONFIG.secretKey}`,
        },
        body: JSON.stringify({
          shop_id: FINCODE_CONFIG.shopId,
          pay_type: 'Card',
          job_code: 'CAPTURE',
          amount,
          customer_id: user.id,
          card_id: card.fincode_card_id,
          order_id: orderId,
          client_field_1: packageId,
          client_field_2: String(points),
        }),
      }
    );

    if (!fincodeResponse.ok) {
      const error = await fincodeResponse.json();
      console.error('Fincode payment error:', error);
      
      // 3Dセキュア認証が必要な場合
      if (error.error_code === '3DS_REQUIRED') {
        return NextResponse.json({
          requires3DSecure: true,
          authUrl: error.acs_url,
          paymentId: error.payment_id,
        });
      }
      
      return NextResponse.json({ 
        error: error.error_message || '決済に失敗しました',
        errorCode: error.error_code 
      }, { status: 400 });
    }

    const paymentData = await fincodeResponse.json();

    // 決済成功 - ポイント付与処理
    await processPaymentSuccess(supabase, user.id, orderId, points, amount, packageId);

    return NextResponse.json({
      success: true,
      paymentId: paymentData.id,
      orderId,
    });

  } catch (error) {
    console.error('Quick checkout error:', error);
    return NextResponse.json(
      { error: '決済処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 決済成功時の共通処理
async function processPaymentSuccess(
  supabase: any,
  userId: string,
  orderId: string,
  points: number,
  amount: number,
  packageId: string
) {
  // 1. 決済履歴を保存
  await supabase
    .from('payment_history')
    .insert({
      user_id: userId,
      order_id: orderId,
      amount,
      points,
      package_id: packageId,
      status: 'completed',
      payment_method: 'card',
      created_at: new Date().toISOString(),
    });

  // 2. ユーザーのポイントを更新
  const { data: currentUser } = await supabase
    .from('users')
    .select('paid_points')
    .eq('id', userId)
    .single();

  const newPaidPoints = (currentUser?.paid_points || 0) + points;

  await supabase
    .from('users')
    .update({ paid_points: newPaidPoints })
    .eq('id', userId);

  // 3. ポイント履歴を記録
  await supabase
    .from('point_history')
    .insert({
      user_id: userId,
      type: 'purchase',
      amount: points,
      description: `${points}ポイント購入`,
      balance_after: newPaidPoints,
      created_at: new Date().toISOString(),
    });

  // 4. セッションステータスを更新
  await supabase
    .from('payment_sessions')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('order_id', orderId);
}