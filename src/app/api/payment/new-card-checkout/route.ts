import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FINCODE_CONFIG } from '@/lib/fincode/config';
import { initializeFincode } from '@/lib/gmo-fincode';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, packageId, amount, points, cardData, saveCard } = await request.json();

    // Fincodeクライアント初期化
    const fincode = initializeFincode({
      publicKey: FINCODE_CONFIG.secretKey,
      environment: FINCODE_CONFIG.environment as 'production' | 'test',
    });

    // カードトークン生成
    const tokenResult = await fincode.createCardToken(cardData);

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
          token: tokenResult.tokenId,
          order_id: orderId,
          customer_id: user.id,
          client_field_1: packageId,
          client_field_2: String(points),
          // カード保存オプション
          save_card: saveCard ? '1' : '0',
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

    // カード保存処理
    if (saveCard && paymentData.card_id) {
      const cardInfo = {
        last4: cardData.cardNumber.slice(-4),
        brand: detectCardBrand(cardData.cardNumber),
        expMonth: cardData.expiryMonth,
        expYear: cardData.expiryYear,
      };

      await saveCardInfo(
        supabase,
        user.id,
        paymentData.card_id,
        cardInfo
      );
    }

    // 決済成功 - ポイント付与処理
    await processPaymentSuccess(supabase, user.id, orderId, points, amount, packageId);

    return NextResponse.json({
      success: true,
      paymentId: paymentData.id,
      orderId,
    });

  } catch (error) {
    console.error('New card checkout error:', error);
    return NextResponse.json(
      { error: '決済処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// カード情報を保存
async function saveCardInfo(
  supabase: any,
  userId: string,
  fincodeCardId: string,
  cardInfo: {
    last4: string;
    brand: string;
    expMonth: string;
    expYear: string;
  }
) {
  try {
    // 最初のカードの場合はデフォルトに設定
    const { count } = await supabase
      .from('user_payment_methods')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_active', true);

    const isFirstCard = count === 0;

    await supabase
      .from('user_payment_methods')
      .insert({
        user_id: userId,
        fincode_card_id: fincodeCardId,
        last4: cardInfo.last4,
        brand: cardInfo.brand,
        exp_month: cardInfo.expMonth,
        exp_year: cardInfo.expYear,
        is_default: isFirstCard,
        is_active: true,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Card save error:', error);
    // カード保存エラーは決済自体には影響させない
  }
}

// カードブランド検出
function detectCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'Amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
  if (/^35/.test(cleaned)) return 'JCB';
  if (/^3(?:0[0-5]|[68])/.test(cleaned)) return 'Diners';
  
  return 'Unknown';
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