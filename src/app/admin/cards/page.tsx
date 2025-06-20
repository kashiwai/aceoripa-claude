import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'

async function getCards(page: number = 1, perPage: number = 20) {
  const supabase = await createClient()
  const offset = (page - 1) * perPage
  
  const { data: cards, count } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1)
  
  return {
    cards: cards || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / perPage)
  }
}

async function getStats() {
  const supabase = await createClient()
  
  const { data: ssrCards, count: ssrCount } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact', head: true })
    .eq('rarity', 'SSR')
  
  const { data: srCards, count: srCount } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact', head: true })
    .eq('rarity', 'SR')
  
  const { data: rCards, count: rCount } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact', head: true })
    .eq('rarity', 'R')
  
  const { data: nCards, count: nCount } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact', head: true })
    .eq('rarity', 'N')
  
  return {
    ssrCount: ssrCount || 0,
    srCount: srCount || 0,
    rCount: rCount || 0,
    nCount: nCount || 0,
    totalCount: (ssrCount || 0) + (srCount || 0) + (rCount || 0) + (nCount || 0)
  }
}

export default async function CardsPage({
  searchParams
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams.page) || 1
  const { cards, totalCount, totalPages } = await getCards(currentPage)
  const stats = await getStats()
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">ポケモンカード管理</h1>
        <div className="flex space-x-4">
          <Link
            href="/admin/cards/import"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
            CSVインポート
          </Link>
          <Link
            href="/admin/cards/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            新規カード追加
          </Link>
        </div>
      </div>
      
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">総カード数</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">SSR</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.ssrCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">SR</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.srCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">R</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.rCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">N</h3>
          <p className="text-3xl font-bold text-gray-600">{stats.nCount}</p>
        </div>
      </div>
      
      {/* カード一覧 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                カード
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                セット・番号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                レアリティ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                市場価格
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                コンディション
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cards.map((card) => (
              <tr key={card.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img 
                        src={card.image_url || '/api/placeholder/80/80'} 
                        alt={card.card_name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{card.card_name}</div>
                      <div className="text-xs text-gray-500">{card.card_type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{card.set_name}</div>
                  <div className="text-xs text-gray-500">#{card.card_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    card.rarity === 'SSR' ? 'bg-yellow-100 text-yellow-800' :
                    card.rarity === 'SR' ? 'bg-purple-100 text-purple-800' :
                    card.rarity === 'R' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {card.rarity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ¥{card.market_price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {card.condition_rating}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={`/admin/cards/${card.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    編集
                  </Link>
                  <button className="text-red-600 hover:text-red-900">
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* ページネーション */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between">
            <Link
              href={`/admin/cards?page=${currentPage - 1}`}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                currentPage <= 1 ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              前へ
            </Link>
            <span className="text-sm text-gray-700">
              ページ {currentPage} / {totalPages} （全 {totalCount} 件）
            </span>
            <Link
              href={`/admin/cards?page=${currentPage + 1}`}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                currentPage >= totalPages ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              次へ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}