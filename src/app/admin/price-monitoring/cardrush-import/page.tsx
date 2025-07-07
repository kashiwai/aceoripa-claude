'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface ImportResult {
  success: boolean
  totalPrices: number
  savedToDb: number
  errors: string[]
}

export default function CardRushImportPage() {
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ja-JP')
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const startImport = async () => {
    setImporting(true)
    setResult(null)
    setLogs([])
    
    addLog('カードラッシュからの価格データ取得を開始します...')
    addLog('全ページをスクレイピングします（数分かかる場合があります）')

    try {
      const response = await fetch('/api/admin/price-monitoring/import-cardrush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('インポートに失敗しました')
      }

      const data: ImportResult = await response.json()
      setResult(data)

      if (data.success) {
        addLog(`✅ 取得完了: ${data.totalPrices.toLocaleString()}件の価格データ`)
        addLog(`📊 DBに保存: ${data.savedToDb.toLocaleString()}件`)
        toast.success('カードラッシュからのデータ取得が完了しました！')
      } else {
        addLog('❌ エラーが発生しました')
        data.errors.forEach(error => addLog(`  - ${error}`))
        toast.error('データ取得中にエラーが発生しました')
      }

    } catch (error) {
      console.error('Import error:', error)
      addLog(`❌ エラー: ${error instanceof Error ? error.message : '不明なエラー'}`)
      toast.error('インポートに失敗しました')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">カードラッシュ価格データ取得</h1>
          <p className="text-muted">
            カードラッシュの買取価格一覧から全データを取得します
          </p>
        </div>
        <Link href="/admin/price-monitoring" className="btn btn-secondary">
          価格監視に戻る
        </Link>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="h5 mb-0">インポート設定</h3>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <h6 className="alert-heading">カードラッシュについて</h6>
                <ul className="mb-0">
                  <li>日本最大級のトレカ買取サイト</li>
                  <li>ポケモンカードの買取価格を公開</li>
                  <li>毎日価格が更新される</li>
                  <li>商品コードも含まれるため正確なマッチングが可能</li>
                </ul>
              </div>

              <button
                onClick={startImport}
                disabled={importing}
                className="btn btn-primary w-100"
              >
                {importing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    データ取得中...
                  </>
                ) : (
                  '価格データ取得を開始'
                )}
              </button>

              <div className="mt-3 text-muted small">
                <p className="mb-1">※ 全ページの取得には5-10分程度かかります</p>
                <p className="mb-0">※ サイトに負荷をかけないよう適切な間隔で実行します</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          {result && (
            <div className="card">
              <div className="card-header">
                <h3 className="h5 mb-0">取得結果</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <label className="text-muted">取得した価格データ</label>
                    <div className="h4 text-primary">{result.totalPrices.toLocaleString()}件</div>
                  </div>
                  <div className="col-6">
                    <label className="text-muted">DBに保存</label>
                    <div className="h4 text-success">{result.savedToDb.toLocaleString()}件</div>
                  </div>
                </div>

                {result.savedToDb > 0 && (
                  <div className="alert alert-success mt-3">
                    <strong>成功！</strong><br />
                    {result.savedToDb}件のカードの価格情報を更新しました。
                  </div>
                )}

                {result.errors.length > 0 && (
                  <div className="alert alert-warning mt-3">
                    <strong>エラー:</strong>
                    <ul className="mb-0">
                      {result.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="h5 mb-0">実行ログ</h3>
            </div>
            <div className="card-body">
              <div 
                className="bg-dark text-light p-3 rounded"
                style={{ height: '300px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.9rem' }}
              >
                {logs.length === 0 ? (
                  <div className="text-muted">ログがここに表示されます</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert-info mt-4">
        <h6 className="alert-heading">💡 ヒント</h6>
        <p>カードラッシュは信頼性の高い価格データソースです。定期的（週1-2回）に実行することで、市場価格の変動を追跡できます。</p>
        <p className="mb-0">他のサイトについては、APIの提供やパートナーシップなど、別の方法を検討することをお勧めします。</p>
      </div>
    </div>
  )
}