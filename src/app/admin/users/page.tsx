import { createClient } from '@/lib/supabase/server'
import UserTable from '@/components/admin/UserTable'
import { Suspense } from 'react'

async function getUsers(page: number = 1, perPage: number = 20) {
  const supabase = await createClient()
  const offset = (page - 1) * perPage
  
  const { data: users, count } = await supabase
    .from('users')
    .select(`
      *,
      user_points (free_points, paid_points),
      user_cards (count)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1)
  
  return {
    users: users || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / perPage)
  }
}

export default async function UsersPage({
  searchParams
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams.page) || 1
  const { users, totalCount, totalPages } = await getUsers(currentPage)
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">ユーザー管理</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>総ユーザー数:</span>
          <span className="font-semibold">{totalCount.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <Suspense fallback={<div className="p-8 text-center">読み込み中...</div>}>
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