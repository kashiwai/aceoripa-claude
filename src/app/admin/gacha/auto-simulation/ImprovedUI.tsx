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

// プリセットのSS/Sカード（すぐに使える）
const PRESET_CARDS = {
  SS: [
    { id: 'preset-ss-1', card_name: 'リザードンex SAR', product_code: 'PRESET-SS-001', rarity: 'SS', market_price: 150000 },
    { id: 'preset-ss-2', card_name: 'ピカチュウex SAR', product_code: 'PRESET-SS-002', rarity: 'SS', market_price: 120000 },
    { id: 'preset-ss-3', card_name: 'ミュウex SAR', product_code: 'PRESET-SS-003', rarity: 'SS', market_price: 98000 },
    { id: 'preset-ss-4', card_name: 'ナンジャモ SAR', product_code: 'PRESET-SS-004', rarity: 'SS', market_price: 110000 },
    { id: 'preset-ss-5', card_name: 'リーリエ SR', product_code: 'PRESET-SS-005', rarity: 'SS', market_price: 85000 },
    { id: 'preset-ss-6', card_name: 'マリィ SR', product_code: 'PRESET-SS-006', rarity: 'SS', market_price: 92000 },
    { id: 'preset-ss-7', card_name: 'ルギアV SA', product_code: 'PRESET-SS-007', rarity: 'SS', market_price: 78000 },
    { id: 'preset-ss-8', card_name: 'レックウザVMAX CSR', product_code: 'PRESET-SS-008', rarity: 'SS', market_price: 88000 },
  ],
  S: [
    { id: 'preset-s-1', card_name: 'ピカチュウVMAX CSR', product_code: 'PRESET-S-001', rarity: 'S', market_price: 45000 },
    { id: 'preset-s-2', card_name: 'イーブイVMAX CSR', product_code: 'PRESET-S-002', rarity: 'S', market_price: 38000 },
    { id: 'preset-s-3', card_name: 'ブラッキーVMAX CSR', product_code: 'PRESET-S-003', rarity: 'S', market_price: 42000 },
    { id: 'preset-s-4', card_name: 'ニンフィアVMAX CSR', product_code: 'PRESET-S-004', rarity: 'S', market_price: 35000 },
    { id: 'preset-s-5', card_name: 'フシギバナex SR', product_code: 'PRESET-S-005', rarity: 'S', market_price: 22000 },
    { id: 'preset-s-6', card_name: 'カメックスex SR', product_code: 'PRESET-S-006', rarity: 'S', market_price: 20000 },
    { id: 'preset-s-7', card_name: 'ミュウツーex SR', product_code: 'PRESET-S-007', rarity: 'S', market_price: 25000 },
    { id: 'preset-s-8', card_name: 'レックウザex SR', product_code: 'PRESET-S-008', rarity: 'S', market_price: 24000 },
    { id: 'preset-s-9', card_name: 'ルカリオex SR', product_code: 'PRESET-S-009', rarity: 'S', market_price: 18000 },
    { id: 'preset-s-10', card_name: 'ゲッコウガex SR', product_code: 'PRESET-S-010', rarity: 'S', market_price: 16000 },
  ]
}

// ガチャテーマプリセット
const GACHA_THEMES = [
  { 
    title: 'ピカチュウ祭り2024', 
    ssPreset: ['preset-ss-2'], // ピカチュウex SAR
    sPreset: ['preset-s-1', 'preset-s-2'] // ピカチュウVMAX, イーブイVMAX
  },
  { 
    title: 'リザードン爆誕祭', 
    ssPreset: ['preset-ss-1'], // リザードンex SAR
    sPreset: ['preset-s-5', 'preset-s-6'] // フシギバナ, カメックス
  },
  { 
    title: '女の子トレーナー大集合', 
    ssPreset: ['preset-ss-4', 'preset-ss-5', 'preset-ss-6'], // ナンジャモ, リーリエ, マリィ
    sPreset: ['preset-s-3', 'preset-s-4'] // ブラッキー, ニンフィア
  },
  { 
    title: '伝説ポケモン降臨', 
    ssPreset: ['preset-ss-3', 'preset-ss-7', 'preset-ss-8'], // ミュウ, ルギア, レックウザ
    sPreset: ['preset-s-7', 'preset-s-8'] // ミュウツー, レックウザ
  }
]

