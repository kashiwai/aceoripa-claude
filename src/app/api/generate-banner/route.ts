import { NextRequest, NextResponse } from 'next/server'
import { createCanvas, registerFont } from 'canvas'
import path from 'path'
import fs from 'fs'

// フォント登録（サーバー起動時）
const initializeFonts = () => {
  const fontDir = path.join(process.cwd(), 'public', 'images', 'font')
  const fontFiles = [
    { file: 'Dela_Gothic_One/DelaGothicOne-Regular.ttf', family: 'DelaGothicOne' },
    { file: 'MOBO-Font11/MOBO-Bold.otf', family: 'MOBOFont' },
    { file: 'YDW_bananaslip_plus_240809/YDWbananaslipplus.otf', family: 'BananaSlip' },
    { file: 'craftmincho/craftmincho.otf', family: 'CraftMincho' },
    { file: 'kinkaku/Kinkakuji-Normal.otf', family: 'Kinkaku' }
  ]

  fontFiles.forEach(font => {
    try {
      const fontPath = path.join(fontDir, font.file)
      if (fs.existsSync(fontPath)) {
        registerFont(fontPath, { family: font.family })
      }
    } catch (err) {
      console.warn(`Font registration failed: ${font.family}`)
    }
  })
}

// サーバー起動時にフォント初期化
initializeFonts()

interface BannerRequest {
  gachaId: string
  bannerType: 'main' | 'rarity' | 'custom'
  rarity?: 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'PSA10'
  title?: string
  subtitle?: string
  colors?: string[]
  size?: {
    width: number
    height: number
  }
  options?: {
    sparkles?: number
    cards?: number
    font?: string
    backgroundStyle?: 'gradient' | 'ai' | 'existing'
  }
}

// バナー生成メイン関数
const generateBanner = async (config: BannerRequest): Promise<Buffer> => {
  const { width = 1024, height = 1024 } = config.size || {}
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // バナータイプ別の生成
  switch (config.bannerType) {
    case 'rarity':
      return generateRarityBanner(ctx, config)
    case 'main':
      return generateMainBanner(ctx, config)
    case 'custom':
      return generateCustomBanner(ctx, config)
    default:
      return generateMainBanner(ctx, config)
  }
}

// レアリティ別バナー生成
const generateRarityBanner = (ctx: any, config: BannerRequest): Buffer => {
  const { rarity = 'N', title, subtitle } = config
  const { width, height } = ctx.canvas

  const rarityConfigs = {
    N: { colors: ['#B0B0B0', '#808080'], sparkles: 20, font: 'DelaGothicOne' },
    R: { colors: ['#4ECDC4', '#2E86C1'], sparkles: 30, font: 'MOBOFont' },
    SR: { colors: ['#FFD93D', '#F39C12'], sparkles: 40, font: 'BananaSlip' },
    SSR: { colors: ['#FF6B6B', '#E74C3C'], sparkles: 60, font: 'Kinkaku' },
    UR: { colors: ['#DA70D6', '#8E44AD'], sparkles: 80, font: 'MOBOFont' },
    PSA10: { colors: ['#FFD700', '#FFA500'], sparkles: 100, font: 'Kinkaku' }
  }

  const rarityConfig = rarityConfigs[rarity]

  // 背景グラデーション
  const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2)
  gradient.addColorStop(0, rarityConfig.colors[0])
  gradient.addColorStop(1, rarityConfig.colors[1])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // 放射状エフェクト
  ctx.globalAlpha = 0.3
  for (let i = 0; i < 36; i++) {
    ctx.save()
    ctx.translate(width/2, height/2)
    ctx.rotate((i * 10) * Math.PI / 180)
    
    const rayGradient = ctx.createLinearGradient(0, 0, 0, -height/2)
    rayGradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
    rayGradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)')
    
    ctx.fillStyle = rayGradient
    ctx.beginPath()
    ctx.moveTo(-20, 0)
    ctx.lineTo(20, 0)
    ctx.lineTo(10, -height/2)
    ctx.lineTo(-10, -height/2)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  ctx.globalAlpha = 1

  // メインテキスト
  ctx.font = `bold ${Math.floor(width * 0.15)}px "${rarityConfig.font}"`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // アウトライン
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = Math.floor(width * 0.02)
  ctx.strokeText(title || rarity, width/2, height * 0.35)
  
  // 本体
  const textGradient = ctx.createLinearGradient(0, height * 0.25, 0, height * 0.45)
  textGradient.addColorStop(0, '#FFFFFF')
  textGradient.addColorStop(1, rarityConfig.colors[0])
  ctx.fillStyle = textGradient
  ctx.fillText(title || rarity, width/2, height * 0.35)

  // サブテキスト
  if (subtitle) {
    ctx.font = `bold ${Math.floor(width * 0.06)}px "${rarityConfig.font}"`
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = Math.floor(width * 0.008)
    ctx.strokeText(subtitle, width/2, height * 0.5)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(subtitle, width/2, height * 0.5)
  }

  // スパークルエフェクト
  for (let i = 0; i < rarityConfig.sparkles; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const size = Math.random() * 4 + 2
    
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(Math.random() * Math.PI)
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.beginPath()
    ctx.moveTo(0, -size)
    ctx.lineTo(size, 0)
    ctx.lineTo(0, size)
    ctx.lineTo(-size, 0)
    ctx.closePath()
    ctx.fill()
    
    ctx.restore()
  }

  return ctx.canvas.toBuffer('image/png')
}

