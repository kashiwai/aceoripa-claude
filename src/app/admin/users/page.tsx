import { createClient } from '@/lib/supabase/server'
import UserTable from '@/components/admin/UserTable'
import { Suspense } from 'react'

async function getUsers(page: number = 1, perPage: number = 20) {
  try {
    const supabase = await createClient()
    const offset = (page - 1) * perPage
    
    const { data: users, count, error } = await supabase
      .from('users')
      .select(`
        *,
        user_points (free_points, paid_points),
        user_cards (count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1)
    
    if (error) {
      console.error('Database error:', error)
      return {
        users: [],
        totalCount: 0,
        totalPages: 0,
        error: error.message
      }
    }
    
    return {
      users: users || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / perPage)
    }
  } catch (error) {
    console.error('Connection error:', error)
    return {
      users: [],
      totalCount: 0,
      totalPages: 0,
      error: 'データベース接続エラー'
    }
  }
}

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const currentPage = Number(resolvedSearchParams.page) || 1
  const { users, totalCount, totalPages } = await getUsers(currentPage)
  
  return (
    <div className="space-y-8">
      {/* ヘッダーセクション */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ユーザー管理</h1>
            <p className="text-gray-600">登録ユーザーの情報を管理できます</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-xl">
              <span className="text-sm text-gray-600">総ユーザー数</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {totalCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* ユーザーテーブル */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Suspense fallback={
          <div className="p-20 text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">ユーザーデータを読み込んでいます...</span>
            </div>
          </div>
        }>
          <UserTable 
            users={users} 
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </Suspense>
      </div>
    </div>
  )
}