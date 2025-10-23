'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'react-hot-toast'

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loginAsAdmin = async () => {
    setLoading(true)
    try {
      // 管理者アカウントでログイン（.env.localに定義済み）
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@aceoripa.com',
        password: 'AceoripaAdmin2024!',
      })

      if (error) {
        toast.error(`ログインエラー: ${error.message}`)
        console.error('Admin login error:', error)
        return
      }

      if (data.user) {
        toast.success('管理者としてログインしました')
        router.push('/payment/test')
      }
    } catch (error: any) {
      toast.error('ログインに失敗しました')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTestUser = async () => {
    setLoading(true)
    try {
      const timestamp = Date.now()
      const testEmail = `testuser${timestamp}@aceoripa.com`
      const testPassword = 'Test1234!'
      
      // テストユーザーを作成
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            username: `テストユーザー${timestamp}`,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        toast.error(`ユーザー作成エラー: ${signUpError.message}`)
        return
      }

      if (signUpData.user) {
        // 作成後、すぐにログイン
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        })

        if (loginError) {
          toast.error(`ログインエラー: ${loginError.message}`)
          return
        }

        if (loginData.user) {
          toast.success(`テストユーザー作成・ログイン成功: ${testEmail}`)
          router.push('/payment/test')
        }
      }
    } catch (error: any) {
      toast.error('テストユーザー作成に失敗しました')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          管理者ログイン
        </h1>
        <p className="text-gray-400 text-center mb-8">
          決済テスト用アクセス
        </p>

        <div className="space-y-4">
          <button
            onClick={loginAsAdmin}
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 px-4 rounded-lg hover:bg-red-700 transition font-bold text-lg shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                処理中...
              </span>
            ) : (
              '🔐 管理者でログイン'
            )}
          </button>

          <button
            onClick={createTestUser}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg hover:bg-blue-700 transition font-bold text-lg shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                作成中...
              </span>
            ) : (
              '👤 新規テストユーザー作成'
            )}
          </button>

          <div className="text-center">
            <a 
              href="/auth/login"
              className="text-gray-400 hover:text-white transition text-sm"
            >
              通常のログインページへ →
            </a>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-300">
            <strong>⚠️ 注意:</strong> このページは開発テスト専用です。
            本番環境では使用しないでください。
          </p>
        </div>
      </div>
    </div>
  )
}