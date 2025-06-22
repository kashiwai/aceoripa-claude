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
}

export default async function AdminDashboard() {
  const stats = await getStats()
  
  const statCards = [
    {
      title: '総ユーザー数',
      value: stats.userCount.toLocaleString(),
      icon: UsersIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500/10'
    },
    {
      title: '本日の売上',
      value: `¥${stats.todayRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-500/10'
    },
    {
      title: 'アクティブガチャ',
      value: stats.gachaCount,
      icon: CubeIcon,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500/10'
    },
    {
      title: '今月の売上',
      value: `¥${stats.monthRevenue.toLocaleString()}`,
      icon: ChartBarIcon,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      iconBg: 'bg-orange-500/10'
    }
  ]
  
  return (
    <div className="space-y-6">
      {/* ヘッダーセクション */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">ダッシュボード</h1>
        <p className="text-gray-600 text-sm">リアルタイムのビジネス指標を確認できます</p>
      </div>
      
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className="h-5 w-5 text-gray-600" />
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Live
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{stat.title}</p>
              <p className="text-xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* クイックアクション */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">クイックアクション</h2>
          <span className="text-xs text-gray-500">よく使う機能</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/gacha/new"
            className="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="w-8 h-8 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <CubeIcon className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">新規ガチャ作成</p>
            <p className="text-xs text-gray-500 mt-1">新しいガチャ商品を追加</p>
          </a>
          <a
            href="/admin/users"
            className="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="w-8 h-8 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <UsersIcon className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">ユーザー管理</p>
            <p className="text-xs text-gray-500 mt-1">ユーザー情報の確認・編集</p>
          </a>
          <a
            href="/admin/notifications"
            className="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="w-8 h-8 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <SpeakerWaveIcon className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">通知管理</p>
            <p className="text-xs text-gray-500 mt-1">プッシュ通知の送信</p>
          </a>
        </div>
      </div>

      {/* アクティビティログ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">最近のアクティビティ</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UsersIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">新規ユーザー登録</p>
                  <p className="text-xs text-gray-500">user@example.com</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">5分前</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">ガチャ購入</p>
                  <p className="text-xs text-gray-500">¥3,000 - SSRガチャ</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">15分前</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <CubeIcon className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">新規ガチャ追加</p>
                  <p className="text-xs text-gray-500">ポケモンカード151</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">1時間前</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}