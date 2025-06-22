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
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ユーザー情報
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                登録日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ポイント残高
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                所持カード
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(user.created_at)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="font-semibold">{getTotalPoints(user).toLocaleString()}pt</div>
                    {user.user_points?.[0] && (
                      <div className="text-xs text-gray-500">
                        無料: {user.user_points[0].free_points.toLocaleString()} / 
                        有料: {user.user_points[0].paid_points.toLocaleString()}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getCardCount(user)}枚
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      詳細
                    </Link>
                    <Link
                      href={`/admin/users/${user.id}/points`}
                      className="text-green-600 hover:text-green-900"
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
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <Link
            href={`/admin/users?page=${currentPage - 1}`}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
              currentPage <= 1 ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            前へ
          </Link>
          <Link
            href={`/admin/users?page=${currentPage + 1}`}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
              currentPage >= totalPages ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            次へ
          </Link>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              ページ <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Link
                href={`/admin/users?page=${currentPage - 1}`}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                  currentPage <= 1 ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </Link>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = currentPage - 2 + i;
                if (pageNum < 1 || pageNum > totalPages) return null;
                
                return (
                  <Link
                    key={pageNum}
                    href={`/admin/users?page=${pageNum}`}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pageNum === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
              
              <Link
                href={`/admin/users?page=${currentPage + 1}`}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                  currentPage >= totalPages ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}