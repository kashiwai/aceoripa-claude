import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = params;

    // 注文情報を取得
    const { data: session, error } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: '注文が見つかりません' }, { status: 404 });
    }

    return NextResponse.json({
      orderId: session.order_id,
      points: session.points,
      amount: session.amount,
      status: session.status,
      createdAt: session.created_at,
      completedAt: session.completed_at,
    });

  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: '注文情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}