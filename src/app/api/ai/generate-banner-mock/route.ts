import { NextRequest, NextResponse } from 'next/server'

// モックバナーデータ（実際のAI生成の代わり）
const MOCK_BANNERS = {
  newUserCampaign: [
    {
      style: 'vibrant_celebration',
      imageUrl: 'https://picsum.photos/1792/1024?random=1',
      prompt: '新規登録キャンペーン - お祝いスタイル',
      revisedPrompt: 'カラフルな紙吹雪とギフトボックスで新規登録を祝うバナー'
    },
    {
      style: 'premium_welcome',
      imageUrl: 'https://picsum.photos/1792/1024?random=2',
      prompt: '新規登録キャンペーン - プレミアムスタイル',
      revisedPrompt: '豪華なゴールドとパープルで高級感のあるウェルカムバナー'
    },
    {
      style: 'pokemon_party',
      imageUrl: 'https://picsum.photos/1792/1024?random=3',
      prompt: '新規登録キャンペーン - ポケモンパーティー',
      revisedPrompt: 'ピカチュウと仲間たちが新規ユーザーを歓迎するバナー'
    }
  ],
  referralCampaign: [
    {
      style: 'friendship_network',
      imageUrl: 'https://picsum.photos/1792/1024?random=4',
      prompt: '友達紹介キャンペーン - 友情ネットワーク',
      revisedPrompt: 'つながりとシェアをテーマにした温かい雰囲気のバナー'
    },
    {
      style: 'treasure_share',
      imageUrl: 'https://picsum.photos/1792/1024?random=5',
      prompt: '友達紹介キャンペーン - 宝物シェア',
      revisedPrompt: '宝箱から溢れるコインと報酬を表現したバナー'
    },
    {
      style: 'team_celebration',
      imageUrl: 'https://picsum.photos/1792/1024?random=6',
      prompt: '友達紹介キャンペーン - チーム祝賀',
      revisedPrompt: 'みんなで祝うチームワークと喜びのバナー'
    }
  ],
  specialEvent: [
    {
      style: 'mega_evolution',
      imageUrl: 'https://picsum.photos/1792/1024?random=7',
      prompt: '特別イベント - メガ進化',
      revisedPrompt: 'エネルギッシュな進化と変化を表現したバナー'
    },
    {
      style: 'legendary_hunt',
      imageUrl: 'https://picsum.photos/1792/1024?random=8',
      prompt: '特別イベント - レジェンドハント',
      revisedPrompt: '神秘的で希少な雰囲気のレジェンドイベントバナー'
    }
  ]
}

export async function POST(request: NextRequest) {
  try {
    const { campaignType, style, customPrompt } = await request.json()

    // 少し遅延を入れて実際のAPI呼び出しをシミュレート
    await new Promise(resolve => setTimeout(resolve, 2000))

    // モックデータから選択
    let banners = []
    if (campaignType && MOCK_BANNERS[campaignType as keyof typeof MOCK_BANNERS]) {
      banners = MOCK_BANNERS[campaignType as keyof typeof MOCK_BANNERS]
      if (style) {
        banners = banners.filter(b => b.style === style)
      }
    } else {
      // ランダムに3つ選択
      const allBanners = Object.values(MOCK_BANNERS).flat()
      banners = allBanners.sort(() => 0.5 - Math.random()).slice(0, 3)
    }

    return NextResponse.json({
      success: true,
      banners: banners,
      count: banners.length,
      mock: true // モックデータであることを示す
    })

  } catch (error) {
    console.error('Mock banner generation error:', error)
    return NextResponse.json({
      success: false,
      error: 'モックバナー生成中にエラーが発生しました'
    }, { status: 500 })
  }
}