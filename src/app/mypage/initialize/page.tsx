'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function InitializeUserPage() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const initializeUser = async () => {
    if (!user) {
      toast.error('ログインしてください')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/user/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (response.ok) {
        toast.success('ユーザーデータを初期化しました！')
        setTimeout(() => {
          router.push('/mypage')
        }, 1000)
      } else {
        const error = await response.json()
        toast.error(error.error || '初期化に失敗しました')
      }
    } catch (error) {
      console.error('Initialize error:', error)
      toast.error('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">ユーザーデータ初期化</h1>
        
        {user ? (
          <div>
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-gray-400 text-sm">ログインユーザー</p>
              <p className="text-white font-bold">{user.email}</p>
              <p className="text-gray-400 text-xs mt-1">ID: {user.id}</p>
            </div>

            <div className="alert alert-info bg-blue-900/50 border border-blue-800 text-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm">このボタンを押すと：</p>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>初回ボーナス1000ポイントを付与</li>
                <li>ユーザーデータベースを初期化</li>
                <li>マイページが利用可能になります</li>
              </ul>
            </div>

            <button
              onClick={initializeUser}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? '初期化中...' : 'ユーザーデータを初期化'}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-400 mb-4">ログインが必要です</p>
            <a href="/auth/login" className="text-[#FF0033] hover:text-[#FF6B6B]">
              ログインページへ
            </a>
          </div>
        )}
      </div>
    </div>
  )
}