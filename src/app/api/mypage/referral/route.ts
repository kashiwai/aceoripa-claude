import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    // 認証チェック
    const cookieStore = cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ユーザーの紹介コードを取得または生成
    const { data: userCode, error: codeError } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', userId)
      .single()

    let referralCode = userCode

    if (!userCode || codeError) {
      // 紹介コードが存在しない場合は生成
      const { data: newCode } = await supabase.rpc('generate_referral_code', {
        user_id_param: userId
      })

      const { data: createdCode } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', userId)
        .single()

      referralCode = createdCode
    }

    // 紹介実績を取得
    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select(`
        *,
        referred_id:users!referrals_referred_id_fkey(email)
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })

    if (referralsError) {
      console.error('紹介実績取得エラー:', referralsError)
    }

    // 統計情報を計算
    const totalReferrals = referrals?.length || 0
    const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0
    const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0
    const totalPointsEarned = referrals?.reduce((sum, r) => sum + (r.referrer_points_awarded || 0), 0) || 0

    // 紹介URLの生成
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aceoripa.com'
    const referralUrl = `${baseUrl}/auth/register?ref=${referralCode.code}`

    // レスポンスデータの整形
    const responseData = {
      code: referralCode.code,
      isActive: referralCode.is_active,
      referralUrl,
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      totalPointsEarned,
      referrals: referrals?.map(r => ({
        id: r.id,
        referredEmail: r.referred_id?.email || 'ユーザー',
        registeredAt: r.registered_at,
        firstPaymentAt: r.first_payment_at,
        status: r.status,
        pointsAwarded: r.referrer_points_awarded || 0
      })) || []
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('紹介データ取得エラー:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}