'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function DebugCallbackPage() {
  const searchParams = useSearchParams()
  const [debugInfo, setDebugInfo] = useState<any>({})
  
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const analyzeCallback = async () => {
      // URLパラメータを全て取得
      const params: any = {}
      searchParams.forEach((value, key) => {
        params[key] = value
      })

      // ハッシュフラグメントも確認
      const hashParams: any = {}
      if (window.location.hash) {
        const hash = window.location.hash.substring(1)
        const hashPairs = hash.split('&')
        hashPairs.forEach(pair => {
          const [key, value] = pair.split('=')
          if (key) hashParams[key] = decodeURIComponent(value || '')
        })
      }

      // 現在のセッション状態
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // 現在のユーザー状態
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      setDebugInfo({
        urlParams: params,
        hashParams: hashParams,
        fullUrl: window.location.href,
        session: session,
        sessionError: sessionError,
        user: user,
        userError: userError,
        timestamp: new Date().toISOString()
      })

      // コードがある場合の処理を試す
      if (params.code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(params.code)
          setDebugInfo(prev => ({
            ...prev,
            exchangeResult: { data, error }
          }))
        } catch (e: any) {
          setDebugInfo(prev => ({
            ...prev,
            exchangeError: e.message
          }))
        }
      }
    }

    analyzeCallback()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">認証コールバックデバッグ</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">URLパラメータ</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(debugInfo.urlParams, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">ハッシュパラメータ</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(debugInfo.hashParams, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">セッション状態</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
              {JSON.stringify({
                session: debugInfo.session,
                error: debugInfo.sessionError
              }, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Exchange結果</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(debugInfo.exchangeResult || debugInfo.exchangeError, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">完全なURL</h2>
            <p className="text-sm break-all">{debugInfo.fullUrl}</p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <a 
            href="/auth/login" 
            className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            ログインページへ
          </a>
          <a 
            href="/" 
            className="px-6 py-2 bg-gray-600 rounded hover:bg-gray-700"
          >
            ホームへ
          </a>
        </div>
      </div>
    </div>
  )
}