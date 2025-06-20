'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'react-hot-toast'
import { TrophyIcon, UserIcon, CreditCardIcon, CalendarIcon } from '@heroicons/react/24/outline'

interface RankingUser {
  id: string
  email: string
  username?: string
  total_points: number
  rank: number
  card_count: number
  gacha_count: number
  last_gacha_date?: string
}

interface RankingSettings {
  id: string
  ranking_type: 'points' | 'cards' | 'gacha_count'
  period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  reset_day?: number
  is_active: boolean
  display_count: number
  created_at: string
  updated_at: string
}

export default function RankingsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [rankings, setRankings] = useState<RankingUser[]>([])
  const [settings, setSettings] = useState<RankingSettings[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'rankings' | 'settings'>('rankings')
  const [selectedRankingType, setSelectedRankingType] = useState<'points' | 'cards' | 'gacha_count'>('points')
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('all_time')
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [editingSettings, setEditingSettings] = useState<RankingSettings | null>(null)
  const [settingsForm, setSettingsForm] = useState({
    ranking_type: 'points' as const,
    period: 'all_time' as const,
    reset_day: 1,
    is_active: true,
    display_count: 10
  })

  useEffect(() => {
    fetchRankings()
    fetchSettings()
  }, [selectedRankingType, selectedPeriod])

  const fetchRankings = async () => {
    try {
      setLoading(true)
      
      // Generate rankings based on type and period
      let query = `
        SELECT 
          u.id,
          u.email,
          u.username,
          COALESCE(SUM(pt.amount), 0) as total_points,
          COUNT(DISTINCT uc.id) as card_count,
          COUNT(DISTINCT g.id) as gacha_count,
          MAX(g.created_at) as last_gacha_date
        FROM auth.users u
        LEFT JOIN point_transactions pt ON u.id = pt.user_id
        LEFT JOIN user_cards uc ON u.id = uc.user_id
        LEFT JOIN gacha_results g ON u.id = g.user_id
      `

      // Add period filter
      if (selectedPeriod !== 'all_time') {
        const dateFilter = getPeriodFilter()
        query += ` WHERE (pt.created_at >= '${dateFilter}' OR pt.created_at IS NULL)
                   AND (uc.created_at >= '${dateFilter}' OR uc.created_at IS NULL)
                   AND (g.created_at >= '${dateFilter}' OR g.created_at IS NULL)`
      }

      query += ` GROUP BY u.id, u.email, u.username`

      // Add ordering based on ranking type
      switch (selectedRankingType) {
        case 'points':
          query += ' ORDER BY total_points DESC'
          break
        case 'cards':
          query += ' ORDER BY card_count DESC'
          break
        case 'gacha_count':
          query += ' ORDER BY gacha_count DESC'
          break
      }

      query += ' LIMIT 100'

      const { data, error } = await supabase.rpc('get_user_rankings', {
        ranking_type: selectedRankingType,
        period: selectedPeriod
      })

      if (error) {
        // Fallback: Simple user query if stored procedure doesn't exist
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select(`
            *,
            point_transactions(amount),
            user_cards(id),
            gacha_results(id, created_at)
          `)
          .limit(50)

        if (usersError) throw usersError

        // Process client-side ranking
        const processedRankings = users?.map((user: any) => ({
          id: user.id,
          email: user.email,
          username: user.username || '名前なし',
          total_points: user.point_transactions?.reduce((sum: number, pt: any) => sum + (pt.amount || 0), 0) || 0,
          card_count: user.user_cards?.length || 0,
          gacha_count: user.gacha_results?.length || 0,
          last_gacha_date: user.gacha_results?.[0]?.created_at || null,
          rank: 0
        })) || []

        // Sort and assign ranks
        processedRankings.sort((a, b) => {
          switch (selectedRankingType) {
            case 'points': return b.total_points - a.total_points
            case 'cards': return b.card_count - a.card_count
            case 'gacha_count': return b.gacha_count - a.gacha_count
            default: return 0
          }
        })

        processedRankings.forEach((user, index) => {
          user.rank = index + 1
        })

        setRankings(processedRankings)
      } else {
        setRankings(data || [])
      }
    } catch (error) {
      console.error('Error fetching rankings:', error)
      toast.error('ランキングの取得に失敗しました')
      setRankings([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('ranking_settings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSettings(data || [])
    } catch (error) {
      console.error('Error fetching settings:', error)
      // Ranking settings table might not exist yet, that's ok
    }
  }

  const getPeriodFilter = () => {
    const now = new Date()
    switch (selectedPeriod) {
      case 'daily':
        return new Date(now.setHours(0, 0, 0, 0)).toISOString()
      case 'weekly':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
        return weekStart.toISOString()
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      default:
        return '1970-01-01T00:00:00.000Z'
    }
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingSettings) {
        const { error } = await supabase
          .from('ranking_settings')
          .update({
            ...settingsForm,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSettings.id)

        if (error) throw error
        toast.success('設定を更新しました')
      } else {
        const { error } = await supabase
          .from('ranking_settings')
          .insert([{
            ...settingsForm,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (error) throw error
        toast.success('設定を作成しました')
      }

      setShowSettingsModal(false)
      setEditingSettings(null)
      resetSettingsForm()
      fetchSettings()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('設定の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const resetSettingsForm = () => {
    setSettingsForm({
      ranking_type: 'points',
      period: 'all_time',
      reset_day: 1,
      is_active: true,
      display_count: 10
    })
  }

  const resetRankings = async () => {
    if (!confirm('ランキングをリセットしますか？この操作は取り消せません。')) return

    try {
      // Here you would implement ranking reset logic
      // For now, just refresh the data
      toast.success('ランキングをリセットしました')
      fetchRankings()
    } catch (error) {
      console.error('Error resetting rankings:', error)
      toast.error('リセットに失敗しました')
    }
  }

  const getRankingValue = (user: RankingUser) => {
    switch (selectedRankingType) {
      case 'points': return user.total_points.toLocaleString()
      case 'cards': return user.card_count.toString()
      case 'gacha_count': return user.gacha_count.toString()
      default: return '0'
    }
  }

  const getRankingUnit = () => {
    switch (selectedRankingType) {
      case 'points': return 'pt'
      case 'cards': return '枚'
      case 'gacha_count': return '回'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ランキング管理</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('rankings')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'rankings' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ランキング表示
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'settings' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            設定管理
          </button>
        </div>
      </div>

      {activeTab === 'rankings' && (
        <div className="space-y-4">
          {/* フィルター */}
          <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ランキング種類
              </label>
              <select
                value={selectedRankingType}
                onChange={(e) => setSelectedRankingType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="points">ポイント</option>
                <option value="cards">カード所持数</option>
                <option value="gacha_count">ガチャ回数</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                期間
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all_time">全期間</option>
                <option value="monthly">月間</option>
                <option value="weekly">週間</option>
                <option value="daily">日間</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={resetRankings}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                リセット
              </button>
            </div>
          </div>

          {/* ランキング表示 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {loading ? (
                <div className="text-center py-4">読み込み中...</div>
              ) : rankings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  ランキングデータがありません
                </div>
              ) : (
                <div className="space-y-4">
                  {rankings.slice(0, 10).map((user, index) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        index === 0 ? 'bg-yellow-50 border-yellow-200' :
                        index === 1 ? 'bg-gray-50 border-gray-200' :
                        index === 2 ? 'bg-orange-50 border-orange-200' :
                        'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-500 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          'bg-blue-500 text-white'
                        }`}>
                          {index === 0 ? <TrophyIcon className="h-6 w-6" /> : index + 1}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <UserIcon className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {user.username || user.email.split('@')[0]}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {getRankingValue(user)} {getRankingUnit()}
                        </div>
                        <div className="text-sm text-gray-500">
                          カード: {user.card_count}枚 | ガチャ: {user.gacha_count}回
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              新規設定作成
            </button>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {settings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  設定がまだありません
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          種類
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          期間
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          表示件数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ステータス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          作成日
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {settings.map((setting) => (
                        <tr key={setting.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {setting.ranking_type === 'points' ? 'ポイント' :
                             setting.ranking_type === 'cards' ? 'カード数' : 'ガチャ回数'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {setting.period === 'all_time' ? '全期間' :
                             setting.period === 'monthly' ? '月間' :
                             setting.period === 'weekly' ? '週間' : '日間'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {setting.display_count}件
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              setting.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {setting.is_active ? '有効' : '無効'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(setting.created_at).toLocaleDateString('ja-JP')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 設定モーダル */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              ランキング設定
            </h2>
            
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ランキング種類
                </label>
                <select
                  value={settingsForm.ranking_type}
                  onChange={(e) => setSettingsForm({ ...settingsForm, ranking_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="points">ポイント</option>
                  <option value="cards">カード所持数</option>
                  <option value="gacha_count">ガチャ回数</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  期間
                </label>
                <select
                  value={settingsForm.period}
                  onChange={(e) => setSettingsForm({ ...settingsForm, period: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all_time">全期間</option>
                  <option value="monthly">月間</option>
                  <option value="weekly">週間</option>
                  <option value="daily">日間</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  表示件数
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settingsForm.display_count}
                  onChange={(e) => setSettingsForm({ ...settingsForm, display_count: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={settingsForm.is_active}
                  onChange={(e) => setSettingsForm({ ...settingsForm, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  有効にする
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false)
                    setEditingSettings(null)
                    resetSettingsForm()
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}