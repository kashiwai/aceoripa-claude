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
    <div>
      {/* ヘッダーセクション */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-1">ユーザー管理</h1>
              <p className="text-muted">登録ユーザーの情報を管理できます</p>
            </div>
            <div>
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <small>総ユーザー数</small>
                  <h3 className="mb-0">{totalCount.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ユーザーテーブル */}
      <div className="card">
        <Suspense fallback={
          <div className="card-body text-center p-5">
            <div className="spinner-border text-primary me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            ユーザーデータを読み込んでいます...
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