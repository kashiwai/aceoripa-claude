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
    const { packageId, amount, points } = body;

    // 注文ID生成
    const orderId = `ORD-${user.id}-${Date.now()}`;
    
    // 決済セッション情報を保存
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .insert({
        order_id: orderId,
        user_id: user.id,
        package_id: packageId,
        amount,
        points,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30分後
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json({ error: 'セッション作成に失敗しました' }, { status: 500 });
    }

    // GMO FINCODE APIで決済セッションを作成
    const fincodeResponse = await fetch(`${FINCODE_CONFIG.environment === 'prod' ? 'https://api.fincode.jp' : 'https://api.test.fincode.jp'}/v1/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FINCODE_CONFIG.secretKey}`,
      },
      body: JSON.stringify({
        shop_id: FINCODE_CONFIG.shopId,
        amount,
        currency: 'JPY',
        order_id: orderId,
        client_field_1: user.id,
        client_field_2: packageId,
        client_field_3: String(points),
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?order_id=${orderId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
        auth_method: '3DS2',
      }),
    });

    if (!fincodeResponse.ok) {
      const error = await fincodeResponse.json();
      console.error('Fincode API error:', error);
      return NextResponse.json({ error: 'Fincode API エラー' }, { status: 500 });
    }

    const fincodeData = await fincodeResponse.json();

    return NextResponse.json({
      sessionId: fincodeData.id,
      orderId,
      publicKey: FINCODE_CONFIG.publicKey,
    });

  } catch (error) {
    console.error('Payment session creation error:', error);
    return NextResponse.json(
      { error: '決済セッション作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}