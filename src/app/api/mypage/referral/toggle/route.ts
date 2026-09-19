import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

// DBアクセスはサービスロールキーで実行（RLSに縛られず紹介コードを更新するため）
const supabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    // 認証チェック（ログイン中のSupabaseセッションを確認）
    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    const { isActive } = await request.json()

    // 紹介コードのステータスを更新
    const { error } = await supabase
      .from('referral_codes')
      .update({ is_active: isActive })
      .eq('user_id', userId)

    if (error) {
      console.error('紹介コードステータス更新エラー:', error)
      return NextResponse.json(
        { error: 'ステータスの更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}