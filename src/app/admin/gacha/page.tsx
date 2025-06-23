import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'

async function getGachaProducts() {
  try {
    const supabase = await createClient()
    
    const { data: products, error } = await supabase
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
    
    if (error) {
      console.error('Database error:', error)
      return []
    }
    
    return products || []
  } catch (error) {
    console.error('Connection error:', error)
    return []
  }
}

export default async function GachaPage() {
  const products = await getGachaProducts()
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">ガチャ管理</h1>
        <Link
          href="/admin/gacha/new"
          className="btn btn-primary"
        >
          ➕ 新規ガチャ作成
        </Link>
      </div>
      
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ガチャ名</th>
                  <th>価格</th>
                  <th>カード数</th>
                  <th>ステータス</th>
                  <th>期間</th>
                  <th>アクション</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const totalCards = product.gacha_pools?.length || 0
                  const ssrCount = product.gacha_pools?.filter(p => p.cards?.rarity === 'SSR').length || 0
                  const srCount = product.gacha_pools?.filter(p => p.cards?.rarity === 'SR').length || 0
                  
                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={product.banner_image_url || '/api/placeholder/40/40'} 
                            alt={product.name}
                            className="rounded me-3"
                            style={{width: '40px', height: '40px', objectFit: 'cover'}}
                          />
                          <div>
                            <div className="fw-medium">{product.name}</div>
                            <small className="text-muted">{product.description}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>単発: ¥{product.single_price}</div>
                        <small className="text-muted">10連: ¥{product.multi_price}</small>
                      </td>
                      <td>
                        <div>合計: {totalCards}枚</div>
                        <small className="text-muted">SSR: {ssrCount} / SR: {srCount}</small>
                      </td>
                      <td>
                        <span className={`badge ${
                          product.is_active 
                            ? 'bg-success' 
                            : 'bg-secondary'
                        }`}>
                          {product.is_active ? '公開中' : '非公開'}
                        </span>
                      </td>
                      <td>
                        {product.start_date && (
                          <div>{new Date(product.start_date).toLocaleDateString('ja-JP')}</div>
                        )}
                        {product.end_date && (
                          <div>〜 {new Date(product.end_date).toLocaleDateString('ja-JP')}</div>
                        )}
                        {!product.start_date && !product.end_date && (
                          <small className="text-muted">期間限定なし</small>
                        )}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Link
                            href={`/admin/gacha/${product.id}`}
                            className="btn btn-outline-primary"
                          >
                            編集
                          </Link>
                          <Link
                            href={`/admin/gacha/${product.id}/pools`}
                            className="btn btn-outline-success"
                          >
                            確率設定
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}