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
    
    // 人気ガチャランキング(今月の完了済み取引をproduct_idごとに集計)
    const { data: monthTransactionsForRanking } = await supabase
      .from('transactions')
      .select('product_id, amount')
      .eq('status', 'completed')
      .gte('created_at', monthStart.toISOString())

    const rankingMap = new Map<string, { count: number; total: number }>()
    for (const t of monthTransactionsForRanking || []) {
      if (!t.product_id) continue
      const entry = rankingMap.get(t.product_id) || { count: 0, total: 0 }
      entry.count += 1
      entry.total += t.amount || 0
      rankingMap.set(t.product_id, entry)
    }
    const rankedProductIds = Array.from(rankingMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)

    let popularGacha: { productId: string; name: string; count: number; total: number }[] = []
    if (rankedProductIds.length > 0) {
      const { data: productNames } = await supabase
        .from('gacha_products')
        .select('id, name')
        .in('id', rankedProductIds.map(([id]) => id))
      const nameMap = new Map((productNames || []).map(p => [p.id, p.name]))
      popularGacha = rankedProductIds.map(([productId, stats]) => ({
        productId,
        name: nameMap.get(productId) || '不明な商品',
        count: stats.count,
        total: stats.total,
      }))
    }

    // 最近の取引(ユーザー・商品名を突き合わせて表示)
    const { data: recentTransactionsRaw } = await supabase
      .from('transactions')
      .select('id, user_id, product_id, amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    let recentTransactions: {
      id: string
      email: string
      productName: string
      amount: number
      status: string
      createdAt: string
    }[] = []

    if (recentTransactionsRaw && recentTransactionsRaw.length > 0) {
      const userIds = Array.from(new Set(recentTransactionsRaw.map(t => t.user_id).filter(Boolean)))
      const productIds = Array.from(new Set(recentTransactionsRaw.map(t => t.product_id).filter(Boolean)))

      const [{ data: users }, { data: products }] = await Promise.all([
        userIds.length > 0
          ? supabase.from('users').select('id, email').in('id', userIds)
          : Promise.resolve({ data: [] as { id: string; email: string }[] }),
        productIds.length > 0
          ? supabase.from('gacha_products').select('id, name').in('id', productIds)
          : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      ])

      const userMap = new Map((users || []).map(u => [u.id, u.email]))
      const productMap = new Map((products || []).map(p => [p.id, p.name]))

      recentTransactions = recentTransactionsRaw.map(t => ({
        id: t.id,
        email: userMap.get(t.user_id) || '不明なユーザー',
        productName: productMap.get(t.product_id) || '不明な商品',
        amount: t.amount || 0,
        status: t.status,
        createdAt: t.created_at,
      }))
    }
    
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
      popularGacha,
      recentTransactions,
      dailySales
    }
  } catch (error) {
    console.error('Sales data fetch error:', error)
    return {
      todayTotal: 0,
      yesterdayTotal: 0,
      monthTotal: 0,
      lastMonthTotal: 0,
      popularGacha: [] as { productId: string; name: string; count: number; total: number }[],
      recentTransactions: [] as { id: string; email: string; productName: string; amount: number; status: string; createdAt: string }[],
      dailySales: [] as { date: string; amount: number }[]
    }
  }
}

