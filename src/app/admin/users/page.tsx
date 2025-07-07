'use client'

import { useEffect, useState } from 'react'
import UserTable from '@/components/admin/UserTable'
import { Suspense } from 'react'

interface User {
  id: string
  email: string
  display_name: string | null
  created_at: string
  email_confirmed: boolean
  free_points: number
  paid_points: number
  total_points: number
  card_count: number
  last_sign_in: string | null
  user_source: string
}

interface UsersData {
  users: User[]
  totalCount: number
  totalPages: number
  error?: string
}

export default function UsersPage() {
  const [usersData, setUsersData] = useState<UsersData>({
    users: [],
    totalCount: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/users?page=${currentPage}&perPage=20`)
        const data = await response.json()
        
        if (data.success) {
          setUsersData({
            users: data.users,
            totalCount: data.totalCount,
            totalPages: data.totalPages
          })
        } else {
          setUsersData({
            users: [],
            totalCount: 0,
            totalPages: 0,
            error: data.error
          })
        }
      } catch (error) {
        setUsersData({
          users: [],
          totalCount: 0,
          totalPages: 0,
          error: 'データの取得に失敗しました'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [currentPage])

  if (loading) {
    return (
      <div className="card-body text-center p-5">
        <div className="spinner-border text-primary me-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        ユーザーデータを読み込んでいます...
      </div>
    )
  }

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
                  <h3 className="mb-0">{usersData.totalCount.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ユーザーテーブル */}
      <div className="card">
        <UserTable 
          users={usersData.users} 
          currentPage={currentPage}
          totalPages={usersData.totalPages}
        />
      </div>
    </div>
  )
}