import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// 環境変数の確認
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

// 管理者用Supabaseクライアント（サービスロールキーを使用）
export const createAdminClient = () => {
  if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set!')
    console.error('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
    console.error('You can find this in your Supabase dashboard under Settings > API > Service role key')
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }

  // Service Roleキーの形式を簡単にチェック
  if (!supabaseServiceKey.startsWith('eyJ')) {
    console.error('SUPABASE_SERVICE_ROLE_KEY appears to be invalid')
    console.error('Make sure you copied the entire key from Supabase dashboard')
    throw new Error('Invalid SUPABASE_SERVICE_ROLE_KEY format')
  }

  console.log('Creating admin client with service role key')
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// 認証チェック付き管理者クライアント取得
export const getAuthenticatedAdminClient = async () => {
  const supabase = createRouteHandlerClient({ cookies })
  
  // 現在のユーザーを取得
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.error('Authentication error:', error)
    throw new Error('Unauthorized')
  }
  
  // ここで管理者権限のチェックを追加することも可能
  // 例: user.email が管理者メールアドレスのリストに含まれているか確認
  
  return {
    user,
    adminClient: createAdminClient()
  }
}

// 管理者権限不要のクライアント（インポート用）
export const getServiceClient = () => {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}