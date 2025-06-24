'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

export default function TestSelectPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const supabase = createClientComponentClient()

  const testSelect = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // シンプルなSELECTで既存のガチャを確認
      const { data, error } = await supabase
        .from('gacha_products')
        .select('*')
        .limit(1)
      
      if (error) {
        console.error('Select error:', error)
        setResult({
          success: false,
          error: error.message,
          details: error
        })
      } else {
        console.log('Select success:', data)
        
        // カラム名を取得
        const columns = data && data.length > 0 ? Object.keys(data[0]) : []
        
        setResult({
          success: true,
          data: data,
          columns: columns,
          columnCount: columns.length
        })
        
        if (columns.length > 0) {
          toast.success(`テーブルに${columns.length}個のカラムが見つかりました`)
        } else {
          toast.warning('テーブルは存在しますが、データがありません')
        }
      }
      
    } catch (error: any) {
      console.error('Unexpected error:', error)
      setResult({
        success: false,
        unexpectedError: error.message
      })
      toast.error('予期しないエラー: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const createCorrectTable = () => {
    const sql = `
-- 既存のテーブルを削除（注意：データが失われます）
DROP TABLE IF EXISTS gacha_products CASCADE;

-- 正しい構造でテーブルを作成
CREATE TABLE gacha_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  single_price INTEGER NOT NULL DEFAULT 100,
  multi_price INTEGER NOT NULL DEFAULT 900,
  is_active BOOLEAN DEFAULT true,
  banner_image_url TEXT,
  featured_card_id UUID,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  total_stock INTEGER DEFAULT 1000,
  sold_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSを有効化
ALTER TABLE gacha_products ENABLE ROW LEVEL SECURITY;

-- 管理者用のポリシー（認証不要で全アクセス可能）
CREATE POLICY "Enable all access for everyone" ON gacha_products
  FOR ALL USING (true);
`;
    
    setResult({
      ...result,
      suggestedSQL: sql
    })
    
    // クリップボードにコピー
    navigator.clipboard.writeText(sql).then(() => {
      toast.success('SQLをクリップボードにコピーしました')
    })
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">ガチャテーブル診断</h1>
      
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">テーブル構造を確認</h5>
          <p className="card-text">gacha_productsテーブルの現在の状態を確認します</p>
          <button
            onClick={testSelect}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? '確認中...' : 'テーブルを確認'}
          </button>
        </div>
      </div>
      
      {result && (
        <div className={`card mb-4 ${result.success ? 'border-success' : 'border-danger'}`}>
          <div className="card-header">
            <h5 className={`mb-0 ${result.success ? 'text-success' : 'text-danger'}`}>
              {result.success ? '✅ テーブル確認結果' : '❌ エラー'}
            </h5>
          </div>
          <div className="card-body">
            {result.columns && result.columns.length > 0 && (
              <>
                <h6>見つかったカラム:</h6>
                <div className="mb-3">
                  {result.columns.map((col: string) => (
                    <span key={col} className="badge bg-secondary me-2 mb-1">{col}</span>
                  ))}
                </div>
                
                <h6>不足しているカラム:</h6>
                <div className="mb-3">
                  {['multi_price', 'single_price', 'banner_image_url', 'total_stock', 'sold_count'].map(col => (
                    !result.columns.includes(col) && (
                      <span key={col} className="badge bg-danger me-2 mb-1">{col}</span>
                    )
                  ))}
                </div>
              </>
            )}
            
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
            
            {!result.success || (result.columns && !result.columns.includes('multi_price')) && (
              <div className="mt-3">
                <button
                  onClick={createCorrectTable}
                  className="btn btn-warning"
                >
                  正しいテーブル構造のSQLを生成
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {result?.suggestedSQL && (
        <div className="card border-info">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">🔧 推奨SQL（クリップボードにコピー済み）</h5>
          </div>
          <div className="card-body">
            <p className="text-danger fw-bold">
              ⚠️ 注意: このSQLを実行すると既存のgacha_productsテーブルが削除されます
            </p>
            <pre className="bg-light p-3 rounded" style={{ maxHeight: '400px', overflow: 'auto' }}>
              {result.suggestedSQL}
            </pre>
            <p className="mt-3">
              このSQLをSupabaseのSQL Editorで実行してください。
            </p>
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <a href="/admin/gacha" className="btn btn-secondary">
          ガチャ管理に戻る
        </a>
      </div>
    </div>
  )
}