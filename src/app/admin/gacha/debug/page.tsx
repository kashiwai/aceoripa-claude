'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

export default function GachaDebugPage() {
  const [loading, setLoading] = useState(true)
  const [gachaData, setGachaData] = useState<any>(null)
  const [error, setError] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchGachaData()
  }, [])

  const fetchGachaData = async () => {
    setLoading(true)
    try {
      // シンプルなクエリでデータを取得
      const { data, error } = await supabase
        .from('gacha_products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching gacha:', error)
        setError(error)
        toast.error('データ取得エラー: ' + error.message)
      } else {
        console.log('Fetched gacha data:', data)
        setGachaData(data)
        toast.success(`${data?.length || 0}個のガチャを取得しました`)
      }
    } catch (err: any) {
      console.error('Unexpected error:', err)
      setError(err)
      toast.error('予期しないエラー: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteGacha = async (id: string) => {
    if (!confirm('このガチャを削除しますか？')) return
    
    try {
      const { error } = await supabase
        .from('gacha_products')
        .delete()
        .eq('id', id)
      
      if (error) {
        toast.error('削除エラー: ' + error.message)
      } else {
        toast.success('ガチャを削除しました')
        fetchGachaData()
      }
    } catch (err: any) {
      toast.error('エラー: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">ガチャデータ デバッグ</h1>
        <button onClick={fetchGachaData} className="btn btn-primary">
          再読み込み
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <h5>エラー詳細:</h5>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {gachaData && gachaData.length > 0 ? (
        <>
          <div className="alert alert-success">
            <strong>{gachaData.length}個</strong>のガチャがデータベースに存在します
          </div>
          
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>名前</th>
                  <th>説明</th>
                  <th>価格</th>
                  <th>カード数</th>
                  <th>通貨</th>
                  <th>状態</th>
                  <th>作成日</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {gachaData.map((gacha: any) => (
                  <tr key={gacha.id}>
                    <td className="small">{gacha.id.substring(0, 8)}...</td>
                    <td>{gacha.name}</td>
                    <td className="small">{gacha.description?.substring(0, 30)}...</td>
                    <td>¥{gacha.price}</td>
                    <td>{gacha.card_count}</td>
                    <td>{gacha.currency}</td>
                    <td>
                      <span className={`badge ${gacha.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {gacha.is_active ? '有効' : '無効'}
                      </span>
                    </td>
                    <td className="small">
                      {new Date(gacha.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td>
                      <button 
                        onClick={() => deleteGacha(gacha.id)}
                        className="btn btn-sm btn-danger"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <h5>生データ:</h5>
            <pre className="bg-light p-3 rounded" style={{ maxHeight: '400px', overflow: 'auto' }}>
              {JSON.stringify(gachaData, null, 2)}
            </pre>
          </div>
        </>
      ) : (
        <div className="alert alert-warning">
          ガチャデータが見つかりません
        </div>
      )}

      <div className="mt-4">
        <a href="/admin/gacha" className="btn btn-secondary me-2">ガチャ管理に戻る</a>
        <a href="/admin/gacha/diagnose-table" className="btn btn-warning">診断ツール</a>
      </div>
    </div>
  )
}