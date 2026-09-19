import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

const POKECA_DIR = '/Users/kousuke/Downloads/pokeca'
const IMAGES_DIR = path.join(POKECA_DIR, 'images')
const MANUAL_IMAGES_DIR = path.join(POKECA_DIR, '手動画像')
const CACHE_FILE = path.join(POKECA_DIR, 'ai_card_excel_cache.json')
const PAID_TIER_CACHE_FILE = path.join(POKECA_DIR, 'paid_tier_cache.json')

interface ImageFile {
  fileName: string
  score: number
  cardName?: string
}

interface CardInfo {
  pokemon_or_character?: string
  full_card_name?: string
  card_number?: string
  rarity?: string
  series?: string
  suggested_filename?: string
}

interface CacheData {
  [key: string]: CardInfo
}

interface PaidTierCacheData {
  [key: string]: string  // Simple card name strings
}

let cacheData: CacheData | null = null
let paidTierCacheData: PaidTierCacheData | null = null
let cacheIndex: Map<string, CardInfo> | null = null
let paidTierIndex: Map<string, string> | null = null
let imageFilesList: string[] | null = null

async function loadCache(): Promise<CacheData> {
  if (cacheData) return cacheData

  try {
    // Load ai_card_excel_cache.json (detailed info)
    const cacheContent = await fs.readFile(CACHE_FILE, 'utf-8')
    cacheData = JSON.parse(cacheContent)

    // Create index for O(1) lookup
    cacheIndex = new Map()
    for (const [key, value] of Object.entries(cacheData)) {
      const match = key.match(/card_[^.]+/)
      if (match) {
        cacheIndex.set(match[0], value)
      }
      // Also index by just the filename without path
      const filename = key.split('/').pop()?.replace(/\.(webp|jpg|jpeg|png)$/i, '')
      if (filename) {
        cacheIndex.set(filename, value)
      }
    }

    console.log(`[Cache] Loaded ai_card_excel_cache: ${Object.keys(cacheData).length} entries`)

    // Load paid_tier_cache.json (simple card names)
    try {
      const paidTierContent = await fs.readFile(PAID_TIER_CACHE_FILE, 'utf-8')
      paidTierCacheData = JSON.parse(paidTierContent)

      // Create index for paid tier cache
      paidTierIndex = new Map()
      for (const [key, value] of Object.entries(paidTierCacheData)) {
        const fileBase = key.replace(/\.(webp|jpg|jpeg|png|gif)$/i, '')
        paidTierIndex.set(fileBase, value)
      }

      console.log(`[Cache] Loaded paid_tier_cache: ${Object.keys(paidTierCacheData).length} entries`)
    } catch (paidError) {
      console.log('[Cache] paid_tier_cache.json not found, using only ai_card_excel_cache')
    }

    return cacheData!
  } catch (error) {
    console.error('Failed to load cache:', error)
    return {}
  }
}

async function loadImageFiles(): Promise<string[]> {
  if (imageFilesList) return imageFilesList

  try {
    console.log('[Search] Loading image files list...')

    // 通常の画像フォルダから読み込み
    const files = await fs.readdir(IMAGES_DIR)
    const regularImages = files.filter(f => /\.(webp|jpg|jpeg|png|gif)$/i.test(f))

    // 手動画像フォルダから読み込み
    let manualImages: string[] = []
    try {
      const manualFiles = await fs.readdir(MANUAL_IMAGES_DIR)
      manualImages = manualFiles
        .filter(f => /\.(webp|jpg|jpeg|png|gif)$/i.test(f))
        .map(f => `手動/${f}`) // プレフィックスを付けて区別
    } catch (err) {
      console.log('[Search] Manual images folder not found or empty')
    }

    imageFilesList = [...regularImages, ...manualImages]
    console.log(`[Search] Loaded ${regularImages.length} regular + ${manualImages.length} manual = ${imageFilesList.length} total images`)
    return imageFilesList
  } catch (error) {
    console.error('Failed to load image files:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')

    if (!query) {
      return NextResponse.json(
        { error: 'Missing query parameter' },
        { status: 400 }
      )
    }

    // キャッシュを読み込み
    const cache = await loadCache()

    // 全画像ファイルを取得（キャッシュ済み）
    const allImages = await loadImageFiles()

    // 検索クエリを正規化
    const normalizedQuery = query.toLowerCase().replace(/\s+/g, '')

    // 検索結果をスコアリング
    const results: ImageFile[] = []

    for (const fileName of allImages) {
      const normalizedFileName = fileName.toLowerCase()

      // 手動画像の場合はプレフィックスを除去してキャッシュ検索
      const isManual = fileName.startsWith('手動/')
      const actualFileName = isManual ? fileName.substring(3) : fileName // '手動/'を除去
      const fileBase = actualFileName.replace(/\.(webp|jpg|jpeg|png|gif)$/i, '')

      // キャッシュからカード情報を探す（インデックス使用でO(1)）
      const cardInfo = cacheIndex?.get(fileBase) || null
      const paidTierCardName = paidTierIndex?.get(fileBase) || null

      let score = 0
      let matchText = normalizedFileName

      // カード情報がある場合はそれも検索対象に含める
      if (cardInfo) {
        const searchableText = [
          cardInfo.pokemon_or_character,
          cardInfo.full_card_name,
          cardInfo.card_number,
          cardInfo.rarity,
          cardInfo.series,
          cardInfo.suggested_filename,
          actualFileName  // 実際のファイル名も含める
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .replace(/\s+/g, '')

        matchText = searchableText
      } else if (paidTierCardName) {
        // ai_card_excel_cacheになくてもpaid_tier_cacheにあればそれを使う
        const searchableText = [paidTierCardName, actualFileName]
          .join(' ')
          .toLowerCase()
          .replace(/\s+/g, '')
        matchText = searchableText
      } else if (isManual) {
        // 手動画像の場合、ファイル名自体が検索に有用
        matchText = actualFileName.toLowerCase().replace(/\s+/g, '')
      }

      // 完全一致（高スコア）
      if (matchText.includes(normalizedQuery)) {
        score = 100

        // ファイル名での完全一致はさらに高スコア
        if (normalizedFileName.includes(normalizedQuery)) {
          score = 110
        }
      } else {
        // 部分一致（文字単位）
        const queryChars = normalizedQuery.split('')
        let matchCount = 0
        for (const char of queryChars) {
          if (matchText.includes(char)) {
            matchCount++
          }
        }
        score = Math.round((matchCount / queryChars.length) * 100)
      }

      // スコア30以上のみ含める（より多くの結果を表示）
      if (score >= 30) {
        results.push({
          fileName,
          score,
          cardName: cardInfo?.full_card_name || cardInfo?.pokemon_or_character || paidTierCardName
        })
      }
    }

    // スコアでソート
    results.sort((a, b) => b.score - a.score)

    // 上位500件を返す
    return NextResponse.json({
      images: results.slice(0, 500),
      total: results.length
    })

  } catch (error) {
    console.error('Error in search-images API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
