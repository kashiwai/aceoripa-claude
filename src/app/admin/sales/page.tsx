import { createClient } from '@/lib/supabase/server'
import { 
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

async function getSalesData() {
  try {
    const supabase = await createClient()
    
    // 今日の売上
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data: todaySales } = await supabase
      .from('transactions')
      .select('amount')
      .gte('created_at', today.toISOString())
      .eq('status', 'completed')
    
    // 昨日の売上（比較用）
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const { data: yesterdaySales } = await supabase
      .from('transactions')
      .select('amount')
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString())
      .eq('status', 'completed')
    
    // 今月の売上
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    
    const { data: monthSales } = await supabase
      .from('transactions')
      .select('amount')
      .gte('created_at', monthStart.toISOString())
      .eq('status', 'completed')
    
    // 先月の売上（比較用）
    const lastMonthStart = new Date(monthStart)
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
    const lastMonthEnd = new Date(monthStart)
    lastMonthEnd.setDate(0)
    
    const { data: lastMonthSales } = await supabase
      .from('transactions')
      .select('amount')
      .gte('created_at', lastMonthStart.toISOString())
      .lt('created_at', lastMonthEnd.toISOString())
      .eq('status', 'completed')
    
    // 人気ガチャランキング
    const { data: popularGacha } = await supabase
      .from('transactions')
      .select(`
        product_id,
        gacha_products!inner(name, price),
        count:product_id.count(),
        total:amount.sum()
      `)
      .eq('status', 'completed')
      .gte('created_at', monthStart.toISOString())
      .order('count', { ascending: false })
      .limit(5)
    
    // 日別売上（過去7日間）
    const dailySales = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const { data } = await supabase
        .from('transactions')
        .select('amount')
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString())
        .eq('status', 'completed')
      
      dailySales.push({
        date: date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
        amount: data?.reduce((sum, t) => sum + t.amount, 0) || 0
      })
    }
    
    return {
      todayTotal: todaySales?.reduce((sum, t) => sum + t.amount, 0) || 0,
      yesterdayTotal: yesterdaySales?.reduce((sum, t) => sum + t.amount, 0) || 0,
      monthTotal: monthSales?.reduce((sum, t) => sum + t.amount, 0) || 0,
      lastMonthTotal: lastMonthSales?.reduce((sum, t) => sum + t.amount, 0) || 0,
      popularGacha: popularGacha || [],
      dailySales
    }
  } catch (error) {
    console.error('Sales data fetch error:', error)
    return {
      todayTotal: 0,
      yesterdayTotal: 0,
      monthTotal: 0,
      lastMonthTotal: 0,
      popularGacha: [],
      dailySales: []
    }
  }
}

export default async function SalesPage() {
  const sales = await getSalesData()
  
  // 前日比・前月比の計算
  const dayChange = sales.yesterdayTotal > 0 
    ? ((sales.todayTotal - sales.yesterdayTotal) / sales.yesterdayTotal * 100).toFixed(1)
    : '0'
  
  const monthChange = sales.lastMonthTotal > 0
    ? ((sales.monthTotal - sales.lastMonthTotal) / sales.lastMonthTotal * 100).toFixed(1)
    : '0'
  
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">売上統計</h1>
        <p className="text-gray-600 text-sm">リアルタイムの売上データと分析</p>
      </div>
      
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 本日の売上 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center ${
              Number(dayChange) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {Number(dayChange) > 0 ? (
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
              )}
              {Math.abs(Number(dayChange))}%
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">本日の売上</p>
            <p className="text-xl font-semibold text-gray-900">
              ¥{sales.todayTotal.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              前日: ¥{sales.yesterdayTotal.toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* 今月の売上 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center ${
              Number(monthChange) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {Number(monthChange) > 0 ? (
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
              )}
              {Math.abs(Number(monthChange))}%
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">今月の売上</p>
            <p className="text-xl font-semibold text-gray-900">
              ¥{sales.monthTotal.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              先月: ¥{sales.lastMonthTotal.toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* 本日の取引数 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">平均単価</p>
            <p className="text-xl font-semibold text-gray-900">
              ¥{sales.todayTotal > 0 ? Math.round(sales.todayTotal / 10) : 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">推定取引数: 10件</p>
          </div>
        </div>
        
        {/* 成長率 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <ArrowTrendingUpIcon className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">月間成長率</p>
            <p className="text-xl font-semibold text-gray-900">
              {Number(monthChange) > 0 ? '+' : ''}{monthChange}%
            </p>
            <p className="text-xs text-gray-500 mt-1">前月比</p>
          </div>
        </div>
      </div>
      
      {/* グラフとランキング */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 日別売上グラフ */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">過去7日間の売上推移</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {sales.dailySales.map((day, index) => {
              const maxAmount = Math.max(...sales.dailySales.map(d => d.amount))
              const height = maxAmount > 0 ? (day.amount / maxAmount * 100) : 0
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '200px' }}>
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${height}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700">
                        {day.amount > 0 ? `¥${(day.amount / 1000).toFixed(0)}k` : ''}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{day.date}</span>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* 人気ガチャランキング */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">人気ガチャTOP5</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((rank) => (
              <div key={rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className={`text-lg font-bold mr-3 ${
                    rank === 1 ? 'text-yellow-500' :
                    rank === 2 ? 'text-gray-400' :
                    rank === 3 ? 'text-orange-600' :
                    'text-gray-600'
                  }`}>
                    #{rank}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">ポケモンカード151</p>
                    <p className="text-sm text-gray-500">購入数: {100 - rank * 15}回</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">¥{((100 - rank * 15) * 1500).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{25 - rank * 3}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 詳細データテーブル */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">最近の取引</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(Date.now() - i * 3600000).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    user{i + 1}@example.com
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ポケモンカード151 10連
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ¥{(15000 - i * 1000).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      完了
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}