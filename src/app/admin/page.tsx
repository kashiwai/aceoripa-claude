import { createClient } from '@/lib/supabase/server'
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  CubeIcon,
  ChartBarIcon 
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
      color: 'bg-blue-500'
    },
    {
      title: '本日の売上',
      value: `¥${stats.todayRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500'
    },
    {
      title: 'アクティブガチャ',
      value: stats.gachaCount,
      icon: CubeIcon,
      color: 'bg-purple-500'
    },
    {
      title: '今月の売上',
      value: `¥${stats.monthRevenue.toLocaleString()}`,
      icon: ChartBarIcon,
      color: 'bg-orange-500'
    }
  ]
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">管理ダッシュボード</h1>
      
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* クイックアクション */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/gacha/new"
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          >
            <CubeIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <span className="text-gray-600">新規ガチャ作成</span>
          </a>
          <a
            href="/admin/users"
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          >
            <UsersIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <span className="text-gray-600">ユーザー管理</span>
          </a>
          <a
            href="/admin/sales"
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          >
            <ChartBarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <span className="text-gray-600">売上レポート</span>
          </a>
        </div>
      </div>
    </div>
  )
}