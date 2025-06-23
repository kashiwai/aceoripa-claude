import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'

async function getGachaProducts() {
  const supabase = await createClient()
  
  try {
    // ガチャ製品を取得（プール情報も含めて）
    const { data: products, error } = await supabase
      .from('gacha_products')
      .select(`
        *,
        gacha_pokemon_pools (
          id,
          pokemon_card_id,
          weight
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Database error:', error)
      throw error
    }
    
    // プール情報から総カード数と総ウェイトを計算
    const productsWithStats = (products || []).map(product => {
      const totalCards = product.gacha_pokemon_pools?.length || 0
      const totalWeight = product.gacha_pokemon_pools?.reduce((sum: number, pool: any) => 
        sum + (pool.weight || 0), 0) || 0
      
      return {
        ...product,
        totalCards,
        totalWeight
      }
    })
    
    return productsWithStats
  } catch (error) {
    console.error('Failed to fetch gacha products:', error)
    // エラー時は空配列を返す（ダミーデータは使わない）
    return []
  }
}

export default async function GachaManagementPage() {
  const products = await getGachaProducts()

  return (
    <div>
      {/* ヘッダー */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">ガチャ管理</h1>
          <p className="text-muted">ガチャの設定・管理を行います</p>
        </div>
        <Link href="/admin/gacha/new" className="btn btn-primary">
          <PlusIcon className="bi bi-plus-lg me-2" style={{width: '20px', height: '20px'}} />
          新規ガチャ作成
        </Link>
      </div>

      {/* ガチャ一覧 */}
      {products.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="mb-4">
              <i className="bi bi-box-seam" style={{fontSize: '3rem', color: '#ccc'}}></i>
            </div>
            <h5 className="text-muted">ガチャがまだ登録されていません</h5>
            <p className="text-muted mb-4">新しいガチャを作成してください</p>
            <Link href="/admin/gacha/new" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2"></i>
              最初のガチャを作成
            </Link>
          </div>
        </div>
      ) : (
        <div className="row">
          {products.map((product) => (
            <div key={product.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                {/* バナー画像 */}
                {product.banner_image_url && (
                  <img
                    src={product.banner_image_url}
                    alt={product.name}
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text text-muted small flex-grow-1">
                    {product.description || '説明なし'}
                  </p>
                  
                  {/* 価格情報 */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small">
                      <span>単発:</span>
                      <strong>¥{product.single_price}</strong>
                    </div>
                    <div className="d-flex justify-content-between small">
                      <span>10連:</span>
                      <strong>¥{product.multi_price}</strong>
                    </div>
                  </div>
                  
                  {/* ステータス */}
                  <div className="mb-3">
                    <span className={`badge ${product.is_active ? 'bg-success' : 'bg-secondary'}`}>
                      {product.is_active ? '公開中' : '非公開'}
                    </span>
                    {product.totalCards > 0 && (
                      <span className="badge bg-info ms-2">
                        {product.totalCards}枚登録
                      </span>
                    )}
                  </div>
                  
                  {/* 期間 */}
                  {(product.start_date || product.end_date) && (
                    <div className="small text-muted mb-3">
                      {product.start_date && `開始: ${new Date(product.start_date).toLocaleDateString('ja-JP')}`}
                      {product.start_date && product.end_date && ' ～ '}
                      {product.end_date && `終了: ${new Date(product.end_date).toLocaleDateString('ja-JP')}`}
                    </div>
                  )}
                  
                  {/* アクション */}
                  <div className="d-grid gap-2">
                    <Link href={`/admin/gacha/${product.id}`} className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-pencil me-2"></i>
                      編集
                    </Link>
                    <Link href={`/admin/gacha/${product.id}/pools`} className="btn btn-sm btn-outline-success">
                      <i className="bi bi-percent me-2"></i>
                      確率設定
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}