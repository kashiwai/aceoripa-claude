import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(req: NextRequest) {
  try {
    const { 
      gachaTitle, 
      ssCards = [], 
      sCards = [], 
      targetProfit = 30, // 目標利益率 (%)
      pullPrice = 3000, // 1回あたりの価格
      cardCount = 5, // 1回で引けるカード数
    } = await req.json()

    const supabase = createAdminClient()

    // 全カードデータを取得
    const { data: allCards, error: cardsError } = await supabase
      .from('pokemon_cards')
      .select('*')
      .order('market_price', { ascending: false })

    if (cardsError) throw cardsError

    // SS/Sカードを除外したリストを作成
    const selectedSSIds = ssCards.map((c: any) => c.id)
    const selectedSIds = sCards.map((c: any) => c.id)
    const availableCards = allCards.filter(
      card => !selectedSSIds.includes(card.id) && !selectedSIds.includes(card.id)
    )

    // レアリティ別にカードを分類
    const cardsByRarity = {
      A: availableCards.filter(c => c.rarity === 'A'),
      B: availableCards.filter(c => c.rarity === 'B'),
      C: availableCards.filter(c => c.rarity === 'C')
    }

    // AIプロンプトの作成
    const prompt = `
ガチャタイトル: ${gachaTitle}

以下の条件でポケモンカードガチャのA, B, C賞のカードを選定してください：

【現在の設定】
- SS賞: ${ssCards.map((c: any) => c.card_name).join(', ')} (${ssCards.length}枚)
- S賞: ${sCards.map((c: any) => c.card_name).join(', ')} (${sCards.length}枚)
- 1回の価格: ${pullPrice}円
- 1回で引けるカード数: ${cardCount}枚
- 目標利益率: ${targetProfit}%

【選定可能なカード数】
- A賞候補: ${cardsByRarity.A.length}枚
- B賞候補: ${cardsByRarity.B.length}枚  
- C賞候補: ${cardsByRarity.C.length}枚

【選定基準】
1. ガチャタイトルに関連性の高いカードを優先
2. 人気キャラクターをバランスよく配置
3. 各レアリティで10-20枚程度選定
4. 利益率を確保しつつ、ユーザーに魅力的な内容にする

【期待される出力形式】
{
  "a_cards": ["カード名1", "カード名2", ...],
  "b_cards": ["カード名1", "カード名2", ...],
  "c_cards": ["カード名1", "カード名2", ...],
  "reasoning": "選定理由の説明"
}

JSONのみを出力してください。
`

    // OpenAI APIを呼び出し
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "あなたはポケモンカードガチャの企画専門家です。収益性とユーザー満足度のバランスを考慮して最適なカード選定を行います。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    const aiResponse = JSON.parse(completion.choices[0].message.content || '{}')

    // 選定されたカード名からカードデータを取得
    const getCardsByNames = async (names: string[], rarity: string) => {
      const cards = []
      for (const name of names) {
        const card = cardsByRarity[rarity as keyof typeof cardsByRarity].find(
          c => c.card_name.includes(name) || name.includes(c.card_name)
        )
        if (card) cards.push(card)
      }
      return cards
    }

    const selectedACards = await getCardsByNames(aiResponse.a_cards || [], 'A')
    const selectedBCards = await getCardsByNames(aiResponse.b_cards || [], 'B')
    const selectedCCards = await getCardsByNames(aiResponse.c_cards || [], 'C')

    // 収支計算
    const calculateProfitability = () => {
      // レアリティ別の排出率（標準）
      const rates = {
        SS: 0.005, // 0.5%
        S: 0.02,   // 2%
        A: 0.10,   // 10%
        B: 0.375,  // 37.5%
        C: 0.50    // 50%
      }

      // 期待コストの計算
      const expectedCost = 
        (ssCards.reduce((sum: number, c: any) => sum + (c.market_price || 0), 0) / Math.max(ssCards.length, 1)) * rates.SS +
        (sCards.reduce((sum: number, c: any) => sum + (c.market_price || 0), 0) / Math.max(sCards.length, 1)) * rates.S +
        (selectedACards.reduce((sum, c) => sum + (c.market_price || 0), 0) / Math.max(selectedACards.length, 1)) * rates.A +
        (selectedBCards.reduce((sum, c) => sum + (c.market_price || 0), 0) / Math.max(selectedBCards.length, 1)) * rates.B +
        (selectedCCards.reduce((sum, c) => sum + (c.market_price || 0), 0) / Math.max(selectedCCards.length, 1)) * rates.C

      const profitPerPull = pullPrice - (expectedCost * cardCount)
      const profitRate = (profitPerPull / pullPrice) * 100

      return {
        expectedCost: expectedCost * cardCount,
        profitPerPull,
        profitRate,
        breakEvenPulls: Math.ceil(pullPrice / profitPerPull)
      }
    }

    const profitability = calculateProfitability()

    // 結果をまとめる
    const result = {
      gachaTitle,
      selectedCards: {
        SS: ssCards,
        S: sCards,
        A: selectedACards,
        B: selectedBCards,
        C: selectedCCards
      },
      cardCounts: {
        SS: ssCards.length,
        S: sCards.length,
        A: selectedACards.length,
        B: selectedBCards.length,
        C: selectedCCards.length
      },
      profitability,
      aiReasoning: aiResponse.reasoning,
      recommendations: {
        shouldLaunch: profitability.profitRate >= targetProfit,
        message: profitability.profitRate >= targetProfit 
          ? `目標利益率${targetProfit}%を達成しています（${profitability.profitRate.toFixed(1)}%）`
          : `利益率が目標を下回っています（${profitability.profitRate.toFixed(1)}% < ${targetProfit}%）。高額カードを減らすか、価格を上げることを検討してください。`
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Auto simulation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Simulation failed' },
      { status: 500 }
    )
  }
}