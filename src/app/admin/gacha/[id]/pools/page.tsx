import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CardPoolManager from '@/components/admin/CardPoolManager'

interface GachaPoolsPageProps {
  params: { id: string }
}

async function getGachaWithPools(id: string) {
  const supabase = await createClient()
  
  const { data: gacha } = await supabase
    .from('gacha_products')
    .select(`
      *,
      gacha_pools (
        id,
        card_id,
        drop_rate,
        cards:pokemon_cards (
          id,
          card_name,
          product_code,
          rarity,
          image_url,
          market_price
        )
      )
    `)
    .eq('id', id)
    .single()
  
  return gacha
}

async function getAvailableCards() {
  const supabase = await createClient()
  
  const { data: cards } = await supabase
    .from('pokemon_cards')
    .select('*')
    .order('rarity', { ascending: false })
    .order('market_price', { ascending: false })
  
  return cards || []
}

export default async function GachaPoolsPage({ params }: GachaPoolsPageProps) {
  const gacha = await getGachaWithPools(params.id)
  const availableCards = await getAvailableCards()
  
  if (!gacha) {
    notFound()
  }
  
  return (
    <div>
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/admin/gacha" className="text-decoration-none">
              ガチャ管理
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link href={`/admin/gacha/${params.id}`} className="text-decoration-none">
              {gacha.name}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            カードプール設定
          </li>
        </ol>
      </nav>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">{gacha.name} - カードプール設定</h1>
      </div>
      
      <div className="card">
        <div className="card-body">
          <div className="mb-4">
            <h5 className="card-title">確率設定の説明</h5>
            <div className="alert alert-info">
              <div className="small">
                <div className="mb-2">
                  ・各カードに設定する数値は「排出ウェイト」です。実際の排出確率は全カードのウェイト合計で計算されます。
                </div>
                <div className="mb-2">
                  ・例: SSカードA(ウェイト10)、SSカードB(ウェイト5)、SカードC(ウェイト30)の場合
                </div>
                <div className="ps-3" style={{fontSize: '0.75rem'}}>
                  合計ウェイト: 45<br/>
                  カードA: 10/45 = 22.2%<br/>
                  カードB: 5/45 = 11.1%<br/>
                  カードC: 30/45 = 66.7%
                </div>
              </div>
            </div>
          </div>
          
          <CardPoolManager 
            gachaId={params.id}
            currentPools={gacha.gacha_pools || []}
            availableCards={availableCards}
          />
        </div>
      </div>
    </div>
  )
}