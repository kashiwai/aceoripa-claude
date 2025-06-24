'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function CheckGachaTablePage() {
  const supabase = createClientComponentClient()
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    const checkResults: any = {
      timestamp: new Date().toISOString(),
      checks: []
    }

    try {
      // 1. gacha_productsテーブルの存在確認
      const { data: gachaData, error: gachaError } = await supabase
        .from('gacha_products')
        .select('*')
      
      checkResults.checks.push({
        name: 'gacha_productsテーブル',
        exists: !gachaError || gachaError.code !== '42P01',
        count: gachaData?.length || 0,
        error: gachaError?.message,
        errorCode: gachaError?.code,
        data: gachaData
      })

      // 2. RLS（Row Level Security）の状態確認
      if (!gachaError || gachaError.code !== '42P01') {
        // テーブルが存在する場合のみRLSチェック
        checkResults.rlsInfo = {
          note: 'RLSが有効な場合、適切なポリシーが必要です',
          suggestion: 'Supabaseダッシュボードで確認してください'
        }
      }

      // 3. 関連テーブルの確認
      const relatedTables = [
        'gacha_pokemon_pools',
        'pokemon_cards',
        'card_rarities'
      ]

      for (const tableName of relatedTables) {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        checkResults.checks.push({
          name: `${tableName}テーブル`,
          exists: !error || error.code !== '42P01',
          error: error?.message,
          errorCode: error?.code
        })
      }

    } catch (error: any) {
      checkResults.generalError = error.message
    }

    setResults(checkResults)
    setLoading(false)
  }

  const createTable = async () => {
    // テーブル作成のSQLを提供
    const sql = `
-- ガチャ製品テーブル
CREATE TABLE IF NOT EXISTS gacha_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  single_price INTEGER NOT NULL DEFAULT 150,
  multi_price INTEGER NOT NULL DEFAULT 1500,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  banner_image_url TEXT,
  featured_card_ids TEXT[],
  guarantee_sr_on_multi BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_gacha_products_active ON gacha_products(is_active);
CREATE INDEX idx_gacha_products_dates ON gacha_products(start_date, end_date);

-- RLSを有効化（必要に応じて）
ALTER TABLE gacha_products ENABLE ROW LEVEL SECURITY;

-- 管理者用のポリシー（例）
CREATE POLICY "Enable all for authenticated users" ON gacha_products
  FOR ALL USING (auth.role() = 'authenticated');
`;

    setResults(prev => ({
      ...prev,
      createTableSQL: sql
    }))
  }

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">ガチャテーブル診断</h1>

      <div className="row">
        <div className="col-lg-8">
          {/* チェック結果 */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">データベース確認結果</h5>
            </div>
            <div className="card-body">
              {results.checks?.map((check: any, index: number) => (
                <div key={index} className={`alert ${check.exists ? 'alert-success' : 'alert-danger'} mb-3`}>
                  <h6 className="alert-heading">
                    {check.name}: {check.exists ? '✅ 存在' : '❌ 存在しない'}
                  </h6>
                  {check.count !== undefined && (
                    <p className="mb-1">レコード数: {check.count}件</p>
                  )}
                  {check.error && (
                    <p className="mb-0 small">
                      エラー: {check.error} 
                      {check.errorCode && ` (Code: ${check.errorCode})`}
                    </p>
                  )}
                  {check.data && check.data.length > 0 && (
                    <details className="mt-2">
                      <summary>データを表示</summary>
                      <pre className="mt-2 p-2 bg-light rounded small">
                        {JSON.stringify(check.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SQL生成 */}
          {results.checks?.some((c: any) => !c.exists && c.name === 'gacha_productsテーブル') && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">テーブル作成</h5>
              </div>
              <div className="card-body">
                <p>gacha_productsテーブルが存在しません。以下の方法で作成してください：</p>
                <button onClick={createTable} className="btn btn-primary mb-3">
                  CREATE TABLE SQLを表示
                </button>
                
                {results.createTableSQL && (
                  <div>
                    <h6>手順:</h6>
                    <ol>
                      <li>Supabaseダッシュボード → SQL Editor</li>
                      <li>以下のSQLをコピー＆ペースト</li>
                      <li>「Run」をクリック</li>
                    </ol>
                    <pre className="p-3 bg-light rounded">
                      {results.createTableSQL}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          {/* サイドバー情報 */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">🔍 診断情報</h5>
              <p className="small text-muted">実行時刻: {new Date(results.timestamp).toLocaleString()}</p>
              
              {results.rlsInfo && (
                <div className="alert alert-info small">
                  <strong>RLS（Row Level Security）について</strong>
                  <p className="mb-0">{results.rlsInfo.note}</p>
                  <p className="mb-0">{results.rlsInfo.suggestion}</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">🛠️ トラブルシューティング</h5>
              <ul className="small">
                <li>テーブルが存在しない → SQLで作成</li>
                <li>データが表示されない → RLSポリシーを確認</li>
                <li>権限エラー → service_role_keyを使用</li>
              </ul>
              
              <hr/>
              
              <div className="d-grid gap-2">
                <a href="/admin/gacha" className="btn btn-secondary btn-sm">
                  ガチャ管理に戻る
                </a>
                <button onClick={() => window.location.reload()} className="btn btn-outline-primary btn-sm">
                  再チェック
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}