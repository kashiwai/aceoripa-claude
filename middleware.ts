import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Basic認証の設定
  const basicAuth = request.headers.get('authorization')
  const url = request.nextUrl

  // 開発環境では認証をスキップ
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  // Basic認証が必要
  if (!basicAuth) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"'
      }
    })
  }

  const authValue = basicAuth.split(' ')[1]
  const [user, password] = atob(authValue).split(':')

  // 認証情報の確認（一時的に固定値）
  const validUser = 'aceoripa'
  const validPassword = 'preview2024'

  if (user !== validUser || password !== validPassword) {
    return new NextResponse('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"'
      }
    })
  }

  return NextResponse.next()
}

// APIルートは除外（必要に応じて）
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}