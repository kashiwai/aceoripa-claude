'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

export default function DiagnoseTablePage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>({})
  const supabase = createClientComponentClient()

  const runDiagnostics = async () => {
    setLoading(true)
    const diagnostics: any = {}
    
    try {
      // 1. テーブルの存在確認
      const { data: tableCheck, error: tableError } = await supabase
        .from('gacha_products')
        .select('*')
        .limit(1)
      
      diagnostics.tableExists = !tableError
      diagnostics.tableError = tableError?.message
      diagnostics.hasData = tableCheck && tableCheck.length > 0
      diagnostics.sampleData = tableCheck
      
      // 2. 簡単な挿入テスト
      const testData = {
        name: 'テスト' + Date.now(),
        price: 100,
        currency: 'JPY',
        card_count: 1,
        is_active: true
      }
      
      const { data: insertTest, error: insertError } = await supabase
        .from('gacha_products')
        .insert([testData])
        .select()
      
      diagnostics.canInsert = !insertError
      diagnostics.insertError = insertError?.message
      diagnostics.insertedData = insertTest
      
      // 挿入成功したら削除
      if (insertTest && insertTest[0]) {
        await supabase
          .from('gacha_products')
          .delete()
          .eq('id', insertTest[0].id)
      }
      
      setResults(diagnostics)
      
      if (diagnostics.canInsert) {
        toast.success('テーブルは正常に動作しています')
      } else {
        toast.error('テーブルに問題があります')
      }
      
    } catch (error: any) {
      diagnostics.unexpectedError = error.message
      setResults(diagnostics)
      toast.error('診断中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const generateFixSQL = () => {
    const sql = `
-- Option 1: 既存テーブルにカラムを追加（推奨）
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS multi_price INTEGER DEFAULT 900;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS banner_image_url TEXT;

-- Option 2: テーブルを完全に作り直す（最終手段）
-- まず既存のテーブルをバックアップ
-- ALTER TABLE gacha_products RENAME TO gacha_products_backup;

-- 新しいテーブルを作成
-- CREATE TABLE gacha_products (...);

-- バックアップからデータを移行
-- INSERT INTO gacha_products SELECT * FROM gacha_products_backup;
`
    
    navigator.clipboard.writeText(sql)
    toast.success('修正SQLをコピーしました')
    setResults({ ...results, fixSQL: sql })
  }

  const insertSimpleData = async () => {
    setLoading(true)
    try {
      // 現在のテーブル構造に合わせたデータ
      const simpleData = [
        { 
          name: 'ピカチュウ大祭り',
          description: 'マリオピカチュウPSA10確定！激アツのピカチュウ祭り開催中！',
          price: 150,
          currency: 'JPY',
          card_count: 10,
          is_active: true
        },
        { 
          name: 'ナンジャモ大量発生オリパ',
          description: 'ナンジャモSRが狙い目！大量発生中の今がチャンス！',
          price: 200,
          currency: 'JPY',
          card_count: 10,
          is_active: true
        },
        { 
          name: 'リザードン祭盤 炎のプレミアオリパ',
          description: 'リザードンex、リザードンVSTAR、歴代リザードンが大集結！',
          price: 300,
          currency: 'JPY',
          card_count: 10,
          is_active: true
        },
        { 
          name: 'ブラッキー超感謝祭',
          description: 'ブラッキーex PSA10確率3倍！月光ポケモンの魅力満載！',
          price: 250,
          currency: 'JPY',
          card_count: 10,
          is_active: true
        },
        { 
          name: 'リーリエ×マリオピカチュウ 超豪華オリパ',
          description: 'リーリエSR、マリオピカチュウPSA10など超豪華ラインナップ！',
          price: 400,
          currency: 'JPY',
          card_count: 10,
          is_active: true
        }
      ]
      
      const { data, error } = await supabase
        .from('gacha_products')
        .insert(simpleData)
        .select()
      
      if (error) {
        toast.error('挿入エラー: ' + error.message)
        setResults({ ...results, insertError: error })
      } else {
        toast.success(`${data.length}個のガチャを登録しました！`)
        setResults({ ...results, insertSuccess: true, insertedData: data })
      }
    } catch (error: any) {
      toast.error('エラー: ' + error.message)
      setResults({ ...results, unexpectedError: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">ガチャテーブル診断ツール</h1>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <button 
            onClick={runDiagnostics} 
            disabled={loading}
            className="btn btn-primary w-100"
          >
            {loading ? '診断中...' : '診断を実行'}
          </button>
        </div>
        <div className="col-md-4">
          <button 
            onClick={generateFixSQL}
            className="btn btn-warning w-100"
          >
            修正SQLを生成
          </button>
        </div>
        <div className="col-md-4">
          <button 
            onClick={insertSimpleData}
            disabled={loading}
            className="btn btn-success w-100"
          >
            シンプルデータ挿入
          </button>
        </div>
      </div>
      
      {Object.keys(results).length > 0 && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">診断結果</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <h6>テーブル状態:</h6>
              <ul>
                <li>テーブル存在: {results.tableExists ? '✅ Yes' : '❌ No'}</li>
                <li>データあり: {results.hasData ? '✅ Yes' : '❌ No'}</li>
                <li>挿入可能: {results.canInsert ? '✅ Yes' : '❌ No'}</li>
              </ul>
            </div>
            
            {results.tableError && (
              <div className="alert alert-danger">
                <strong>テーブルエラー:</strong> {results.tableError}
              </div>
            )}
            
            {results.insertError && (
              <div className="alert alert-warning">
                <strong>挿入エラー:</strong> {results.insertError}
              </div>
            )}
            
            <h6>詳細:</h6>
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(results, null, 2)}
            </pre>
            
            {results.fixSQL && (
              <div className="mt-3">
                <h6>修正SQL（クリップボードにコピー済み）:</h6>
                <pre className="bg-light p-3 rounded" style={{ maxHeight: '300px', overflow: 'auto' }}>
                  {results.fixSQL}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <a href="/admin/gacha" className="btn btn-secondary">ガチャ管理に戻る</a>
      </div>
    </div>
  )
}