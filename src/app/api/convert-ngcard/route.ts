import { NextResponse } from 'next/server'

export async function GET() {
  // Sharp依存を削除 - 本番環境では画像変換不要
  return NextResponse.json({ 
    message: 'Image conversion is disabled in production',
    info: 'Please use pre-converted images'
  }, { status: 503 })
}