import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic'

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
      // テーブルが存在しない場合はデフォルトのパッケージを返す
      if (error.code === '42P01') {
        const defaultPackages = [
          {
            id: 'pack_150',
            name: '150ポイント',
            points: 150,
            bonus: 0,
            price: 120,
            displayPrice: '¥120',
            popular: false,
            totalPoints: 150,
            pricePerPoint: 0.8,
          },
          {
            id: 'pack_500',
            name: '500ポイント+50ボーナス',
            points: 500,
            bonus: 50,
            price: 400,
            displayPrice: '¥400',
            popular: false,
            totalPoints: 550,
            pricePerPoint: 0.73,
          },
          {
            id: 'pack_1000',
            name: '1000ポイント+150ボーナス',
            points: 1000,
            bonus: 150,
            price: 800,
            displayPrice: '¥800',
            popular: true,
            totalPoints: 1150,
            pricePerPoint: 0.70,
          },
          {
            id: 'pack_3000',
            name: '3000ポイント+600ボーナス',
            points: 3000,
            bonus: 600,
            price: 2400,
            displayPrice: '¥2,400',
            popular: false,
            totalPoints: 3600,
            pricePerPoint: 0.67,
          },
          {
            id: 'pack_5000',
            name: '5000ポイント+1200ボーナス',
            points: 5000,
            bonus: 1200,
            price: 4000,
            displayPrice: '¥4,000',
            popular: false,
            totalPoints: 6200,
            pricePerPoint: 0.65,
          },
          {
            id: 'pack_10000',
            name: '10000ポイント+3000ボーナス',
            points: 10000,
            bonus: 3000,
            price: 8000,
            displayPrice: '¥8,000',
            popular: false,
            totalPoints: 13000,
            pricePerPoint: 0.62,
          },
        ];
        return NextResponse.json({ 
          packages: defaultPackages,
          count: defaultPackages.length 
        });
      }
      return NextResponse.json({ error: 'パッケージの取得に失敗しました' }, { status: 500 });
    }

    // データベースからデータがない場合もデフォルトを返す
    if (!packages || packages.length === 0) {
      const defaultPackages = [
        {
          id: 'pack_150',
          name: '150ポイント',
          points: 150,
          bonus: 0,
          price: 120,
          displayPrice: '¥120',
          popular: false,
          totalPoints: 150,
          pricePerPoint: 0.8,
        },
        {
          id: 'pack_500',
          name: '500ポイント+50ボーナス',
          points: 500,
          bonus: 50,
          price: 400,
          displayPrice: '¥400',
          popular: false,
          totalPoints: 550,
          pricePerPoint: 0.73,
        },
        {
          id: 'pack_1000',
          name: '1000ポイント+150ボーナス',
          points: 1000,
          bonus: 150,
          price: 800,
          displayPrice: '¥800',
          popular: true,
          totalPoints: 1150,
          pricePerPoint: 0.70,
        },
        {
          id: 'pack_3000',
          name: '3000ポイント+600ボーナス',
          points: 3000,
          bonus: 600,
          price: 2400,
          displayPrice: '¥2,400',
          popular: false,
          totalPoints: 3600,
          pricePerPoint: 0.67,
        },
        {
          id: 'pack_5000',
          name: '5000ポイント+1200ボーナス',
          points: 5000,
          bonus: 1200,
          price: 4000,
          displayPrice: '¥4,000',
          popular: false,
          totalPoints: 6200,
          pricePerPoint: 0.65,
        },
        {
          id: 'pack_10000',
          name: '10000ポイント+3000ボーナス',
          points: 10000,
          bonus: 3000,
          price: 8000,
          displayPrice: '¥8,000',
          popular: false,
          totalPoints: 13000,
          pricePerPoint: 0.62,
        },
      ];
      return NextResponse.json({ 
        packages: defaultPackages,
        count: defaultPackages.length 
      });
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