export const dynamic = 'force-dynamic'

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
    <div>
      {/* ヘッダー */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">売上統計</h1>
          <p className="text-muted">リアルタイムの売上データと分析</p>
        </div>
      </div>
      
      {/* 統計カード */}
      <div className="row mb-4">
        {/* 本日の売上 */}
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="rounded p-2 bg-white bg-opacity-20">
                  <CurrencyDollarIcon style={{width: '20px', height: '20px'}} />
                </div>
                <span className={`badge ${
                  Number(dayChange) > 0 ? 'bg-light text-success' : 'bg-light text-danger'
                }`}>
                  {Number(dayChange) > 0 ? '↑' : '↓'}
                  {Math.abs(Number(dayChange))}%
                </span>
              </div>
              <div>
                <small className="text-light">本日の売上</small>
                <h4 className="mb-0">
                  ¥{sales.todayTotal.toLocaleString()}
                </h4>
                <small className="text-light">
                  前日: ¥{sales.yesterdayTotal.toLocaleString()}
                </small>
              </div>
            </div>
          </div>
        </div>
        
        {/* 今月の売上 */}
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="rounded p-2 bg-white bg-opacity-20">
                  <ChartBarIcon style={{width: '20px', height: '20px'}} />
                </div>
                <span className={`badge ${
                  Number(monthChange) > 0 ? 'bg-light text-success' : 'bg-light text-danger'
                }`}>
                  {Number(monthChange) > 0 ? '↑' : '↓'}
                  {Math.abs(Number(monthChange))}%
                </span>
              </div>
              <div>
                <small className="text-light">今月の売上</small>
                <h4 className="mb-0">
                  ¥{sales.monthTotal.toLocaleString()}
                </h4>
                <small className="text-light">
                  先月: ¥{sales.lastMonthTotal.toLocaleString()}
                </small>
              </div>
            </div>
          </div>
        </div>
        
        {/* 平均単価 */}
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="rounded p-2 bg-white bg-opacity-20">
                  <CurrencyDollarIcon style={{width: '20px', height: '20px'}} />
                </div>
              </div>
              <div>
                <small className="text-light">平均単価</small>
                <h4 className="mb-0">
                  ¥{sales.todayTotal > 0 ? Math.round(sales.todayTotal / 10) : 0}
                </h4>
                <small className="text-light">推定取引数: 10件</small>
              </div>
            </div>
          </div>
        </div>
        
        {/* 成長率 */}
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="rounded p-2 bg-white bg-opacity-20">
                  <ArrowTrendingUpIcon style={{width: '20px', height: '20px'}} />
                </div>
              </div>
              <div>
                <small>月間成長率</small>
                <h4 className="mb-0">
                  {Number(monthChange) > 0 ? '+' : ''}{monthChange}%
                </h4>
                <small>前月比</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* グラフとランキング */}
      <div className="row">
        {/* 日別売上グラフ */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">過去7日間の売上推移</h5>
              <div className="d-flex align-items-end justify-content-between" style={{height: '250px', gap: '8px'}}>
                {sales.dailySales.map((day, index) => {
                  const maxAmount = Math.max(...sales.dailySales.map(d => d.amount))
                  const height = maxAmount > 0 ? (day.amount / maxAmount * 100) : 0
                  
                  return (
                    <div key={index} className="d-flex flex-column align-items-center" style={{flex: 1}}>
                      <div className="w-100 bg-light rounded position-relative" style={{ height: '200px' }}>
                        <div 
                          className="position-absolute bottom-0 w-100 bg-primary rounded transition-all"
                          style={{ height: `${height}%` }}
                        >
                          <span className="position-absolute text-dark fw-bold" style={{top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px'}}>
                            {day.amount > 0 ? `¥${(day.amount / 1000).toFixed(0)}k` : ''}
                          </span>
                        </div>
                      </div>
                      <small className="text-muted mt-2">{day.date}</small>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* 人気ガチャランキング */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">人気ガチャTOP5(今月)</h5>
              <div>
                {sales.popularGacha.length === 0 && (
                  <p className="text-muted text-center py-3">今月はまだ購入実績がありません</p>
                )}
                {sales.popularGacha.map((item, index) => {
                  const rank = index + 1
                  const monthTotalCount = sales.popularGacha.reduce((sum, g) => sum + g.count, 0) || 1
                  const share = Math.round((item.count / monthTotalCount) * 100)
                  return (
                    <div key={item.productId} className="d-flex justify-content-between align-items-center p-3 mb-2 bg-light rounded">
                      <div className="d-flex align-items-center">
                        <span className={`h5 me-3 ${
                          rank === 1 ? 'text-warning' :
                          rank === 2 ? 'text-secondary' :
                          rank === 3 ? 'text-danger' :
                          'text-muted'
                        }`}>
                          #{rank}
                        </span>
                        <div>
                          <div className="fw-medium">{item.name}</div>
                          <small className="text-muted">購入数: {item.count}回</small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">¥{item.total.toLocaleString()}</div>
                        <small className="text-muted">{share}%</small>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 詳細データテーブル */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">最近の取引</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>日時</th>
                  <th>ユーザー</th>
                  <th>商品</th>
                  <th>金額</th>
                  <th>ステータス</th>
                </tr>
              </thead>
              <tbody>
                {sales.recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">取引履歴がありません</td>
                  </tr>
                )}
                {sales.recentTransactions.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <small>{new Date(t.createdAt).toLocaleString('ja-JP')}</small>
                    </td>
                    <td>{t.email}</td>
                    <td>{t.productName}</td>
                    <td className="fw-bold">
                      ¥{t.amount.toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${t.status === 'completed' ? 'bg-success' : t.status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                        {t.status === 'completed' ? '完了' : t.status === 'pending' ? '保留中' : t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}