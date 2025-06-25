import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // デモページは常に許可
  if (request.nextUrl.pathname === '/admin/login/demo' ||
      request.nextUrl.pathname.startsWith('/admin/demo')) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // セッションをリフレッシュ
  await supabase.auth.getSession()

  // /admin/* へのアクセス制御
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // ログインページは除外
    if (request.nextUrl.pathname === '/admin/login') {
      // 既にログイン済みの場合は/adminへリダイレクト
      const adminSession = request.cookies.get('admin_session')
      if (adminSession) {
        try {
          const session = JSON.parse(adminSession.value)
          const loginTime = new Date(session.loginTime)
          const now = new Date()
          const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)
          
          if (hoursDiff < 24) {
            return NextResponse.redirect(new URL('/admin', request.url))
          }
        } catch (e) {}
      }
      return response
    }
    
    // 管理者セッションをチェック
    const adminSession = request.cookies.get('admin_session')
    
    if (!adminSession) {
      // ログインページへリダイレクト
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    try {
      // セッションの有効性をチェック（24時間）
      const session = JSON.parse(adminSession.value)
      const loginTime = new Date(session.loginTime)
      const now = new Date()
      const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)
      
      if (hoursDiff > 24) {
        // セッションが期限切れ
        response.cookies.delete('admin_session')
        const loginUrl = new URL('/admin/login', request.url)
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      // 無効なセッション
      response.cookies.delete('admin_session')
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}