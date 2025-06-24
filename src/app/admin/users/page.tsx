import { createClient } from '@/lib/supabase/server'
import UserTable from '@/components/admin/UserTable'
import { Suspense } from 'react'

async function getUsers(page: number = 1, perPage: number = 20) {
  try {
    // APIエンドポイントから取得
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/users?page=${page}&perPage=${perPage}`,
      { cache: 'no-store' }
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }
    
    const data = await response.json()
    
    if (data.success) {
      // UserTableコンポーネントが期待する形式に変換
      const formattedUsers = data.users.map((user: any) => ({
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        created_at: user.created_at,
        user_points: [{
          free_points: user.free_points,
          paid_points: user.paid_points
        }],
        user_cards: [{ count: user.card_count || 0 }]
      }))
      
      return {
        users: formattedUsers,
        totalCount: data.totalCount,
        totalPages: data.totalPages
      }
    } else {
      throw new Error(data.error || 'Failed to fetch users')
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return {
      users: [],
      totalCount: 0,
      totalPages: 0,
      error: error instanceof Error ? error.message : 'データの取得に失敗しました'
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