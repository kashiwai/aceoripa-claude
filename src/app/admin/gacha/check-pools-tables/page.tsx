'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

export default function CheckPoolsTablesPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>({})
  const supabase = createClientComponentClient()

  const checkTables = async () => {
    setLoading(true)
    const tableChecks: any = {}
    
    try {
      // 1. pokemon_cardsテーブルの確認
      const { data: pokemonCards, error: pcError } = await supabase
        .from('pokemon_cards')
        .select('*')
        .limit(1)
      
      tableChecks.pokemon_cards = {
        exists: !pcError,
        error: pcError?.message,
        hasData: pokemonCards && pokemonCards.length > 0,
        columns: pokemonCards && pokemonCards.length > 0 ? Object.keys(pokemonCards[0]) : []
      }
      
      // 2. gacha_pokemon_poolsテーブルの確認
      const { data: gachaPools, error: gpError } = await supabase
        .from('gacha_pokemon_pools')
        .select('*')
        .limit(1)
      
      tableChecks.gacha_pokemon_pools = {
        exists: !gpError,
        error: gpError?.message,
        hasData: gachaPools && gachaPools.length > 0,
        columns: gachaPools && gachaPools.length > 0 ? Object.keys(gachaPools[0]) : []
      }
      
      // 3. card_raritiesテーブルの確認
      const { data: rarities, error: crError } = await supabase
        .from('card_rarities')
        .select('*')
        .limit(5)
      
      tableChecks.card_rarities = {
        exists: !crError,
        error: crError?.message,
        hasData: rarities && rarities.length > 0,
        data: rarities
      }
      
      setResults(tableChecks)
      
      // 結果をトースト表示
      if (tableChecks.pokemon_cards.exists && tableChecks.gacha_pokemon_pools.exists) {
        toast.success('必要なテーブルは全て存在します')
      } else {
        toast('一部のテーブルが不足しています', {
          icon: '⚠️',
        })
      }
      
    } catch (error: any) {
      toast.error('チェック中にエラーが発生しました')
      setResults({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const createMissingTables = () => {
    const sql = `
-- gacha_pokemon_poolsテーブルのみ作成（pokemon_cardsは既に存在）
CREATE TABLE IF NOT EXISTS gacha_pokemon_pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gacha_product_id UUID REFERENCES gacha_products(id) ON DELETE CASCADE,
  pokemon_card_id UUID REFERENCES pokemon_cards(id) ON DELETE CASCADE,
  weight INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gacha_product_id, pokemon_card_id)
);

-- RLSポリシー
ALTER TABLE gacha_pokemon_pools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON gacha_pokemon_pools FOR ALL USING (true);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_gacha_pools_gacha_id ON gacha_pokemon_pools(gacha_product_id);
CREATE INDEX IF NOT EXISTS idx_gacha_pools_card_id ON gacha_pokemon_pools(pokemon_card_id);`
    
    navigator.clipboard.writeText(sql)
    toast.success('SQLをクリップボードにコピーしました')
    setResults({ ...results, sql: sql })
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">確率設定テーブル診断</h1>
      
      <div className="mb-4">
        <button 
          onClick={checkTables} 
          disabled={loading}
          className="btn btn-primary me-2"
        >
          {loading ? 'チェック中...' : 'テーブルをチェック'}
        </button>
        
        {results.gacha_pokemon_pools && !results.gacha_pokemon_pools.exists && (
          <button 
            onClick={createMissingTables}
            className="btn btn-warning"
          >
            作成SQLを生成
          </button>
        )}
      </div>
      
      {Object.keys(results).length > 0 && !results.error && (
        <div className="row">
          {/* pokemon_cardsテーブル */}
          <div className="col-md-4 mb-3">
            <div className={`card ${results.pokemon_cards?.exists ? 'border-success' : 'border-danger'}`}>
              <div className="card-header">
                <h5 className="mb-0">pokemon_cards</h5>
              </div>
              <div className="card-body">
                <p>存在: {results.pokemon_cards?.exists ? '✅' : '❌'}</p>
                <p>データ: {results.pokemon_cards?.hasData ? 'あり' : 'なし'}</p>
                {results.pokemon_cards?.columns && (
                  <div>
                    <strong>カラム:</strong>
                    <ul className="small mb-0">
                      {results.pokemon_cards.columns.map((col: string) => (
                        <li key={col}>{col}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {results.pokemon_cards?.error && (
                  <div className="alert alert-danger small mb-0 mt-2">
                    {results.pokemon_cards.error}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* gacha_pokemon_poolsテーブル */}
          <div className="col-md-4 mb-3">
            <div className={`card ${results.gacha_pokemon_pools?.exists ? 'border-success' : 'border-danger'}`}>
              <div className="card-header">
                <h5 className="mb-0">gacha_pokemon_pools</h5>
              </div>
              <div className="card-body">
                <p>存在: {results.gacha_pokemon_pools?.exists ? '✅' : '❌'}</p>
                <p>データ: {results.gacha_pokemon_pools?.hasData ? 'あり' : 'なし'}</p>
                {results.gacha_pokemon_pools?.columns && (
                  <div>
                    <strong>カラム:</strong>
                    <ul className="small mb-0">
                      {results.gacha_pokemon_pools.columns.map((col: string) => (
                        <li key={col}>{col}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {results.gacha_pokemon_pools?.error && (
                  <div className="alert alert-danger small mb-0 mt-2">
                    {results.gacha_pokemon_pools.error}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* card_raritiesテーブル */}
          <div className="col-md-4 mb-3">
            <div className={`card ${results.card_rarities?.exists ? 'border-success' : 'border-danger'}`}>
              <div className="card-header">
                <h5 className="mb-0">card_rarities</h5>
              </div>
              <div className="card-body">
                <p>存在: {results.card_rarities?.exists ? '✅' : '❌'}</p>
                <p>データ: {results.card_rarities?.hasData ? 'あり' : 'なし'}</p>
                {results.card_rarities?.data && (
                  <div>
                    <strong>レアリティ:</strong>
                    <ul className="small mb-0">
                      {results.card_rarities.data.map((r: any) => (
                        <li key={r.id}>{r.rarity_code}: {r.base_drop_rate}%</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {results.sql && (
        <div className="card mt-3">
          <div className="card-header">
            <h5 className="mb-0">作成SQL（クリップボードにコピー済み）</h5>
          </div>
          <div className="card-body">
            <pre className="bg-light p-3 rounded">{results.sql}</pre>
          </div>
        </div>
      )}
      
      {results.error && (
        <div className="alert alert-danger">
          <strong>エラー:</strong> {results.error}
        </div>
      )}
      
      <div className="mt-4">
        <a href="/admin/gacha" className="btn btn-secondary">ガチャ管理に戻る</a>
      </div>
    </div>
  )
}