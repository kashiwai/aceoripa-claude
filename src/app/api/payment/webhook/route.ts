import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// FINCODEからのWebhookを処理
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.text();
    const signature = request.headers.get('x-fincode-signature');
    
    // 署名検証（本番環境では必須）
    // TODO: FINCODE_WEBHOOK_SECRETを環境変数に追加
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.FINCODE_WEBHOOK_SECRET!)
    //   .update(body)
    //   .digest('hex');
    
    // if (signature !== expectedSignature) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    // }
    
    const data = JSON.parse(body);
    // console.log('FINCODE Webhook received:', data);
    
    // イベントタイプに応じた処理
    switch (data.event) {
      case 'payment.captured':
        // 決済完了時の処理
        await handlePaymentCaptured(data, supabase);
        break;
        
      case 'payment.failed':
        // 決済失敗時の処理
        await handlePaymentFailed(data, supabase);
        break;
        
      case 'payment.refunded':
        // 返金時の処理
        await handlePaymentRefunded(data, supabase);
        break;
        
      default:
        // console.log('Unhandled webhook event:', data.event);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// 決済完了時の処理
async function handlePaymentCaptured(data: any, supabase: any) {
  const { order_id, amount, id: payment_id } = data.data;
  
  // payment_sessionsを更新
  const { data: session, error: sessionError } = await supabase
    .from('payment_sessions')
    .update({
      status: 'completed',
      payment_id,
      completed_at: new Date().toISOString()
    })
    .eq('order_id', order_id)
    .select()
    .single();
    
  if (sessionError) {
    console.error('Session update error:', sessionError);
    return;
  }
  
  // ユーザーにポイントを付与
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('paid_points')
    .eq('id', session.user_id)
    .single();
    
  if (userError) {
    console.error('User fetch error:', userError);
    return;
  }
  
  const newPoints = (user.paid_points || 0) + session.points;
  
  const { error: updateError } = await supabase
    .from('users')
    .update({ paid_points: newPoints })
    .eq('id', session.user_id);
    
  if (updateError) {
    console.error('Points update error:', updateError);
    return;
  }
  
  // トランザクション履歴に記録
  await supabase
    .from('transactions')
    .insert({
      user_id: session.user_id,
      type: 'purchase',
      amount: session.points,
      description: `ポイント購入: ${session.points}ポイント`,
      order_id,
      payment_id
    });
}

// 決済失敗時の処理
async function handlePaymentFailed(data: any, supabase: any) {
  const { order_id, error_code, error_message } = data.data;
  
  await supabase
    .from('payment_sessions')
    .update({
      status: 'failed',
      error_code,
      error_message,
      failed_at: new Date().toISOString()
    })
    .eq('order_id', order_id);
}

// 返金時の処理
async function handlePaymentRefunded(data: any, supabase: any) {
  const { order_id, refund_amount, id: refund_id } = data.data;
  
  const { data: session } = await supabase
    .from('payment_sessions')
    .select('user_id, points')
    .eq('order_id', order_id)
    .single();
    
  if (session) {
    // ポイントを減算
    const { data: user } = await supabase
      .from('users')
      .select('paid_points')
      .eq('id', session.user_id)
      .single();
      
    if (user) {
      const newPoints = Math.max(0, (user.paid_points || 0) - session.points);
      
      await supabase
        .from('users')
        .update({ paid_points: newPoints })
        .eq('id', session.user_id);
        
      // トランザクション履歴に記録
      await supabase
        .from('transactions')
        .insert({
          user_id: session.user_id,
          type: 'refund',
          amount: -session.points,
          description: `返金処理: ${session.points}ポイント`,
          order_id,
          payment_id: refund_id
        });
    }
  }
}