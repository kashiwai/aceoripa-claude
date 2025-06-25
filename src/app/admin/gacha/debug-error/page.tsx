'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function DebugErrorPage() {
  const [tableInfo, setTableInfo] = useState<any>({})
  const [testResult, setTestResult] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    try {
      // 1. テーブル構造を確認
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: 'gacha_products' })
        
      if (columnsError) {
        // RPC関数がない場合は直接テーブルから1行取得してカラムを確認
        const { data: sample, error: sampleError } = await supabase
          .from('gacha_products')
          .select('*')
          .limit(1)
          .single()
          
        if (sampleError) {
          setTableInfo({ error: sampleError.message, code: sampleError.code })
        } else {
          setTableInfo({ 
            columns: sample ? Object.keys(sample) : [],
            sampleData: sample 
          })
        }
      } else {
        setTableInfo({ columns })
      }

      // 2. 更新テストを実行
      const testData = {
        name: 'テストガチャ',
        description: 'テスト',
        price: 100,
        is_active: true
      }

      const { data: insertData, error: insertError } = await supabase
        .from('gacha_products')
        .insert(testData)
        .select()
        .single()

      if (insertError) {
        setTestResult({ 
          insertError: insertError.message,
          insertCode: insertError.code,
          insertDetails: insertError.details
        })
      } else if (insertData) {
        // 更新テスト
        const updateData = {
          name: 'テストガチャ更新',
          banner_image_url: '/test/image.jpg',
          single_price: 150,
          multi_price: 1500
        }

        const { error: updateError } = await supabase
          .from('gacha_products')
          .update(updateData)
          .eq('id', insertData.id)

        if (updateError) {
          setTestResult({ 
            insertSuccess: true,
            updateError: updateError.message,
            updateCode: updateError.code,
            updateDetails: updateError.details,
            attemptedFields: Object.keys(updateData)
          })
        } else {
          setTestResult({ 
            insertSuccess: true,
            updateSuccess: true 
          })
        }

        // テストデータを削除
        await supabase
          .from('gacha_products')
          .delete()
          .eq('id', insertData.id)
      }

    } catch (error: any) {
      setTableInfo({ generalError: error.message })
    } finally {
      setLoading(false)
    }
  }

  const generateSQL = () => {
    const sql = `
-- 現在のテーブル構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gacha_products'
ORDER BY ordinal_position;

-- 必要なカラムを追加
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS banner_image_url TEXT,
ADD COLUMN IF NOT EXISTS single_price INTEGER,
ADD COLUMN IF NOT EXISTS multi_price INTEGER,
ADD COLUMN IF NOT EXISTS card_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_stock INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;

-- priceカラムが存在しない場合は追加
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS price INTEGER;

-- データ移行
UPDATE gacha_products 
SET single_price = COALESCE(single_price, price, 150),
    multi_price = COALESCE(multi_price, price * 10, 1500),
    card_count = COALESCE(card_count, 1)
WHERE single_price IS NULL OR multi_price IS NULL;
    `.trim()
    
    navigator.clipboard.writeText(sql)
    alert('SQLをクリップボードにコピーしました')
  }

  if (loading) {
    return <div className="p-4">診断中...</div>
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">ガチャテーブル エラー診断</h1>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="h5 mb-0">テーブル構造</h3>
            </div>
            <div className="card-body">
              <pre className="bg-light p-3 rounded" style={{ fontSize: '12px' }}>
                {JSON.stringify(tableInfo, null, 2)}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="h5 mb-0">更新テスト結果</h3>
            </div>
            <div className="card-body">
              <pre className="bg-light p-3 rounded" style={{ fontSize: '12px' }}>
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="h5 mb-0">推奨される修正</h3>
        </div>
        <div className="card-body">
          {tableInfo.columns && !tableInfo.columns.includes('banner_image_url') && (
            <div className="alert alert-danger">
              <strong>banner_image_url</strong> カラムが存在しません
            </div>
          )}
          {tableInfo.columns && !tableInfo.columns.includes('single_price') && (
            <div className="alert alert-danger">
              <strong>single_price</strong> カラムが存在しません
            </div>
          )}
          {tableInfo.columns && !tableInfo.columns.includes('multi_price') && (
            <div className="alert alert-danger">
              <strong>multi_price</strong> カラムが存在しません
            </div>
          )}
          
          <button onClick={generateSQL} className="btn btn-primary">
            修正SQLを生成してコピー
          </button>
          
          <div className="mt-3">
            <p className="text-muted">生成されたSQLをSupabaseのSQL Editorで実行してください</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <a href="/admin/gacha" className="btn btn-secondary">ガチャ管理に戻る</a>
      </div>
    </div>
  )
}