import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// ガチャプール（カードリスト）のサンプルデータ（フォールバック用）
const GACHA_POOLS = {
  '1': [ // ピカチュウ大祭り
    { id: 'PK-M001', name: 'マリオピカチュウ PSA10', rarity: 'SS', image: '/images/pokemon/008_マリオピカチュウ PSA10_PK-0008.jpg' },
    { id: 'PK-M002', name: 'ポンチョを着たピカチュウ(黒リザ) PSA10', rarity: 'SS', image: '/images/pokemon/010_ポンチョを着たピカチュウ(黒リザ) PSA10_PK-0010.jpg' },
    { id: 'PK-M006', name: 'ポンチョを着たピカチュウ(黒レックウザ) PSA10', rarity: 'SS', image: '/images/pokemon/019_ポンチョを着たピカチュウ(黒レックウザ) PSA10_PK-0019.jpg' },
    { id: 'PK-M003', name: 'アセロラ(エクバ) PSA10', rarity: 'S', image: '/images/pokemon/003_アセロラ(エクバ) PSA10_PK-0003.jpg' },
    { id: 'PK-M004', name: 'ブルーの探索 PSA10', rarity: 'S', image: '/images/pokemon/185_ブルーの探索 PSA10_PK-0187.jpg' },
    { id: 'PK-M008', name: 'ブラッキーex PSA10', rarity: 'S', image: '/images/pokemon/197_ブラッキーex PSA10_PK-0199.jpg' },
    { id: 'PK-M005', name: 'ポンチョを着たピカチュウ(リザ) PSA10', rarity: 'A', image: '/images/pokemon/016_ポンチョを着たピカチュウ(リザ) PSA10_PK-0016.jpg' },
    { id: 'PK-M042', name: 'アローラの仲間たち PSA10', rarity: 'A', image: '/images/pokemon/032_アローラの仲間たち PSA10_PK-0032.jpg' }
  ],
  '2': [ // ナンジャモ大量発生オリパ
    { id: 'NJ-T001', name: 'おじょうさま PSA10', rarity: 'SS', image: '/images/pokemon/204_おじょうさま PSA10_PK-0206.jpg' },
    { id: 'NJ-T002', name: 'ヒガナ PSA10', rarity: 'SS', image: '/images/pokemon/220_ヒガナ PSA10_PK-0223.jpg' },
    { id: 'NJ-T003', name: 'アセロラ PSA10', rarity: 'SS', image: '/images/pokemon/015_アセロラ PSA10_PK-0015.jpg' },
    { id: 'NJ-T007', name: 'ニンフィアEX PSA10（エラー版）', rarity: 'S', image: '/images/pokemon/137_ニンフィアEX PSA10（エラー版）_PK-0139.jpg' },
    { id: 'NJ-T017', name: 'ポンチョを着たピカチュウ(レックウザ) PSA10', rarity: 'A', image: '/images/pokemon/020_ポンチョを着たピカチュウ(レックウザ) PSA10_PK-0020.jpg' },
    { id: 'NJ-T027', name: 'アセロラ（エクバ）', rarity: 'B', image: '/images/pokemon/009_アセロラ（エクバ）_PK-0009.jpg' },
    { id: 'NJ-T037', name: 'アセロラ', rarity: 'C', image: '/images/pokemon/028_アセロラ_PK-0028.jpg' },
    { id: 'NJ-T047', name: 'アローラの仲間たち', rarity: 'C', image: '/images/pokemon/061_アローラの仲間たち_PK-0061.jpg' }
  ],
  '3': [ // リザードン祭盤
    { id: 'CZ-F001', name: 'マリオピカチュウ PSA10', rarity: 'SS', image: '/images/pokemon/081_マリオピカチュウ PSA10_PK-0081.jpg' },
    { id: 'CZ-F002', name: 'ブルーの探索 PSA10', rarity: 'SS', image: '/images/pokemon/235_ブルーの探索 PSA10_PK-0238.jpg' },
    { id: 'CZ-F004', name: 'ホロンの研究塔 1パック', rarity: 'SS', image: '/images/pokemon/123_ホロンの研究塔 1パック_PK-0124.jpg' },
    { id: 'CZ-F007', name: 'ポンチョを着たピカチュウ(ロコン)', rarity: 'S', image: '/images/pokemon/151_ポンチョを着たピカチュウ(ロコン)_PK-0153.jpg' },
    { id: 'CZ-F025', name: 'ブルーの探索', rarity: 'A', image: '/images/pokemon/248_ブルーの探索_PK-0251.jpg' },
    { id: 'CZ-F038', name: 'THE BEST OF XY 1BOX', rarity: 'B', image: '/images/pokemon/034_THE BEST OF XY 1BOX_PK-0034.jpg' },
    { id: 'CZ-F050', name: 'アセロラ', rarity: 'C', image: '/images/pokemon/028_アセロラ_PK-0028.jpg' }
  ],
  '4': [ // ブラッキー超感謝祭
    { id: 'BK-A001', name: 'ブラッキーex PSA10', rarity: 'SS', image: '/images/pokemon/197_ブラッキーex PSA10_PK-0199.jpg' },
    { id: 'BK-A002', name: 'おじょうさま PSA10', rarity: 'SS', image: '/images/pokemon/204_おじょうさま PSA10_PK-0206.jpg' },
    { id: 'BK-A005', name: 'ヒガナ PSA10', rarity: 'SS', image: '/images/pokemon/220_ヒガナ PSA10_PK-0223.jpg' },
    { id: 'BK-A006', name: 'マリオピカチュウ PSA10', rarity: 'S', image: '/images/pokemon/008_マリオピカチュウ PSA10_PK-0008.jpg' },
    { id: 'BK-A016', name: 'アセロラ(エクバ) PSA10', rarity: 'A', image: '/images/pokemon/003_アセロラ(エクバ) PSA10_PK-0003.jpg' },
    { id: 'BK-A031', name: 'ブルーの探索 PSA10', rarity: 'B', image: '/images/pokemon/185_ブルーの探索 PSA10_PK-0187.jpg' },
    { id: 'BK-A044', name: 'ニンフィアEX PSA10（エラー版）', rarity: 'C', image: '/images/pokemon/137_ニンフィアEX PSA10（エラー版）_PK-0139.jpg' }
  ],
  '5': [ // リーリエ×マリオピカチュウ
    { id: 'LM-P001', name: 'アローラの仲間たち PSA10', rarity: 'SS', image: '/images/pokemon/032_アローラの仲間たち PSA10_PK-0032.jpg' },
    { id: 'LM-P002', name: 'ポンチョを着たピカチュウ(黒リザ) PSA10', rarity: 'SS', image: '/images/pokemon/010_ポンチョを着たピカチュウ(黒リザ) PSA10_PK-0010.jpg' },
    { id: 'LM-P003', name: 'ポンチョを着たピカチュウ(リザ) PSA10', rarity: 'SS', image: '/images/pokemon/016_ポンチョを着たピカチュウ(リザ) PSA10_PK-0016.jpg' },
    { id: 'LM-P011', name: 'マリオピカチュウ PSA10', rarity: 'S', image: '/images/pokemon/081_マリオピカチュウ PSA10_PK-0081.jpg' },
    { id: 'LM-P021', name: 'ポンチョを着たピカチュウ(黒レックウザ) PSA10', rarity: 'A', image: '/images/pokemon/019_ポンチョを着たピカチュウ(黒レックウザ) PSA10_PK-0019.jpg' },
    { id: 'LM-P036', name: 'ポンチョを着たピカチュウ(レックウザ) PSA10', rarity: 'B', image: '/images/pokemon/020_ポンチョを着たピカチュウ(レックウザ) PSA10_PK-0020.jpg' },
    { id: 'LM-P045', name: 'ポンチョを着たピカチュウ(ロコン)', rarity: 'C', image: '/images/pokemon/151_ポンチョを着たピカチュウ(ロコン)_PK-0153.jpg' }
  ]
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const gachaId = params.id
    const supabase = createRouteHandlerClient({ cookies })
    
    // まずSupabaseから実際のカードプールデータを取得
    const { data: poolData, error: poolError } = await supabase
      .from('gacha_pokemon_pools')
      .select(`
        id,
        weight,
        pokemon_card:pokemon_cards (
          id,
          card_name,
          product_code,
          rarity,
          image_url,
          market_price,
          description
        )
      `)
      .eq('gacha_product_id', gachaId)
    
    if (poolError) {
      console.error('Error fetching pool from Supabase:', poolError)
      // エラーの場合はフォールバックデータを使用
      const fallbackCards = GACHA_POOLS[gachaId as keyof typeof GACHA_POOLS]
      if (!fallbackCards) {
        return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
      }
      
      const formattedCards = fallbackCards.map(card => ({
        id: card.id,
        name: card.name,
        rarity: card.rarity,
        imageUrl: card.image,
        probability: 1
      }))
      
      return NextResponse.json({ success: true, cards: formattedCards })
    }
    
    // データが存在しない場合もフォールバックを使用
    if (!poolData || poolData.length === 0) {
      const fallbackCards = GACHA_POOLS[gachaId as keyof typeof GACHA_POOLS]
      if (!fallbackCards) {
        return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
      }
      
      const formattedCards = fallbackCards.map(card => ({
        id: card.id,
        name: card.name,
        rarity: card.rarity,
        imageUrl: card.image,
        probability: 1
      }))
      
      return NextResponse.json({ success: true, cards: formattedCards })
    }
    
    // レアリティごとの合計weightを計算
    const rarityWeights: { [key: string]: number } = {}
    poolData.forEach(item => {
      if (item.pokemon_card) {
        const rarity = item.pokemon_card.rarity
        rarityWeights[rarity] = (rarityWeights[rarity] || 0) + item.weight
      }
    })
    
    // 総weightを計算
    const totalWeight = Object.values(rarityWeights).reduce((sum, weight) => sum + weight, 0)
    
    // フロントエンドのCard interfaceに合わせてフィールド名を変換
    const formattedCards = poolData
      .filter(item => item.pokemon_card !== null)
      .map(item => {
        const card = item.pokemon_card!
        const rarityWeight = rarityWeights[card.rarity]
        const probability = totalWeight > 0 ? (rarityWeight / totalWeight) * 100 : 0
        
        return {
          id: card.id,
          name: card.card_name,
          rarity: card.rarity,
          imageUrl: card.image_url,
          description: card.description,
          probability: Math.round(probability * 10) / 10 // 小数点1位まで
        }
      })
    
    return NextResponse.json({ success: true, cards: formattedCards })
  } catch (error) {
    console.error('Error fetching gacha pool:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}