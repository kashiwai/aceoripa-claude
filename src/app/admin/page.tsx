import { createClient } from '@/lib/supabase/server'
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  CubeIcon,
  ChartBarIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline'

async function getStats() {
  try {
    const supabase = await createClient()
    
    // ユーザー数取得
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    // 本日の売上
    const today = new Date().toISOString().split('T')[0]
    const { data: todaySales } = await supabase
      .from('transactions')
      .select('amount')
      .gte('created_at', today)
      .eq('status', 'completed')
    
    const todayRevenue = todaySales?.reduce((sum, t) => sum + t.amount, 0) || 0
    
    // アクティブガチャ数
    const { count: gachaCount } = await supabase
      .from('gacha_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    // 今月の売上
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    
    const { data: monthSales } = await supabase
      .from('transactions')
      .select('amount')
      .gte('created_at', monthStart.toISOString())
      .eq('status', 'completed')
    
    const monthRevenue = monthSales?.reduce((sum, t) => sum + t.amount, 0) || 0
    
    return {
      userCount: userCount || 0,
      todayRevenue,
      gachaCount: gachaCount || 0,
      monthRevenue
    }
  } catch (error) {
    console.error('Database connection error:', error)
    // エラー時はダミーデータを返す
    return {
      userCount: 0,
      todayRevenue: 0,
      gachaCount: 0,
      monthRevenue: 0
    }
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()
  
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
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <span className="badge bg-primary rounded-pill">👤</span>
                    </div>
                    <div>
                      <h6 className="mb-1">新規ユーザー登録</h6>
                      <p className="mb-1 text-muted">user@example.com</p>
                    </div>
                  </div>
                  <small className="text-muted">5分前</small>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <span className="badge bg-success rounded-pill">💰</span>
                    </div>
                    <div>
                      <h6 className="mb-1">ガチャ購入</h6>
                      <p className="mb-1 text-muted">¥3,000 - SSRガチャ</p>
                    </div>
                  </div>
                  <small className="text-muted">15分前</small>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <span className="badge bg-info rounded-pill">📦</span>
                    </div>
                    <div>
                      <h6 className="mb-1">新規ガチャ追加</h6>
                      <p className="mb-1 text-muted">ポケモンカード151</p>
                    </div>
                  </div>
                  <small className="text-muted">1時間前</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}