'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SetupGachaTablesPage() {
  const [copied, setCopied] = useState(false)

  const sqlScript = `-- ガチャシステム用テーブル作成SQL

-- 1. カードレアリティテーブル
CREATE TABLE IF NOT EXISTS card_rarities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(10) NOT NULL UNIQUE,
  display_name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#000000',
  weight INTEGER DEFAULT 100,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- レアリティのマスターデータを挿入
INSERT INTO card_rarities (name, display_name, color, weight, sort_order) VALUES
  ('SS', 'SS（ダブルエス）', '#FF0033', 1, 1),
  ('S', 'S（エス）', '#FFD700', 5, 2),
  ('A', 'A（エー）', '#C0C0C0', 15, 3),
  ('B', 'B（ビー）', '#CD7F32', 30, 4),
  ('C', 'C（シー）', '#808080', 49, 5)
ON CONFLICT (name) DO NOTHING;

-- 2. ガチャプールテーブル（ガチャとカードの中間テーブル）
CREATE TABLE IF NOT EXISTS gacha_pokemon_pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gacha_product_id UUID NOT NULL REFERENCES gacha_products(id) ON DELETE CASCADE,
  pokemon_card_id UUID NOT NULL REFERENCES pokemon_cards(id) ON DELETE CASCADE,
  weight INTEGER NOT NULL DEFAULT 100,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(gacha_product_id, pokemon_card_id)
);

-- インデックスの作成
CREATE INDEX idx_gacha_pools_product ON gacha_pokemon_pools(gacha_product_id);
CREATE INDEX idx_gacha_pools_card ON gacha_pokemon_pools(pokemon_card_id);
CREATE INDEX idx_gacha_pools_weight ON gacha_pokemon_pools(weight);

-- RLSポリシー（必要に応じて調整）
ALTER TABLE card_rarities ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_pokemon_pools ENABLE ROW LEVEL SECURITY;

-- 読み取り専用ポリシー（全ユーザー）
CREATE POLICY "Allow read access for all users" ON card_rarities
  FOR SELECT USING (true);

CREATE POLICY "Allow read access for all users" ON gacha_pokemon_pools
  FOR SELECT USING (true);

-- 管理者用の全権限ポリシー
CREATE POLICY "Allow all for authenticated users" ON gacha_pokemon_pools
  FOR ALL USING (auth.role() = 'authenticated');`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">ガチャテーブルセットアップ</h1>

      <div className="alert alert-warning mb-4">
        <h5 className="alert-heading">⚠️ 必要なテーブルが不足しています</h5>
        <p>以下のテーブルを作成する必要があります：</p>
        <ul className="mb-0">
          <li><strong>gacha_pokemon_pools</strong> - ガチャとカードの関連テーブル</li>
          <li><strong>card_rarities</strong> - カードレアリティマスター</li>
        </ul>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">セットアップ手順</h5>
        </div>
        <div className="card-body">
          <ol className="mb-4">
            <li className="mb-2">以下のSQLをコピー</li>
            <li className="mb-2">
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                Supabaseダッシュボード
              </a>
              を開く
            </li>
            <li className="mb-2">SQL Editor に移動</li>
            <li className="mb-2">SQLを貼り付けて「Run」をクリック</li>
            <li className="mb-2">実行後、このページをリロード</li>
          </ol>

          <div className="position-relative">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6>実行するSQL:</h6>
              <button
                onClick={copyToClipboard}
                className={`btn btn-sm ${copied ? 'btn-success' : 'btn-primary'}`}
              >
                {copied ? '✅ コピーしました' : '📋 SQLをコピー'}
              </button>
            </div>
            
            <pre className="p-3 bg-light rounded" style={{ maxHeight: '400px', overflow: 'auto' }}>
              {sqlScript}
            </pre>
          </div>

          <div className="mt-4">
            <h6>このSQLの内容:</h6>
            <ul>
              <li><strong>card_rarities</strong>テーブルの作成とレアリティデータの挿入</li>
              <li><strong>gacha_pokemon_pools</strong>テーブルの作成</li>
              <li>必要なインデックスの作成</li>
              <li>RLSポリシーの設定</li>
            </ul>
          </div>
        </div>
        <div className="card-footer">
          <div className="d-flex justify-content-between">
            <Link href="/admin/gacha/check-table" className="btn btn-secondary">
              ← 診断に戻る
            </Link>
            <a 
              href="https://supabase.com/dashboard/project/_/sql/new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Supabase SQL Editorを開く →
            </a>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="alert alert-info">
          <h6 className="alert-heading">💡 ヒント</h6>
          <p className="mb-0">
            SQLの実行が完了したら、
            <Link href="/admin/gacha/check-table" className="alert-link">
              診断ページ
            </Link>
            で正しく作成されたか確認できます。
          </p>
        </div>
      </div>
    </div>
  )
}