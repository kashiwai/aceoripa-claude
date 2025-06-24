'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface ImportedCard {
  category: string
  product_code: string
  card_name: string
  rank: string
  price: number
  rarity: string
}

// 実際のポケモン画像とのマッピング
const IMAGE_MAPPING: Record<string, string> = {
  'アセロラ': '/images/pokemon/003_アセロラ(エクバ) PSA10_PK-0003.jpg',
  'マリオピカチュウ': '/images/pokemon/008_マリオピカチュウ PSA10_PK-0008.jpg',
  'ポンチョを着たピカチュウ(黒リザ)': '/images/pokemon/010_ポンチョを着たピカチュウ(黒リザ) PSA10_PK-0010.jpg',
  'ポンチョを着たピカチュウ(リザ)': '/images/pokemon/016_ポンチョを着たピカチュウ(リザ) PSA10_PK-0016.jpg',
  'ポンチョを着たピカチュウ(黒レックウザ)': '/images/pokemon/019_ポンチョを着たピカチュウ(黒レックウザ) PSA10_PK-0019.jpg',
  'ポンチョを着たピカチュウ(レックウザ)': '/images/pokemon/020_ポンチョを着たピカチュウ(レックウザ) PSA10_PK-0020.jpg',
  'アローラの仲間たち': '/images/pokemon/032_アローラの仲間たち PSA10_PK-0032.jpg',
  'ブルーの探索': '/images/pokemon/185_ブルーの探索 PSA10_PK-0187.jpg',
  'ブラッキーex': '/images/pokemon/197_ブラッキーex PSA10_PK-0199.jpg',
  'おじょうさま': '/images/pokemon/204_おじょうさま PSA10_PK-0206.jpg',
  'ヒガナ': '/images/pokemon/220_ヒガナ PSA10_PK-0223.jpg',
}

