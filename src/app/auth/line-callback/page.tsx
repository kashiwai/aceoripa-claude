'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'react-hot-toast'

export default function LineCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  
  useEffect(() => {
    const handleLineCallback = async () => {
      if (!code) {
        router.push('/auth/login?error=no_code')
        return
      }
      
      try {
        // バックエンドAPIを呼び出してLINE認証を完了
        const response = await fetch('/api/auth/line', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })
        
        const data = await response.json()
        
        if (data.success && data.session) {
          // Supabaseクライアントでセッションを設定
          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
          
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          })
          
          toast.success('ログインしました！')
          router.push('/mypage')
        } else {
          throw new Error(data.error || 'ログインに失敗しました')
        }
      } catch (error: any) {
        console.error('LINE callback error:', error)
        toast.error(error.message || 'ログインに失敗しました')
        router.push('/auth/login?error=line_failed')
      }
    }
    
    handleLineCallback()
  }, [code, router])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 border-8 border-[#00B900] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-2xl font-bold text-[#00B900]">LINE認証処理中...</p>
        <p className="text-gray-400 mt-2">少々お待ちください</p>
      </div>
    </div>
  )
}