import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'

async function getGachaProducts() {
  const supabase = await createClient()
  
  const { data: products } = await supabase
    .from('gacha_products')
    .select(`
      *,
      gacha_pools (
        drop_rate,
        cards (
          name,
          rarity
        )
      )
    `)
    .order('created_at', { ascending: false })
  
  return products || []
}

export default async function GachaPage() {
  const products = await getGachaProducts()
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">ガチャ管理</h1>
        <Link
          href="/admin/gacha/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          新規ガチャ作成
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ガチャ名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                価格
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                カード数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                期間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const totalCards = product.gacha_pools?.length || 0
              const ssrCount = product.gacha_pools?.filter(p => p.cards?.rarity === 'SSR').length || 0
              const srCount = product.gacha_pools?.filter(p => p.cards?.rarity === 'SR').length || 0
              
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={product.banner_image_url || '/api/placeholder/40/40'} 
                        alt={product.name}
                        className="h-10 w-10 rounded-lg mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      単発: {product.single_price}円
                    </div>
                    <div className="text-xs text-gray-500">
                      10連: {product.multi_price}円
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      合計: {totalCards}枚
                    </div>
                    <div className="text-xs text-gray-500">
                      SSR: {ssrCount} / SR: {srCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_active ? '公開中' : '非公開'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.start_date && (
                      <div>{new Date(product.start_date).toLocaleDateString('ja-JP')}</div>
                    )}
                    {product.end_date && (
                      <div>〜 {new Date(product.end_date).toLocaleDateString('ja-JP')}</div>
                    )}
                    {!product.start_date && !product.end_date && (
                      <div>期間限定なし</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/admin/gacha/${product.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      編集
                    </Link>
                    <Link
                      href={`/admin/gacha/${product.id}/pools`}
                      className="text-green-600 hover:text-green-900"
                    >
                      確率設定
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}