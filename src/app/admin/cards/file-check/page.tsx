'use client'

import { useEffect, useState } from 'react'

export default function FileCheckPage() {
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    checkFiles()
  }, [])

  const checkFiles = async () => {
    const filesToCheck = [
      '/images/ngcard.jpg',
      '/images/banner1.jpg',
      '/images/pokemon-151.jpg',
      '/images/box-style.png',
      '/images/pokemon-151.png',
      '/images/ポケモンカード151オリパ.jpg',
    ]

    const checkResults = []

    for (const file of filesToCheck) {
      try {
        const response = await fetch(file)
        checkResults.push({
          file,
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length'),
          ok: response.ok
        })
      } catch (error) {
        checkResults.push({
          file,
          error: error.message
        })
      }
    }

    setResults(checkResults)
  }

  return (
    <div className="container mt-5">
      <h1>ファイル存在確認</h1>
      
      <table className="table table-bordered mt-4">
        <thead>
          <tr>
            <th>ファイルパス</th>
            <th>ステータス</th>
            <th>Content-Type</th>
            <th>サイズ</th>
            <th>結果</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index} className={result.ok ? '' : 'table-danger'}>
              <td>{result.file}</td>
              <td>{result.status || 'エラー'}</td>
              <td>{result.contentType || '-'}</td>
              <td>{result.contentLength ? `${(parseInt(result.contentLength) / 1024).toFixed(1)} KB` : '-'}</td>
              <td>{result.ok ? '✅ OK' : `❌ ${result.error || result.statusText}`}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-5">画像プレビュー</h2>
      <div className="row">
        {results.filter(r => r.ok).map((result, index) => (
          <div key={index} className="col-md-3 mb-3">
            <div className="card">
              <img 
                src={result.file} 
                alt={result.file}
                className="card-img-top"
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <p className="card-text small">{result.file}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <a href="/admin/cards" className="btn btn-primary">管理画面に戻る</a>
      </div>
    </div>
  )
}