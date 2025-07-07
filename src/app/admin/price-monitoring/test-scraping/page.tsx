'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface ScrapingTestResult {
  source: string
  success: boolean
  priceCount: number
  prices: Array<{
    price: number
    condition: string
    rarity?: string
  }>
  error?: string
  responseTime: number
}

export default function TestScrapingPage() {
  const [testCardName, setTestCardName] = useState('ピカチュウ')
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<ScrapingTestResult[]>([])

  const testScraping = async () => {
    setTesting(true)
    setResults([])

    try {
      const response = await fetch('/api/admin/price-monitoring/test-scraping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardName: testCardName })
      })

      if (!response.ok) throw new Error('テストに失敗しました')

      const data = await response.json()
      setResults(data.results || [])
      
      const successCount = data.results.filter((r: ScrapingTestResult) => r.success).length
      toast.success(`${successCount}/${data.results.length}のサイトから価格取得に成功しました`)
    } catch (error) {
      console.error('Test scraping error:', error)
      toast.error('スクレイピングテストに失敗しました')
    } finally {
      setTesting(false)
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'cardrush': return 'カードラッシュ'
      case 'pokecazilla': return 'ポケカジラ'
      case 'serra': return 'カードショップセラ'
      case 'pokeca_chart': return 'ポケカチャート'
      default: return source
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'cardrush': return 'bg-primary'
      case 'pokecazilla': return 'bg-success'
      case 'serra': return 'bg-warning'
      case 'pokeca_chart': return 'bg-info'
      default: return 'bg-secondary'
    }
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">スクレイピングテスト</h1>
          <p className="text-muted">
            実際のサイトから価格データを取得できるかテストします
          </p>
        </div>
        <Link href="/admin/price-monitoring" className="btn btn-secondary">
          価格監視に戻る
        </Link>
      </div>

      {/* テスト設定 */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="h5 mb-0">テスト設定</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="cardName" className="form-label">
                  テスト用カード名
                </label>
                <input
                  type="text"
                  id="cardName"
                  className="form-control"
                  value={testCardName}
                  onChange={(e) => setTestCardName(e.target.value)}
                  placeholder="例: ピカチュウ, リザードン"
                />
                <small className="form-text text-muted">
                  一般的なポケモン名で検索すると見つかりやすいです
                </small>
              </div>
              
              <button
                onClick={testScraping}
                disabled={testing || !testCardName.trim()}
                className="btn btn-primary w-100"
              >
                {testing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    テスト実行中...
                  </>
                ) : (
                  'スクレイピングテストを実行'
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="h5 mb-0">対象サイト</h3>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <span className="badge bg-primary me-2">1</span>
                  <strong>カードラッシュ</strong>
                  <br />
                  <small className="text-muted">https://cardrush.media/ - 買取価格</small>
                </li>
                <li className="mb-2">
                  <span className="badge bg-success me-2">2</span>
                  <strong>ポケカジラ</strong>
                  <br />
                  <small className="text-muted">https://pokecazilla.com/ - 市場価格</small>
                </li>
                <li className="mb-2">
                  <span className="badge bg-warning me-2">3</span>
                  <strong>カードショップセラ</strong>
                  <br />
                  <small className="text-muted">https://cardshop-serra.com/ - 買取価格</small>
                </li>
                <li className="mb-0">
                  <span className="badge bg-info me-2">4</span>
                  <strong>ポケカチャート</strong>
                  <br />
                  <small className="text-muted">https://pokeca-chart.com/ - 相場情報</small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* テスト結果 */}
      {results.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="h5 mb-0">
                  テスト結果 - 「{testCardName}」の検索結果
                </h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {results.map((result, index) => (
                    <div key={index} className="col-md-6 col-lg-3 mb-4">
                      <div className={`card h-100 ${result.success ? 'border-success' : 'border-danger'}`}>
                        <div className="card-header d-flex justify-content-between align-items-center">
                          <span className={`badge ${getSourceColor(result.source)} text-white`}>
                            {getSourceLabel(result.source)}
                          </span>
                          <span className={`badge ${result.success ? 'bg-success' : 'bg-danger'}`}>
                            {result.success ? '成功' : '失敗'}
                          </span>
                        </div>
                        <div className="card-body">
                          {result.success ? (
                            <>
                              <h6 className="card-title text-success">
                                {result.priceCount}件の価格データ
                              </h6>
                              <p className="card-text">
                                <small className="text-muted">
                                  応答時間: {result.responseTime}ms
                                </small>
                              </p>
                              
                              {result.prices.length > 0 && (
                                <div className="mt-3">
                                  <h6 className="small">取得した価格例:</h6>
                                  {result.prices.slice(0, 3).map((price, priceIndex) => (
                                    <div key={priceIndex} className="mb-1">
                                      <span className="fw-bold text-success">
                                        ¥{price.price.toLocaleString()}
                                      </span>
                                      {price.rarity && (
                                        <span className="badge bg-light text-dark ms-1">
                                          {price.rarity}
                                        </span>
                                      )}
                                      <br />
                                      <small className="text-muted">{price.condition}</small>
                                    </div>
                                  ))}
                                  {result.prices.length > 3 && (
                                    <small className="text-muted">
                                      他 {result.prices.length - 3}件...
                                    </small>
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <h6 className="card-title text-danger">
                                エラーが発生しました
                              </h6>
                              <p className="card-text">
                                <small className="text-danger">
                                  {result.error || '不明なエラー'}
                                </small>
                              </p>
                              <p className="card-text">
                                <small className="text-muted">
                                  応答時間: {result.responseTime}ms
                                </small>
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 統計サマリー */}
                <div className="alert alert-info mt-4">
                  <h6 className="alert-heading">テスト結果サマリー</h6>
                  <ul className="mb-0">
                    <li>
                      成功したサイト: {results.filter(r => r.success).length}/{results.length}
                    </li>
                    <li>
                      取得できた価格データ総数: {results.reduce((sum, r) => sum + r.priceCount, 0)}件
                    </li>
                    <li>
                      平均応答時間: {Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length)}ms
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 注意事項 */}
      <div className="alert alert-warning">
        <h6 className="alert-heading">⚠️ 注意事項</h6>
        <ul className="mb-0">
          <li>このテストは実際のWebサイトにアクセスします</li>
          <li>サイトの利用規約に従って適切な頻度で実行してください</li>
          <li>レート制限により一時的に失敗する場合があります</li>
          <li>サイトの構造変更により動作しなくなる可能性があります</li>
        </ul>
      </div>
    </div>
  )
}