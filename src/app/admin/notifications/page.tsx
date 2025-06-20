'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BannerNotificationManager } from '@/components/admin/BannerNotificationManager'

export default function AdminNotificationsPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      // This would typically check if the user is an admin
      // For now, we'll allow access for demo purposes
      setIsAdmin(true)
    } catch (error) {
      console.error('Failed to check admin access:', error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">アクセス権限がありません</h1>
          <p className="text-gray-600 mb-4">この機能は管理者のみ利用できます</p>
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← トップページに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-blue-600 hover:text-blue-800 mr-4">
                ← トップに戻る
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">管理者パネル</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-700 hover:text-gray-900">
                ダッシュボード
              </Link>
              <Link href="/admin/notifications" className="text-blue-600 font-medium">
                通知管理
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-8">
        <BannerNotificationManager />
      </main>
    </div>
  )
}