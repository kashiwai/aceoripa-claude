import { NextResponse } from 'next/server'

// ガチャプール（カードリスト）のサンプルデータ
const GACHA_POOLS = {
  '1': [ // ピカチュウ大祭り
    { id: 'PK-M001', name: 'ポンチョを着たピカチュウ(黒リザ) PSA10', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'PK-M002', name: 'ニンフィアGX PSA10', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'PK-M006', name: 'ポンチョを着たピカチュウ(黒レックウザ) PSA10', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'PK-M007', name: 'ナンジャモ PSA10（SAR）', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'PK-M003', name: 'レイジングサーフ BOX', rarity: 'S', image: '/images/ngcard.jpg' },
    { id: 'PK-M004', name: 'ミュウツーVSTAR', rarity: 'S', image: '/images/ngcard.jpg' },
    { id: 'PK-M008', name: '熱風のアリーナ BOX', rarity: 'S', image: '/images/ngcard.jpg' },
    { id: 'PK-M005', name: 'ラティアス', rarity: 'A', image: '/images/ngcard.jpg' },
    { id: 'PK-M042', name: 'ピカチュウV', rarity: 'C', image: '/images/ngcard.jpg' }
  ],
  '2': [ // ナンジャモ大量発生オリパ
    { id: 'NJ-T001', name: 'ナンジャモ SAR PSA10', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'NJ-T002', name: 'ナンジャモSR PSA10', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'NJ-T003', name: 'サナ SR PSA10', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'NJ-T007', name: 'カリンの信念 PSA10', rarity: 'S', image: '/images/ngcard.jpg' },
    { id: 'NJ-T017', name: 'スノーハザード BOX', rarity: 'A', image: '/images/ngcard.jpg' },
    { id: 'NJ-T027', name: 'テツノカシラex SAR', rarity: 'B', image: '/images/ngcard.jpg' },
    { id: 'NJ-T037', name: 'マッギョ AR', rarity: 'C', image: '/images/ngcard.jpg' },
    { id: 'NJ-T047', name: 'かがやくルチャブル K', rarity: 'D', image: '/images/ngcard.jpg' }
  ],
  '3': [ // リザードン祭盤
    { id: 'CZ-F001', name: 'リザードンVMAX(HR仕様) PSA10', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'CZ-F002', name: 'ブラッキーGX HR PSA10', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'CZ-F004', name: 'ホワイトコレクション 1パック', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'CZ-F007', name: 'リザードンGX PSA10', rarity: 'S', image: '/images/ngcard.jpg' },
    { id: 'CZ-F025', name: 'サンダース PSA10', rarity: 'A', image: '/images/ngcard.jpg' },
    { id: 'CZ-F038', name: 'ブラッキー(マスターボールミラー) PSA10', rarity: 'B', image: '/images/ngcard.jpg' },
    { id: 'CZ-F050', name: 'フシギダネ C', rarity: 'C', image: '/images/ngcard.jpg' }
  ],
  '4': [ // ブラッキー超感謝祭
    { id: 'BK-A001', name: 'ブラッキーVMAX PSA10（PROMO）', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'BK-A002', name: 'ルチアのアピール PSA10', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'BK-A005', name: 'ムゲンゾーン パック', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'BK-A006', name: 'サンダースVMAX PSA10', rarity: 'S', image: '/images/ngcard.jpg' },
    { id: 'BK-A016', name: 'イーブイヒーローズ イーブイズセット 1BOX', rarity: 'A', image: '/images/ngcard.jpg' },
    { id: 'BK-A031', name: 'ブラッキーGX SSR PSA10', rarity: 'B', image: '/images/ngcard.jpg' },
    { id: 'BK-A044', name: 'ミュウV(SA) PSA10', rarity: 'C', image: '/images/ngcard.jpg' }
  ],
  '5': [ // リーリエ×マリオピカチュウ
    { id: 'LM-P001', name: 'リーリエ PSA10', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'LM-P002', name: 'コイキング&ホエルオーGX PSA10', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'LM-P003', name: 'ホワイトコレクション 1パック', rarity: 'SS', image: '/images/ngcard.jpg' },
    { id: 'LM-P011', name: 'マリオピカチュウ PSA10', rarity: 'S', image: '/images/ngcard.jpg' },
    { id: 'LM-P021', name: 'N PSA10', rarity: 'A', image: '/images/ngcard.jpg' },
    { id: 'LM-P036', name: 'コイキング&ホエルオー SR PSA10', rarity: 'B', image: '/images/ngcard.jpg' },
    { id: 'LM-P045', name: 'ニンフィアex PSA10', rarity: 'C', image: '/images/ngcard.jpg' }
  ]
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const gachaId = params.id
    
    // サンプルプールデータから返す
    const poolCards = GACHA_POOLS[gachaId as keyof typeof GACHA_POOLS]
    
    if (!poolCards) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }
    
    return NextResponse.json({ cards: poolCards })
  } catch (error) {
    console.error('Error fetching gacha pool:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}