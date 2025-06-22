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
    // 一時的に全てのadminページへのアクセスを許可（デモ用）
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}