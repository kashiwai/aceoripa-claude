import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: 保存されたカード一覧を取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ユーザーの保存済みカード情報を取得
    const { data: cards, error } = await supabase
      .from('user_payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Cards fetch error:', error);
      return NextResponse.json({ error: 'カード情報の取得に失敗しました' }, { status: 500 });
    }

    // カード情報をマスキング
    const maskedCards = cards?.map(card => ({
      id: card.id,
      last4: card.last4,
      brand: card.brand,
      exp_month: card.exp_month,
      exp_year: card.exp_year,
      is_default: card.is_default,
      created_at: card.created_at,
    })) || [];

    return NextResponse.json({ 
      cards: maskedCards,
      count: maskedCards.length 
    });

  } catch (error) {
    console.error('Cards API error:', error);
    return NextResponse.json(
      { error: 'カード情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// POST: 新しいカードを保存
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      fincodeCardId, 
      last4, 
      brand, 
      expMonth, 
      expYear, 
      setAsDefault 
    } = await request.json();

    // デフォルトカードに設定する場合、既存のデフォルトを解除
    if (setAsDefault) {
      await supabase
        .from('user_payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true);
    }

    // 新しいカード情報を保存
    const { data: newCard, error } = await supabase
      .from('user_payment_methods')
      .insert({
        user_id: user.id,
        fincode_card_id: fincodeCardId,
        last4,
        brand,
        exp_month: expMonth,
        exp_year: expYear,
        is_default: setAsDefault || false,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Card save error:', error);
      return NextResponse.json({ error: 'カード情報の保存に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      card: {
        id: newCard.id,
        last4: newCard.last4,
        brand: newCard.brand,
        exp_month: newCard.exp_month,
        exp_year: newCard.exp_year,
        is_default: newCard.is_default,
      }
    });

  } catch (error) {
    console.error('Card save API error:', error);
    return NextResponse.json(
      { error: 'カード保存中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// DELETE: カードを削除
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('id');

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    // カードを論理削除（is_activeをfalseに）
    const { error } = await supabase
      .from('user_payment_methods')
      .update({ is_active: false })
      .eq('id', cardId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Card delete error:', error);
      return NextResponse.json({ error: 'カードの削除に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Card delete API error:', error);
    return NextResponse.json(
      { error: 'カード削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}