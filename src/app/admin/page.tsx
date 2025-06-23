import { createClient } from '@/lib/supabase/server'
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  CubeIcon,
  ChartBarIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline'

async function getStats() {
  const supabase = await createClient()
  
  try {
    // ユーザー数を取得
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (userError) throw userError

    // 今日の売上を取得
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data: todayTransactions, error: todayError } = await supabase
      .from('transactions')
      .select('amount')
      .gte('created_at', today.toISOString())
      .eq('status', 'completed')
    
    if (todayError) throw todayError
    
    const todayRevenue = todayTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

    // 今月の売上を取得
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const { data: monthTransactions, error: monthError } = await supabase
      .from('transactions')
      .select('amount')
      .gte('created_at', firstDayOfMonth.toISOString())
      .eq('status', 'completed')
    
    if (monthError) throw monthError
    
    const monthRevenue = monthTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

    // アクティブガチャ数を取得
    const { count: gachaCount, error: gachaError } = await supabase
      .from('gacha_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    if (gachaError) throw gachaError

    return {
      userCount: userCount || 0,
      todayRevenue: todayRevenue,
      gachaCount: gachaCount || 0,
      monthRevenue: monthRevenue
    }
  } catch (error) {
    console.error('Database error:', error)
    // エラー時は0を返す（ダミーデータは使わない）
    return {
      userCount: 0,
      todayRevenue: 0,
      gachaCount: 0,
      monthRevenue: 0
    }
  }
}

async function getRecentActivities() {
  const supabase = await createClient()
  
  try {
    // 最近のユーザー登録
    const { data: recentUsers } = await supabase
      .from('users')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    // 最近の取引
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('id, user_id, amount, type, created_at, gacha_products(name)')
      .order('created_at', { ascending: false })
      .limit(5)

    // 最近のガチャ追加
    const { data: recentGachas } = await supabase
      .from('gacha_products')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    // 全てのアクティビティを統合してソート
    const activities = []

    if (recentUsers) {
      activities.push(...recentUsers.map(user => ({
        type: 'user',
        title: '新規ユーザー登録',
        description: user.email,
        created_at: user.created_at,
        icon: '👤',
        badge: 'bg-primary'
      })))
    }

    if (recentTransactions) {
      activities.push(...recentTransactions.map(tx => ({
        type: 'transaction',
        title: tx.type === 'gacha' ? 'ガチャ購入' : 'ポイント購入',
        description: `¥${tx.amount.toLocaleString()}${tx.gacha_products ? ` - ${tx.gacha_products.name}` : ''}`,
        created_at: tx.created_at,
        icon: '💰',
        badge: 'bg-success'
      })))
    }

    if (recentGachas) {
      activities.push(...recentGachas.map(gacha => ({
        type: 'gacha',
        title: '新規ガチャ追加',
        description: gacha.name,
        created_at: gacha.created_at,
        icon: '📦',
        badge: 'bg-info'
      })))
    }

    // 時間順にソート
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return activities.slice(0, 10) // 最新10件を返す
  } catch (error) {
    console.error('Activities fetch error:', error)
    return []
  }
}

function formatTimeAgo(date: string) {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}日前`
  if (hours > 0) return `${hours}時間前`
  if (minutes > 0) return `${minutes}分前`
  return 'たった今'
}

export default async function AdminDashboard() {
  const stats = await getStats()
  const activities = await getRecentActivities()
  
  return (
    <div>
      {/* ヘッダー */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-1">ダッシュボード</h1>
          <p className="text-muted">リアルタイムのビジネス指標を確認できます</p>
        </div>
      </div>
      
      {/* 統計カード */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title text-muted">総ユーザー数</h6>
                  <h3 className="mb-0">{stats.userCount.toLocaleString()}</h3>
                </div>
                <div className="align-self-center">
                  <span className="badge bg-primary">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title text-muted">本日の売上</h6>
                  <h3 className="mb-0">¥{stats.todayRevenue.toLocaleString()}</h3>
                </div>
                <div className="align-self-center">
                  <span className="badge bg-success">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title text-muted">アクティブガチャ</h6>
                  <h3 className="mb-0">{stats.gachaCount}</h3>
                </div>
                <div className="align-self-center">
                  <span className="badge bg-info">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title text-muted">今月の売上</h6>
                  <h3 className="mb-0">¥{stats.monthRevenue.toLocaleString()}</h3>
                </div>
                <div className="align-self-center">
                  <span className="badge bg-warning">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* クイックアクション */}
      <div className="row mb-4">
        <div className="col">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">クイックアクション</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <a href="/admin/gacha/new" className="btn btn-outline-primary w-100 h-100 d-flex flex-column justify-content-center">
                    <div className="mb-2">📦</div>
                    <strong>新規ガチャ作成</strong>
                    <small className="text-muted">新しいガチャ商品を追加</small>
                  </a>
                </div>
                <div className="col-md-4 mb-3">
                  <a href="/admin/users" className="btn btn-outline-primary w-100 h-100 d-flex flex-column justify-content-center">
                    <div className="mb-2">👥</div>
                    <strong>ユーザー管理</strong>
                    <small className="text-muted">ユーザー情報の確認・編集</small>
                  </a>
                </div>
                <div className="col-md-4 mb-3">
                  <a href="/admin/announcements" className="btn btn-outline-primary w-100 h-100 d-flex flex-column justify-content-center">
                    <div className="mb-2">📢</div>
                    <strong>お知らせ管理</strong>
                    <small className="text-muted">プッシュ通知の送信</small>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* アクティビティログ */}
      <div className="row">
        <div className="col">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">最近のアクティビティ</h5>
            </div>
            <div className="card-body">
              {activities.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p>アクティビティがまだありません</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {activities.map((activity, index) => (
                    <div key={`${activity.type}-${index}`} className="list-group-item d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <span className={`badge ${activity.badge} rounded-pill`}>{activity.icon}</span>
                        </div>
                        <div>
                          <h6 className="mb-1">{activity.title}</h6>
                          <p className="mb-1 text-muted">{activity.description}</p>
                        </div>
                      </div>
                      <small className="text-muted">{formatTimeAgo(activity.created_at)}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}