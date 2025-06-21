'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminDemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    // デモモードチェック（CookieとsessionStorageの両方をチェック）
    const isDemo = sessionStorage.getItem('adminDemo')
    const hasDemoCookie = document.cookie.includes('adminDemo=true')
    
    if (!isDemo && !hasDemoCookie) {
      router.push('/admin/login/demo')
    }
  }, [router])

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <p className="font-bold">デモモード</p>
            <p className="text-sm">データの保存はできません</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}