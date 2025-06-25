'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

export default function ApiTestPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const runTests = async () => {
    setLoading(true)
    setResults({})
    
    try {
      // 1. ガチャ一覧取得テスト
      const listTest = await testGachaList()
      setResults(prev => ({ ...prev, list: listTest }))
      
      // 2. 単一ガチャ取得テスト
      if (listTest.success && listTest.data.length > 0) {
        const singleTest = await testSingleGacha(listTest.data[0].id)
        setResults(prev => ({ ...prev, single: singleTest }))
        
        // 3. 更新テスト
        const updateTest = await testUpdateGacha(listTest.data[0].id)
        setResults(prev => ({ ...prev, update: updateTest }))
      }
      
      // 4. カラム確認
      const columnsTest = await testTableColumns()
      setResults(prev => ({ ...prev, columns: columnsTest }))
      
    } catch (error: any) {
      setResults(prev => ({ ...prev, error: error.message }))
    } finally {
      setLoading(false)
    }
  }
  
  const testGachaList = async () => {
    try {
      const { data, error } = await supabase
        .from('gacha_products')
        .select('*')
        .limit(5)
      
      return {
        success: !error,
        error: error?.message,
        data: data || [],
        count: data?.length || 0
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  const testSingleGacha = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('gacha_products')
        .select('*')
        .eq('id', id)
        .single()
      
      return {
        success: !error,
        error: error?.message,
        data: data,
        fields: data ? Object.keys(data) : []
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  const testUpdateGacha = async (id: string) => {
    try {
      const testData = {
        name: 'テスト更新 ' + new Date().toISOString(),
        description: 'APIテスト',
        price: 100,
        banner_image_url: '/test/image.jpg',
        single_price: 150,
        multi_price: 1500
      }
      
      const { data, error } = await supabase
        .from('gacha_products')
        .update(testData)
        .eq('id', id)
        .select()
      
      return {
        success: !error,
        error: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        attemptedFields: Object.keys(testData),
        data: data
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  const testTableColumns = async () => {
    try {
      // サンプルデータを1件取得してカラムを確認
      const { data, error } = await supabase
        .from('gacha_products')
        .select('*')
        .limit(1)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      const columns = data && data.length > 0 ? Object.keys(data[0]) : []
      
      return {
        success: true,
        columns: columns,
        missingColumns: checkMissingColumns(columns)
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  const checkMissingColumns = (existingColumns: string[]) => {
    const requiredColumns = [
      'id', 'name', 'description', 'price', 
      'banner_image_url', 'single_price', 'multi_price',
      'is_active', 'card_count', 'total_stock', 'sold_count'
    ]
    
    return requiredColumns.filter(col => !existingColumns.includes(col))
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">ガチャAPI診断ツール</h1>
      
      <div className="mb-4">
        <button 
          onClick={runTests} 
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'テスト実行中...' : 'APIテストを実行'}
        </button>
      </div>
      
      {Object.keys(results).length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="h5 mb-0">テスト結果</h3>
          </div>
          <div className="card-body">
            <pre className="bg-light p-3 rounded" style={{ 
              fontSize: '12px',
              maxHeight: '600px',
              overflow: 'auto'
            }}>
              {JSON.stringify(results, null, 2)}
            </pre>
            
            {results.columns?.missingColumns?.length > 0 && (
              <div className="alert alert-danger mt-3">
                <h6>不足しているカラム:</h6>
                <ul className="mb-0">
                  {results.columns.missingColumns.map((col: string) => (
                    <li key={col}><code>{col}</code></li>
                  ))}
                </ul>
              </div>
            )}
            
            {results.update?.error && (
              <div className="alert alert-danger mt-3">
                <h6>更新エラー:</h6>
                <p className="mb-0">{results.update.error}</p>
                {results.update.errorCode && (
                  <p className="mb-0">コード: <code>{results.update.errorCode}</code></p>
                )}
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