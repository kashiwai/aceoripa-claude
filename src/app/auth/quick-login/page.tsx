'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'react-hot-toast'

export default function QuickLoginPage() {
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkCurrentUser()
  }, [])

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserInfo(user)
      toast.success('すでにログイン済みです')
    }
  }

  const quickLogin = async () => {
    setLoading(true)
    try {
      // テストユーザーでログイン（実際のメールアドレス形式）
      const testEmail = 'test.user.' + Date.now() + '@example.com'
      const testPassword = 'TestPass123!'
      
      // まず既存のテストユーザーでログインを試みる
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: testPassword,
      })

      if (error) {
        // エラーの場合、新規作成を試みる
        if (error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
              data: {
                username: 'デモユーザー',
              },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (signUpError) {
            throw signUpError
          }

          toast.success('デモユーザーを作成しました。メール確認後にログインしてください。')
          return
        }
        throw error
      }

      if (data.user) {
        setUserInfo(data.user)
        toast.success('ログイン成功！決済テストページへ移動します...')
        setTimeout(() => {
          router.push('/payment/test')
        }, 1500)
      }
    } catch (error: any) {
      toast.error(`エラー: ${error.message}`)
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUserInfo(null)
      toast.success('ログアウトしました')
    } catch (error: any) {
      toast.error('ログアウトエラー')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          クイックログイン
        </h1>
        <p className="text-gray-600 text-center mb-6">
          ワンクリックで決済テストページへ
        </p>

        {userInfo ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">✅ ログイン済み</p>
              <p className="text-sm text-gray-600 mt-1">
                Email: {userInfo.email}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ID: {userInfo.id}
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => router.push('/payment/test')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                決済テストページへ →
              </button>
              
              <button
                onClick={logout}
                disabled={loading}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                ログアウト
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={quickLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-bold text-lg shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  ログイン中...
                </span>
              ) : (
                '🚀 デモユーザーでログイン'
              )}
            </button>

            <div className="text-center text-sm text-gray-500">
              または
            </div>

            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              通常のログインページへ
            </button>
          </div>
        )}

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>📝 メモ:</strong> このページはテスト用です。
            テストユーザーで自動ログインするか、新規テストユーザーを作成します。
          </p>
        </div>
      </div>
    </div>
  )
}