export default function ImprovedAutoSimulationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [selectedSS, setSelectedSS] = useState<CardData[]>([])
  const [selectedS, setSelectedS] = useState<CardData[]>([])
  const [gachaTitle, setGachaTitle] = useState('')
  const [pullPrice, setPullPrice] = useState(3000)
  const [cardCount, setCardCount] = useState(5)
  const [targetProfit, setTargetProfit] = useState(30)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState('')
  const [usePreset, setUsePreset] = useState(true)
  const [suggestedSS, setSuggestedSS] = useState<CardData[]>([])
  const [suggestedS, setSuggestedS] = useState<CardData[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // カードの選択/解除（プリセット用）
  const togglePresetCard = (card: CardData, type: 'SS' | 'S') => {
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

  // テーマプリセットの適用
  const applyThemePreset = (theme: typeof GACHA_THEMES[0]) => {
    setGachaTitle(theme.title)
    setSelectedSS(PRESET_CARDS.SS.filter(card => theme.ssPreset.includes(card.id)))
    setSelectedS(PRESET_CARDS.S.filter(card => theme.sPreset.includes(card.id)))
  }

  // タイトルに基づくカード候補の提案
  const suggestCardsByTitle = (title: string) => {
    if (!title || title.length < 2) {
      setShowSuggestions(false)
      return
    }

    // キーワード抽出（ひらがな・カタカナ・漢字を考慮）
    const keywords = title.toLowerCase().split(/[\s、。！？]/g).filter(k => k.length > 1)
    
    // すべてのプリセットカードから検索
    const allCards = [...PRESET_CARDS.SS, ...PRESET_CARDS.S]
    
    // マッチング関数
    const matchCard = (card: CardData, keywords: string[]) => {
      const cardNameLower = card.card_name.toLowerCase()
      return keywords.some(keyword => {
        // 直接マッチ
        if (cardNameLower.includes(keyword)) return true
        
        // ポケモン名の部分マッチ（例：「ピカチュウ」→「ピカ」）
        if (keyword.length >= 2 && cardNameLower.includes(keyword.substring(0, 2))) return true
        
        // 特定のキーワードマッピング
        const keywordMap: Record<string, string[]> = {
          'でんき': ['ピカチュウ', 'サンダース', 'レックウザ'],
          'ほのお': ['リザードン', 'ブースター', 'ファイヤー'],
          'みず': ['カメックス', 'シャワーズ', 'ルギア'],
          'くさ': ['フシギバナ', 'リーフィア'],
          'エスパー': ['ミュウ', 'ミュウツー', 'エーフィ'],
          'あく': ['ブラッキー'],
          'フェアリー': ['ニンフィア'],
          'こおり': ['グレイシア'],
          'ドラゴン': ['レックウザ', 'ガブリアス'],
          '女の子': ['ナンジャモ', 'リーリエ', 'マリィ', 'サーナイト'],
          'トレーナー': ['ナンジャモ', 'リーリエ', 'マリィ'],
          '伝説': ['ミュウ', 'ミュウツー', 'ルギア', 'レックウザ', 'アルセウス', 'ギラティナ'],
          'イーブイ': ['イーブイ', 'ブラッキー', 'ニンフィア', 'グレイシア', 'リーフィア', 'サンダース', 'シャワーズ', 'ブースター', 'エーフィ']
        }
        
        // キーワードマッピングでチェック
        for (const [key, values] of Object.entries(keywordMap)) {
          if (keyword.includes(key) || key.includes(keyword)) {
            return values.some(v => cardNameLower.includes(v.toLowerCase()))
          }
        }
        
        return false
      })
    }
    
    // SS候補とS候補を別々に検索
    const ssMatches = PRESET_CARDS.SS.filter(card => matchCard(card, keywords))
    const sMatches = PRESET_CARDS.S.filter(card => matchCard(card, keywords))
    
    // マッチしなかった場合は、関連性の高いカードを表示
    if (ssMatches.length === 0 && sMatches.length === 0) {
      // デフォルトで人気カードを表示
      setSuggestedSS(PRESET_CARDS.SS.slice(0, 4))
      setSuggestedS(PRESET_CARDS.S.slice(0, 4))
    } else {
      setSuggestedSS(ssMatches.slice(0, 4))
      setSuggestedS(sMatches.slice(0, 4))
    }
    
    setShowSuggestions(true)
  }

  // タイトル変更時の処理
  const handleTitleChange = (value: string) => {
    setGachaTitle(value)
    // 少し遅延を入れて入力が落ち着いてから提案
    setTimeout(() => {
      suggestCardsByTitle(value)
    }, 300)
  }

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
            ガチャ自動シミュレーション（簡単モード）
          </h5>
        </div>
        <div className="card-body">
          {/* クイックスタート */}
          <div className="alert alert-success mb-4">
            <h6 className="alert-heading">
              <i className="bi bi-lightning-fill me-2"></i>
              クイックスタート
            </h6>
            <p className="mb-2">テーマを選ぶだけですぐにシミュレーション可能！</p>
            <div className="d-flex flex-wrap gap-2">
              {GACHA_THEMES.map((theme, index) => (
                <button
                  key={index}
                  className="btn btn-sm btn-outline-success"
                  onClick={() => applyThemePreset(theme)}
                >
                  {theme.title}
                </button>
              ))}
            </div>
          </div>

          {/* 基本設定 */}
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <label className="form-label">ガチャタイトル</label>
              <input
                type="text"
                className="form-control"
                placeholder="例: ピカチュウ祭り2024"
                value={gachaTitle}
                onChange={e => handleTitleChange(e.target.value)}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">1回の価格 (円)</label>
              <div className="btn-group w-100" role="group">
                <button
                  className={`btn ${pullPrice === 1000 ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setPullPrice(1000)}
                >
                  1,000円
                </button>
                <button
                  className={`btn ${pullPrice === 3000 ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setPullPrice(3000)}
                >
                  3,000円
                </button>
                <button
                  className={`btn ${pullPrice === 5000 ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setPullPrice(5000)}
                >
                  5,000円
                </button>
                <button
                  className={`btn ${pullPrice === 10000 ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setPullPrice(10000)}
                >
                  10,000円
                </button>
              </div>
            </div>
          </div>

          {/* タイトルに基づく候補表示 */}
          {showSuggestions && gachaTitle && (
            <div className="alert alert-info mb-4">
              <h6 className="alert-heading">
                <i className="bi bi-lightbulb me-2"></i>
                「{gachaTitle}」に関連するカード候補
              </h6>
              <div className="row mt-3">
                <div className="col-md-6">
                  <p className="fw-bold mb-2">SS賞候補</p>
                  <div className="d-flex flex-wrap gap-2">
                    {suggestedSS.map(card => (
                      <button
                        key={card.id}
                        className={`btn btn-sm ${
                          selectedSS.find(c => c.id === card.id) 
                            ? 'btn-warning' 
                            : 'btn-outline-warning'
                        }`}
                        onClick={() => togglePresetCard(card, 'SS')}
                      >
                        {card.card_name}
                        {selectedSS.find(c => c.id === card.id) && (
                          <i className="bi bi-check ms-1"></i>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-md-6">
                  <p className="fw-bold mb-2">S賞候補</p>
                  <div className="d-flex flex-wrap gap-2">
                    {suggestedS.map(card => (
                      <button
                        key={card.id}
                        className={`btn btn-sm ${
                          selectedS.find(c => c.id === card.id) 
                            ? 'btn-info' 
                            : 'btn-outline-info'
                        }`}
                        onClick={() => togglePresetCard(card, 'S')}
                      >
                        {card.card_name}
                        {selectedS.find(c => c.id === card.id) && (
                          <i className="bi bi-check ms-1"></i>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  クリックしてカードを選択/解除できます。より多くのカードは下のセクションから選択してください。
                </small>
              </div>
            </div>
          )}

          {/* SS賞選択 */}
          <div className="mb-4">
            <h6 className="mb-3">
              <span className="badge bg-warning text-dark me-2">SS賞</span>
              最高レアリティカード選択（{selectedSS.length}枚選択中）
            </h6>
            <div className="row">
              {PRESET_CARDS.SS.map(card => (
                <div key={card.id} className="col-md-3 mb-3">
                  <div
                    className={`card h-100 ${
                      selectedSS.find(c => c.id === card.id) 
                        ? 'border-warning bg-warning bg-opacity-10' 
                        : 'border-secondary'
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => togglePresetCard(card, 'SS')}
                  >
                    <div className="card-body">
                      <h6 className="card-title">{card.card_name}</h6>
                      <p className="card-text">
                        <small className="text-muted">
                          市場価格: ¥{card.market_price.toLocaleString()}
                        </small>
                      </p>
                      {selectedSS.find(c => c.id === card.id) && (
                        <div className="text-center">
                          <i className="bi bi-check-circle-fill text-warning"></i>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* S賞選択 */}
          <div className="mb-4">
            <h6 className="mb-3">
              <span className="badge bg-info me-2">S賞</span>
              準最高レアリティカード選択（{selectedS.length}枚選択中）
            </h6>
            <div className="row">
              {PRESET_CARDS.S.map(card => (
                <div key={card.id} className="col-md-3 mb-3">
                  <div
                    className={`card h-100 ${
                      selectedS.find(c => c.id === card.id) 
                        ? 'border-info bg-info bg-opacity-10' 
                        : 'border-secondary'
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => togglePresetCard(card, 'S')}
                  >
                    <div className="card-body">
                      <h6 className="card-title">{card.card_name}</h6>
                      <p className="card-text">
                        <small className="text-muted">
                          市場価格: ¥{card.market_price.toLocaleString()}
                        </small>
                      </p>
                      {selectedS.find(c => c.id === card.id) && (
                        <div className="text-center">
                          <i className="bi bi-check-circle-fill text-info"></i>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 詳細設定 */}
          <div className="accordion mb-4" id="advancedSettings">
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAdvanced">
                  <i className="bi bi-gear me-2"></i>
                  詳細設定
                </button>
              </h2>
              <div id="collapseAdvanced" className="accordion-collapse collapse" data-bs-parent="#advancedSettings">
                <div className="accordion-body">
                  <div className="row">
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
                </div>
              </div>
            </div>
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
              <>
                <i className="bi bi-play-circle me-2"></i>
                AIシミュレーション実行
              </>
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
                  <i className="bi bi-rocket-takeoff me-2"></i>
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