export default function ImportCardsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isImporting, setIsImporting] = useState(false)
  const [previewData, setPreviewData] = useState<ImportedCard[]>([])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [uploadMethod, setUploadMethod] = useState<'api' | 'direct'>('api')

  // ランクをレアリティにマッピング
  const mapRankToRarity = (rank: string): string => {
    const normalizedRank = rank.toLowerCase().replace('rank', '')
    switch (normalizedRank) {
      case 'ss':
        return 'SS'
      case 's':
        return 'S'
      case 'a':
        return 'A'
      case 'b':
        return 'B'
      case 'c':
        return 'C'
      default:
        return 'C' // デフォルト
    }
  }

  // カード名から画像URLを取得
  const getImageUrl = (cardName: string): string => {
    // 完全一致を試す
    if (IMAGE_MAPPING[cardName]) {
      return IMAGE_MAPPING[cardName]
    }
    
    // 部分一致を試す
    for (const [key, value] of Object.entries(IMAGE_MAPPING)) {
      if (cardName.includes(key) || key.includes(cardName)) {
        return value
      }
    }
    
    // デフォルト画像
    return '/api/test-image'
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const csv = e.target?.result as string
      const lines = csv.split('\n')
      const headers = lines[0].split(',')
      
      // BOMを除去
      const cleanHeaders = headers.map(h => h.replace(/^\uFEFF/, '').trim())
      
      const data: ImportedCard[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const values = line.split(',')
        if (values.length >= 5) {
          const rank = values[3]?.trim() || ''
          const rarity = mapRankToRarity(rank)
          
          data.push({
            category: values[0]?.trim() || '',
            product_code: values[1]?.trim() || '',
            card_name: values[2]?.trim() || '',
            rank: rank,
            price: parseInt(values[4]?.trim() || '0'),
            rarity: rarity
          })
        }
      }
      
      setPreviewData(data)
      toast.success(`${data.length}件のカードデータを読み込みました`)
    }
    
    reader.readAsText(file, 'UTF-8')
  }

  const handleImport = async () => {
    if (previewData.length === 0) {
      toast.error('インポートするデータがありません')
      return
    }

    setIsImporting(true)
    
    try {
      // バッチでインサート（重複チェック付き）
      const insertData = previewData.map(card => ({
        card_name: card.card_name,
        product_code: card.product_code,
        rarity: card.rarity,
        image_url: getImageUrl(card.card_name), // カード名に基づいて画像URLを設定
        market_price: card.price,
        description: `${card.category}カード - ${card.rank}`
      }))

      if (uploadMethod === 'direct') {
        // Supabaseに直接インポート
        console.log('Direct import mode')
        
        // 既存データの確認
        const { data: existingCards, error: checkError } = await supabase
          .from('pokemon_cards')
          .select('product_code')
          .in('product_code', insertData.map(c => c.product_code))

        if (checkError && checkError.code !== '42P01') {
          console.error('Check error:', checkError)
        }

        const existingCodes = new Set(existingCards?.map(c => c.product_code) || [])
        const newCards = insertData.filter(card => !existingCodes.has(card.product_code))
        
        if (newCards.length === 0) {
          toast.warning('すべてのカードが既に登録済みです')
          router.push('/admin/cards')
          return
        }

        // バッチインポート（50件ずつ）
        let imported = 0
        const batchSize = 50
        
        for (let i = 0; i < newCards.length; i += batchSize) {
          const batch = newCards.slice(i, i + batchSize)
          
          const { data, error } = await supabase
            .from('pokemon_cards')
            .insert(batch)
            .select()

          if (error) {
            console.error('Insert error:', error)
            toast.error(`バッチ ${Math.floor(i/batchSize) + 1} でエラー: ${error.message}`)
          } else {
            imported += data?.length || 0
          }
        }

        toast.success(
          `${imported}件のカードをインポートしました` +
          (insertData.length - newCards.length > 0 ? `（重複スキップ: ${insertData.length - newCards.length}件）` : '')
        )
        
      } else {
        // APIルートを使用してインポート
        const response = await fetch('/api/admin/cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cards: insertData })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'インポートに失敗しました')
        }

        toast.success(
          `${result.imported}件のカードをインポートしました` +
          (result.skipped > 0 ? `（重複スキップ: ${result.skipped}件）` : '')
        )
      }
      
      router.push('/admin/cards')
    } catch (error) {
      console.error('Error importing cards:', error)
      if (error instanceof Error) {
        toast.error(`インポートエラー: ${error.message}`)
      } else {
        toast.error('カードのインポートに失敗しました')
      }
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div>
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/admin/cards" className="text-decoration-none">
              カード管理
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            CSVインポート
          </li>
        </ol>
      </nav>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">CSVインポート</h1>
      </div>

      <div className="row">
        {/* アップロードエリア */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">CSVファイルアップロード</h5>
              
              <div className="mb-3">
                <label className="form-label">
                  CSVファイルを選択
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="form-control"
                />
              </div>

              {previewData.length > 0 && (
                <>
                  <div className="alert alert-success">
                    ✅ {previewData.length}件のカードデータを読み込みました
                  </div>
                  
                  {/* インポート方法の選択 */}
                  <div className="mb-3">
                    <label className="form-label">インポート方法</label>
                    <div className="btn-group w-100" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="uploadMethod"
                        id="methodApi"
                        checked={uploadMethod === 'api'}
                        onChange={() => setUploadMethod('api')}
                      />
                      <label className="btn btn-outline-secondary" htmlFor="methodApi">
                        APIルート経由（推奨）
                      </label>
                      
                      <input
                        type="radio"
                        className="btn-check"
                        name="uploadMethod"
                        id="methodDirect"
                        checked={uploadMethod === 'direct'}
                        onChange={() => setUploadMethod('direct')}
                      />
                      <label className="btn btn-outline-secondary" htmlFor="methodDirect">
                        直接インポート
                      </label>
                    </div>
                    <small className="text-muted d-block mt-1">
                      {uploadMethod === 'api' 
                        ? 'サーバー側で処理（安全）' 
                        : 'ブラウザから直接処理（エラー時に使用）'}
                    </small>
                  </div>
                  
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="btn btn-primary w-100"
                  >
                    {isImporting ? 'インポート中...' : `${previewData.length}件をインポート`}
                  </button>
                </>
              )}

              {/* フォーマット説明 */}
              <div className="alert alert-info mt-3">
                <h6 className="alert-heading">CSVフォーマット</h6>
                <div className="small">
                  <div>• カテゴリー名,新コード,商品名,ランク,交換ポイント</div>
                  <div>• ランク: RankSS, RankS, RankA, RankB, RankC</div>
                  <div>• 交換ポイント: 数値（円）</div>
                  <div>• 文字エンコード: UTF-8</div>
                  <div>• 画像: カード名に基づいて自動設定</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* プレビューエリア */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                プレビュー ({previewData.length}件)
              </h5>
              
              {previewData.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <div style={{fontSize: '4rem'}}>📄</div>
                  <p>CSVファイルをアップロードしてプレビューを表示</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>カード名</th>
                        <th>商品コード</th>
                        <th>レアリティ</th>
                        <th>価格</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 10).map((card, index) => (
                        <tr key={index}>
                          <td>{card.card_name}</td>
                          <td><small className="text-muted">{card.product_code}</small></td>
                          <td>
                            <span className={`badge ${
                              card.rarity === 'SS' ? 'bg-warning' :
                              card.rarity === 'S' ? 'bg-info' :
                              card.rarity === 'A' ? 'bg-primary' :
                              card.rarity === 'B' ? 'bg-success' : 'bg-secondary'
                            }`}>
                              {card.rarity}賞
                            </span>
                          </td>
                          <td>¥{card.price.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {previewData.length > 10 && (
                    <div className="text-center mt-3">
                      <small className="text-muted">...他 {previewData.length - 10}件</small>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="alert alert-warning">
        <h6 className="alert-heading">⚠️ 注意事項</h6>
        <ul className="mb-0 small">
          <li>商品コードが重複する場合、既存データはスキップされます</li>
          <li>カード画像は、カード名に基づいて自動的に設定されます</li>
          <li>画像が見つからない場合は、デフォルト画像が使用されます</li>
          <li>大量データの場合、処理に時間がかかる場合があります</li>
        </ul>
      </div>
    </div>
  )
}