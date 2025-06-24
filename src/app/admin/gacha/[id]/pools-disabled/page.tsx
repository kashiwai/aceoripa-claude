import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface GachaPoolsPageProps {
  params: { id: string }
}

export default async function GachaPoolsDisabledPage({ params }: GachaPoolsPageProps) {
  const supabase = await createClient()
  
  // ガチャ情報のみ取得
  const { data: gacha } = await supabase
    .from('gacha_products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!gacha) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          ガチャが見つかりません
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">{gacha.name} - 確率設定</h1>
          <p className="text-muted">カードプールと排出確率の管理</p>
        </div>
        <Link href={`/admin/gacha/${params.id}`} className="btn btn-secondary">
          ← ガチャ詳細に戻る
        </Link>
      </div>

      <div className="alert alert-warning">
        <h4 className="alert-heading">機能準備中</h4>
        <p>確率設定機能は現在準備中です。</p>
        <hr />
        <p className="mb-0">
          この機能を使用するには、以下のテーブルの作成が必要です：
        </p>
        <ul className="mt-2">
          <li>pokemon_cards - ポケモンカードマスターデータ</li>
          <li>gacha_pokemon_pools - ガチャとカードの関連テーブル</li>
        </ul>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">ガチャ情報</h5>
        </div>
        <div className="card-body">
          <dl className="row">
            <dt className="col-sm-3">ガチャ名</dt>
            <dd className="col-sm-9">{gacha.name}</dd>
            
            <dt className="col-sm-3">説明</dt>
            <dd className="col-sm-9">{gacha.description || '-'}</dd>
            
            <dt className="col-sm-3">価格</dt>
            <dd className="col-sm-9">¥{gacha.price}</dd>
            
            <dt className="col-sm-3">カード枚数</dt>
            <dd className="col-sm-9">{gacha.card_count}枚</dd>
            
            <dt className="col-sm-3">ステータス</dt>
            <dd className="col-sm-9">
              <span className={`badge ${gacha.is_active ? 'bg-success' : 'bg-secondary'}`}>
                {gacha.is_active ? '公開中' : '非公開'}
              </span>
            </dd>
          </dl>
        </div>
      </div>

      <div className="mt-4">
        <Link href="/admin/gacha" className="btn btn-secondary">
          ガチャ一覧に戻る
        </Link>
      </div>
    </div>
  )
}