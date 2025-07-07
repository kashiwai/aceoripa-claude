import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { gachaData } = await request.json()
    
    // 管理者権限チェック（Cookieベース）
    const adminSessionCookie = request.cookies.get('admin_session')
    if (!adminSessionCookie) {
      return NextResponse.json({
        success: false,
        message: '管理者認証が必要です'
      }, { status: 401 })
    }
    
    try {
      const adminSession = JSON.parse(adminSessionCookie.value)
      if (!adminSession.id || !adminSession.username) {
        return NextResponse.json({
          success: false,
          message: '無効なセッションです'
        }, { status: 401 })
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: '無効なセッションです'
      }, { status: 401 })
    }

    // ガチャデータの詳細を取得
    const { data: product, error: productError } = await supabase
      .from('gacha_products')
      .select(`
        *,
        gacha_pools (
          id,
          drop_rate,
          cards (
            name,
            rarity,
            market_price
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (productError || !product) {
      return NextResponse.json({
        success: false,
        message: 'ガチャデータが見つかりません'
      }, { status: 404 })
    }

    // 売上データを取得
    const { data: salesData } = await supabase
      .from('gacha_results')
      .select('created_at, total_price')
      .eq('gacha_product_id', params.id)
      .order('created_at', { ascending: false })
      .limit(100)

    // AIに最適化提案を求める
    const prompt = `
ガチャ商品の最適化提案をしてください。

商品情報:
- 名前: ${product.name}
- 価格: ${product.single_price}円
- 説明: ${product.description}
- アクティブ: ${product.is_active}
- 販売開始日: ${product.start_date || 'なし'}
- 販売終了日: ${product.end_date || 'なし'}

カード情報:
${product.gacha_pools?.map((pool: any) => 
  `- ${pool.cards?.name || 'Unknown'} (${pool.cards?.rarity || 'Unknown'}) - 出現率: ${pool.drop_rate}% - 市場価格: ${pool.cards?.market_price || 0}円`
).join('\n') || 'カード情報なし'}

最近の売上:
${salesData?.length ? `過去${salesData.length}回の売上データあり` : '売上データなし'}

以下の観点から最適化提案をJSON形式で回答してください:
{
  "priceAdjustment": 価格調整額（プラスマイナス），
  "packCountAdjustment": パック数調整提案，
  "rarityAdjustment": "レアリティ調整提案",
  "marketingTips": ["マーケティング提案1", "マーケティング提案2"],
  "reasoning": "提案の根拠"
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "あなたはガチャゲームの収益最適化エキスパートです。データを分析して具体的な改善提案を行ってください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content
    
    if (!aiResponse) {
      return NextResponse.json({
        success: false,
        message: 'AI応答を取得できませんでした'
      })
    }

    // JSON形式の応答をパース
    let suggestions
    try {
      suggestions = JSON.parse(aiResponse)
    } catch (parseError) {
      // JSONパースに失敗した場合は、テキストをそのまま返す
      suggestions = {
        reasoning: aiResponse
      }
    }

    return NextResponse.json({
      success: true,
      message: 'AI最適化が完了しました',
      suggestions: suggestions
    })

  } catch (error: any) {
    console.error('AI optimization error:', error)
    return NextResponse.json({
      success: false,
      message: error.message || 'AI最適化に失敗しました'
    }, { status: 500 })
  }
}