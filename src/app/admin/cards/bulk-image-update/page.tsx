'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

interface Card {
  id: string
  card_name: string
  product_code: string
  image_url: string
  new_image_url?: string
}

interface ImageMapping {
  keyword: string
  image_url: string
}

// デフォルトの画像マッピング
const DEFAULT_MAPPINGS: ImageMapping[] = [
  { keyword: 'アセロラ', image_url: '/images/pokemon/003_アセロラ(エクバ) PSA10_PK-0003.jpg' },
  { keyword: 'マリオピカチュウ', image_url: '/images/pokemon/008_マリオピカチュウ PSA10_PK-0008.jpg' },
  { keyword: 'ポンチョを着たピカチュウ(黒リザ)', image_url: '/images/pokemon/010_ポンチョを着たピカチュウ(黒リザ) PSA10_PK-0010.jpg' },
  { keyword: 'ポンチョを着たピカチュウ(リザ)', image_url: '/images/pokemon/016_ポンチョを着たピカチュウ(リザ) PSA10_PK-0016.jpg' },
  { keyword: 'ポンチョを着たピカチュウ(黒レックウザ)', image_url: '/images/pokemon/019_ポンチョを着たピカチュウ(黒レックウザ) PSA10_PK-0019.jpg' },
  { keyword: 'ポンチョを着たピカチュウ(レックウザ)', image_url: '/images/pokemon/020_ポンチョを着たピカチュウ(レックウザ) PSA10_PK-0020.jpg' },
  { keyword: 'アローラの仲間たち', image_url: '/images/pokemon/032_アローラの仲間たち PSA10_PK-0032.jpg' },
  { keyword: 'ブルーの探索', image_url: '/images/pokemon/185_ブルーの探索 PSA10_PK-0187.jpg' },
  { keyword: 'ブラッキーex', image_url: '/images/pokemon/197_ブラッキーex PSA10_PK-0199.jpg' },
  { keyword: 'おじょうさま', image_url: '/images/pokemon/204_おじょうさま PSA10_PK-0206.jpg' },
  { keyword: 'ヒガナ', image_url: '/images/pokemon/220_ヒガナ PSA10_PK-0223.jpg' },
]

