'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

export default function CheckSchemaPage() {
  const [loading, setLoading] = useState(false)
  const [schemaInfo, setSchemaInfo] = useState<any>(null)
  const supabase = createClientComponentClient()

  const checkSchema = async () => {
    setLoading(true)
    
    try {
      // gacha_productsテーブルの構造を確認
      // まず、テーブルから1行取得してカラムを確認
      const { data: sampleData, error: sampleError } = await supabase
        .from('gacha_products')
        .select('*')
        .limit(1)
      
      let columns = null
      let columnsError = sampleError
      
      if (!sampleError && sampleData && sampleData.length > 0) {
        // サンプルデータからカラム名を取得
        const columnNames = Object.keys(sampleData[0])
        columns = columnNames.map(name => ({
          column_name: name,
          data_type: typeof sampleData[0][name],
          is_nullable: 'YES',
          column_default: null
        }))
      }
      
      if (columnsError) {
        console.error('Error checking columns:', columnsError)
        
        // 別の方法で確認
        const { data: testInsert, error: testError } = await supabase
          .from('gacha_products')
          .select('*')
          .limit(1)
        
        setSchemaInfo({
          error: columnsError.message,
          testError: testError?.message,
          testData: testInsert
        })
        return
      }
      
      // 必要なカラムの確認
      const requiredColumns = [
        'id', 'name', 'description', 'single_price', 'multi_price',
        'is_active', 'banner_image_url', 'featured_card_id',
        'start_date', 'end_date', 'total_stock', 'sold_count',
        'metadata', 'created_at', 'updated_at'
      ]
      
      const existingColumns = columns?.map(col => col.column_name) || []
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))
      
      setSchemaInfo({
        columns: columns,
        existingColumns: existingColumns,
        missingColumns: missingColumns,
        requiredColumns: requiredColumns
      })
      
      if (missingColumns.length > 0) {
        toast.error(`不足しているカラム: ${missingColumns.join(', ')}`)
      } else {
        toast.success('すべての必要なカラムが存在します')
      }
      
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('予期しないエラーが発生しました')
      setSchemaInfo({ unexpectedError: error })
    } finally {
      setLoading(false)
    }
  }

  const createMissingColumns = async () => {
    if (!schemaInfo?.missingColumns || schemaInfo.missingColumns.length === 0) {
      toast.error('追加するカラムがありません')
      return
    }
    
    setLoading(true)
    
    try {
      // 不足しているカラムのCREATE文を生成
      const alterStatements = []
      
      for (const col of schemaInfo.missingColumns) {
        let statement = ''
        switch (col) {
          case 'total_stock':
          case 'sold_count':
            statement = `ALTER TABLE gacha_products ADD COLUMN IF NOT EXISTS ${col} INTEGER DEFAULT 0;`
            break
          case 'metadata':
            statement = `ALTER TABLE gacha_products ADD COLUMN IF NOT EXISTS ${col} JSONB DEFAULT '{}';`
            break
          default:
            // その他のカラムは既存のスキーマに基づいて追加
            break
        }
        if (statement) {
          alterStatements.push(statement)
        }
      }
      
      setSchemaInfo({
        ...schemaInfo,
        alterStatements: alterStatements
      })
      
      toast.success('ALTER文を生成しました。Supabaseダッシュボードで実行してください。')
      
    } catch (error) {
      console.error('Error creating statements:', error)
      toast.error('ALTER文の生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">データベーススキーマ確認</h1>
      
      <div className="card mb-4">
        <div className="card-body">
          <button
            onClick={checkSchema}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'チェック中...' : 'スキーマをチェック'}
          </button>
        </div>
      </div>
      
      {schemaInfo && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">結果</h5>
          </div>
          <div className="card-body">
            {schemaInfo.error && (
              <div className="alert alert-danger">
                <h6>エラー:</h6>
                <pre>{JSON.stringify(schemaInfo, null, 2)}</pre>
              </div>
            )}
            
            {schemaInfo.columns && (
              <>
                <h6>gacha_productsテーブルのカラム:</h6>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>カラム名</th>
                      <th>データ型</th>
                      <th>NULL許可</th>
                      <th>デフォルト値</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemaInfo.columns.map((col: any) => (
                      <tr key={col.column_name}>
                        <td>{col.column_name}</td>
                        <td>{col.data_type}</td>
                        <td>{col.is_nullable}</td>
                        <td>{col.column_default || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {schemaInfo.missingColumns.length > 0 && (
                  <div className="alert alert-warning mt-3">
                    <h6>不足しているカラム:</h6>
                    <ul className="mb-2">
                      {schemaInfo.missingColumns.map((col: string) => (
                        <li key={col}>{col}</li>
                      ))}
                    </ul>
                    <button
                      onClick={createMissingColumns}
                      className="btn btn-sm btn-warning"
                      disabled={loading}
                    >
                      ALTER文を生成
                    </button>
                  </div>
                )}
                
                {schemaInfo.alterStatements && (
                  <div className="alert alert-info mt-3">
                    <h6>実行すべきSQL文:</h6>
                    <pre className="bg-light p-2">
                      {schemaInfo.alterStatements.join('\n')}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}