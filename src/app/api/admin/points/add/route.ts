import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const adminToken = cookieStore.get('admin_token');

    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, amount, type, description } = body;

    if (!userId || !amount || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ポイント履歴に追加
    const { error: historyError } = await supabase
      .from('point_history')
      .insert({
        user_id: userId,
        amount: amount,
        type: type === 'paid' ? 'purchase' : 'bonus',
        description: description || `管理者による${type === 'paid' ? '有料' : '無料'}ポイント追加`,
      });

    if (historyError) {
      throw historyError;
    }

    // ユーザーの現在のポイントを取得
    const { data: currentUser, error: getUserError } = await supabase
      .from('users')
      .select(type === 'paid' ? 'points' : 'free_points')
      .eq('id', userId)
      .single();

    if (getUserError) {
      throw getUserError;
    }

    const currentPoints = type === 'paid' 
      ? (currentUser.points || 0)
      : (currentUser.free_points || 0);

    // ユーザーのポイントを更新
    const { error: updateError } = await supabase
      .from('users')
      .update({
        [type === 'paid' ? 'points' : 'free_points']: currentPoints + amount
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ 
      success: true,
      message: `${type === 'paid' ? '有料' : '無料'}ポイントを追加しました`
    });

  } catch (error) {
    console.error('Error adding points:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}