'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  created_at: string
  user_points?: Array<{
    free_points: number
    paid_points: number
  }>
  user_cards?: Array<{ count: number }>
  _count?: {
    user_cards: number
  }
}

interface UserTableProps {
  users: User[]
  currentPage: number
  totalPages: number
}

export default function UserTable({ users, currentPage, totalPages }: UserTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getTotalPoints = (user: User) => {
    if (!user.user_points?.[0]) return 0
    return user.user_points[0].free_points + user.user_points[0].paid_points
  }
  
  const getCardCount = (user: User) => {
    return user._count?.user_cards || 0
  }
  
  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>ユーザー情報</th>
              <th>登録日</th>
              <th>ポイント残高</th>
              <th>所持カード</th>
              <th>アクション</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{width: '32px', height: '32px', fontSize: '14px'}}>
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="fw-medium">{user.email}</div>
                      <small className="text-muted">ID: {user.id.slice(0, 8)}...</small>
                    </div>
                  </div>
                </td>
                <td>
                  <small>{formatDate(user.created_at)}</small>
                </td>
                <td>
                  <div>
                    <div className="fw-bold">{getTotalPoints(user).toLocaleString()}pt</div>
                    {user.user_points?.[0] && (
                      <small className="text-muted">
                        無料: {user.user_points[0].free_points.toLocaleString()} / 
                        有料: {user.user_points[0].paid_points.toLocaleString()}
                      </small>
                    )}
                  </div>
                </td>
                <td>
                  <span className="badge bg-primary">
                    {getCardCount(user)}枚
                  </span>
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="btn btn-outline-primary"
                    >
                      詳細
                    </Link>
                    <Link
                      href={`/admin/users/${user.id}/points`}
                      className="btn btn-outline-success"
                    >
                      ポイント
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* ページネーション */}
      <div className="card-footer">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted">
              ページ <span className="fw-medium">{currentPage}</span> / <span className="fw-medium">{totalPages}</span>
            </small>
          </div>
          <nav aria-label="Page navigation">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                <Link
                  href={`/admin/users?page=${currentPage - 1}`}
                  className="page-link"
                >
                  <ChevronLeftIcon style={{width: '16px', height: '16px'}} />
                </Link>
              </li>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = currentPage - 2 + i;
                if (pageNum < 1 || pageNum > totalPages) return null;
                
                return (
                  <li key={pageNum} className={`page-item ${pageNum === currentPage ? 'active' : ''}`}>
                    <Link
                      href={`/admin/users?page=${pageNum}`}
                      className="page-link"
                    >
                      {pageNum}
                    </Link>
                  </li>
                );
              })}
              
              <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                <Link
                  href={`/admin/users?page=${currentPage + 1}`}
                  className="page-link"
                >
                  <ChevronRightIcon style={{width: '16px', height: '16px'}} />
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}