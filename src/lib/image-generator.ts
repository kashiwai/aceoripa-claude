// 画像生成エンジンのユーティリティ関数

interface GachaImageConfig {
  name: string
  category: 'pokemon' | 'onepiece' | 'yugioh' | 'weiss' | 'duel-masters' | 'other'
  style?: 'normal' | 'premium' | 'limited' | 'collaboration'
  rarity?: 'common' | 'rare' | 'super-rare' | 'ultra-rare'
}

interface BannerConfig {
  title: string
  subtitle?: string
  type: 'campaign' | 'new' | 'sale' | 'ranking' | 'event'
  style?: 'gradient' | 'photo' | 'illustration'
}

// ガチャバナー画像生成（1024×1024）
export async function generateGachaBanner(config: GachaImageConfig): Promise<string> {
  const categoryPrompts = {
    pokemon: 'ポケモンカードのオリパガチャ、ピカチュウやリザードンなどの人気ポケモン、電撃エフェクト、モンスターボール',
    onepiece: 'ワンピースカードのオリパガチャ、ルフィや海賊旗、航海の冒険感、グランドラインの世界観',
    yugioh: '遊戯王カードのオリパガチャ、デュエルディスク、千年パズル、魔法と罠カード',
    weiss: 'ヴァイスシュヴァルツのオリパガチャ、アニメキャラクター、キラキラエフェクト、サイン入りカード',
    'duel-masters': 'デュエルマスターズのオリパガチャ、クリーチャーバトル、炎と雷のエフェクト',
    other: 'トレーディングカードのオリパガチャ、豪華なカードパック、レアカードの輝き'
  }

  const stylePrompts = {
    normal: '標準的なデザイン、清潔感のある',
    premium: '高級感のある金色の装飾、プレミアム感、VIP仕様',
    limited: '期間限定の特別感、希少性を演出、限定マーク',
    collaboration: 'コラボレーション企画、特別なコラボロゴ'
  }

  const prompt = `
    ${categoryPrompts[config.category]}のバナー画像。
    ${config.name}という名前のガチャ。
    ${config.style ? stylePrompts[config.style] : ''}
    魅力的でクリックしたくなるデザイン。
    高品質、プロフェッショナル、日本のゲームセンターやオンラインガチャサイト風。
    テキストは含めない。
  `.trim()

  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        size: '1024x1024',
        quality: 'hd'
      })
    })

    const data = await response.json()
    return data.imageUrl || ''
  } catch (error) {
    console.error('Failed to generate gacha banner:', error)
    return `/api/placeholder/1024/1024?text=${encodeURIComponent(config.name)}`
  }
}

// PRバナー画像生成（400×400）
export async function generatePRBanner(config: BannerConfig): Promise<string> {
  const typePrompts = {
    campaign: 'キャンペーン告知、お得感、期間限定、割引',
    new: '新商品、NEW、新登場、フレッシュ',
    sale: 'セール、SALE、特価、お買い得',
    ranking: 'ランキング、TOP、人気、ベストセラー',
    event: 'イベント、祭り、お祭り感、にぎやか'
  }

  const prompt = `
    ${typePrompts[config.type]}のPRバナー画像。
    ${config.title}。
    ${config.subtitle || ''}
    正方形のバナーデザイン、目を引く、インパクトのある。
    日本のウェブサイトやアプリで使われるような広告バナー。
    明るく魅力的な色使い。
    テキストは含めない。
  `.trim()

  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        size: '1024x1024', // 高解像度で生成してリサイズ
        quality: 'standard'
      })
    })

    const data = await response.json()
    return data.imageUrl || ''
  } catch (error) {
    console.error('Failed to generate PR banner:', error)
    return `/api/placeholder/400/400?text=${encodeURIComponent(config.title)}`
  }
}

// カード画像生成（トレカ風）
export async function generateCardImage(
  cardName: string,
  rarity: 'N' | 'R' | 'SR' | 'SSR',
  category: string
): Promise<string> {
  const rarityPrompts = {
    N: 'ノーマルカード、シンプル、基本的な',
    R: 'レアカード、少し特別感のある、輝きのある',
    SR: 'スーパーレアカード、キラキラ、ホログラフィック効果',
    SSR: 'シークレットスーパーレアカード、虹色に輝く、最高級の、プレミアム'
  }

  const prompt = `
    ${category}の${rarityPrompts[rarity]}トレーディングカード。
    ${cardName}。
    カードゲームのイラスト、高品質、コレクター向け。
    ${rarity === 'SSR' ? '特別な演出効果、豪華な装飾' : ''}
    縦向きのカードデザイン。
  `.trim()

  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        size: '1024x1024',
        quality: rarity === 'SSR' ? 'hd' : 'standard'
      })
    })

    const data = await response.json()
    return data.imageUrl || ''
  } catch (error) {
    console.error('Failed to generate card image:', error)
    return `/api/placeholder/300/400?text=${encodeURIComponent(cardName)}`
  }
}

// SNS共有画像生成
export async function generateShareImage(
  cards: Array<{ name: string, rarity: string }>,
  userName: string
): Promise<string> {
  const cardList = cards.map(c => `${c.name}(${c.rarity})`).join(', ')
  
  const prompt = `
    オンラインガチャの当選報告画像。
    ${userName}様の当選結果。
    獲得カード: ${cardList}。
    お祝い、おめでとう、キラキラエフェクト。
    SNSでシェアしたくなるような華やかなデザイン。
    正方形の画像。
  `.trim()

  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        size: '1024x1024',
        quality: 'standard'
      })
    })

    const data = await response.json()
    return data.imageUrl || ''
  } catch (error) {
    console.error('Failed to generate share image:', error)
    return `/api/placeholder/1024/1024?text=当選おめでとう！`
  }
}

// バッチ画像生成（複数画像を一度に生成）
export async function batchGenerateImages(
  configs: Array<{ type: 'gacha' | 'banner' | 'card', config: any }>
): Promise<Array<{ type: string, imageUrl: string }>> {
  const results = []
  
  for (const item of configs) {
    let imageUrl = ''
    
    switch (item.type) {
      case 'gacha':
        imageUrl = await generateGachaBanner(item.config)
        break
      case 'banner':
        imageUrl = await generatePRBanner(item.config)
        break
      case 'card':
        imageUrl = await generateCardImage(
          item.config.name,
          item.config.rarity,
          item.config.category
        )
        break
    }
    
    results.push({ type: item.type, imageUrl })
    
    // レート制限を考慮して少し待機
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return results
}