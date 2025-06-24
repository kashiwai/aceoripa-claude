'use client'

import { useState, useEffect } from 'react'

export default function JpgTestPage() {
  const [results, setResults] = useState<any[]>([])
  
  const testUrls = [
    { name: '直接パス', url: '/images/ngcard.jpg' },
    { name: 'APIルート (test-image)', url: '/api/test-image' },
    { name: 'APIルート (dynamic)', url: '/api/image/ngcard.jpg' },
    { name: 'Pokemon JPG (動作確認)', url: '/images/pokemon/003_アセロラ(エクバ) PSA10_PK-0003.jpg' },
    { name: 'Box PNG (動作確認)', url: '/images/box-style.png' },
  ]

  useEffect(() => {
    testUrls.forEach((test, index) => {
      const img = new Image()
      img.onload = () => {
        setResults(prev => [...prev, { ...test, status: '✅ 成功', width: img.width, height: img.height }])
      }
      img.onerror = () => {
        setResults(prev => [...prev, { ...test, status: '❌ エラー' }])
      }
      img.src = test.url
    })
  }, [])

  return (
    <div className="container mt-5">
      <h1>JPGファイル読み込みテスト</h1>
      
      <div className="alert alert-info">
        <p>様々な方法でngcard.jpgの読み込みをテストします。</p>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>方法</th>
            <th>URL</th>
            <th>プレビュー</th>
            <th>状態</th>
            <th>サイズ</th>
          </tr>
        </thead>
        <tbody>
          {testUrls.map((test, index) => {
            const result = results.find(r => r.url === test.url)
            return (
              <tr key={index}>
                <td>{test.name}</td>
                <td><code>{test.url}</code></td>
                <td>
                  <img 
                    src={test.url} 
                    alt={test.name}
                    style={{ maxHeight: '100px', maxWidth: '100px' }}
                  />
                </td>
                <td>{result?.status || '⏳ 読み込み中...'}</td>
                <td>{result?.width && result?.height ? `${result.width}x${result.height}` : '-'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="mt-5">
        <h2>HTMLでの直接埋め込みテスト</h2>
        <div dangerouslySetInnerHTML={{
          __html: `
            <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
              <p>通常のHTMLタグ:</p>
              <img src="/images/ngcard.jpg" alt="Direct HTML" style="max-height: 200px;" />
            </div>
          `
        }} />
      </div>

      <div className="mt-5">
        <h2>背景画像テスト</h2>
        <div 
          style={{
            width: '200px',
            height: '300px',
            backgroundImage: 'url(/images/ngcard.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid #ddd',
          }}
        >
          <p style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: '10px' }}>
            背景画像として表示
          </p>
        </div>
      </div>

      <div className="mt-4">
        <a href="/admin/cards" className="btn btn-primary">カード管理に戻る</a>
      </div>
    </div>
  )
}