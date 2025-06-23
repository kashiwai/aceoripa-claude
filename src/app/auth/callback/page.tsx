'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallbackPage() {
  const router = useRouter()
  
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleCallback = async () => {
      try {
        // URLのハッシュフラグメントからトークンを取得
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        
        if (accessToken) {
          // セッションを確認
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            // ログイン成功
            router.push('/mypage')
          } else {
            // エラー
            router.push('/auth/login?error=callback_failed')
          }
        } else {
          // トークンがない場合
          router.push('/auth/login?error=no_token')
        }
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/auth/login?error=unexpected')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 border-8 border-[#FF0033] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-2xl font-bold text-[#FF0033]">認証処理中...</p>
        <p className="text-gray-400 mt-2">少々お待ちください</p>
      </div>
    </div>
  )
}