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
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/admin/gacha" className="hover:text-gray-700">
            ガチャ管理
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/admin/gacha/${params.id}`} className="hover:text-gray-700">
            {gacha.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">カードプール設定</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{gacha.name} - カードプール設定</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">確率設定の説明</h2>
          <div className="bg-blue-50 p-4 rounded-lg text-sm">
            <p className="mb-2">
              ・各カードに設定する数値は「排出ウェイト」です。実際の排出確率は全カードのウェイト合計で計算されます。
            </p>
            <p className="mb-2">
              ・例: SSRカードA(ウェイト10)、SSRカードB(ウェイト5)、SRカードC(ウェイト30)の場合
            </p>
            <p className="pl-4 text-xs">
              合計ウェイト: 45<br/>
              カードA: 10/45 = 22.2%<br/>
              カードB: 5/45 = 11.1%<br/>
              カードC: 30/45 = 66.7%
            </p>
          </div>
        </div>
        
        <CardPoolManager 
          gachaId={params.id}
          currentPools={gacha.gacha_pools || []}
          availableCards={availableCards}
        />
      </div>
    </div>
  )
}