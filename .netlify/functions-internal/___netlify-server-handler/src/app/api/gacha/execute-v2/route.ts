// pages/api/gacha/execute-v2.ts - 端末2統合版
import { NextResponse } from 'next/server'
import { supabase, db, handleSupabaseError } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

// ガチャ確率設定（端末3統合）
const GACHA_RATES = {
  SSR: 0.03,  // 3%
  SR: 0.12,   // 12%
  R: 0.35,    // 35%
  N: 0.50     // 50%
}

// ガチャコスト
const GACHA_COSTS = {
  single: 100,   // 1回100PT
  ten: 1000      // 10回1000PT
}

export async function POST(request: Request) {
  try {
    const supabaseClient = await createClient()
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, pullCount } = body
    
    // 互換性のため変数名を調整
    const gachaId = productId
    const type = pullCount === 10 ? 'ten' : 'single'
    const userId = user.id

    // バリデーション
    if (!gachaId || !type) {
      return NextResponse.json({ 
        error: '必要なパラメータが不足しています' 
      }, { status: 400 })
    }

    if (!['single', 'ten'].includes(type)) {
      return NextResponse.json({ 
        error: '無効なガチャタイプです' 
      }, { status: 400 })
    }

    // ユーザー情報取得
    const { data: userProfile, error: userError } = await db.getUser(userId)
    if (userError || !userProfile) {
      return NextResponse.json({ 
        error: 'ユーザーが見つかりません' 
      }, { status: 404 })
    }

    // ポイント確認
    const cost = GACHA_COSTS[type]
    const currentPoints = userProfile.points || 0
    
    if (currentPoints < cost) {
      return NextResponse.json({ 
        error: 'ポイントが不足しています' 
      }, { status: 400 })
    }

    // ガチャアイテム取得（簡易版 - 実際はガチャマスターから取得）
    const gachaItems = await getDefaultGachaItems()

    // ガチャ実行
    const results = []
    const drawCount = type === 'ten' ? 10 : 1

    for (let i = 0; i < drawCount; i++) {
      // 10連の場合、最後がSR確定
      const guaranteeSR = type === 'ten' && i === 9 && !results.some(r => ['SSR', 'SR'].includes(r.rarity))
      
      const result = await executeGachaDraw(gachaItems, guaranteeSR)
      results.push(result)

      // ガチャ履歴保存
      await db.saveGachaHistory(userId, {
        gachaId,
        cardId: result.card_id,
        rarity: result.rarity,
        pointsUsed: cost / drawCount
      })
    }

    // ポイント減算
    const newPoints = currentPoints - cost
    const { error: updateError } = await db.updateUserPoints(userId, newPoints)
    
    if (updateError) {
      throw new Error('ポイント更新に失敗しました')
    }

    // ポイント取引履歴保存
    await db.savePointTransaction(userId, {
      type: 'gacha',
      amount: -cost,
      description: `ガチャ実行 (${type === 'ten' ? '10連' : '1回'})`
    })

    // レスポンス（端末5の演出システムと連携）
    return NextResponse.json({
      success: true,
      results: results.map(r => ({
        id: r.card_id,
        name: r.name,
        rarity: r.rarity,
        imageUrl: r.imageUrl,
        isNew: r.is_new
      })),
      remainingPoints: newPoints,
      statistics: calculateStatistics(results)
    })

  } catch (error) {
    console.error('Gacha execute error:', error)
    return NextResponse.json({ 
      error: 'ガチャ実行中にエラーが発生しました' 
    }, { status: 500 })
  }
}

// ガチャ抽選実行
async function executeGachaDraw(gachaItems: any[], guaranteeSR = false) {
  try {
    // レアリティ別アイテム分類
    const itemsByRarity = gachaItems.reduce((acc, item) => {
      const rarity = item.rarity
      if (!acc[rarity]) acc[rarity] = []
      acc[rarity].push(item)
      return acc
    }, {} as Record<string, any[]>)

    let selectedRarity
    
    if (guaranteeSR) {
      // SR以上確定
      selectedRarity = Math.random() < 0.2 ? 'SSR' : 'SR' // SSR:SR = 1:4
    } else {
      // 通常確率
      const random = Math.random()
      let cumulative = 0
      
      for (const [rarity, rate] of Object.entries(GACHA_RATES)) {
        cumulative += rate
        if (random <= cumulative) {
          selectedRarity = rarity
          break
        }
      }
    }

    // 選択されたレアリティからランダム選択
    let availableItems = itemsByRarity[selectedRarity] || []
    if (!availableItems.length) {
      // フォールバック：N確定
      selectedRarity = 'N'
      availableItems = itemsByRarity['N'] || []
    }

    const selectedItem = availableItems[Math.floor(Math.random() * availableItems.length)]
    
    return {
      card_id: selectedItem.id,
      name: selectedItem.name,
      rarity: selectedRarity,
      imageUrl: selectedItem.imageUrl,
      is_new: Math.random() < 0.3 // 30%の確率で新規（仮実装）
    }

  } catch (error) {
    console.error('Gacha draw error:', error)
    throw error
  }
}

// 統計計算
function calculateStatistics(results: any[]) {
  const stats = {
    total: results.length,
    SSR: 0,
    SR: 0,
    R: 0,
    N: 0,
    newCards: 0
  }

  results.forEach(result => {
    stats[result.rarity as keyof typeof stats]++
    if (result.is_new) stats.newCards++
  })

  return stats
}

// デフォルトガチャアイテム（仮実装）
async function getDefaultGachaItems() {
  return [
    // SSR
    { id: 'card_001', name: 'ミュウツーEX', rarity: 'SSR', imageUrl: '/api/placeholder/cards/mewtwo-ex' },
    { id: 'card_002', name: 'レックウザVMAX', rarity: 'SSR', imageUrl: '/api/placeholder/cards/rayquaza-vmax' },
    
    // SR
    { id: 'card_010', name: 'ピカチュウV', rarity: 'SR', imageUrl: '/api/placeholder/cards/pikachu-v' },
    { id: 'card_011', name: 'リザードンV', rarity: 'SR', imageUrl: '/api/placeholder/cards/charizard-v' },
    { id: 'card_012', name: 'フシギバナV', rarity: 'SR', imageUrl: '/api/placeholder/cards/venusaur-v' },
    
    // R
    { id: 'card_020', name: 'イーブイ', rarity: 'R', imageUrl: '/api/placeholder/cards/eevee' },
    { id: 'card_021', name: 'ガブリアス', rarity: 'R', imageUrl: '/api/placeholder/cards/garchomp' },
    { id: 'card_022', name: 'ルカリオ', rarity: 'R', imageUrl: '/api/placeholder/cards/lucario' },
    { id: 'card_023', name: 'ゲンガー', rarity: 'R', imageUrl: '/api/placeholder/cards/gengar' },
    
    // N
    { id: 'card_030', name: 'ポッポ', rarity: 'N', imageUrl: '/api/placeholder/cards/pidgey' },
    { id: 'card_031', name: 'コラッタ', rarity: 'N', imageUrl: '/api/placeholder/cards/rattata' },
    { id: 'card_032', name: 'キャタピー', rarity: 'N', imageUrl: '/api/placeholder/cards/caterpie' },
    { id: 'card_033', name: 'ビードル', rarity: 'N', imageUrl: '/api/placeholder/cards/weedle' },
    { id: 'card_034', name: 'コイキング', rarity: 'N', imageUrl: '/api/placeholder/cards/magikarp' }
  ]
}