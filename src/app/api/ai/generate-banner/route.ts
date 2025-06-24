import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// バナー生成用プロンプトテンプレート
const BANNER_PROMPTS = {
  newUserCampaign: [
    {
      style: 'vibrant_celebration',
      prompt: `Create a vibrant and colorful banner background for a new user registration campaign. 
        Include: confetti, gift boxes, sparkles, celebration elements. 
        Colors: bright rainbow gradients, gold accents, festive atmosphere.
        Style: Modern, energetic, Pokemon card game inspired.
        Text space: Leave center area clear for overlay text.
        Aspect ratio: 16:9 for wide banner`
    },
    {
      style: 'premium_welcome',
      prompt: `Design a premium welcome banner for new user registration bonus campaign.
        Include: luxury gift boxes, golden coins, premium card packs, shining effects.
        Colors: gold, purple, deep blue gradients with sparkles.
        Style: Luxurious, exclusive, high-end gaming aesthetic.
        Text space: Clear space in center for campaign text overlay.
        Aspect ratio: 16:9 for wide banner`
    },
    {
      style: 'pokemon_party',
      prompt: `Create a Pokemon-themed party banner for new user welcome campaign.
        Include: Pikachu silhouettes, pokeballs, party decorations, fireworks.
        Colors: Pokemon yellow, red, blue with festive elements.
        Style: Playful, exciting, game-inspired celebration.
        Text space: Center area clear for text overlay.
        Aspect ratio: 16:9 for wide banner`
    }
  ],
  referralCampaign: [
    {
      style: 'friendship_network',
      prompt: `Design a friendship and connection themed banner for referral campaign.
        Include: connected network lines, friend icons, gift exchanges, reward symbols.
        Colors: warm gradients of orange, pink, purple with glowing connections.
        Style: Social, warm, inviting with modern tech aesthetic.
        Text space: Clear center area for referral campaign text.
        Aspect ratio: 16:9 for wide banner`
    },
    {
      style: 'treasure_share',
      prompt: `Create a treasure sharing banner for friend referral rewards campaign.
        Include: treasure chests opening, coins flowing, shared rewards, multiplier symbols.
        Colors: gold, emerald green, ruby red with shimmering effects.
        Style: Adventure, rewarding, generous feeling.
        Text space: Center clear for campaign details overlay.
        Aspect ratio: 16:9 for wide banner`
    },
    {
      style: 'team_celebration',
      prompt: `Design a team celebration banner for referral bonus campaign.
        Include: multiple characters celebrating, high-fives, team badges, bonus multipliers.
        Colors: energetic mix of blue, orange, green with dynamic lighting.
        Style: Team spirit, collaborative, exciting gaming atmosphere.
        Text space: Center area reserved for text overlay.
        Aspect ratio: 16:9 for wide banner`
    }
  ],
  specialEvent: [
    {
      style: 'mega_evolution',
      prompt: `Create an epic mega evolution themed banner for special event.
        Include: evolution energy, transformation effects, rare cards floating, power auras.
        Colors: electric blue, hot pink, neon purple with energy streaks.
        Style: Epic, powerful, transformation theme.
        Text space: Center clear for event announcement.
        Aspect ratio: 16:9 for wide banner`
    },
    {
      style: 'legendary_hunt',
      prompt: `Design a legendary Pokemon hunt banner for limited time event.
        Include: mysterious fog, legendary silhouettes, ancient symbols, glowing orbs.
        Colors: deep purple, midnight blue, golden highlights with mystical glow.
        Style: Mysterious, rare, exclusive feeling.
        Text space: Center area for event details.
        Aspect ratio: 16:9 for wide banner`
    }
  ]
}

export async function POST(request: NextRequest) {
  try {
    // APIキーの確認
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set')
      return NextResponse.json({
        success: false,
        error: 'OpenAI APIキーが設定されていません'
      }, { status: 500 })
    }

    const { campaignType, style, customPrompt } = await request.json()

    // プロンプトの選択
    let prompts = []
    if (customPrompt) {
      prompts = [{ style: 'custom', prompt: customPrompt }]
    } else if (campaignType && BANNER_PROMPTS[campaignType as keyof typeof BANNER_PROMPTS]) {
      prompts = BANNER_PROMPTS[campaignType as keyof typeof BANNER_PROMPTS]
      if (style) {
        prompts = prompts.filter(p => p.style === style)
      }
    } else {
      // デフォルトで全パターンから3つランダムに選択
      const allPrompts = Object.values(BANNER_PROMPTS).flat()
      prompts = allPrompts.sort(() => 0.5 - Math.random()).slice(0, 3)
    }

    // 画像生成
    const generationPromises = prompts.map(async (promptData) => {
      try {
        // console.log(`Generating image for style: ${promptData.style}`)
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: promptData.prompt,
          n: 1,
          size: "1792x1024",
          quality: "hd",
          style: "vivid"
        })

        return {
          style: promptData.style,
          imageUrl: response.data[0].url,
          prompt: promptData.prompt,
          revisedPrompt: response.data[0].revised_prompt
        }
      } catch (error: any) {
        console.error(`Error generating image for style ${promptData.style}:`, error)
        console.error('Error details:', error.response?.data || error.message)
        return null
      }
    })

    const results = await Promise.all(generationPromises)
    const successfulResults = results.filter(r => r !== null)

    if (successfulResults.length === 0) {
      throw new Error('画像生成に失敗しました')
    }

    return NextResponse.json({
      success: true,
      banners: successfulResults,
      count: successfulResults.length
    })

  } catch (error) {
    console.error('Banner generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'バナー生成中にエラーが発生しました'
    }, { status: 500 })
  }
}

// プロンプトテンプレート取得API
export async function GET() {
  return NextResponse.json({
    success: true,
    templates: Object.keys(BANNER_PROMPTS),
    styles: Object.entries(BANNER_PROMPTS).reduce((acc, [key, values]) => {
      acc[key] = values.map(v => v.style)
      return acc
    }, {} as Record<string, string[]>)
  })
}