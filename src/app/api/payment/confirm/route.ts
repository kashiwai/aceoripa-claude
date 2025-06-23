import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await request.json();

    // 決済セッション情報を取得
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      console.error('Session fetch error:', sessionError);
      return NextResponse.json({ error: 'セッションが見つかりません' }, { status: 404 });
    }

    // 決済が既に処理済みかチェック
    if (session.status === 'completed') {
      return NextResponse.json({ error: '決済は既に処理されています' }, { status: 400 });
    }

    // トランザクション開始
    // 1. 決済履歴を保存
    const { error: historyError } = await supabase
      .from('payment_history')
      .insert({
        user_id: user.id,
        order_id: orderId,
        amount: session.amount,
        points: session.points,
        package_id: session.package_id,
        status: 'completed',
        payment_method: 'card',
        created_at: new Date().toISOString(),
      });

    if (historyError) {
      console.error('Payment history error:', historyError);
      return NextResponse.json({ error: '決済履歴の保存に失敗しました' }, { status: 500 });
    }

    // 2. ユーザーのポイントを更新
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('paid_points')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('User fetch error:', userError);
      return NextResponse.json({ error: 'ユーザー情報の取得に失敗しました' }, { status: 500 });
    }

    const newPaidPoints = (currentUser.paid_points || 0) + session.points;

    const { error: updateError } = await supabase
      .from('users')
      .update({ paid_points: newPaidPoints })
      .eq('id', user.id);

    if (updateError) {
      console.error('Point update error:', updateError);
      return NextResponse.json({ error: 'ポイント更新に失敗しました' }, { status: 500 });
    }

    // 3. ポイント履歴を記録
    const { error: pointHistoryError } = await supabase
      .from('point_history')
      .insert({
        user_id: user.id,
        type: 'purchase',
        amount: session.points,
        description: `${session.points}ポイント購入`,
        balance_after: newPaidPoints,
        created_at: new Date().toISOString(),
      });

    if (pointHistoryError) {
      console.error('Point history error:', pointHistoryError);
    }

    // 4. セッションステータスを更新
    const { error: sessionUpdateError } = await supabase
      .from('payment_sessions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('order_id', orderId);

    if (sessionUpdateError) {
      console.error('Session update error:', sessionUpdateError);
    }

    // 5. 通知を送信（オプション）
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'payment_complete',
          title: 'ポイント購入完了',
          message: `${session.points}ポイントの購入が完了しました`,
          created_at: new Date().toISOString(),
        });
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
    }

    return NextResponse.json({
      success: true,
      orderId,
      points: session.points,
      newTotalPoints: newPaidPoints,
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: '決済確認中にエラーが発生しました' },
      { status: 500 }
    );
  }
}