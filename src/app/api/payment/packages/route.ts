import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // アクティブなパッケージのみ取得
    const { data: packages, error } = await supabase
      .from('point_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Packages fetch error:', error);
      return NextResponse.json({ error: 'パッケージの取得に失敗しました' }, { status: 500 });
    }

    // フロントエンド用にフォーマット
    const formattedPackages = packages?.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      points: pkg.points,
      bonus: pkg.bonus,
      price: pkg.price,
      displayPrice: `¥${pkg.price.toLocaleString()}`,
      popular: pkg.is_popular,
      totalPoints: pkg.points + pkg.bonus,
      pricePerPoint: pkg.price / (pkg.points + pkg.bonus),
    })) || [];

    return NextResponse.json({ 
      packages: formattedPackages,
      count: formattedPackages.length 
    });

  } catch (error) {
    console.error('Packages API error:', error);
    return NextResponse.json(
      { error: 'パッケージ情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}