'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  useEffect(() => {
    // ポイント管理ページにリダイレクト
    router.replace(`/admin/users/${userId}/points`)
  }, [userId, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">リダイレクト中...</p>
      </div>
    </div>
  )
}
