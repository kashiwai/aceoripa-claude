import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 環境変数が設定されていない場合はスキップ
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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

  const { data: { user } } = await supabase.auth.getUser()

  // Admin路由保護
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // ログインページとデモページは除外
    if (request.nextUrl.pathname === '/admin/login' || 
        request.nextUrl.pathname === '/admin/login/demo' ||
        request.nextUrl.pathname.startsWith('/admin/login/')) {
      return response
    }

    // デモモードチェック（ブラウザのみ）
    const isDemoMode = request.cookies.get('adminDemo')?.value === 'true'
    if (isDemoMode) {
      return response
    }

    // 未認証の場合はログインページへ
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Admin権限チェック
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@aceoripa.com'
    if (user.email !== adminEmail) {
      // 権限がない場合はトップページへ
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 決済ページの保護
  if (request.nextUrl.pathname.startsWith('/payment')) {
    if (!user) {
      // 未認証の場合はログインページへ
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}