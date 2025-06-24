'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

export default function TestGachaCreatePage() {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testTableConnection = async () => {
    setLoading(true)
    const testResults: any = {
      timestamp: new Date().toISOString(),
      tests: []
    }

    try {
      // 1. テーブル存在確認
      const { data: tableCheck, error: tableError } = await supabase
        .from('gacha_products')
        .select('id')
        .limit(1)
      
      testResults.tests.push({
        name: 'テーブル接続確認',
        success: !tableError,
        data: tableCheck,
        error: tableError?.message,
        errorCode: tableError?.code
      })

      // 2. 現在のガチャ数を確認
      const { count, error: countError } = await supabase
        .from('gacha_products')
        .select('*', { count: 'exact', head: true })
      
      testResults.tests.push({
        name: '現在のガチャ数',
        success: !countError,
        count: count,
        error: countError?.message
      })

      // 3. テストガチャを作成
      const testGacha = {
        name: `テストガチャ_${Date.now()}`,
        description: 'データベース接続テスト用',
        single_price: 100,
        multi_price: 1000,
        is_active: false,
        banner_image_url: 'https://placehold.co/800x400',
        featured_card_ids: [],
        guarantee_sr_on_multi: true,
        metadata: {
          test: true,
          created_from: 'test-create-page'
        }
      }

      const { data: createData, error: createError } = await supabase
        .from('gacha_products')
        .insert([testGacha])
        .select()
        .single()
      
      testResults.tests.push({
        name: 'ガチャ作成テスト',
        success: !createError,
        data: createData,
        error: createError?.message,
        errorCode: createError?.code,
        errorDetails: createError
      })

      // 4. 作成したガチャを確認
      if (createData?.id) {
        const { data: verifyData, error: verifyError } = await supabase
          .from('gacha_products')
          .select('*')
          .eq('id', createData.id)
          .single()
        
        testResults.tests.push({
          name: '作成確認',
          success: !verifyError && verifyData !== null,
          data: verifyData,
          error: verifyError?.message
        })

        // 5. 削除（クリーンアップ）
        const { error: deleteError } = await supabase
          .from('gacha_products')
          .delete()
          .eq('id', createData.id)
        
        testResults.tests.push({
          name: 'テストデータ削除',
          success: !deleteError,
          error: deleteError?.message
        })
      }

    } catch (error: any) {
      testResults.tests.push({
        name: '予期しないエラー',
        success: false,
        error: error.message
      })
    }

    setResult(testResults)
    setLoading(false)
  }

  const checkTableSchema = async () => {
    try {
      // RLSポリシーの確認
      const { data: policies, error: policyError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'gacha_products')

      setResult({
        policies: policies || [],
        error: policyError?.message,
        note: 'RLSポリシーが有効な場合、適切な権限設定が必要です'
      })
    } catch (error: any) {
      setResult({
        error: error.message
      })
    }
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">ガチャテーブル接続テスト</h1>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">データベース接続テスト</h5>
              <p className="text-muted">gacha_productsテーブルへの読み書きをテストします</p>
              
              <div className="d-flex gap-3">
                <button
                  onClick={testTableConnection}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'テスト中...' : '接続テスト実行'}
                </button>
                
                <button
                  onClick={checkTableSchema}
                  className="btn btn-secondary"
                >
                  RLSポリシー確認
                </button>
              </div>
            </div>
          </div>

          {/* 結果表示 */}
          {result && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">テスト結果</h5>
              </div>
              <div className="card-body">
                {result.tests ? (
                  <div className="space-y-3">
                    {result.tests.map((test: any, index: number) => (
                      <div key={index} className={`alert ${test.success ? 'alert-success' : 'alert-danger'}`}>
                        <h6>{test.name}: {test.success ? '✅ 成功' : '❌ 失敗'}</h6>
                        {test.error && (
                          <div>
                            <strong>エラー:</strong> {test.error}
                            {test.errorCode && <span> (Code: {test.errorCode})</span>}
                          </div>
                        )}
                        {test.count !== undefined && (
                          <div><strong>件数:</strong> {test.count}</div>
                        )}
                        {test.data && (
                          <details className="mt-2">
                            <summary>詳細データ</summary>
                            <pre className="mt-2 p-2 bg-light rounded">
                              {JSON.stringify(test.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="p-3 bg-light rounded">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">🔍 よくある問題</h5>
              <ul className="small">
                <li><strong>42P01エラー:</strong> テーブルが存在しない</li>
                <li><strong>42501エラー:</strong> 権限不足（RLS設定要確認）</li>
                <li><strong>23505エラー:</strong> 重複エラー</li>
                <li><strong>データが保存されない:</strong> RLSポリシーの設定が必要</li>
              </ul>
              
              <hr/>
              
              <h6>解決方法</h6>
              <ol className="small">
                <li>Supabase SQLエディタでテーブル確認</li>
                <li>RLSが有効な場合は適切なポリシーを設定</li>
                <li>サービスロールキーを使用（管理者権限）</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}