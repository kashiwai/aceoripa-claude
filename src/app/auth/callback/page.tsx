'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'react-hot-toast'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleCallback = async () => {
      try {
        // URLパラメータからエラーをチェック
        const searchParams = new URLSearchParams(window.location.search)
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (error) {
          console.error('OAuth error:', error, errorDescription)
          setError(errorDescription || error)
          toast.error('ログインに失敗しました: ' + (errorDescription || error))
          setTimeout(() => router.push('/auth/login'), 3000)
          return
        }

        // URLのハッシュフラグメントからトークンを取得（Implicit Flow）
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        // URLパラメータからコードを取得（PKCE Flow）
        const code = searchParams.get('code')
        
        if (accessToken || code) {
          // console.log('Callback params:', { accessToken: !!accessToken, code: !!code })
          
          // codeがある場合のみexchangeCodeForSessionを使用
          if (code && !accessToken) {
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            
            if (exchangeError) {
              console.error('Exchange error:', exchangeError)
              setError('認証トークンの交換に失敗しました: ' + exchangeError.message)
              setTimeout(() => router.push('/auth/login'), 3000)
              return
            }
          }
          
          // セッションを確認
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            console.error('Session error:', sessionError)
            setError('セッションの取得に失敗しました')
            setTimeout(() => router.push('/auth/login'), 3000)
            return
          }
          
          if (session) {
            // 新規ユーザーかどうかチェック
            const isNewUser = session.user.created_at === session.user.last_sign_in_at
            
            if (isNewUser) {
              // 新規ユーザーの場合、追加の初期化処理
              await initializeNewUser(session.user.id)
              toast.success('アカウントを作成しました！')
            } else {
              toast.success('ログインしました！')
            }
            
            // マイページへリダイレクト
            router.push('/mypage')
          } else {
            setError('セッションが見つかりません')
            setTimeout(() => router.push('/auth/login'), 3000)
          }
        } else {
          // トークンもコードもない場合
          setError('認証情報が見つかりません')
          setTimeout(() => router.push('/auth/login'), 3000)
        }
      } catch (error) {
        console.error('Callback error:', error)
        setError('予期しないエラーが発生しました')
        setTimeout(() => router.push('/auth/login'), 3000)
      }
    }

    // 新規ユーザーの初期化処理
    const initializeNewUser = async (userId: string) => {
      try {
        // ユーザーポイントの初期化
        await fetch('/api/user/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })
      } catch (error) {
        console.error('User initialization error:', error)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-red-500">認証エラー</p>
            <p className="text-gray-400 mt-2">{error}</p>
            <p className="text-gray-500 mt-4 text-sm">ログインページに戻ります...</p>
          </>
        ) : (
          <>
            <div className="w-32 h-32 border-8 border-[#FF0033] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-2xl font-bold text-[#FF0033]">認証処理中...</p>
            <p className="text-gray-400 mt-2">少々お待ちください</p>
          </>
        )}
      </div>
    </div>
  )
}