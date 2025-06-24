import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FINCODE_CONFIG } from '@/lib/fincode/config';

// FINCODE顧客を作成または取得
async function getOrCreateFincodeCustomer(userId: string, email?: string): Promise<string> {
  const supabase = await createClient();
  
  // 既存の顧客IDを確認
  const { data: existingCustomer } = await supabase
    .from('users')
    .select('fincode_customer_id')
    .eq('id', userId)
    .single();
  
  if (existingCustomer?.fincode_customer_id) {
    return existingCustomer.fincode_customer_id;
  }
  
  // 新規顧客を作成
  const paymentUrl = FINCODE_CONFIG.environment === 'prod' 
    ? 'https://api.fincode.jp' 
    : 'https://api.test.fincode.jp';
  
  const response = await fetch(`${paymentUrl}/v1/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FINCODE_CONFIG.secretKey}`,
    },
    body: JSON.stringify({
      id: `CUST_${userId}`,
      email: email || `${userId}@ace-oripa.com`,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('FINCODE customer creation error:', error);
    // 既に存在する場合はそのIDを使用
    if (error.errors && error.errors[0]?.error_code === 'E0001003014') {
      console.log('Customer already exists, using existing ID');
      // 既存顧客IDをDBに保存
      const customerId = `CUST_${userId}`;
      await supabase
        .from('users')
        .update({ fincode_customer_id: customerId })
        .eq('id', userId);
      return customerId;
    }
    if (error.error_code === '1001001') {
      return `CUST_${userId}`;
    }
    throw new Error('顧客作成に失敗しました');
  }
  
  const customerData = await response.json();
  
  // 顧客IDを保存
  await supabase
    .from('users')
    .update({ fincode_customer_id: customerData.id })
    .eq('id', userId);
  
  return customerData.id;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // セッション情報をデバッグ
    const { data: { session: authSession }, error: authSessionError } = await supabase.auth.getSession();
    console.log('Session check:', { hasSession: !!authSession, authSessionError });
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not authenticated in create-session');
      
      // クッキーをチェック
      const cookies = request.headers.get('cookie');
      console.log('Request cookies:', cookies?.substring(0, 100));
      
      return NextResponse.json({ error: 'Unauthorized - Please login first' }, { status: 401 });
    }

    const body = await request.json();
    const { packageId, amount, points } = body;

    // 注文ID生成（FINCODEの制限に対応：英数字のみ、最大200文字）
    const timestamp = Date.now().toString();
    const userIdShort = user.id.replace(/-/g, '').substring(0, 8);
    const orderId = `ORD${userIdShort}${timestamp}`;
    
    // 決済セッション情報を保存
    const { data: paymentSession, error: paymentSessionError } = await supabase
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

    if (paymentSessionError) {
      console.error('Session creation error:', paymentSessionError);
      return NextResponse.json({ error: 'セッション作成に失敗しました' }, { status: 500 });
    }

    // FINCODE APIで決済用の顧客を作成または取得
    try {
      const customerId = await getOrCreateFincodeCustomer(user.id, user.email);
      
      // セッションIDとアクセスIDを生成（決済はフロントエンドで処理）
      const sessionId = `SESSION-${Date.now()}`;
      const accessId = `ACCESS-${Date.now()}`;
      
      // セッション情報を更新
      await supabase
        .from('payment_sessions')
        .update({
          session_id: sessionId,
          access_id: accessId,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);
      
      return NextResponse.json({
        sessionId,
        accessId,
        orderId,
        publicKey: FINCODE_CONFIG.publicKey,
        customerId,
      });
    } catch (customerError: any) {
      console.error('Customer creation error:', customerError);
      console.error('Error details:', customerError.message);
      
      // FINCODEのAPIキーが無効な場合のエラーメッセージを確認
      if (customerError.message?.includes('認証') || customerError.message?.includes('権限')) {
        return NextResponse.json({ 
          error: 'FINCODE API認証エラー - APIキーを確認してください',
          details: customerError.message
        }, { status: 401 });
      }
      
      // エラーでも決済フローを続行（フロントエンドで新規カード登録）
      return NextResponse.json({
        sessionId: `SESSION-${Date.now()}`,
        accessId: `ACCESS-${Date.now()}`,
        orderId,
        publicKey: FINCODE_CONFIG.publicKey,
        customerId: null,
      });
    }

  } catch (error) {
    console.error('Payment session creation error:', error);
    return NextResponse.json(
      { error: '決済セッション作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}