'use client'

import { useEffect, useState } from 'react'

export default function TestNgcardPage() {
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [pokemonImages, setPokemonImages] = useState<string[]>([
    '/images/pokemon/003_アセロラ(エクバ) PSA10_PK-0003.jpg',
    '/images/pokemon/008_マリオピカチュウ PSA10_PK-0008.jpg',
  ])

  useEffect(() => {
    // APIルートのテスト
    fetch('/api/test-image')
      .then(res => {
        if (res.ok) {
          setApiStatus({ ok: true, status: res.status })
        } else {
          return res.json().then(data => {
            setApiStatus({ ok: false, status: res.status, data })
          })
        }
      })
      .catch(err => {
        setApiStatus({ ok: false, error: err.message })
      })
  }, [])

  return (
    <div className="container mt-5">
      <h1>ngcard.jpg テストページ</h1>
      
      <div className="row">
        <div className="col-md-12">
          <h2>1. 直接パステスト</h2>
          <table className="table">
            <thead>
              <tr>
                <th>パス</th>
                <th>画像</th>
                <th>状態</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>/images/ngcard.jpg</td>
                <td>
                  <img 
                    src="/images/ngcard.jpg" 
                    alt="Direct ngcard"
                    width="100"
                    height="140"
                    onError={(e) => {
                      const td = e.currentTarget.parentElement?.nextElementSibling
                      if (td) td.textContent = '❌ 読み込みエラー'
                    }}
                    onLoad={(e) => {
                      const td = e.currentTarget.parentElement?.nextElementSibling
                      if (td) td.textContent = '✅ 成功'
                    }}
                  />
                </td>
                <td>-</td>
              </tr>
              
              <tr>
                <td>/api/test-image (APIルート)</td>
                <td>
                  <img 
                    src="/api/test-image" 
                    alt="API ngcard"
                    width="100"
                    height="140"
                    onError={(e) => {
                      const td = e.currentTarget.parentElement?.nextElementSibling
                      if (td) td.textContent = '❌ 読み込みエラー'
                    }}
                    onLoad={(e) => {
                      const td = e.currentTarget.parentElement?.nextElementSibling
                      if (td) td.textContent = '✅ 成功'
                    }}
                  />
                </td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="col-md-12 mt-4">
          <h2>2. APIルートステータス</h2>
          <pre className="bg-light p-3">
            {JSON.stringify(apiStatus, null, 2)}
          </pre>
        </div>

        <div className="col-md-12 mt-4">
          <h2>3. 比較: Pokemonフォルダの画像（正常動作）</h2>
          <div className="row">
            {pokemonImages.map((src, index) => (
              <div key={index} className="col-md-3">
                <img 
                  src={src} 
                  alt={`Pokemon ${index}`}
                  className="img-fluid"
                  style={{ maxHeight: '200px' }}
                />
                <p className="small mt-2">{src.split('/').pop()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-12 mt-4">
          <h2>4. iframeテスト</h2>
          <div className="row">
            <div className="col-md-6">
              <h5>直接パス</h5>
              <iframe 
                src="/images/ngcard.jpg" 
                width="300" 
                height="400"
                style={{ border: '1px solid #ddd' }}
              />
            </div>
            <div className="col-md-6">
              <h5>APIルート</h5>
              <iframe 
                src="/api/test-image" 
                width="300" 
                height="400"
                style={{ border: '1px solid #ddd' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <a href="/admin/cards" className="btn btn-primary">カード管理に戻る</a>
      </div>
    </div>
  )
}