export default function BulkImageUpdatePage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [mappings, setMappings] = useState<ImageMapping[]>(DEFAULT_MAPPINGS)
  const [newMapping, setNewMapping] = useState({ keyword: '', image_url: '' })
  const [updateMethod, setUpdateMethod] = useState<'mapping' | 'csv'>('mapping')
  const [csvText, setCsvText] = useState('')
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('pokemon_cards')
        .select('id, card_name, product_code, image_url')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setCards(data || [])
    } catch (error) {
      console.error('Error fetching cards:', error)
      toast.error('カード一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const addMapping = () => {
    if (newMapping.keyword && newMapping.image_url) {
      setMappings([...mappings, newMapping])
      setNewMapping({ keyword: '', image_url: '' })
      toast.success('マッピングを追加しました')
    }
  }

  const removeMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index))
  }

  const applyMappings = () => {
    const updatedCards = cards.map(card => {
      for (const mapping of mappings) {
        if (card.card_name.includes(mapping.keyword)) {
          return { ...card, new_image_url: mapping.image_url }
        }
      }
      return card
    })
    setCards(updatedCards)
    toast.success('マッピングを適用しました')
  }

  const parseCsv = () => {
    const lines = csvText.trim().split('\n')
    const updatedCards = [...cards]
    
    lines.forEach(line => {
      const [product_code, image_url] = line.split(',').map(s => s.trim())
      if (product_code && image_url) {
        const cardIndex = updatedCards.findIndex(c => c.product_code === product_code)
        if (cardIndex !== -1) {
          updatedCards[cardIndex] = {
            ...updatedCards[cardIndex],
            new_image_url: image_url
          }
        }
      }
    })
    
    setCards(updatedCards)
    toast.success('CSVデータを適用しました')
  }

  const updateSelectedCards = async () => {
    const cardsToUpdate = cards.filter(card => 
      selectedCards.has(card.id) && card.new_image_url
    )
    
    if (cardsToUpdate.length === 0) {
      toast.error('更新対象のカードがありません')
      return
    }
    
    setUpdating(true)
    try {
      // バッチ更新（10件ずつ）
      const batchSize = 10
      let successCount = 0
      
      for (let i = 0; i < cardsToUpdate.length; i += batchSize) {
        const batch = cardsToUpdate.slice(i, i + batchSize)
        
        for (const card of batch) {
          const { error } = await supabaseAdmin
            .from('pokemon_cards')
            .update({ image_url: card.new_image_url })
            .eq('id', card.id)
          
          if (!error) {
            successCount++
          }
        }
      }
      
      toast.success(`${successCount}件のカード画像を更新しました`)
      
      // リロード
      await fetchCards()
      setSelectedCards(new Set())
    } catch (error) {
      console.error('Update error:', error)
      toast.error('更新に失敗しました')
    } finally {
      setUpdating(false)
    }
  }

  const updateAllCards = async () => {
    const cardsToUpdate = cards.filter(card => card.new_image_url)
    
    if (cardsToUpdate.length === 0) {
      toast.error('更新対象のカードがありません')
      return
    }
    
    if (!confirm(`${cardsToUpdate.length}件のカードを更新しますか？`)) {
      return
    }
    
    setUpdating(true)
    try {
      // バッチ更新
      const batchSize = 10
      let successCount = 0
      
      for (let i = 0; i < cardsToUpdate.length; i += batchSize) {
        const batch = cardsToUpdate.slice(i, i + batchSize)
        
        for (const card of batch) {
          const { error } = await supabaseAdmin
            .from('pokemon_cards')
            .update({ image_url: card.new_image_url })
            .eq('id', card.id)
          
          if (!error) {
            successCount++
          }
        }
      }
      
      toast.success(`${successCount}件のカード画像を更新しました`)
      
      // リロード
      await fetchCards()
    } catch (error) {
      console.error('Update error:', error)
      toast.error('更新に失敗しました')
    } finally {
      setUpdating(false)
    }
  }

  const toggleCardSelection = (cardId: string) => {
    const newSelected = new Set(selectedCards)
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId)
    } else {
      newSelected.add(cardId)
    }
    setSelectedCards(newSelected)
  }

  const selectAll = () => {
    const allIds = cards.filter(card => card.new_image_url).map(card => card.id)
    setSelectedCards(new Set(allIds))
  }

  const deselectAll = () => {
    setSelectedCards(new Set())
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  const cardsWithNewImages = cards.filter(card => card.new_image_url)

  return (
    <div className="container-fluid mt-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/admin/cards">カード管理</Link>
          </li>
          <li className="breadcrumb-item active">画像一括更新</li>
        </ol>
      </nav>

      <h1>カード画像一括更新</h1>

      <div className="row">
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">更新方法を選択</h5>
            </div>
            <div className="card-body">
              <div className="btn-group w-100 mb-3" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  id="methodMapping"
                  checked={updateMethod === 'mapping'}
                  onChange={() => setUpdateMethod('mapping')}
                />
                <label className="btn btn-outline-primary" htmlFor="methodMapping">
                  キーワードマッピング
                </label>
                
                <input
                  type="radio"
                  className="btn-check"
                  id="methodCsv"
                  checked={updateMethod === 'csv'}
                  onChange={() => setUpdateMethod('csv')}
                />
                <label className="btn btn-outline-primary" htmlFor="methodCsv">
                  CSV入力
                </label>
              </div>

              {updateMethod === 'mapping' ? (
                <div>
                  <h6>キーワードマッピング</h6>
                  <p className="small text-muted">カード名に含まれるキーワードで画像を自動設定</p>
                  
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control form-control-sm mb-2"
                      placeholder="キーワード（例：ピカチュウ）"
                      value={newMapping.keyword}
                      onChange={(e) => setNewMapping({ ...newMapping, keyword: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm mb-2"
                      placeholder="画像URL（例：/images/pokemon/xxx.jpg）"
                      value={newMapping.image_url}
                      onChange={(e) => setNewMapping({ ...newMapping, image_url: e.target.value })}
                    />
                    <button
                      className="btn btn-sm btn-primary w-100"
                      onClick={addMapping}
                    >
                      マッピング追加
                    </button>
                  </div>

                  <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {mappings.map((mapping, index) => (
                      <div key={index} className="d-flex align-items-center mb-2 p-2 bg-light rounded">
                        <div className="flex-grow-1 small">
                          <div><strong>{mapping.keyword}</strong></div>
                          <div className="text-muted" style={{ fontSize: '0.8em' }}>{mapping.image_url}</div>
                        </div>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => removeMapping(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn btn-success w-100"
                    onClick={applyMappings}
                  >
                    マッピングを適用
                  </button>
                </div>
              ) : (
                <div>
                  <h6>CSV入力</h6>
                  <p className="small text-muted">商品コードと画像URLをCSV形式で入力</p>
                  
                  <textarea
                    className="form-control mb-3"
                    rows={10}
                    placeholder="商品コード,画像URL&#10;A-O=N-000001,/images/pokemon/001.jpg&#10;A-O=N-000002,/images/pokemon/002.jpg"
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                  />
                  
                  <button
                    className="btn btn-success w-100"
                    onClick={parseCsv}
                  >
                    CSVを適用
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  更新プレビュー ({cardsWithNewImages.length}件)
                </h5>
                <div>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={selectAll}
                  >
                    全選択
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={deselectAll}
                  >
                    選択解除
                  </button>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={updateSelectedCards}
                    disabled={updating || selectedCards.size === 0}
                  >
                    選択した{selectedCards.size}件を更新
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={updateAllCards}
                    disabled={updating || cardsWithNewImages.length === 0}
                  >
                    全て更新
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th width="30">
                        <input
                          type="checkbox"
                          checked={selectedCards.size === cardsWithNewImages.length && cardsWithNewImages.length > 0}
                          onChange={() => {
                            if (selectedCards.size === cardsWithNewImages.length) {
                              deselectAll()
                            } else {
                              selectAll()
                            }
                          }}
                        />
                      </th>
                      <th>カード名</th>
                      <th>商品コード</th>
                      <th>現在の画像</th>
                      <th>新しい画像</th>
                      <th>プレビュー</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cardsWithNewImages.map((card) => (
                      <tr key={card.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedCards.has(card.id)}
                            onChange={() => toggleCardSelection(card.id)}
                          />
                        </td>
                        <td>{card.card_name}</td>
                        <td><small>{card.product_code}</small></td>
                        <td>
                          <small className="text-muted">
                            {card.image_url?.split('/').pop() || 'なし'}
                          </small>
                        </td>
                        <td>
                          <small className="text-success">
                            {card.new_image_url?.split('/').pop()}
                          </small>
                        </td>
                        <td>
                          <img
                            src={card.new_image_url}
                            alt={card.card_name}
                            style={{ height: '50px' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.border = '1px solid red'
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {cardsWithNewImages.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    更新対象のカードがありません。<br />
                    左側でマッピングを設定するか、CSVを入力してください。
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}