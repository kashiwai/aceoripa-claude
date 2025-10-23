import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const LINE_CHANNEL_ID = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || process.env.LINE_CHANNEL_ID!
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!
const LINE_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/line/callback`

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action')
  
  if (action === 'login') {
    // LINE認証ページへリダイレクト
    const state = Math.random().toString(36).substring(7)
    const nonce = Math.random().toString(36).substring(7)
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: LINE_CHANNEL_ID,
      redirect_uri: LINE_REDIRECT_URI,
      state: state,
      scope: 'profile openid email',
      nonce: nonce,
    })
    
    return NextResponse.redirect(
      `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`
    )
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// コールバック処理
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 })
    }
    
    // LINEのアクセストークンを取得
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: LINE_REDIRECT_URI,
        client_id: LINE_CHANNEL_ID,
        client_secret: LINE_CHANNEL_SECRET,
      }),
    })
    
    const tokenData = await tokenResponse.json()
    
    if (!tokenData.access_token) {
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 400 })
    }
    
    // ユーザー情報を取得
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })
    
    const profileData = await profileResponse.json()
    
    // Supabaseにユーザーを作成または更新
    const supabase = await createClient()
    
    // メールアドレスがない場合はLINE IDベースで生成
    const email = tokenData.email || `${profileData.userId}@line.local`
    
    // 既存ユーザーをチェック
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('provider_id', profileData.userId)
      .eq('provider', 'line')
      .single()
    
    if (existingUser) {
      // 既存ユーザーでログイン
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: existingUser.email,
        password: profileData.userId, // LINE IDをパスワードとして使用
      })
      
      if (error) throw error
      
      return NextResponse.json({ 
        success: true, 
        session,
        user: existingUser
      })
    } else {
      // 新規ユーザー作成
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: profileData.userId, // LINE IDをパスワードとして使用
        options: {
          data: {
            name: profileData.displayName,
            avatar_url: profileData.pictureUrl,
            provider: 'line',
            provider_id: profileData.userId,
          }
        }
      })
      
      if (authError) throw authError
      
      // usersテーブルにも追加
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user!.id,
          email: email,
          name: profileData.displayName,
          avatar_url: profileData.pictureUrl,
          provider: 'line',
          provider_id: profileData.userId,
        })
      
      if (userError) throw userError
      
      return NextResponse.json({ 
        success: true,
        session: authData.session,
        user: authData.user
      })
    }
  } catch (error: any) {
    console.error('LINE auth error:', error)
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    )
  }
}