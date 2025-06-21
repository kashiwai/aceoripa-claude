import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // デモページは常に許可
  if (request.nextUrl.pathname === '/admin/login/demo' ||
      request.nextUrl.pathname.startsWith('/admin/demo')) {
    return NextResponse.next()
  }

  // /admin/* へのアクセス制御
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // ログインページは許可
    if (request.nextUrl.pathname.startsWith('/admin/login')) {
      return NextResponse.next()
    }

    // それ以外はログインページへリダイレクト
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}