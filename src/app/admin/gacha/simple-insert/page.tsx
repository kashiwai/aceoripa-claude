'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function SimpleInsertPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const insertSimpleGacha = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // 最小限の必須フィールドのみでテスト
      const testGacha = {
        name: 'テストガチャ',
        description: 'テスト用のガチャです',
        single_price: 100,
        multi_price: 900,
        is_active: true
      }
      
      console.log('Inserting:', testGacha)
      
      const { data, error } = await supabase
        .from('gacha_products')
        .insert([testGacha])
        .select()
      
      if (error) {
        console.error('Insert error:', error)
        setResult({
          success: false,
          error: error.message,
          details: error,
          hint: error.hint || 'なし',
          code: error.code
        })
        toast.error('挿入エラー: ' + error.message)
      } else {
        console.log('Insert success:', data)
        setResult({
          success: true,
          data: data
        })
        toast.success('テストガチャを挿入しました！')
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

  const insertFullGachas = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // 実際のガチャデータ（最小限のフィールド）
      const gachas = [
        {
          name: 'ピカチュウ大祭り',
          description: 'マリオピカチュウPSA10確定！激アツのピカチュウ祭り開催中！',
          single_price: 150,
          multi_price: 1350,
          is_active: true,
          banner_image_url: '/images/banners/real-gacha/S__44392515_0.jpg'
        },
        {
          name: 'ナンジャモ大量発生オリパ',
          description: 'ナンジャモSRが狙い目！大量発生中の今がチャンス！',
          single_price: 200,
          multi_price: 1800,
          is_active: true,
          banner_image_url: '/images/banners/real-gacha/S__44392516_0.jpg'
        },
        {
          name: 'リザードン祭盤 炎のプレミアオリパ',
          description: 'リザードンex、リザードンVSTAR、歴代リザードンが大集結！',
          single_price: 300,
          multi_price: 2700,
          is_active: true,
          banner_image_url: '/images/banners/real-gacha/S__44392517_0.jpg'
        },
        {
          name: 'ブラッキー超感謝祭',
          description: 'ブラッキーex PSA10確率3倍！月光ポケモンの魅力満載！',
          single_price: 250,
          multi_price: 2250,
          is_active: true,
          banner_image_url: '/images/banners/real-gacha/S__44392521_0.jpg'
        },
        {
          name: 'リーリエ×マリオピカチュウ 超豪華オリパ',
          description: 'リーリエSR、マリオピカチュウPSA10など超豪華ラインナップ！',
          single_price: 400,
          multi_price: 3600,
          is_active: true,
          banner_image_url: '/images/banners/real-gacha/S__44392523_0.jpg'
        }
      ]
      
      console.log('Inserting gachas:', gachas)
      
      const { data, error } = await supabase
        .from('gacha_products')
        .insert(gachas)
        .select()
      
      if (error) {
        console.error('Insert error:', error)
        setResult({
          success: false,
          error: error.message,
          details: error
        })
        toast.error('挿入エラー: ' + error.message)
      } else {
        console.log('Insert success:', data)
        setResult({
          success: true,
          data: data,
          count: data.length
        })
        toast.success(`${data.length}個のガチャを登録しました！`)
        
        // 3秒後にリダイレクト
        setTimeout(() => {
          router.push('/admin/gacha')
        }, 3000)
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

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">シンプルガチャ挿入テスト</h1>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">ステップ1: テスト挿入</h5>
              <p className="card-text">最小限のデータでテスト挿入を行います</p>
              <button
                onClick={insertSimpleGacha}
                disabled={loading}
                className="btn btn-warning"
              >
                {loading ? 'テスト中...' : 'テストガチャを挿入'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">ステップ2: 本番データ挿入</h5>
              <p className="card-text">TOPページの5つのガチャを挿入します</p>
              <button
                onClick={insertFullGachas}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? '挿入中...' : '5つのガチャを挿入'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {result && (
        <div className={`card ${result.success ? 'border-success' : 'border-danger'}`}>
          <div className="card-header">
            <h5 className={`mb-0 ${result.success ? 'text-success' : 'text-danger'}`}>
              {result.success ? '✅ 成功' : '❌ エラー'}
            </h5>
          </div>
          <div className="card-body">
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
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