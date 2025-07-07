'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CardData {
  id: string
  card_name: string
  product_code: string
  rarity: string
  market_price: number
}

interface SimulationResult {
  gachaTitle: string
  selectedCards: {
    SS: CardData[]
    S: CardData[]
    A: CardData[]
    B: CardData[]
    C: CardData[]
  }
  cardCounts: {
    SS: number
    S: number
    A: number
    B: number
    C: number
  }
  profitability: {
    expectedCost: number
    profitPerPull: number
    profitRate: number
    breakEvenPulls: number
  }
  aiReasoning: string
  recommendations: {
    shouldLaunch: boolean
    message: string
  }
}

export default function AutoSimulationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [cards, setCards] = useState<CardData[]>([])
  const [selectedSS, setSelectedSS] = useState<CardData[]>([])
  const [selectedS, setSelectedS] = useState<CardData[]>([])
  const [searchSS, setSearchSS] = useState('')
  const [searchS, setSearchS] = useState('')
  const [gachaTitle, setGachaTitle] = useState('')
  const [pullPrice, setPullPrice] = useState(3000)
  const [cardCount, setCardCount] = useState(5)
  const [targetProfit, setTargetProfit] = useState(30)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'ss' | 's'>('ss')

  // カードデータの読み込み
  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    setLoading(true)
    try {
      // 全カードを取得するために大きなlimitを設定
      const res = await fetch('/api/admin/cards?limit=10000')
      if (!res.ok) {
        const errorText = await res.text()
        console.error('API Error:', errorText)
        throw new Error('Failed to fetch cards')
      }
      const data = await res.json()
      const allCards = data.cards || []
      setCards(allCards)
      
      // デバッグ: レアリティ別のカード数を表示
      const rarityCounts = allCards.reduce((acc: Record<string, number>, card: CardData) => {
        acc[card.rarity] = (acc[card.rarity] || 0) + 1
        return acc
      }, {})
      console.log('Total cards fetched:', allCards.length)
      console.log('Card counts by rarity:', rarityCounts)
      console.log('SS cards:', allCards.filter((c: CardData) => c.rarity === 'SS').length)
      console.log('S cards:', allCards.filter((c: CardData) => c.rarity === 'S').length)
      
      // SS/Sカードのサンプルを表示
      const ssSample = allCards.filter((c: CardData) => c.rarity === 'SS').slice(0, 3)
      const sSample = allCards.filter((c: CardData) => c.rarity === 'S').slice(0, 3)
      if (ssSample.length > 0) {
        console.log('Sample SS cards:', ssSample.map((c: CardData) => c.card_name))
      }
      if (sSample.length > 0) {
        console.log('Sample S cards:', sSample.map((c: CardData) => c.card_name))
      }
    } catch (err) {
      setError('カードデータの取得に失敗しました')
      console.error('Error fetching cards:', err)
    } finally {
      setLoading(false)
    }
  }

  // カードの選択/解除
  const toggleCardSelection = (card: CardData, type: 'SS' | 'S') => {
    if (type === 'SS') {
      setSelectedSS(prev => 
        prev.find(c => c.id === card.id)
          ? prev.filter(c => c.id !== card.id)
          : [...prev, card]
      )
    } else {
      setSelectedS(prev =>
        prev.find(c => c.id === card.id)
          ? prev.filter(c => c.id !== card.id)
          : [...prev, card]
      )
    }
  }

  // フィルタリングされたカード（改善された検索）
  const searchFilter = (card: CardData, search: string, rarity: string) => {
    if (card.rarity !== rarity) return false
    if (!search) return true
    
    const searchLower = search.toLowerCase()
    const cardNameLower = card.card_name.toLowerCase()
    
    // 部分一致検索
    if (cardNameLower.includes(searchLower)) return true
    
    // ひらがな・カタカナの変換を考慮
    const hiraganaToKatakana = (str: string) => {
      return str.replace(/[\u3041-\u3096]/g, (match) => {
        const code = match.charCodeAt(0) + 0x60
        return String.fromCharCode(code)
      })
    }
    
    const katakanaToHiragana = (str: string) => {
      return str.replace(/[\u30A1-\u30F6]/g, (match) => {
        const code = match.charCodeAt(0) - 0x60
        return String.fromCharCode(code)
      })
    }
    
    // ひらがな・カタカナ両方で検索
    const searchKatakana = hiraganaToKatakana(searchLower)
    const searchHiragana = katakanaToHiragana(searchLower)
    
    return cardNameLower.includes(searchKatakana) || cardNameLower.includes(searchHiragana)
  }

  const filteredSSCards = cards.filter(card => searchFilter(card, searchSS, 'SS'))
  const filteredSCards = cards.filter(card => searchFilter(card, searchS, 'S'))

  // シミュレーション実行
  const runSimulation = async () => {
    if (!gachaTitle) {
      setError('ガチャタイトルを入力してください')
      return
    }

    if (selectedSS.length === 0 && selectedS.length === 0) {
      setError('SS賞またはS賞を最低1枚は選択してください')
      return
    }

    setSimulating(true)
    setError('')

    try {
      const res = await fetch('/api/admin/gacha/auto-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gachaTitle,
          ssCards: selectedSS,
          sCards: selectedS,
          targetProfit,
          pullPrice,
          cardCount
        })
      })

      if (!res.ok) throw new Error('Simulation failed')
      
      const result = await res.json()
      setSimulationResult(result)
    } catch (err) {
      setError('シミュレーションに失敗しました')
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="bi bi-stars me-2"></i>
            ガチャ自動シミュレーション
          </h5>
        </div>
        <div className="card-body">
          <p className="text-muted mb-4">
            SS/S賞を選択すると、AIが自動的にA/B/C賞を選定し、収支シミュレーションを行います
          </p>
          
          {/* カード読み込み状況 */}
          {loading ? (
            <div className="alert alert-info">
              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
              カードデータを読み込み中...
            </div>
          ) : (
            <div className="alert alert-secondary">
              <small>
                総カード数: {cards.length.toLocaleString()}枚
                （SS: {cards.filter(c => c.rarity === 'SS').length}枚、
                S: {cards.filter(c => c.rarity === 'S').length}枚）
              </small>
            </div>
          )}

          {/* 基本設定 */}
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <label className="form-label">ガチャタイトル</label>
              <input
                type="text"
                className="form-control"
                placeholder="例: ピカチュウ祭り2024"
                value={gachaTitle}
                onChange={e => setGachaTitle(e.target.value)}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">1回の価格 (円)</label>
              <input
                type="number"
                className="form-control"
                value={pullPrice}
                onChange={e => setPullPrice(Number(e.target.value))}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">1回で引けるカード数</label>
              <input
                type="number"
                className="form-control"
                value={cardCount}
                onChange={e => setCardCount(Number(e.target.value))}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">目標利益率: {targetProfit}%</label>
              <input
                type="range"
                className="form-range"
                min="10"
                max="50"
                step="5"
                value={targetProfit}
                onChange={e => setTargetProfit(Number(e.target.value))}
              />
            </div>
          </div>

          {/* カード選択タブ */}
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'ss' ? 'active' : ''}`}
                onClick={() => setActiveTab('ss')}
              >
                SS賞選択 ({selectedSS.length}枚)
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 's' ? 'active' : ''}`}
                onClick={() => setActiveTab('s')}
              >
                S賞選択 ({selectedS.length}枚)
              </button>
            </li>
          </ul>

          {/* タブコンテンツ */}
          <div className="tab-content mb-4">
            {activeTab === 'ss' && (
              <div className="tab-pane active">
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="カード名で検索..."
                  value={searchSS}
                  onChange={e => setSearchSS(e.target.value)}
                />
                <div className="row" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredSSCards.length === 0 ? (
                    <div className="col-12 text-center py-4">
                      <p className="text-muted">
                        {searchSS ? `「${searchSS}」に一致するSS賞カードが見つかりません` : 'SS賞カードがありません'}
                      </p>
                      <small className="text-muted">
                        カードデータが正しくインポートされているか確認してください
                      </small>
                    </div>
                  ) : (
                    filteredSSCards.map(card => (
                    <div key={card.id} className="col-md-4 mb-2">
                      <div
                        className={`card cursor-pointer ${
                          selectedSS.find(c => c.id === card.id) ? 'border-primary bg-light' : ''
                        }`}
                        onClick={() => toggleCardSelection(card, 'SS')}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body p-2">
                          <h6 className="card-title mb-1 small">{card.card_name}</h6>
                          <p className="card-text small text-muted mb-0">
                            {card.product_code} - ¥{card.market_price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )))}
                </div>
              </div>
            )}

            {activeTab === 's' && (
              <div className="tab-pane active">
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="カード名で検索..."
                  value={searchS}
                  onChange={e => setSearchS(e.target.value)}
                />
                <div className="row" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredSCards.length === 0 ? (
                    <div className="col-12 text-center py-4">
                      <p className="text-muted">
                        {searchS ? `「${searchS}」に一致するS賞カードが見つかりません` : 'S賞カードがありません'}
                      </p>
                      <small className="text-muted">
                        カードデータが正しくインポートされているか確認してください
                      </small>
                    </div>
                  ) : (
                    filteredSCards.map(card => (
                    <div key={card.id} className="col-md-4 mb-2">
                      <div
                        className={`card cursor-pointer ${
                          selectedS.find(c => c.id === card.id) ? 'border-primary bg-light' : ''
                        }`}
                        onClick={() => toggleCardSelection(card, 'S')}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body p-2">
                          <h6 className="card-title mb-1 small">{card.card_name}</h6>
                          <p className="card-text small text-muted mb-0">
                            {card.product_code} - ¥{card.market_price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-danger mb-4">
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          {/* シミュレーション実行 */}
          <button
            className="btn btn-primary btn-lg w-100 mb-4"
            onClick={runSimulation}
            disabled={simulating || loading}
          >
            {simulating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                シミュレーション中...
              </>
            ) : (
              'AIシミュレーション実行'
            )}
          </button>

          {/* 結果表示 */}
          {simulationResult && (
            <div className="mt-4">
              <div className={`card ${simulationResult.recommendations.shouldLaunch ? 'border-success' : 'border-danger'}`}>
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    {simulationResult.recommendations.shouldLaunch ? (
                      <i className="bi bi-graph-up-arrow text-success me-2"></i>
                    ) : (
                      <i className="bi bi-graph-down-arrow text-danger me-2"></i>
                    )}
                    収支シミュレーション結果
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <h6 className="text-muted">期待コスト</h6>
                      <h4>¥{Math.round(simulationResult.profitability.expectedCost).toLocaleString()}</h4>
                    </div>
                    <div className="col-md-3">
                      <h6 className="text-muted">1回あたり利益</h6>
                      <h4>¥{Math.round(simulationResult.profitability.profitPerPull).toLocaleString()}</h4>
                    </div>
                    <div className="col-md-3">
                      <h6 className="text-muted">利益率</h6>
                      <h4 className={simulationResult.profitability.profitRate >= targetProfit ? 'text-success' : 'text-danger'}>
                        {simulationResult.profitability.profitRate.toFixed(1)}%
                      </h4>
                    </div>
                    <div className="col-md-3">
                      <h6 className="text-muted">損益分岐点</h6>
                      <h4>{simulationResult.profitability.breakEvenPulls}回</h4>
                    </div>
                  </div>

                  <div className="alert alert-info">
                    {simulationResult.recommendations.message}
                  </div>
                </div>
              </div>

              {/* AI選定カード */}
              <div className="card mt-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">AI選定カード</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-3">{simulationResult.aiReasoning}</p>
                  
                  {Object.entries(simulationResult.selectedCards).map(([rarity, cards]) => (
                    <div key={rarity} className="mb-3">
                      <h6>{rarity}賞 ({cards.length}枚)</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {cards.slice(0, 8).map((card: CardData) => (
                          <span key={card.id} className="badge bg-secondary">
                            {card.card_name}
                          </span>
                        ))}
                        {cards.length > 8 && (
                          <span className="badge bg-secondary">
                            他{cards.length - 8}枚...
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ガチャ作成ボタン */}
              {simulationResult.recommendations.shouldLaunch && (
                <button 
                  className="btn btn-success btn-lg w-100 mt-4"
                  onClick={() => {
                    const data = encodeURIComponent(JSON.stringify(simulationResult))
                    router.push(`/admin/gacha/new?simulation=${data}`)
                  }}
                >
                  このシミュレーション結果でガチャを作成
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}