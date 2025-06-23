'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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

export default function ImportCardsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isImporting, setIsImporting] = useState(false)
  const [previewData, setPreviewData] = useState<ImportedCard[]>([])
  const [csvFile, setCsvFile] = useState<File | null>(null)

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
        image_url: '/images/ngcard.jpg', // 全てNGカード画像を使用
        market_price: card.price,
        description: `${card.category}カード - ${card.rank}`
      }))

      // 既存の商品コードをチェック
      const existingCodes = await supabase
        .from('pokemon_cards')
        .select('product_code')
        .in('product_code', insertData.map(c => c.product_code))

      const existingCodesSet = new Set(
        existingCodes.data?.map(c => c.product_code) || []
      )

      // 重複していないデータのみフィルタリング
      const newData = insertData.filter(
        card => !existingCodesSet.has(card.product_code)
      )

      if (newData.length === 0) {
        toast.error('すべてのカードが既に登録済みです')
        return
      }

      // インサート実行
      const { data, error } = await supabase
        .from('pokemon_cards')
        .insert(newData)

      if (error) throw error

      const duplicateCount = insertData.length - newData.length
      
      toast.success(
        `${newData.length}件のカードをインポートしました` +
        (duplicateCount > 0 ? `（重複スキップ: ${duplicateCount}件）` : '')
      )
      
      router.push('/admin/cards')
    } catch (error) {
      console.error('Error importing cards:', error)
      toast.error('カードのインポートに失敗しました')
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
                  <div>• 画像: 全て /images/ngcard.jpg を使用</div>
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
          <li>カード画像は全て /images/ngcard.jpg が設定されます</li>
          <li>インポート後、個別にカード編集画面で実際の画像URLを設定してください</li>
          <li>大量データの場合、処理に時間がかかる場合があります</li>
        </ul>
      </div>
    </div>
  )
}