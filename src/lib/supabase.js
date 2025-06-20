// lib/supabase.js - Supabaseクライアント完全実装
import { createClient } from '@supabase/supabase-js'

// 環境変数確認
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables - using local defaults')
}

// クライアントサイド用（認証付き）
export const supabase = createClient(
  supabaseUrl || 'http://127.0.0.1:54321',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// サーバーサイド用（Service Role Key）
export const supabaseAdmin = supabaseServiceKey ? createClient(
  supabaseUrl || 'http://127.0.0.1:54321',
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null

// 認証ヘルパー関数
export const auth = {
  // ユーザー登録
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      
      if (error) throw error
      
      // 新規ユーザーに1000PT付与
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email: data.user.email,
          points: 1000,
          rank: 'BRONZE'
        })
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // ログイン
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // ログアウト
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  // 現在のユーザー取得
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      return { user: null, error }
    }
  },

  // ユーザープロフィール作成
  async createUserProfile(userId, profileData) {
    try {
      if (!supabaseAdmin) {
        console.error('Service role key not configured')
        return { data: null, error: new Error('Admin client not available') }
      }

      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// データベースヘルパー関数
export const db = {
  // ユーザー情報取得
  async getUser(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // ポイント更新
  async updateUserPoints(userId, points) {
    try {
      const adminClient = supabaseAdmin || supabase
      const { data, error } = await adminClient
        .from('users')
        .update({ 
          points,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // ガチャアイテム取得
  async getGachaItems(gachaId) {
    try {
      const { data, error } = await supabase
        .from('gacha_items')
        .select(`
          *,
          cards (*)
        `)
        .eq('gacha_id', gachaId)
        .eq('is_active', true)
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // ガチャ履歴保存
  async saveGachaHistory(userId, gachaData) {
    try {
      const adminClient = supabaseAdmin || supabase
      const { data, error } = await adminClient
        .from('user_gacha_history')
        .insert({
          user_id: userId,
          gacha_id: gachaData.gachaId,
          card_id: gachaData.cardId,
          rarity: gachaData.rarity,
          points_used: gachaData.pointsUsed,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // ポイント取引履歴保存
  async savePointTransaction(userId, transactionData) {
    try {
      const adminClient = supabaseAdmin || supabase
      const { data, error } = await adminClient
        .from('point_transactions')
        .insert({
          user_id: userId,
          type: transactionData.type,
          amount: transactionData.amount,
          description: transactionData.description,
          square_payment_id: transactionData.squarePaymentId || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// リアルタイム機能
export const realtime = {
  // ユーザーポイント変更監視
  subscribeToUserPoints(userId, callback) {
    return supabase
      .channel(`user_points_${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  // 新しいガチャ結果監視
  subscribeToGachaResults(userId, callback) {
    return supabase
      .channel(`gacha_results_${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_gacha_history',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  }
}

// エラーハンドリングユーティリティ
export const handleSupabaseError = (error) => {
  console.error('Supabase Error:', error)
  
  // 一般的なエラーメッセージの翻訳
  const errorMessages = {
    'Invalid login credentials': 'ログイン情報が正しくありません',
    'User already registered': 'このメールアドレスは既に登録されています',
    'Email not confirmed': 'メールアドレスの確認が完了していません',
    'Too many requests': 'リクエストが多すぎます。しばらく待ってから再試行してください'
  }
  
  return errorMessages[error.message] || error.message || '予期しないエラーが発生しました'
}

// 接続テスト
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1)
    
    if (error) throw error
    
    console.log('✅ Supabase接続成功')
    return true
  } catch (error) {
    console.error('❌ Supabase接続失敗:', error)
    return false
  }
}

export default supabase