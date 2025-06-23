import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  
  if (error) {
    // エラーがある場合はログインページへ
    return NextResponse.redirect(
      new URL('/auth/login?error=line_auth_failed', request.url)
    )
  }
  
  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/login?error=no_code', request.url)
    )
  }
  
  // コードを使用してクライアント側で処理するページへリダイレクト
  return NextResponse.redirect(
    new URL(`/auth/line-callback?code=${code}&state=${state}`, request.url)
  )
}