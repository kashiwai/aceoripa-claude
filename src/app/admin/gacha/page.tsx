import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'

async function getGachaProducts() {
  try {
    const supabase = await createClient()
    
    // まず基本的なガチャ製品を取得
    const { data: products, error } = await supabase
      .from('gacha_products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Database error:', error)
    }
    
    // データベースが空の場合はサンプルデータを返す
    if (!products || products.length === 0) {
      return [
        {
          id: '1',
          name: 'ピカチュウ大祭り',
          description: 'ピカチュウがメインのプレミアムオリパ',
          single_price: 150,
          multi_price: 1400,
          banner_image_url: '/images/banners/real-gacha/S__44392515_0.jpg',
          is_active: true,
          start_date: null,
          end_date: null,
          created_at: new Date().toISOString(),
          gacha_pools: []
        },
        {
          id: '2', 
          name: 'ナンジャモ大量発生オリパ',
          description: 'ナンジャモカード大量収録の特別オリパ',
          single_price: 200,
          multi_price: 1900,
          banner_image_url: '/images/banners/real-gacha/S__44392516_0.jpg',
          is_active: true,
          start_date: null,
          end_date: null,
          created_at: new Date().toISOString(),
          gacha_pools: []
        },
        {
          id: '3',
          name: 'リザードン祭盤 炎のプレミアオリパ',
          description: 'リザードンシリーズ特化の豪華オリパ',
          single_price: 300,
          multi_price: 2800,
          banner_image_url: '/images/banners/real-gacha/S__44392517_0.jpg',
          is_active: false,
          start_date: null,
          end_date: null,
          created_at: new Date().toISOString(),
          gacha_pools: []
        },
        {
          id: '4',
          name: 'ブラッキー超感謝祭',
          description: 'ブラッキー愛好家のための限定オリパ',
          single_price: 250,
          multi_price: 2300,
          banner_image_url: '/images/banners/real-gacha/S__44392521_0.jpg',
          is_active: true,
          start_date: null,
          end_date: null,
          created_at: new Date().toISOString(),
          gacha_pools: []
        },
        {
          id: '5',
          name: 'リーリエ×マリオピカチュウ 超豪華オリパ',
          description: 'リーリエとマリオピカチュウのコラボレーションオリパ',
          single_price: 400,
          multi_price: 3800,
          banner_image_url: '/images/banners/real-gacha/S__44392523_0.jpg',
          is_active: true,
          start_date: null,
          end_date: null,
          created_at: new Date().toISOString(),
          gacha_pools: []
        }
      ]
    }
    
    return products
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
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="text-muted">
                        <div style={{fontSize: '3rem'}}>🎰</div>
                        <h5 className="mt-3">ガチャがまだ登録されていません</h5>
                        <p>新しいガチャを作成してください</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const totalCards = product.gacha_pools?.length || 0
                    const ssCount = product.gacha_pools?.filter(p => p.cards?.rarity === 'SS').length || 0
                    const sCount = product.gacha_pools?.filter(p => p.cards?.rarity === 'S').length || 0
                    
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
                          <small className="text-muted">SS: {ssCount} / S: {sCount}</small>
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}