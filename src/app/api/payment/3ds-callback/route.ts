import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FINCODE_CONFIG } from '@/lib/fincode/config';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const paRes = formData.get('PaRes') as string;
    const md = formData.get('MD') as string; // order_id

    if (!paRes || !md) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://ace-oripa.com'}/payment/error?message=3DS認証に失敗しました`
      );
    }

    const supabase = await createClient();

    // セッション情報を取得
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('order_id', md)
      .single();

    if (sessionError || !session) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://ace-oripa.com'}/payment/error?message=注文が見つかりません`
      );
    }

    // FINCODE APIで3DS認証結果を送信
    const paymentUrl = FINCODE_CONFIG.environment === 'prod' 
      ? 'https://api.fincode.jp' 
      : 'https://api.test.fincode.jp';

    const authResponse = await fetch(`${paymentUrl}/v1/payments/${md}/auth`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FINCODE_CONFIG.secretKey}`,
      },
      body: JSON.stringify({
        pay_type: 'Card',
        access_id: session.access_id,
        pa_res: paRes,
      }),
    });

    if (!authResponse.ok) {
      const error = await authResponse.json();
      console.error('3DS authentication error:', error);
      
      await supabase
        .from('payment_sessions')
        .update({
          status: 'failed',
          error_message: '3DS認証に失敗しました',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', md);
      
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://ace-oripa.com'}/payment/error?message=3DS認証に失敗しました`
      );
    }

    // 決済成功
    await supabase
      .from('payment_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('order_id', md);

    // ユーザーにポイントを付与
    const { data: userData } = await supabase
      .from('users')
      .select('paid_points')
      .eq('id', session.user_id)
      .single();

    const newPoints = (userData?.paid_points || 0) + session.points;

    await supabase
      .from('users')
      .update({ paid_points: newPoints })
      .eq('id', session.user_id);

    // トランザクション履歴に記録
    await supabase
      .from('transactions')
      .insert({
        user_id: session.user_id,
        type: 'purchase',
        amount: session.points,
        description: `ポイント購入: ${session.points}ポイント`,
        order_id: md,
        payment_id: session.payment_id,
      });

    // 成功ページへリダイレクト
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://ace-oripa.com'}/payment/success?order=${md}`
    );

  } catch (error) {
    console.error('3DS callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://ace-oripa.com'}/payment/error?message=決済処理中にエラーが発生しました`
    );
  }
}