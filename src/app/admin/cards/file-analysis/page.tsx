'use client'

import { useEffect, useState } from 'react'

export default function FileAnalysisPage() {
  const [fileData, setFileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/check-file')
      .then(res => res.json())
      .then(data => {
        setFileData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="container mt-5">読み込み中...</div>
  }

  return (
    <div className="container mt-5">
      <h1>ファイル分析結果</h1>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">ngcard.jpg (問題のファイル)</h5>
            </div>
            <div className="card-body">
              {fileData?.ngcard && (
                <ul className="list-unstyled">
                  <li><strong>存在:</strong> {fileData.ngcard.exists ? '✅ はい' : '❌ いいえ'}</li>
                  <li><strong>サイズ:</strong> {fileData.ngcard.size ? `${(fileData.ngcard.size / 1024).toFixed(2)} KB` : 'N/A'}</li>
                  <li><strong>有効なJPEG:</strong> {fileData.ngcard.isValidJPEG ? '✅ はい' : '❌ いいえ'}</li>
                  <li><strong>最初のバイト:</strong> 
                    <code className="d-block mt-1" style={{ fontSize: '0.8em' }}>
                      {fileData.ngcard.firstBytes || 'N/A'}
                    </code>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Pokemon JPG (正常なファイル)</h5>
            </div>
            <div className="card-body">
              {fileData?.pokemon && (
                <ul className="list-unstyled">
                  <li><strong>存在:</strong> {fileData.pokemon.exists ? '✅ はい' : '❌ いいえ'}</li>
                  <li><strong>サイズ:</strong> {fileData.pokemon.size ? `${(fileData.pokemon.size / 1024).toFixed(2)} KB` : 'N/A'}</li>
                  <li><strong>有効なJPEG:</strong> {fileData.pokemon.isValidJPEG ? '✅ はい' : '❌ いいえ'}</li>
                  <li><strong>最初のバイト:</strong> 
                    <code className="d-block mt-1" style={{ fontSize: '0.8em' }}>
                      {fileData.pokemon.firstBytes || 'N/A'}
                    </code>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert-info mt-4">
        <h6>JPEGファイルの判定基準:</h6>
        <ul className="mb-0">
          <li>JPEGファイルは必ず <code>FF D8</code> で始まる必要があります</li>
          <li>正常なJPEGファイルと問題のあるファイルのバイト構造を比較しています</li>
        </ul>
      </div>

      {fileData?.ngcard && !fileData.ngcard.isValidJPEG && (
        <div className="alert alert-danger mt-4">
          <h6>⚠️ ngcard.jpgは有効なJPEGファイルではありません</h6>
          <p>ファイルが破損しているか、正しくアップロードされていない可能性があります。</p>
          <p>新しいJPEGファイルをアップロードし直すことをお勧めします。</p>
        </div>
      )}

      <div className="mt-4">
        <a href="/admin/cards" className="btn btn-primary">カード管理に戻る</a>
      </div>
    </div>
  )
}