// メインバナー生成
const generateMainBanner = (ctx: any, config: BannerRequest): Buffer => {
  const { title = '超激レアガチャ', subtitle = 'PSA10確率UP!' } = config
  const { width, height } = ctx.canvas

  // 背景グラデーション
  const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2)
  gradient.addColorStop(0, '#FFD700')
  gradient.addColorStop(0.2, '#FF6B6B')
  gradient.addColorStop(0.4, '#DA70D6')
  gradient.addColorStop(0.6, '#4ECDC4')
  gradient.addColorStop(0.8, '#FFD93D')
  gradient.addColorStop(1, '#FF6B6B')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // 暗めオーバーレイ
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fillRect(0, 0, width, height)

  // 中央爆発エフェクト
  const explosionGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.4)
  explosionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
  explosionGradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.4)')
  explosionGradient.addColorStop(1, 'rgba(255, 0, 0, 0)')
  
  ctx.fillStyle = explosionGradient
  ctx.fillRect(0, 0, width, height)

  // メインテキスト
  ctx.font = `bold ${Math.floor(width * 0.12)}px "Kinkaku"`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // アウトライン
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = Math.floor(width * 0.02)
  ctx.strokeText(title, width/2, height * 0.4)
  
  // グラデーションテキスト
  const textGradient = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.5)
  textGradient.addColorStop(0, '#FFD700')
  textGradient.addColorStop(0.5, '#FFFFFF')
  textGradient.addColorStop(1, '#FFD700')
  
  ctx.fillStyle = textGradient
  ctx.fillText(title, width/2, height * 0.4)

  // サブテキスト
  ctx.font = `bold ${Math.floor(width * 0.05)}px "MOBOFont"`
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = Math.floor(width * 0.008)
  ctx.strokeText(subtitle, width/2, height * 0.6)
  
  ctx.fillStyle = '#FF0000'
  ctx.fillText(subtitle, width/2, height * 0.6)

  return ctx.canvas.toBuffer('image/png')
}

// カスタムバナー生成
const generateCustomBanner = (ctx: any, config: BannerRequest): Buffer => {
  const { title = 'カスタムバナー', colors = ['#FF6B6B', '#4ECDC4'] } = config
  const { width, height } = ctx.canvas

  // カスタム背景
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color)
  })
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // タイトル
  ctx.font = `bold ${Math.floor(width * 0.1)}px "DelaGothicOne"`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = Math.floor(width * 0.01)
  ctx.strokeText(title, width/2, height/2)
  ctx.fillStyle = '#000000'
  ctx.fillText(title, width/2, height/2)

  return ctx.canvas.toBuffer('image/png')
}

