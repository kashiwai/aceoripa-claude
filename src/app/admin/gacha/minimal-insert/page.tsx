'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function MinimalInsertPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const checkColumns = async () => {
    setLoading(true)
    try {
      // テーブルの全データを取得して構造を確認
      const { data, error } = await supabase
        .from('gacha_products')
        .select('*')
        .limit(1)
      
      if (!error && data) {
        const columns = data.length > 0 ? Object.keys(data[0]) : []
        setResult({
          existingColumns: columns,
          data: data
        })
        toast.success(`${columns.length}個のカラムを検出しました`)
      } else if (error) {
        setResult({ error: error.message })
        toast.error('エラー: ' + error.message)
      }
    } catch (error: any) {
      setResult({ error: error.message })
      toast.error('エラー: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const insertMinimal = async () => {
    setLoading(true)
    try {
      // 最も基本的なデータのみ
      const minimalGachas = [
        {
          name: 'ピカチュウ大祭り',
          description: 'マリオピカチュウPSA10確定！',
          single_price: 150,
          is_active: true
        },
        {
          name: 'ナンジャモ大量発生オリパ',
          description: 'ナンジャモSRが狙い目！',
          single_price: 200,
          is_active: true
        },
        {
          name: 'リザードン祭盤',
          description: 'リザードンex大集結！',
          single_price: 300,
          is_active: true
        },
        {
          name: 'ブラッキー超感謝祭',
          description: 'ブラッキーex PSA10確率3倍！',
          single_price: 250,
          is_active: true
        },
        {
          name: 'リーリエ×マリオピカチュウ',
          description: '超豪華ラインナップ！',
          single_price: 400,
          is_active: true
        }
      ]
      
      const { data, error } = await supabase
        .from('gacha_products')
        .insert(minimalGachas)
        .select()
      
      if (error) {
        setResult({ error: error.message, details: error })
        toast.error('エラー: ' + error.message)
      } else {
        setResult({ success: true, data: data })
        toast.success(`${data.length}個のガチャを登録しました！`)
        setTimeout(() => router.push('/admin/gacha'), 2000)
      }
    } catch (error: any) {
      setResult({ error: error.message })
      toast.error('エラー: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const generateAlterSQL = () => {
    const sql = `
-- 既存のgacha_productsテーブルに不足しているカラムを追加
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS multi_price INTEGER DEFAULT 900;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS banner_image_url TEXT;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS featured_card_id UUID;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS total_stock INTEGER DEFAULT 1000;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
`
    navigator.clipboard.writeText(sql)
    toast.success('SQLをクリップボードにコピーしました')
    setResult({ ...result, sql: sql })
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">最小限データ挿入</h1>
      
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">1. カラム確認</h5>
              <p className="card-text">現在のテーブル構造を確認</p>
              <button onClick={checkColumns} disabled={loading} className="btn btn-info">
                カラムを確認
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">2. ALTER SQL生成</h5>
              <p className="card-text">不足カラムの追加SQL</p>
              <button onClick={generateAlterSQL} className="btn btn-warning">
                SQLを生成
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">3. データ挿入</h5>
              <p className="card-text">最小限のデータで挿入</p>
              <button onClick={insertMinimal} disabled={loading} className="btn btn-primary">
                ガチャを挿入
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {result && (
        <div className="card mt-4">
          <div className="card-body">
            <h5>結果:</h5>
            <pre className="bg-light p-3">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <a href="/admin/gacha" className="btn btn-secondary">戻る</a>
      </div>
    </div>
  )
}