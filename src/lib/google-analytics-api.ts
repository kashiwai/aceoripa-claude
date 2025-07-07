import { BetaAnalyticsDataClient } from '@google-analytics/data';

// GA4 プロパティID
const propertyId = process.env.GA_PROPERTY_ID;

// サービスアカウント認証情報
const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS 
  ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : null;

// Google Analytics Data API クライアントの初期化
const analyticsDataClient = credentials 
  ? new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
      projectId: credentials.project_id,
    })
  : null;

export interface AnalyticsData {
  pageViews: number;
  uniqueUsers: number;
  sessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number }>;
  trafficSources: {
    organic: number;
    direct: number;
    social: number;
    referral: number;
    paid: number;
  };
}

export async function getAnalyticsData(startDate: string, endDate: string): Promise<AnalyticsData | null> {
  if (!analyticsDataClient || !propertyId) {
    console.warn('Google Analytics Data API is not configured');
    return null;
  }

  try {
    // 基本的なメトリクスを取得
    const [metricsResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' }
      ],
    });

    // トップページを取得
    const [pagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 5,
    });

    // トラフィックソースを取得
    const [trafficResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
    });

    // データを整形
    const metrics = metricsResponse.rows?.[0]?.metricValues || [];
    
    const topPages = pagesResponse.rows?.map(row => ({
      page: row.dimensionValues?.[0]?.value || '',
      views: parseInt(row.metricValues?.[0]?.value || '0'),
    })) || [];

    const trafficData: AnalyticsData['trafficSources'] = {
      organic: 0,
      direct: 0,
      social: 0,
      referral: 0,
      paid: 0,
    };

    trafficResponse.rows?.forEach(row => {
      const channel = row.dimensionValues?.[0]?.value?.toLowerCase() || '';
      const sessions = parseInt(row.metricValues?.[0]?.value || '0');

      if (channel.includes('organic')) trafficData.organic += sessions;
      else if (channel.includes('direct')) trafficData.direct += sessions;
      else if (channel.includes('social')) trafficData.social += sessions;
      else if (channel.includes('referral')) trafficData.referral += sessions;
      else if (channel.includes('paid') || channel.includes('cpc') || channel.includes('ppc')) trafficData.paid += sessions;
    });

    return {
      pageViews: parseInt(metrics[0]?.value || '0'),
      uniqueUsers: parseInt(metrics[1]?.value || '0'),
      sessions: parseInt(metrics[2]?.value || '0'),
      avgSessionDuration: parseFloat(metrics[3]?.value || '0'),
      bounceRate: parseFloat(metrics[4]?.value || '0'),
      topPages,
      trafficSources: trafficData,
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return null;
  }
}

export async function getTodayAnalytics(): Promise<AnalyticsData | null> {
  return getAnalyticsData('today', 'today');
}

export async function getYesterdayAnalytics(): Promise<AnalyticsData | null> {
  return getAnalyticsData('yesterday', 'yesterday');
}

export async function getWeekAnalytics(): Promise<AnalyticsData | null> {
  return getAnalyticsData('7daysAgo', 'today');
}

export async function getMonthAnalytics(): Promise<AnalyticsData | null> {
  return getAnalyticsData('30daysAgo', 'today');
}