export async function POST(request: NextRequest) {
  try {
    // 新しいAPIとレガシーAPIの両対応
    const body = await request.json()
    
    // 新形式のバナー生成リクエスト
    if (body.gachaId && body.bannerType) {
      const config: BannerRequest = body
      
      // バリデーション
      if (!config.gachaId) {
        return NextResponse.json(
          { error: 'gachaId is required' },
          { status: 400 }
        )
      }

      // バナー生成
      const bannerBuffer = await generateBanner(config)
      
      // バナーファイル名
      const timestamp = Date.now()
      const filename = `banner-${config.gachaId}-${config.bannerType}-${timestamp}.png`
      const filepath = path.join(process.cwd(), 'public', 'images', 'generated-banners', filename)
      
      // ディレクトリ作成
      const dir = path.dirname(filepath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      // ファイル保存
      fs.writeFileSync(filepath, bannerBuffer)
      
      // URL生成
      const bannerUrl = `/images/generated-banners/${filename}`
      
      return NextResponse.json({
        success: true,
        bannerUrl,
        filename,
        config
      })
    }
    
    // レガシー形式（既存のOpenAI DALL-E API呼び出し）
    const { type, text, style, title, subtitle } = body;
    
    // バナータイプ別のプロンプト生成
    const prompts: Record<string, string> = {
      'line-campaign': `
        Create a vibrant banner for LINE friend registration campaign in Japanese mobile game style.
        Text: "${text || 'LINE友達登録で最大70%OFFクーポン!'}"
        Style: Green gradient background, LINE app logo, discount coupon visual, mobile-first design,
        bright yellow accent for discount percentage, professional game banner quality.
        Size: 375x80px mobile banner format.
      `,
      'gacha-main': `
        Create an exciting gacha game banner with Japanese text.
        Main text: "${text || '超絶ガチャ爆誕'}"
        Style: Purple to pink gradient, sparkles and stars, golden accents, epic game feel,
        Japanese mobile game aesthetic, premium quality, exciting atmosphere.
        Size: 375x200px hero banner.
      `,
      'campaign': `
        Create a limited-time campaign banner for Japanese mobile game.
        Text: "${text || '期間限定キャンペーン'}"
        Style: Yellow to orange gradient, fire effects, urgency feeling, "LIMITED TIME" vibe,
        Japanese text prominent, mobile game UI style.
        Size: 375x100px.
      `,
      'new': `
        Create a "NEW" banner for new products or features.
        Title: "${title || '新商品入荷'}"
        Subtitle: "${subtitle || '最新ガチャ登場'}"
        Style: Modern, clean, eye-catching design with Japanese text.
      `,
      'sns-winner': `
        Create a social media winner announcement banner.
        Text: "${text || 'SNS当選報告'}"
        Style: Celebration theme, confetti, trophy or prize visual, social media icons,
        exciting winner announcement feel, Japanese text.
        Size: 200x200px square format.
      `,
      'card-pack': `
        Create a trading card pack banner for online gacha.
        Text: "${text || 'ポケモンカード151'}"
        Style: Holographic effect, trading card aesthetic, pack opening excitement,
        premium shiny finish, Japanese TCG style.
        Size: 400x600px vertical card format.
      `
    };

    const prompt = prompts[type] || prompts['gacha-main'];

    // OpenAI APIキー確認
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    // APIキーが設定されていない場合はプレースホルダーを返す
    if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('xxx') || OPENAI_API_KEY.includes('...')) {
      console.warn('OpenAI API key not configured, returning placeholder');
      return NextResponse.json({
        success: true,
        imageUrl: `/api/placeholder/400/400?text=${encodeURIComponent(title || text || 'Banner')}`,
        revised_prompt: prompt,
        placeholder: true
      });
    }

    // OpenAI API呼び出し（タイムアウト設定）
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8秒タイムアウト

    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt + " High quality, professional game asset, no watermarks.",
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          style: style || 'vivid'
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json();
        console.error('OpenAI API error:', errorData);
        throw new Error('Failed to generate image');
      }

      const data = await openaiResponse.json();
      
      return NextResponse.json({
        success: true,
        imageUrl: data.data[0].url,
        revised_prompt: data.data[0].revised_prompt
      });
    } catch (error: any) {
      clearTimeout(timeout);
      
      if (error.name === 'AbortError') {
        console.error('Banner generation timeout');
      } else {
        console.error('Banner generation error:', error);
      }
      
      // エラー時はプレースホルダーを返す
      return NextResponse.json({
        success: true,
        imageUrl: `/api/placeholder/400/400?text=${encodeURIComponent(type || 'Banner')}`,
        revised_prompt: prompt,
        error: true
      });
    }
  } catch (error) {
    console.error('Banner generation error:', error);
    return NextResponse.json({
      success: true,
      imageUrl: '/api/placeholder/400/400?text=Error',
      error: true
    });
  }
}

// GET: バナー生成状況確認
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gachaId = searchParams.get('gachaId')
    
    if (!gachaId) {
      return NextResponse.json(
        { error: 'gachaId parameter is required' },
        { status: 400 }
      )
    }
    
    const bannersDir = path.join(process.cwd(), 'public', 'images', 'generated-banners')
    
    if (!fs.existsSync(bannersDir)) {
      return NextResponse.json({
        gachaId,
        banners: [],
        count: 0
      })
    }
    
    const files = fs.readdirSync(bannersDir)
    const gachaBanners = files
      .filter(file => file.startsWith(`banner-${gachaId}-`))
      .map(file => {
        const stat = fs.statSync(path.join(bannersDir, file))
        return {
          filename: file,
          url: `/images/generated-banners/${file}`,
          createdAt: stat.ctime,
          sizeBytes: stat.size
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return NextResponse.json({
      gachaId,
      banners: gachaBanners,
      count: gachaBanners.length
    })
    
  } catch (error: any) {
    console.error('Banner status check error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check banner status' },
      { status: 500 }
    )
  }
}