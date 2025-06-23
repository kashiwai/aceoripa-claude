import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // アクティブなキャンペーンを取得
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${new Date().toISOString()}`)
      .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
      .order('sort_order', { ascending: true });

    if (campaignsError) {
      console.error('Campaigns fetch error:', campaignsError);
      return NextResponse.json({ error: 'キャンペーンの取得に失敗しました' }, { status: 500 });
    }

    // ユーザーの受け取り状況を確認
    const { data: claimedCampaigns } = await supabase
      .from('campaign_claims')
      .select('campaign_id, claimed_at')
      .eq('user_id', user.id);

    const claimedMap = new Map(
      claimedCampaigns?.map(c => [c.campaign_id, c.claimed_at]) || []
    );

    // デイリーボーナスの確認
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyBonus } = await supabase
      .from('daily_bonus_claims')
      .select('*')
      .eq('user_id', user.id)
      .eq('claim_date', today)
      .single();

    // 無料ポイント設定から取得
    const { data: freePointSettings } = await supabase
      .from('free_point_settings')
      .select('*')
      .eq('is_active', true);

    // キャンペーンデータを整形
    const formattedCampaigns = campaigns?.map(campaign => ({
      id: campaign.id,
      type: campaign.type,
      title: campaign.title,
      description: campaign.description,
      points: campaign.points,
      imageUrl: campaign.image_url,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      isActive: true,
      claimed: claimedMap.has(campaign.id),
      progress: campaign.progress_required ? {
        current: 0, // ここは実際の進捗を取得する必要があります
        total: campaign.progress_required
      } : null
    })) || [];

    // デイリーボーナスを追加
    const dailyBonusConfig = freePointSettings?.find(s => s.type === 'daily');
    if (dailyBonusConfig) {
      formattedCampaigns.unshift({
        id: 'daily-bonus',
        type: 'daily',
        title: 'デイリーボーナス',
        description: dailyBonusConfig.description || '毎日ログインで無料ポイントGET！',
        points: dailyBonusConfig.points,
        imageUrl: null,
        startDate: today,
        endDate: today,
        isActive: true,
        claimed: !!dailyBonus,
        progress: null
      });
    }

    return NextResponse.json({ 
      campaigns: formattedCampaigns,
      totalActive: formattedCampaigns.filter(c => !c.claimed).length
    });

  } catch (error) {
    console.error('Campaigns API error:', error);
    return NextResponse.json(
      { error: 'キャンペーン情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}