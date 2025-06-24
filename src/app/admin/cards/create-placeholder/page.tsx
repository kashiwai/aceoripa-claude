'use client'

export default function CreatePlaceholderPage() {
  return (
    <div className="container mt-5">
      <h1>プレースホルダー画像作成</h1>
      
      <div className="mb-4">
        <p>シンプルなカードプレースホルダーを表示します</p>
      </div>

      <div style={{ width: '300px', height: '420px', margin: '0 auto' }}>
        <svg
          width="300"
          height="420"
          viewBox="0 0 300 420"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="300" height="420" fill="#f0f0f0" stroke="#ccc" strokeWidth="2"/>
          <rect x="10" y="10" width="280" height="400" fill="#fff" stroke="#ddd" strokeWidth="1"/>
          
          <rect x="20" y="20" width="260" height="260" fill="#e9ecef" stroke="#dee2e6" strokeWidth="1"/>
          <text x="150" y="150" textAnchor="middle" fill="#6c757d" fontSize="24" fontFamily="sans-serif">
            カード画像
          </text>
          
          <rect x="20" y="290" width="260" height="110" fill="#f8f9fa"/>
          <text x="150" y="320" textAnchor="middle" fill="#495057" fontSize="18" fontWeight="bold" fontFamily="sans-serif">
            ポケモンカード
          </text>
          <text x="150" y="345" textAnchor="middle" fill="#6c757d" fontSize="14" fontFamily="sans-serif">
            商品コード: XXXX-XXX
          </text>
          <text x="150" y="370" textAnchor="middle" fill="#28a745" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
            ¥0
          </text>
        </svg>
      </div>

      <div className="mt-4">
        <a href="/admin/cards" className="btn btn-primary">カード管理に戻る</a>
      </div>
    </div>
  )
}