import { NextRequest, NextResponse } from 'next/server'
import { generateGachaBanner, generatePRBanner, batchGenerateImages } from '@/lib/image-generator'

// 自動画像生成API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, config, batch } = body

    if (batch) {
      // バッチ生成
      const results = await batchGenerateImages(config)
      return NextResponse.json({ success: true, results })
    }

    let imageUrl = ''

    switch (type) {
      case 'gacha':
        imageUrl = await generateGachaBanner(config)
        break
      case 'banner':
        imageUrl = await generatePRBanner(config)
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, imageUrl })
  } catch (error) {
    console.error('Auto generate error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}

// 事前定義されたガチャ画像セットを生成
export async function GET() {
  try {
    const predefinedGachas = [
      {
        type: 'gacha',
        config: {
          name: 'ポケモンカード151ガチャ',
          category: 'pokemon',
          style: 'premium'
        }
      },
      {
        type: 'gacha',
        config: {
          name: 'ワンピースカード頂上決戦',
          category: 'onepiece',
          style: 'limited'
        }
      },
      {
        type: 'gacha',
        config: {
          name: '遊戯王プレミアムパック',
          category: 'yugioh',
          style: 'premium'
        }
      },
      {
        type: 'gacha',
        config: {
          name: 'ヴァイスシュヴァルツSP',
          category: 'weiss',
          style: 'collaboration'
        }
      },
      {
        type: 'gacha',
        config: {
          name: 'デュエルマスターズ神撃',
          category: 'duel-masters',
          style: 'normal'
        }
      }
    ]

    const bannerConfigs = [
      {
        type: 'banner',
        config: {
          title: '新商品入荷',
          subtitle: '最新ガチャ登場',
          type: 'new'
        }
      },
      {
        type: 'banner',
        config: {
          title: '期間限定セール',
          subtitle: '50%OFF',
          type: 'sale'
        }
      },
      {
        type: 'banner',
        config: {
          title: '高還元率オリパ',
          subtitle: 'レア確率UP',
          type: 'campaign'
        }
      },
      {
        type: 'banner',
        config: {
          title: 'コラボオリパ',
          subtitle: '限定コラボ',
          type: 'event'
        }
      },
      {
        type: 'banner',
        config: {
          title: '人気ランキング',
          subtitle: 'TOP10',
          type: 'ranking'
        }
      }
    ]

    // ガチャ画像とバナー画像を生成
    const allConfigs = [...predefinedGachas, ...bannerConfigs]
    const results = await batchGenerateImages(allConfigs as { type: "banner" | "card" | "gacha"; config: any; }[])

    return NextResponse.json({
      success: true,
      message: 'Generated predefined images',
      results: {
        gachas: results.slice(0, 5),
        banners: results.slice(5, 10)
      }
    })
  } catch (error) {
    console.error('Predefined generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate predefined images' },
      { status: 500 }
    )
  }
}